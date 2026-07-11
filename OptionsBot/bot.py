from __future__ import annotations

import time

from config import config
from core.logging_setup import get_logger
from core.models import Opportunity, Venue
from execution.order_manager import OrderManager
from risk.manager import RiskManager
from scanners import kalshi_mispricing, options_mispricing
from storage.db import Store
from venues.base import VenueClient
from venues.deribit import DeribitClient
from venues.kalshi import KalshiClient
from venues.tradier import TradierClient

log = get_logger(__name__)


def build_venue_clients() -> dict[Venue, VenueClient]:
    clients: dict[Venue, VenueClient] = {}
    if config.enable_tradier:
        clients[Venue.TRADIER] = TradierClient()
    if config.enable_deribit:
        clients[Venue.DERIBIT] = DeribitClient()
    if config.enable_kalshi:
        clients[Venue.KALSHI] = KalshiClient()
    return clients


def scan_tradier(client: TradierClient, symbols: list[str]) -> list[Opportunity]:
    quotes = []
    for symbol in symbols:
        try:
            expirations = client.get_expirations(symbol)
        except Exception:
            log.exception("Failed to fetch expirations for %s", symbol)
            continue
        for expiration in expirations[:4]:  # nearest few expiries only, keeps request volume sane
            try:
                quotes.extend(client.get_chain(symbol, expiration))
            except Exception:
                log.exception("Failed to fetch chain for %s %s", symbol, expiration)
    return options_mispricing.scan_all(
        quotes, config.scanner.iv_zscore_threshold, config.scanner.parity_violation_min_usd
    )


def scan_deribit(client: DeribitClient, currencies: list[str]) -> list[Opportunity]:
    quotes = []
    for currency in currencies:
        try:
            quotes.extend(client.get_chain(currency))
        except Exception:
            log.exception("Failed to fetch Deribit chain for %s", currency)
    return options_mispricing.scan_all(
        quotes, config.scanner.iv_zscore_threshold, config.scanner.parity_violation_min_usd
    )


def scan_kalshi(client: KalshiClient) -> list[Opportunity]:
    try:
        markets = client.get_markets()
    except Exception:
        log.exception("Failed to fetch Kalshi markets")
        return []
    return kalshi_mispricing.scan_all(markets, config.scanner.kalshi_arb_min_edge_cents)


def scan_once(
    clients: dict[Venue, VenueClient],
    tradier_symbols: list[str],
    deribit_currencies: list[str],
) -> list[Opportunity]:
    opportunities: list[Opportunity] = []
    if Venue.TRADIER in clients:
        opportunities.extend(scan_tradier(clients[Venue.TRADIER], tradier_symbols))
    if Venue.DERIBIT in clients:
        opportunities.extend(scan_deribit(clients[Venue.DERIBIT], deribit_currencies))
    if Venue.KALSHI in clients:
        opportunities.extend(scan_kalshi(clients[Venue.KALSHI]))
    return opportunities


def run(
    tradier_symbols: list[str],
    deribit_currencies: list[str],
    interval_seconds: int | None = None,
    once: bool = False,
) -> None:
    log.info(
        "Starting OptionsBot. live_trading=%s tradier=%s deribit=%s kalshi=%s",
        config.live_trading,
        config.enable_tradier,
        config.enable_deribit,
        config.enable_kalshi,
    )
    if not config.live_trading:
        log.info("Running in DRY RUN mode - no real orders will be placed.")

    clients = build_venue_clients()
    if not clients:
        log.warning("No venues enabled (see ENABLE_TRADIER/ENABLE_DERIBIT/ENABLE_KALSHI in .env)")

    risk = RiskManager(limits=config.risk)
    store = Store()
    order_manager = OrderManager(clients, risk, store)

    interval = interval_seconds or config.scan_interval_seconds
    while True:
        opportunities = scan_once(clients, tradier_symbols, deribit_currencies)
        log.info("Scan complete: %d opportunities found", len(opportunities))
        for opp in sorted(opportunities, key=lambda o: o.edge_usd, reverse=True):
            order_manager.act_on(opp)

        if once:
            return
        time.sleep(interval)
