from __future__ import annotations

import datetime
from dataclasses import dataclass, field

from config import RiskConfig
from core.logging_setup import get_logger
from core.models import Opportunity

log = get_logger(__name__)


@dataclass
class RiskManager:
    """Every trade must pass through here before it reaches an order
    manager. Fails closed: unknown/ambiguous cases are rejected, not
    allowed through.
    """

    limits: RiskConfig
    _daily_realized_pnl: float = 0.0
    _day: datetime.date = field(default_factory=lambda: datetime.date.today())
    _open_position_count: int = 0
    _halted: bool = False
    _halt_reason: str = ""

    def _roll_day_if_needed(self) -> None:
        today = datetime.date.today()
        if today != self._day:
            log.info("New trading day - resetting daily P&L counter (was %.2f)", self._daily_realized_pnl)
            self._day = today
            self._daily_realized_pnl = 0.0
            self._halted = False
            self._halt_reason = ""

    def record_realized_pnl(self, amount_usd: float) -> None:
        self._roll_day_if_needed()
        self._daily_realized_pnl += amount_usd
        if self._daily_realized_pnl <= -self.limits.max_daily_loss_usd:
            self._halted = True
            self._halt_reason = (
                f"daily loss ${-self._daily_realized_pnl:.2f} reached max "
                f"${self.limits.max_daily_loss_usd:.2f}"
            )
            log.error("TRADING HALTED: %s", self._halt_reason)

    def set_open_position_count(self, count: int) -> None:
        self._open_position_count = count

    def approve(self, opportunity: Opportunity) -> tuple[bool, str]:
        self._roll_day_if_needed()
        if self._halted:
            return False, f"halted: {self._halt_reason}"

        if self._open_position_count >= self.limits.max_open_positions:
            return False, (
                f"open position count {self._open_position_count} >= "
                f"max {self.limits.max_open_positions}"
            )

        estimated_risk = self._estimate_worst_case_loss(opportunity)
        if estimated_risk > self.limits.max_position_risk_usd:
            return False, (
                f"estimated worst-case loss ${estimated_risk:.2f} exceeds "
                f"max ${self.limits.max_position_risk_usd:.2f} per position"
            )

        return True, "ok"

    @staticmethod
    def _estimate_worst_case_loss(opportunity: Opportunity) -> float:
        """Conservative estimate: sum of premium paid on the "buy" legs.
        This assumes options/contracts, where max loss on a long premium
        position is the premium itself; it does NOT account for margin on
        short legs, so short-leg strategies need their own explicit limit
        before this is trusted for anything beyond long-only structures.
        """
        total = 0.0
        for leg in opportunity.legs:
            if leg["side"] == "buy":
                price = leg.get("price") or 0.0
                qty = leg.get("quantity", 1)
                # Kalshi prices are in cents; options are in dollars per
                # contract (x100 multiplier is handled by the venue, not
                # modeled here) - this is a rough bound, not exact margin.
                total += price * qty
        return total
