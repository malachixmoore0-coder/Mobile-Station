from __future__ import annotations

import uuid

from config import config
from core.logging_setup import get_logger
from core.models import Opportunity, Order, OrderSide, Venue
from risk.manager import RiskManager
from storage.db import Store
from venues.base import VenueClient

log = get_logger(__name__)


class OrderManager:
    """The only path from "here's an opportunity" to "an order left the
    process." Every order goes through the risk manager first, and every
    attempt (approved or not, dry-run or live) is logged to storage.
    """

    def __init__(self, venue_clients: dict[Venue, VenueClient], risk: RiskManager, store: Store) -> None:
        self.venue_clients = venue_clients
        self.risk = risk
        self.store = store

    def act_on(self, opportunity: Opportunity) -> None:
        opp_id = self.store.record_opportunity(opportunity, acted_on=False)

        approved, reason = self.risk.approve(opportunity)
        if not approved:
            log.info("Skipping opportunity (%s): %s", reason, opportunity.description)
            return

        client = self.venue_clients.get(opportunity.venue)
        if client is None:
            log.warning("No venue client configured for %s, skipping", opportunity.venue)
            return

        dry_run = not config.live_trading
        for leg in opportunity.legs:
            order = Order(
                venue=opportunity.venue,
                symbol=leg["symbol"],
                side=OrderSide(leg["side"]),
                quantity=leg.get("quantity", 1),
                limit_price=leg.get("price"),
                opportunity_kind=opportunity.kind,
                client_order_id=str(uuid.uuid4()),
            )
            try:
                result = client.place_order(order, dry_run=dry_run)
            except Exception:
                log.exception("Order placement failed for %s", order.symbol)
                continue
            self.store.record_order(order, dry_run=dry_run, result=result)

        log.info(
            "%s opportunity (edge $%.2f, confidence %.0f%%): %s",
            "Simulated" if dry_run else "Executed",
            opportunity.edge_usd,
            opportunity.confidence * 100,
            opportunity.description,
        )
