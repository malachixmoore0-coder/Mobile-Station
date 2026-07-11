from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Venue(str, Enum):
    TRADIER = "tradier"
    DERIBIT = "deribit"
    KALSHI = "kalshi"


class OptionRight(str, Enum):
    CALL = "call"
    PUT = "put"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


@dataclass
class OptionQuote:
    """A single option contract's market snapshot."""

    venue: Venue
    underlying: str
    symbol: str  # venue-native contract identifier
    right: OptionRight
    strike: float
    expiry_epoch: float  # seconds since epoch, UTC
    bid: float
    ask: float
    underlying_price: float
    risk_free_rate: float = 0.05
    dividend_yield: float = 0.0
    volume: int = 0
    open_interest: int = 0
    fetched_at: float = field(default_factory=time.time)

    @property
    def mid(self) -> float:
        if self.bid <= 0 or self.ask <= 0:
            return max(self.bid, self.ask)
        return (self.bid + self.ask) / 2.0

    @property
    def time_to_expiry_years(self) -> float:
        return max(self.expiry_epoch - time.time(), 0.0) / (365.0 * 24 * 3600)


@dataclass
class KalshiMarketQuote:
    """A binary yes/no Kalshi market snapshot. Prices are in cents (1-99)."""

    ticker: str
    event_ticker: str
    title: str
    yes_bid: int
    yes_ask: int
    no_bid: int
    no_ask: int
    volume: int = 0
    fetched_at: float = field(default_factory=time.time)


class OpportunityKind(str, Enum):
    IV_SMILE_OUTLIER = "iv_smile_outlier"
    PUT_CALL_PARITY = "put_call_parity"
    BELOW_INTRINSIC = "below_intrinsic"
    KALSHI_LOCKED_ARB = "kalshi_locked_arb"
    KALSHI_EVENT_SUM = "kalshi_event_sum"


@dataclass
class Opportunity:
    kind: OpportunityKind
    venue: Venue
    description: str
    edge_usd: float  # estimated profit/edge, after assumed fees, for the unit size below
    legs: list  # list of dicts describing each leg: {symbol, side, quantity, price}
    confidence: float  # 0-1, informal signal strength
    raw: dict = field(default_factory=dict)
    found_at: float = field(default_factory=time.time)


@dataclass
class Order:
    venue: Venue
    symbol: str
    side: OrderSide
    quantity: int
    limit_price: Optional[float]
    opportunity_kind: OpportunityKind
    client_order_id: str


@dataclass
class Position:
    venue: Venue
    symbol: str
    quantity: int
    avg_price: float
