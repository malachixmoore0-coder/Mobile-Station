import time

from core.models import KalshiMarketQuote, OptionQuote, OptionRight, Venue
from pricing.black_scholes import price
from scanners.kalshi_mispricing import scan_event_sum_arbitrage, scan_locked_arbitrage
from scanners.options_mispricing import (
    scan_below_intrinsic,
    scan_iv_smile_outliers,
    scan_put_call_parity,
)

EXPIRY = time.time() + 30 * 24 * 3600  # 30 days out


def make_quote(strike: float, mid: float, right: OptionRight = OptionRight.CALL, spread: float = 0.05) -> OptionQuote:
    return OptionQuote(
        venue=Venue.TRADIER,
        underlying="TEST",
        symbol=f"TEST{strike}{right.value[0].upper()}",
        right=right,
        strike=strike,
        expiry_epoch=EXPIRY,
        bid=mid - spread,
        ask=mid + spread,
        underlying_price=100.0,
    )


def test_iv_smile_outlier_flags_the_planted_mispricing():
    s, t, r, q = 100.0, 30 / 365, 0.05, 0.0
    true_vol = 0.25
    strikes = [80, 90, 95, 100, 105, 110, 120]
    quotes = [
        make_quote(k, price(OptionRight.CALL, s, k, t, r, q, true_vol))
        for k in strikes
    ]
    # Plant one option priced far too high for its strike (implies a much
    # higher IV than its neighbors).
    mispriced = make_quote(100.0, price(OptionRight.CALL, s, 100.0, t, r, q, true_vol) + 3.0)
    quotes = [q for q in quotes if q.strike != 100] + [mispriced]

    results = scan_iv_smile_outliers(quotes, zscore_threshold=2.0, risk_free_rate=r)
    assert any(o.legs[0]["symbol"] == mispriced.symbol for o in results)


def test_iv_smile_no_outliers_when_all_consistent():
    s, t, r, q = 100.0, 30 / 365, 0.05, 0.0
    true_vol = 0.3
    strikes = [80, 90, 95, 100, 105, 110, 120]
    quotes = [make_quote(k, price(OptionRight.CALL, s, k, t, r, q, true_vol)) for k in strikes]
    results = scan_iv_smile_outliers(quotes, zscore_threshold=3.0, risk_free_rate=r)
    assert results == []


def test_put_call_parity_violation_detected():
    call = make_quote(100.0, 12.0, OptionRight.CALL)
    put = make_quote(100.0, 3.0, OptionRight.PUT)  # way too cheap relative to the call
    results = scan_put_call_parity([call, put], min_violation_usd=0.5)
    assert len(results) == 1
    assert results[0].edge_usd > 0.5


def test_put_call_parity_no_violation_for_consistent_prices():
    s, k, t, r, q, sigma = 100.0, 100.0, 0.5, 0.03, 0.0, 0.25
    call_price = price(OptionRight.CALL, s, k, t, r, q, sigma)
    put_price = price(OptionRight.PUT, s, k, t, r, q, sigma)
    call = OptionQuote(
        venue=Venue.TRADIER, underlying="TEST", symbol="C", right=OptionRight.CALL,
        strike=k, expiry_epoch=time.time() + t * 365 * 24 * 3600,
        bid=call_price - 0.01, ask=call_price + 0.01, underlying_price=s,
    )
    put = OptionQuote(
        venue=Venue.TRADIER, underlying="TEST", symbol="P", right=OptionRight.PUT,
        strike=k, expiry_epoch=time.time() + t * 365 * 24 * 3600,
        bid=put_price - 0.01, ask=put_price + 0.01, underlying_price=s,
    )
    results = scan_put_call_parity([call, put], min_violation_usd=0.5, risk_free_rate=r)
    assert results == []


def test_below_intrinsic_flagged():
    quote = make_quote(80.0, 15.0, OptionRight.CALL, spread=0.0)  # intrinsic is 20, ask is 15
    results = scan_below_intrinsic([quote])
    assert len(results) == 1
    assert results[0].edge_usd > 0


def test_kalshi_locked_arbitrage_detected():
    market = KalshiMarketQuote(
        ticker="TEST-MARKET", event_ticker="TEST-EVENT", title="Test",
        yes_bid=40, yes_ask=45, no_bid=50, no_ask=52,
    )
    results = scan_locked_arbitrage([market], min_edge_cents=1)
    assert len(results) == 1
    assert results[0].raw["edge_cents"] == 3  # 100 - (45 + 52)


def test_kalshi_locked_arbitrage_absent_when_no_edge():
    market = KalshiMarketQuote(
        ticker="TEST-MARKET", event_ticker="TEST-EVENT", title="Test",
        yes_bid=48, yes_ask=52, no_bid=48, no_ask=52,
    )
    results = scan_locked_arbitrage([market], min_edge_cents=1)
    assert results == []


def test_kalshi_event_sum_arbitrage_detected():
    markets = [
        KalshiMarketQuote(ticker=f"T-{i}", event_ticker="EVENT", title="t", yes_bid=10, yes_ask=20, no_bid=70, no_ask=80)
        for i in range(4)
    ]  # sum(yes_ask) = 80 < 100
    results = scan_event_sum_arbitrage(markets, min_edge_cents=1)
    assert len(results) == 1
    assert results[0].raw["edge_cents"] == 20
