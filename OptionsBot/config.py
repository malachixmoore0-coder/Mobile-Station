import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() == "true"


def _float(name: str, default: float) -> float:
    val = os.getenv(name)
    return float(val) if val else default


def _int(name: str, default: int) -> int:
    val = os.getenv(name)
    return int(val) if val else default


@dataclass
class RiskConfig:
    max_position_risk_usd: float = _float("MAX_POSITION_RISK_USD", 200)
    max_daily_loss_usd: float = _float("MAX_DAILY_LOSS_USD", 500)
    max_open_positions: int = _int("MAX_OPEN_POSITIONS", 10)


@dataclass
class ScannerConfig:
    iv_zscore_threshold: float = _float("OPTIONS_IV_ZSCORE_THRESHOLD", 2.5)
    parity_violation_min_usd: float = _float("PARITY_VIOLATION_MIN_USD", 0.15)
    kalshi_arb_min_edge_cents: float = _float("KALSHI_ARB_MIN_EDGE_CENTS", 2)


@dataclass
class Config:
    # Global kill switch. Every order-placement path must check this before
    # touching real money - default is always dry-run.
    live_trading: bool = _bool("LIVE_TRADING", False)

    enable_tradier: bool = _bool("ENABLE_TRADIER", False)
    enable_deribit: bool = _bool("ENABLE_DERIBIT", False)
    enable_kalshi: bool = _bool("ENABLE_KALSHI", False)

    tradier_base_url: str = os.getenv("TRADIER_BASE_URL", "https://sandbox.tradier.com")
    tradier_access_token: str = os.getenv("TRADIER_ACCESS_TOKEN", "")
    tradier_account_id: str = os.getenv("TRADIER_ACCOUNT_ID", "")

    deribit_base_url: str = os.getenv("DERIBIT_BASE_URL", "https://test.deribit.com")
    deribit_client_id: str = os.getenv("DERIBIT_CLIENT_ID", "")
    deribit_client_secret: str = os.getenv("DERIBIT_CLIENT_SECRET", "")

    kalshi_base_url: str = os.getenv("KALSHI_BASE_URL", "https://demo-api.kalshi.co")
    kalshi_api_key_id: str = os.getenv("KALSHI_API_KEY_ID", "")
    kalshi_private_key_path: str = os.getenv("KALSHI_PRIVATE_KEY_PATH", "./kalshi_private_key.pem")

    scan_interval_seconds: int = _int("SCAN_INTERVAL_SECONDS", 60)

    risk: RiskConfig = field(default_factory=RiskConfig)
    scanner: ScannerConfig = field(default_factory=ScannerConfig)


config = Config()
