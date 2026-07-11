"""Relative-value mispricing scanner for listed/crypto options.

Two independent signals, both self-contained (no external vol forecast
needed):

1. IV smile outlier: within a single underlying+expiry, fit a smooth curve
   (quadratic in log-moneyness) through each strike's implied volatility.
   A contract whose IV is a statistical outlier vs. its neighbors is
   either stale/illiquid or a genuine pricing error - either way it's a
   candidate, not a certainty, hence "confidence" rather than guaranteed
   edge.

2. Put-call parity / below-intrinsic: true near-arbitrage. If C - P
   deviates materially from S*e^-qT - K*e^-rT (same strike/expiry), or an
   option trades below intrinsic value, that is a mechanical mispricing
   independent of any volatility model.
"""

from __future__ import annotations

import math
from collections import defaultdict

import numpy as np

from core.models import Opportunity, OpportunityKind, OptionQuote, OptionRight
from pricing.black_scholes import ImpliedVolError, implied_volatility, intrinsic_value


def _valid_for_iv(q: OptionQuote) -> bool:
    return (
        q.bid > 0
        and q.ask > 0
        and q.ask >= q.bid
        and q.time_to_expiry_years > 1.0 / 365.0  # skip same-day expiry noise
        and q.mid > intrinsic_value(q.right, q.underlying_price, q.strike) + 1e-6
    )


def scan_iv_smile_outliers(
    quotes: list[OptionQuote], zscore_threshold: float, risk_free_rate: float = 0.05
) -> list[Opportunity]:
    opportunities: list[Opportunity] = []
    groups: dict[tuple, list[OptionQuote]] = defaultdict(list)
    for q in quotes:
        groups[(q.underlying, q.expiry_epoch, q.right)].append(q)

    for (underlying, expiry, right), group in groups.items():
        valid = [q for q in group if _valid_for_iv(q)]
        if len(valid) < 5:
            continue  # need enough points on the smile to fit anything meaningful

        ivs = []
        moneyness = []
        kept = []
        for q in valid:
            try:
                iv = implied_volatility(
                    q.mid, q.right, q.underlying_price, q.strike, q.time_to_expiry_years,
                    risk_free_rate, q.dividend_yield,
                )
            except ImpliedVolError:
                continue
            ivs.append(iv)
            moneyness.append(math.log(q.strike / q.underlying_price))
            kept.append(q)

        if len(kept) < 5:
            continue

        x = np.array(moneyness)
        y = np.array(ivs)
        coeffs = np.polyfit(x, y, 2)
        fitted = np.polyval(coeffs, x)
        residuals = y - fitted
        std = residuals.std()
        if std < 1e-6:
            continue

        for q, iv, resid in zip(kept, ivs, residuals):
            z = resid / std
            if abs(z) < zscore_threshold:
                continue
            # Positive z: this strike's IV is rich vs. its neighbors -> sell it.
            # Negative z: cheap vs. neighbors -> buy it.
            side = "sell" if z > 0 else "buy"
            opportunities.append(
                Opportunity(
                    kind=OpportunityKind.IV_SMILE_OUTLIER,
                    venue=q.venue,
                    description=(
                        f"{q.symbol}: IV {iv:.1%} is a {z:+.1f}-sigma outlier vs. the "
                        f"fitted smile for {underlying} {right.value}s expiring "
                        f"{expiry:.0f} ({side} candidate)"
                    ),
                    edge_usd=abs(resid) * q.underlying_price * 0.01,  # rough vega-scaled estimate
                    legs=[{"symbol": q.symbol, "side": side, "quantity": 1, "price": q.mid}],
                    confidence=min(abs(z) / (zscore_threshold * 2), 0.9),
                    raw={"iv": iv, "zscore": z, "fitted_iv": float(fitted[list(kept).index(q)])},
                )
            )
    return opportunities


def scan_put_call_parity(
    quotes: list[OptionQuote], min_violation_usd: float, risk_free_rate: float = 0.05
) -> list[Opportunity]:
    opportunities: list[Opportunity] = []
    by_key: dict[tuple, dict[OptionRight, OptionQuote]] = defaultdict(dict)
    for q in quotes:
        by_key[(q.underlying, q.expiry_epoch, q.strike)][q.right] = q

    for (underlying, expiry, strike), pair in by_key.items():
        call = pair.get(OptionRight.CALL)
        put = pair.get(OptionRight.PUT)
        if not call or not put or call.bid <= 0 or put.bid <= 0:
            continue
        t = call.time_to_expiry_years
        if t <= 0:
            continue
        s = call.underlying_price
        rhs = s * math.exp(-call.dividend_yield * t) - strike * math.exp(-risk_free_rate * t)
        lhs = call.mid - put.mid
        diff = lhs - rhs
        if abs(diff) < min_violation_usd:
            continue

        # diff > 0: call rich / put cheap relative to parity -> sell call, buy put (+ hedge with stock)
        # diff < 0: opposite
        if diff > 0:
            legs = [
                {"symbol": call.symbol, "side": "sell", "quantity": 1, "price": call.bid},
                {"symbol": put.symbol, "side": "buy", "quantity": 1, "price": put.ask},
            ]
        else:
            legs = [
                {"symbol": call.symbol, "side": "buy", "quantity": 1, "price": call.ask},
                {"symbol": put.symbol, "side": "sell", "quantity": 1, "price": put.bid},
            ]

        opportunities.append(
            Opportunity(
                kind=OpportunityKind.PUT_CALL_PARITY,
                venue=call.venue,
                description=(
                    f"{underlying} {strike} strike, exp {expiry:.0f}: put-call parity "
                    f"violated by ${diff:.2f} (needs stock/underlying leg to fully hedge)"
                ),
                edge_usd=abs(diff),
                legs=legs,
                confidence=0.7,
                raw={"diff": diff},
            )
        )
    return opportunities


def scan_below_intrinsic(quotes: list[OptionQuote]) -> list[Opportunity]:
    opportunities = []
    for q in quotes:
        if q.ask <= 0:
            continue
        intrinsic = intrinsic_value(q.right, q.underlying_price, q.strike)
        if intrinsic <= 0:
            continue
        if q.ask < intrinsic - 0.01:
            opportunities.append(
                Opportunity(
                    kind=OpportunityKind.BELOW_INTRINSIC,
                    venue=q.venue,
                    description=(
                        f"{q.symbol}: ask ${q.ask:.2f} is below intrinsic value "
                        f"${intrinsic:.2f} - likely a stale/erroneous quote"
                    ),
                    edge_usd=intrinsic - q.ask,
                    legs=[{"symbol": q.symbol, "side": "buy", "quantity": 1, "price": q.ask}],
                    confidence=0.95,
                    raw={"intrinsic": intrinsic},
                )
            )
    return opportunities


def scan_all(quotes: list[OptionQuote], zscore_threshold: float, parity_min_usd: float) -> list[Opportunity]:
    return (
        scan_iv_smile_outliers(quotes, zscore_threshold)
        + scan_put_call_parity(quotes, parity_min_usd)
        + scan_below_intrinsic(quotes)
    )
