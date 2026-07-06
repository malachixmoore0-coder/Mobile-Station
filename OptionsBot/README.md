# OptionsBot

Scans three markets for pricing mistakes and, if you turn live trading on,
trades them automatically:

- **Equity/ETF options** (via [Tradier](https://docs.tradier.com/)) - flags
  strikes whose implied volatility is a statistical outlier vs. the smile
  fitted through neighboring strikes, put-call parity violations, and
  quotes priced below intrinsic value.
- **Crypto options** (via [Deribit](https://docs.deribit.com/), BTC/ETH) -
  same three scanners, applied to Deribit's chain.
- **Kalshi event markets** - locked arbitrage on a single market
  (`yes_ask + no_ask < 100c`) and event-sum arbitrage across mutually
  exclusive markets under one event (`sum(yes_ask) < 100c`).

## This is real-money trading software. Read this before turning it on.

- **Defaults to dry-run.** `LIVE_TRADING=false` in `.env` is the default;
  every venue client checks it before touching an order-placing endpoint.
  Nothing places a real order until you explicitly set it to `true`, and
  `main.py` makes you type `yes` at a prompt on top of that.
- **The scanners are signals, not guarantees.** The IV-smile-outlier check
  is relative value (this strike looks mispriced *versus its neighbors*),
  not a certainty - it can be wrong, especially in illiquid names where
  wide bid/ask spreads themselves cause the appearance of an outlier. The
  put-call-parity and below-intrinsic checks are closer to true arbitrage
  but ignore transaction costs, assignment risk, and (for American-style
  equity options) early-exercise value - verify economics before sizing up.
  The Kalshi event-sum check is only valid if the markets you group really
  are mutually exclusive and exhaustive; verify that assumption per event
  before trusting it (see the confidence score on that opportunity type).
- **Test on sandboxes first.** Tradier's sandbox (`sandbox.tradier.com`)
  and Deribit's testnet (`test.deribit.com`) are real paper-trading
  accounts with delayed/live data feeds - use them. Kalshi's demo API
  (`demo-api.kalshi.co`) is the equivalent for Kalshi.
- **Risk limits are a backstop, not a strategy.** `risk/manager.py` caps
  worst-case loss per position, total open positions, and a daily-loss
  kill switch, all configured in `.env`. They fail closed (unknown/short
  strategies aren't sized correctly by the default estimator - see the
  docstring on `_estimate_worst_case_loss`) but they are not a substitute
  for understanding what you're trading.
- **You are responsible for your own capital, taxes, and compliance.**
  Nothing here is financial advice, and past scanner hits are not a
  guarantee of future edge.

## Setup

```bash
cd OptionsBot
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

1. Leave `LIVE_TRADING=false` while you get things running.
2. Enable whichever venues you have accounts for (`ENABLE_TRADIER`,
   `ENABLE_DERIBIT`, `ENABLE_KALSHI`) and fill in their credentials:
   - **Tradier**: sign up, generate a sandbox access token + account ID
     from your API settings. `TRADIER_BASE_URL=https://sandbox.tradier.com`.
   - **Deribit**: create a testnet account at test.deribit.com, generate a
     client ID/secret under API settings.
   - **Kalshi**: generate an API key under account settings; it gives you
     a Key ID and a private key file (RSA, only shown once - save it).
     Point `KALSHI_PRIVATE_KEY_PATH` at that file. Double-check the demo
     and production base URLs in Kalshi's current docs before you rely on
     the ones in `.env.example` - Kalshi has changed hostnames before.
3. Adjust `MAX_POSITION_RISK_USD`, `MAX_DAILY_LOSS_USD`,
   `MAX_OPEN_POSITIONS`, and the scanner thresholds to taste.

## Running

```bash
python main.py --once                                   # single scan, dry-run, all default symbols
python main.py --tradier-symbols SPY,AAPL,TSLA --once
python main.py --deribit-currencies BTC --interval 30
python main.py                                           # continuous loop at SCAN_INTERVAL_SECONDS
```

Every opportunity found (and every order attempt, simulated or real) is
logged to `optionsbot.sqlite3` in the working directory - inspect it with
any SQLite client to review what the bot has seen and done.

Going live is one flag plus one typed confirmation:

```bash
# in .env
LIVE_TRADING=true
```

```bash
python main.py
# LIVE_TRADING=true - this will place REAL orders with REAL money. Type 'yes' to continue:
```

## Architecture

```
config.py                  env-driven settings, all risk/scanner knobs
core/models.py              shared dataclasses (quotes, opportunities, orders, positions)
pricing/black_scholes.py    price/greeks/implied-vol, no external deps on a vol forecast
venues/{tradier,deribit,kalshi}.py   one adapter per market, common venues/base.py interface
scanners/options_mispricing.py       IV-smile outlier, put-call parity, below-intrinsic
scanners/kalshi_mispricing.py        locked arbitrage, event-sum arbitrage
risk/manager.py             position/day loss limits + kill switch, approves or rejects each opportunity
execution/order_manager.py  the only path from opportunity -> order; always risk-checked, always logged
storage/db.py                SQLite log of every opportunity and order
bot.py / main.py             scan loop wiring + CLI
```

To add a new scanner: write a function that takes a list of quotes and
returns `list[Opportunity]`, wire it into `scan_all` in the relevant
scanner module. To add a venue: implement `venues/base.VenueClient` and
register it in `bot.build_venue_clients`.

## Tests

```bash
python -m pytest tests/ -v
```

Covers the Black-Scholes math (price/parity/greeks/implied-vol round
trips) and every scanner's detection logic against synthetic data - no
network or credentials required.
