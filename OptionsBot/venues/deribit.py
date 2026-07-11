from __future__ import annotations

import datetime
import time
import uuid

import requests

from config import config
from core.logging_setup import get_logger
from core.models import Order, OptionQuote, OptionRight, Position, Venue
from venues.base import VenueClient

log = get_logger(__name__)


def _parse_instrument_name(name: str) -> tuple[str, float, OptionRight, float]:
    """'BTC-27JUN25-60000-C' -> (currency, expiry_epoch, right, strike)."""
    currency, expiry_str, strike_str, right_str = name.split("-")
    expiry = datetime.datetime.strptime(expiry_str, "%d%b%y").replace(
        hour=8, tzinfo=datetime.timezone.utc
    )  # Deribit options expire 08:00 UTC
    right = OptionRight.CALL if right_str == "C" else OptionRight.PUT
    return currency, expiry.timestamp(), right, float(strike_str)


class DeribitClient(VenueClient):
    """Crypto (BTC/ETH) options via Deribit's JSON-RPC-over-HTTP API.

    Docs: https://docs.deribit.com/. Use https://test.deribit.com (a real
    testnet with its own funded paper account) until confident.
    """

    name = "deribit"

    def __init__(self) -> None:
        self.base_url = config.deribit_base_url.rstrip("/")
        self.client_id = config.deribit_client_id
        self.client_secret = config.deribit_client_secret
        self._session = requests.Session()
        self._token: str | None = None
        self._token_expires_at = 0.0

    def is_live_ready(self) -> bool:
        return bool(self.client_id and self.client_secret)

    def _authenticate(self) -> str:
        if self._token and time.time() < self._token_expires_at - 30:
            return self._token
        resp = self._session.get(
            f"{self.base_url}/api/v2/public/auth",
            params={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            timeout=10,
        )
        resp.raise_for_status()
        result = resp.json()["result"]
        self._token = result["access_token"]
        self._token_expires_at = time.time() + result["expires_in"]
        return self._token

    def _auth_headers(self) -> dict:
        return {"Authorization": f"Bearer {self._authenticate()}"}

    def get_instruments(self, currency: str) -> list[str]:
        resp = self._session.get(
            f"{self.base_url}/api/v2/public/get_instruments",
            params={"currency": currency, "kind": "option", "expired": "false"},
            timeout=10,
        )
        resp.raise_for_status()
        return [row["instrument_name"] for row in resp.json()["result"]]

    def get_chain(self, currency: str, expiry_filter: str | None = None) -> list[OptionQuote]:
        """currency: 'BTC' or 'ETH'. expiry_filter, if given, is the exact
        Deribit expiry token e.g. '27JUN25' to limit to one expiration.
        """
        quotes = []
        for instrument in self.get_instruments(currency):
            _, expiry_epoch, right, strike = _parse_instrument_name(instrument)
            if expiry_filter and expiry_filter not in instrument:
                continue
            resp = self._session.get(
                f"{self.base_url}/api/v2/public/ticker",
                params={"instrument_name": instrument},
                timeout=10,
            )
            resp.raise_for_status()
            result = resp.json()["result"]
            best_bid = result.get("best_bid_price") or 0.0
            best_ask = result.get("best_ask_price") or 0.0
            underlying_price = result.get("underlying_price") or result.get("index_price") or 0.0
            # Deribit option prices are quoted in units of the underlying
            # coin; convert to USD-equivalent for a common price scale.
            quotes.append(
                OptionQuote(
                    venue=Venue.DERIBIT,
                    underlying=currency,
                    symbol=instrument,
                    right=right,
                    strike=strike,
                    expiry_epoch=expiry_epoch,
                    bid=best_bid * underlying_price,
                    ask=best_ask * underlying_price,
                    underlying_price=underlying_price,
                    volume=int(result.get("stats", {}).get("volume") or 0),
                )
            )
        return quotes

    def place_order(self, order: Order, dry_run: bool) -> dict:
        client_id = order.client_order_id or str(uuid.uuid4())
        if dry_run or not config.live_trading:
            log.info(
                "[DRY RUN] deribit order not sent: %s %s x%d @ %s (%s)",
                order.side.value,
                order.symbol,
                order.quantity,
                order.limit_price,
                client_id,
            )
            return {"status": "simulated", "client_order_id": client_id}

        if not self.is_live_ready():
            raise RuntimeError("Deribit credentials not configured")

        endpoint = "buy" if order.side.value == "buy" else "sell"
        resp = self._session.get(
            f"{self.base_url}/api/v2/private/{endpoint}",
            params={
                "instrument_name": order.symbol,
                "amount": order.quantity,
                "type": "limit",
                "price": order.limit_price,
                "label": client_id,
            },
            headers=self._auth_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()["result"]

    def get_positions(self) -> list[Position]:
        if not self.is_live_ready():
            return []
        positions = []
        for currency in ("BTC", "ETH"):
            resp = self._session.get(
                f"{self.base_url}/api/v2/private/get_positions",
                params={"currency": currency, "kind": "option"},
                headers=self._auth_headers(),
                timeout=10,
            )
            resp.raise_for_status()
            for row in resp.json()["result"]:
                if row.get("size", 0) == 0:
                    continue
                positions.append(
                    Position(
                        venue=Venue.DERIBIT,
                        symbol=row["instrument_name"],
                        quantity=int(row["size"]),
                        avg_price=float(row.get("average_price") or 0.0),
                    )
                )
        return positions
