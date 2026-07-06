import math

import pytest

from core.models import OptionRight
from pricing.black_scholes import (
    ImpliedVolError,
    greeks,
    implied_volatility,
    intrinsic_value,
    price,
)


def test_call_put_parity_holds_for_model_prices():
    s, k, t, r, q, sigma = 100.0, 100.0, 0.5, 0.03, 0.0, 0.25
    call = price(OptionRight.CALL, s, k, t, r, q, sigma)
    put = price(OptionRight.PUT, s, k, t, r, q, sigma)
    lhs = call - put
    rhs = s * math.exp(-q * t) - k * math.exp(-r * t)
    assert lhs == pytest.approx(rhs, abs=1e-8)


def test_atm_call_price_reasonable():
    call = price(OptionRight.CALL, 100.0, 100.0, 1.0, 0.05, 0.0, 0.2)
    assert 8.0 < call < 12.0  # standard textbook ballpark for these params


def test_deep_itm_call_converges_to_intrinsic_as_vol_shrinks():
    call = price(OptionRight.CALL, 150.0, 100.0, 0.1, 0.0, 0.0, 0.001)
    assert call == pytest.approx(50.0, abs=0.5)


def test_intrinsic_value():
    assert intrinsic_value(OptionRight.CALL, 110, 100) == 10
    assert intrinsic_value(OptionRight.CALL, 90, 100) == 0
    assert intrinsic_value(OptionRight.PUT, 90, 100) == 10
    assert intrinsic_value(OptionRight.PUT, 110, 100) == 0


def test_implied_volatility_round_trips_price():
    s, k, t, r, q, true_sigma = 100.0, 105.0, 0.75, 0.04, 0.01, 0.35
    model_price = price(OptionRight.CALL, s, k, t, r, q, true_sigma)
    solved_sigma = implied_volatility(model_price, OptionRight.CALL, s, k, t, r, q)
    assert solved_sigma == pytest.approx(true_sigma, abs=1e-4)


def test_implied_volatility_round_trips_for_put():
    s, k, t, r, q, true_sigma = 100.0, 95.0, 0.25, 0.02, 0.0, 0.6
    model_price = price(OptionRight.PUT, s, k, t, r, q, true_sigma)
    solved_sigma = implied_volatility(model_price, OptionRight.PUT, s, k, t, r, q)
    assert solved_sigma == pytest.approx(true_sigma, abs=1e-4)


def test_implied_volatility_rejects_below_intrinsic():
    with pytest.raises(ImpliedVolError):
        implied_volatility(1.0, OptionRight.CALL, 150.0, 100.0, 0.5, 0.05, 0.0)


def test_greeks_call_delta_between_zero_and_one():
    g = greeks(OptionRight.CALL, 100.0, 100.0, 0.5, 0.03, 0.0, 0.25)
    assert 0.0 < g.delta < 1.0
    assert g.gamma > 0
    assert g.vega > 0


def test_greeks_put_delta_between_minus_one_and_zero():
    g = greeks(OptionRight.PUT, 100.0, 100.0, 0.5, 0.03, 0.0, 0.25)
    assert -1.0 < g.delta < 0.0
