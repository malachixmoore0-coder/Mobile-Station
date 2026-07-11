from __future__ import annotations

from abc import ABC, abstractmethod

from core.models import Order, Position


class VenueClient(ABC):
    """Common interface every venue adapter implements. Keeps scanners and
    the bot loop venue-agnostic.
    """

    name: str

    @abstractmethod
    def is_live_ready(self) -> bool:
        """Whether credentials are configured for this venue."""

    @abstractmethod
    def place_order(self, order: Order, dry_run: bool) -> dict:
        """Submit an order. When dry_run is True, MUST NOT call any
        order-placing network endpoint - return a simulated fill instead.
        """

    @abstractmethod
    def get_positions(self) -> list[Position]:
        ...
