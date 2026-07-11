from __future__ import annotations

import base64
import time
import uuid

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

from config import config
from core.logging_setup import get_logger
from core.models import KalshiMarketQuote, Order, Position, Venue
from venues.base import VenueClient

log = get_logger(__name__)

API_PREFIX = "/trade-api/v2"


class KalshiClient(VenueClient):
    """Event/prediction markets via Kalshi's Trade API.

    Docs: https://docs.kalshi.com/. Requests under /portfolio require
    RSA-PSS-signed headers; market data endpoints are public. Verify the
    current base URLs in Kalshi's docs before pointing this at production -
    they have changed hostnames before.
    """

    name = "kalshi"

    def __init__(self) -> None:
        self.base_url = config.kalshi_base_url.rstrip("/")
        self.key_id = config.kalshi_api_key_id
        self._private_key = None
        if config.kalshi_private_key_path:
            try:
                with open(config.kalshi_private_key_path, "rb") as f:
                    self._private_key = serialization.load_pem_private_key(f.read(), password=None)
            except FileNotFoundError:
                log.warning("Kalshi private key not found at %s", config.kalshi_private_key_path)
        self._session = requests.Session()

    def is_live_ready(self) -> bool:
        return bool(self.key_id and self._private_key)

    def _signed_headers(self, method: str, path: str) -> dict:
        timestamp_ms = str(int(time.time() * 1000))
        message = f"{timestamp_ms}{method}{path}".encode()
        signature = self._private_key.sign(
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()), salt_length=hashes.SHA256().digest_size
            ),
            hashes.SHA256(),
        )
        return {
            "KALSHI-ACCESS-KEY": self.key_id,
            "KALSHI-ACCESS-SIGNATURE": base64.b64encode(signature).decode(),
            "KALSHI-ACCESS-TIMESTAMP": timestamp_ms,
        }

    def _get(self, path: str, params: dict | None = None, authed: bool = False) -> dict:
        headers = self._signed_headers("GET", path) if authed else {}
        resp = self._session.get(f"{self.base_url}{path}", params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_events(self, status: str = "open", limit: int = 200) -> list[dict]:
        return self._get(f"{API_PREFIX}/events", params={"status": status, "limit": limit}).get(
            "events", []
        )

    def get_markets(self, event_ticker: str | None = None, limit: int = 200) -> list[KalshiMarketQuote]:
        params = {"limit": limit, "status": "open"}
        if event_ticker:
            params["event_ticker"] = event_ticker
        rows = self._get(f"{API_PREFIX}/markets", params=params).get("markets", [])
        return [
            KalshiMarketQuote(
                ticker=row["ticker"],
                event_ticker=row.get("event_ticker", ""),
                title=row.get("title", row["ticker"]),
                yes_bid=int(row.get("yes_bid") or 0),
                yes_ask=int(row.get("yes_ask") or 0),
                no_bid=int(row.get("no_bid") or 0),
                no_ask=int(row.get("no_ask") or 0),
                volume=int(row.get("volume") or 0),
            )
            for row in rows
        ]

    def place_order(self, order: Order, dry_run: bool) -> dict:
        client_id = order.client_order_id or str(uuid.uuid4())
        if dry_run or not config.live_trading:
            log.info(
                "[DRY RUN] kalshi order not sent: %s %s x%d @ %s (%s)",
                order.side.value,
                order.symbol,
                order.quantity,
                order.limit_price,
                client_id,
            )
            return {"status": "simulated", "client_order_id": client_id}

        if not self.is_live_ready():
            raise RuntimeError("Kalshi credentials not configured")

        path = f"{API_PREFIX}/portfolio/orders"
        # order.symbol is expected in the form "TICKER:yes" or "TICKER:no"
        ticker, market_side = order.symbol.split(":")
        price_cents = int(round(order.limit_price)) if order.limit_price else None
        body = {
            "ticker": ticker,
            "client_order_id": client_id,
            "side": market_side,
            "action": order.side.value,  # "buy" or "sell"
            "count": order.quantity,
            "type": "limit" if price_cents else "market",
        }
        if price_cents is not None:
            body[f"{market_side}_price"] = price_cents
        headers = self._signed_headers("POST", path)
        resp = self._session.post(f"{self.base_url}{path}", json=body, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_positions(self) -> list[Position]:
        if not self.is_live_ready():
            return []
        path = f"{API_PREFIX}/portfolio/positions"
        rows = self._get(path, authed=True).get("market_positions", [])
        return [
            Position(
                venue=Venue.KALSHI,
                symbol=row["ticker"],
                quantity=int(row.get("position", 0)),
                avg_price=float(row.get("market_exposure", 0)) / 100.0,
            )
            for row in rows
            if row.get("position", 0) != 0
        ]
