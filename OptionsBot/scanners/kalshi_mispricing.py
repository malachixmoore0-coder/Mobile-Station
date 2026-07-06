"""Mispricing scanners for Kalshi's binary yes/no markets.

Both checks are mechanical (no probability model needed):

1. Locked arbitrage: on a single market, if yes_ask + no_ask < 100 cents,
   buying one of each side guarantees a 100-cent payout for less than
   100 cents of cost, regardless of outcome.

2. Event-sum arbitrage: for a set of mutually exclusive and exhaustive
   markets under one event (exactly one resolves YES), if the sum of the
   YES asks is under 100 cents, buying YES on every market in the group
   guarantees a 100-cent payout for less than 100 cents of cost.
"""

from __future__ import annotations

from collections import defaultdict

from core.models import KalshiMarketQuote, Opportunity, OpportunityKind, Venue


def scan_locked_arbitrage(
    markets: list[KalshiMarketQuote], min_edge_cents: float
) -> list[Opportunity]:
    opportunities = []
    for m in markets:
        if m.yes_ask <= 0 or m.no_ask <= 0:
            continue
        edge = 100 - (m.yes_ask + m.no_ask)
        if edge < min_edge_cents:
            continue
        opportunities.append(
            Opportunity(
                kind=OpportunityKind.KALSHI_LOCKED_ARB,
                venue=Venue.KALSHI,
                description=(
                    f"{m.ticker}: yes_ask {m.yes_ask}c + no_ask {m.no_ask}c = "
                    f"{m.yes_ask + m.no_ask}c, locked edge {edge}c/contract"
                ),
                edge_usd=edge / 100.0,
                legs=[
                    {"symbol": f"{m.ticker}:yes", "side": "buy", "quantity": 1, "price": m.yes_ask},
                    {"symbol": f"{m.ticker}:no", "side": "buy", "quantity": 1, "price": m.no_ask},
                ],
                confidence=0.95,
                raw={"edge_cents": edge},
            )
        )
    return opportunities


def scan_event_sum_arbitrage(
    markets: list[KalshiMarketQuote], min_edge_cents: float, min_group_size: int = 2
) -> list[Opportunity]:
    opportunities = []
    by_event: dict[str, list[KalshiMarketQuote]] = defaultdict(list)
    for m in markets:
        if m.event_ticker:
            by_event[m.event_ticker].append(m)

    for event_ticker, group in by_event.items():
        if len(group) < min_group_size:
            continue
        if any(m.yes_ask <= 0 for m in group):
            continue
        total_cost = sum(m.yes_ask for m in group)
        edge = 100 - total_cost
        if edge < min_edge_cents:
            continue
        opportunities.append(
            Opportunity(
                kind=OpportunityKind.KALSHI_EVENT_SUM,
                venue=Venue.KALSHI,
                description=(
                    f"event {event_ticker}: {len(group)} mutually-exclusive markets, "
                    f"sum(yes_ask)={total_cost}c, edge {edge}c/contract IF the "
                    f"group is truly exhaustive (verify - this is the load-bearing assumption)"
                ),
                edge_usd=edge / 100.0,
                legs=[
                    {"symbol": f"{m.ticker}:yes", "side": "buy", "quantity": 1, "price": m.yes_ask}
                    for m in group
                ],
                confidence=0.6,  # depends on the exhaustiveness assumption holding
                raw={"edge_cents": edge, "market_count": len(group)},
            )
        )
    return opportunities


def scan_all(markets: list[KalshiMarketQuote], min_edge_cents: float) -> list[Opportunity]:
    return scan_locked_arbitrage(markets, min_edge_cents) + scan_event_sum_arbitrage(
        markets, min_edge_cents
    )
