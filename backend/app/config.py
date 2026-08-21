import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST_DIR = FRONTEND_DIR / "dist"
DATA_CACHE_DIR = BASE_DIR / "data_cache"

# Ensure cache directory exists
DATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# App Settings
APP_TITLE = "AlphaQuant Backtesting Platform"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = "Institutional-Grade Algorithmic Trading Strategy Backtester with SMC & Quantitative Risk Analytics"

# Default Backtest Parameters
DEFAULT_INITIAL_CAPITAL = 100000.0
DEFAULT_COMMISSION_PCT = 0.001  # 0.1% per trade
DEFAULT_SLIPPAGE_PCT = 0.0005   # 0.05% slippage
DEFAULT_RISK_PER_TRADE = 0.02   # 2% equity risk per trade
DEFAULT_TIMEFRAME = "1d"
DEFAULT_PERIOD = "2y"
