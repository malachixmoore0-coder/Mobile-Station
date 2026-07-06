#!/usr/bin/env python3
import argparse

from bot import run
from config import config


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scans equity, crypto, and Kalshi markets for options/contract mispricing."
    )
    parser.add_argument(
        "--tradier-symbols",
        default="SPY,QQQ",
        help="Comma-separated underlyings to scan on Tradier (default: SPY,QQQ)",
    )
    parser.add_argument(
        "--deribit-currencies",
        default="BTC,ETH",
        help="Comma-separated currencies to scan on Deribit (default: BTC,ETH)",
    )
    parser.add_argument("--interval", type=int, default=None, help="Seconds between scans")
    parser.add_argument("--once", action="store_true", help="Run a single scan pass and exit")
    args = parser.parse_args()

    if config.live_trading:
        confirm = input(
            "LIVE_TRADING=true - this will place REAL orders with REAL money. "
            "Type 'yes' to continue: "
        )
        if confirm.strip().lower() != "yes":
            print("Aborted.")
            return

    run(
        tradier_symbols=[s.strip() for s in args.tradier_symbols.split(",") if s.strip()],
        deribit_currencies=[c.strip() for c in args.deribit_currencies.split(",") if c.strip()],
        interval_seconds=args.interval,
        once=args.once,
    )


if __name__ == "__main__":
    main()
