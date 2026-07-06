"""Black-Scholes-Merton pricing, greeks, and implied volatility.

Used as a *relative-value* yardstick: options are compared against each
other (same underlying/expiry, across strikes) rather than against some
externally-forecast "true" volatility. See scanners/options_mispricing.py.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from core.models import OptionRight

_SQRT_2PI = math.sqrt(2 * math.pi)


def _norm_pdf(x: float) -> float:
    return math.exp(-0.5 * x * x) / _SQRT_2PI


def _norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2)))


def _d1_d2(s: float, k: float, t: float, r: float, q: float, sigma: float) -> tuple[float, float]:
    if t <= 0 or sigma <= 0:
        raise ValueError("time to expiry and volatility must be positive")
    vol_sqrt_t = sigma * math.sqrt(t)
    d1 = (math.log(s / k) + (r - q + 0.5 * sigma * sigma) * t) / vol_sqrt_t
    d2 = d1 - vol_sqrt_t
    return d1, d2


def price(right: OptionRight, s: float, k: float, t: float, r: float, q: float, sigma: float) -> float:
    """Theoretical option price under Black-Scholes-Merton."""
    if t <= 0:
        return intrinsic_value(right, s, k)
    d1, d2 = _d1_d2(s, k, t, r, q, sigma)
    disc_q = math.exp(-q * t)
    disc_r = math.exp(-r * t)
    if right == OptionRight.CALL:
        return s * disc_q * _norm_cdf(d1) - k * disc_r * _norm_cdf(d2)
    return k * disc_r * _norm_cdf(-d2) - s * disc_q * _norm_cdf(-d1)


def intrinsic_value(right: OptionRight, s: float, k: float) -> float:
    if right == OptionRight.CALL:
        return max(s - k, 0.0)
    return max(k - s, 0.0)


@dataclass
class Greeks:
    delta: float
    gamma: float
    vega: float  # per 1.00 (100 vol points) change in sigma; divide by 100 for a 1-vol-point move
    theta: float  # per year; divide by 365 for per-day
    rho: float


def greeks(right: OptionRight, s: float, k: float, t: float, r: float, q: float, sigma: float) -> Greeks:
    d1, d2 = _d1_d2(s, k, t, r, q, sigma)
    disc_q = math.exp(-q * t)
    disc_r = math.exp(-r * t)
    pdf_d1 = _norm_pdf(d1)

    gamma = disc_q * pdf_d1 / (s * sigma * math.sqrt(t))
    vega = s * disc_q * pdf_d1 * math.sqrt(t)

    if right == OptionRight.CALL:
        delta = disc_q * _norm_cdf(d1)
        theta = (
            -s * disc_q * pdf_d1 * sigma / (2 * math.sqrt(t))
            - r * k * disc_r * _norm_cdf(d2)
            + q * s * disc_q * _norm_cdf(d1)
        )
        rho = k * t * disc_r * _norm_cdf(d2)
    else:
        delta = disc_q * (_norm_cdf(d1) - 1.0)
        theta = (
            -s * disc_q * pdf_d1 * sigma / (2 * math.sqrt(t))
            + r * k * disc_r * _norm_cdf(-d2)
            - q * s * disc_q * _norm_cdf(-d1)
        )
        rho = -k * t * disc_r * _norm_cdf(-d2)

    return Greeks(delta=delta, gamma=gamma, vega=vega, theta=theta, rho=rho)


class ImpliedVolError(Exception):
    pass


def implied_volatility(
    market_price: float,
    right: OptionRight,
    s: float,
    k: float,
    t: float,
    r: float,
    q: float = 0.0,
    initial_guess: float = 0.5,
    tol: float = 1e-6,
    max_iterations: int = 100,
) -> float:
    """Solve for sigma given an observed price, via Newton-Raphson with a
    bisection fallback (Newton can diverge for deep ITM/OTM or near-expiry
    contracts).
    """
    intrinsic = intrinsic_value(right, s, k)
    if market_price < intrinsic - 1e-9:
        raise ImpliedVolError("market price below intrinsic value - not a volatility problem")
    if t <= 0:
        raise ImpliedVolError("cannot solve implied vol at/after expiry")

    sigma = initial_guess
    for _ in range(max_iterations):
        try:
            model_price = price(right, s, k, t, r, q, sigma)
            vega = greeks(right, s, k, t, r, q, sigma).vega
        except ValueError:
            break
        diff = model_price - market_price
        if abs(diff) < tol:
            return sigma
        if vega < 1e-8:
            break
        sigma -= diff / vega
        if sigma <= 0:
            sigma = 1e-4

    # Bisection fallback over a generous vol range.
    lo, hi = 1e-4, 5.0
    price_lo = price(right, s, k, t, r, q, lo) - market_price
    price_hi = price(right, s, k, t, r, q, hi) - market_price
    if price_lo * price_hi > 0:
        raise ImpliedVolError("implied vol not bracketed in [0.01%, 500%]")
    for _ in range(200):
        mid = (lo + hi) / 2.0
        price_mid = price(right, s, k, t, r, q, mid) - market_price
        if abs(price_mid) < tol:
            return mid
        if price_lo * price_mid < 0:
            hi = mid
            price_hi = price_mid
        else:
            lo = mid
            price_lo = price_mid
    return (lo + hi) / 2.0
