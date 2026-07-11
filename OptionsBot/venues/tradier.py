from __future__ import annotations

import uuid

import requests

from config import config
from core.logging_setup import get_logger
from core.models import Order, OptionQuote, OptionRight, Position, Venue
from venues.base import VenueClient

log = get_logger(__name__)


class TradierClient(VenueClient):
    """US equity/ETF options via Tradier's brokerage API.

    Docs: https://docs.tradier.com/. Sandbox host is a real paper-trading
    account - use it (TRADIER_BASE_URL=https://sandbox.tradier.com) until
    you are confident in the strategy.
    """

    name = "tradier"

    def __init__(self) -> None:
        self.base_url = config.tradier_base_url.rstrip("/")
        self.token = config.tradier_access_token
        self.account_id = config.tradier_account_id
        self._session = requests.Session()
        self._session.headers.update(
            {"Authorization": f"Bearer {self.token}", "Accept": "application/json"}
        )

    def is_live_ready(self) -> bool:
        return bool(self.token and self.account_id)

    def get_expirations(self, symbol: str) -> list[str]:
        resp = self._session.get(
            f"{self.base_url}/v1/markets/options/expirations",
            params={"symbol": symbol, "includeAllRoots": "true"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("expirations")
        if not data:
            return []
        dates = data.get("date")
        if isinstance(dates, str):
            return [dates]
        return dates or []

    def get_underlying_price(self, symbol: str) -> float:
        resp = self._session.get(
            f"{self.base_url}/v1/markets/quotes", params={"symbols": symbol}, timeout=10
        )
        resp.raise_for_status()
        quote = resp.json()["quotes"]["quote"]
        return float(quote["last"] or quote.get("close") or 0.0)

    def get_chain(self, symbol: str, expiration: str) -> list[OptionQuote]:
        """expiration: 'YYYY-MM-DD'."""
        underlying_price = self.get_underlying_price(symbol)
        resp = self._session.get(
            f"{self.base_url}/v1/markets/options/chains",
            params={"symbol": symbol, "expiration": expiration, "greeks": "false"},
            timeout=10,
        )
        resp.raise_for_status()
        options = resp.json().get("options")
        if not options:
            return []
        rows = options.get("option")
        if isinstance(rows, dict):
            rows = [rows]

        import datetime

        expiry_epoch = datetime.datetime.strptime(expiration, "%Y-%m-%d").replace(
            hour=21, tzinfo=datetime.timezone.utc
        ).timestamp()

        quotes = []
        for row in rows or []:
            right = OptionRight.CALL if row["option_type"] == "call" else OptionRight.PUT
            quotes.append(
                OptionQuote(
                    venue=Venue.TRADIER,
                    underlying=symbol,
                    symbol=row["symbol"],
                    right=right,
                    strike=float(row["strike"]),
                    expiry_epoch=expiry_epoch,
                    bid=float(row.get("bid") or 0.0),
                    ask=float(row.get("ask") or 0.0),
                    underlying_price=underlying_price,
                    volume=int(row.get("volume") or 0),
                    open_interest=int(row.get("open_interest") or 0),
                )
            )
        return quotes

    def place_order(self, order: Order, dry_run: bool) -> dict:
        client_id = order.client_order_id or str(uuid.uuid4())
        if dry_run or not config.live_trading:
            log.info(
                "[DRY RUN] tradier order not sent: %s %s x%d @ %s (%s)",
                order.side.value,
                order.symbol,
                order.quantity,
                order.limit_price,
                client_id,
            )
            return {"status": "simulated", "client_order_id": client_id}

        if not self.is_live_ready():
            raise RuntimeError("Tradier credentials not configured")

        tradier_side = "buy_to_open" if order.side.value == "buy" else "sell_to_close"
        resp = self._session.post(
            f"{self.base_url}/v1/accounts/{self.account_id}/orders",
            data={
                "class": "option",
                "symbol": order.symbol[:6],  # underlying root
                "option_symbol": order.symbol,
                "side": tradier_side,
                "quantity": order.quantity,
                "type": "limit",
                "duration": "day",
                "price": order.limit_price,
                "tag": client_id,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def get_positions(self) -> list[Position]:
        if not self.is_live_ready():
            return []
        resp = self._session.get(
            f"{self.base_url}/v1/accounts/{self.account_id}/positions", timeout=10
        )
        resp.raise_for_status()
        positions = resp.json().get("positions")
        if not positions or positions == "null":
            return []
        rows = positions.get("position")
        if isinstance(rows, dict):
            rows = [rows]
        return [
            Position(
                venue=Venue.TRADIER,
                symbol=row["symbol"],
                quantity=int(row["quantity"]),
                avg_price=float(row["cost_basis"]) / max(int(row["quantity"]), 1),
            )
            for row in rows or []
        ]
