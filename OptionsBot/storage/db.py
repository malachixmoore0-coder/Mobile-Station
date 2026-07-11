from __future__ import annotations

import json
import sqlite3
import time
from contextlib import contextmanager

from core.models import Opportunity, Order

SCHEMA = """
CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    found_at REAL NOT NULL,
    venue TEXT NOT NULL,
    kind TEXT NOT NULL,
    description TEXT NOT NULL,
    edge_usd REAL NOT NULL,
    confidence REAL NOT NULL,
    legs_json TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    acted_on INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placed_at REAL NOT NULL,
    venue TEXT NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    limit_price REAL,
    opportunity_kind TEXT NOT NULL,
    client_order_id TEXT NOT NULL,
    dry_run INTEGER NOT NULL,
    result_json TEXT
);
"""


class Store:
    def __init__(self, path: str = "optionsbot.sqlite3") -> None:
        self.path = path
        with self._conn() as conn:
            conn.executescript(SCHEMA)

    @contextmanager
    def _conn(self):
        conn = sqlite3.connect(self.path)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def record_opportunity(self, opp: Opportunity, acted_on: bool = False) -> int:
        with self._conn() as conn:
            cur = conn.execute(
                "INSERT INTO opportunities "
                "(found_at, venue, kind, description, edge_usd, confidence, legs_json, raw_json, acted_on) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    opp.found_at,
                    opp.venue.value if hasattr(opp.venue, "value") else str(opp.venue),
                    opp.kind.value,
                    opp.description,
                    opp.edge_usd,
                    opp.confidence,
                    json.dumps(opp.legs),
                    json.dumps(opp.raw),
                    int(acted_on),
                ),
            )
            return cur.lastrowid

    def record_order(self, order: Order, dry_run: bool, result: dict) -> int:
        with self._conn() as conn:
            cur = conn.execute(
                "INSERT INTO orders "
                "(placed_at, venue, symbol, side, quantity, limit_price, opportunity_kind, "
                "client_order_id, dry_run, result_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    time.time(),
                    order.venue.value,
                    order.symbol,
                    order.side.value,
                    order.quantity,
                    order.limit_price,
                    order.opportunity_kind.value,
                    order.client_order_id,
                    int(dry_run),
                    json.dumps(result),
                ),
            )
            return cur.lastrowid
