# 🚀 AlphaQuant: Automated Trading Strategy Backtesting Platform

An institutional-grade, quantitative algorithmic trading backtester and risk analytics platform built with **Python (FastAPI, Pandas, NumPy, Plotly)** and **React**.

Unlike speculative machine learning price predictors that suffer from overfitting and lookahead bias, AlphaQuant implements **systematic rule-based execution**, **Smart Money Concepts (SMC)**, and **quant-level risk management** (Kelly Criterion, dynamic ATR stops, Trailing Stops, R:R multiple targets, and Monte Carlo ruin stress tests).

---

## 🌟 Key Features & Unique Selling Points (USP)

### 1. Smart Money Concepts (SMC) & Institutional Price Action
- **Order Blocks (OB)**: Automatically identifies institutional footprints—last down candle before a violent displacement rally (Bullish OB) or last up candle before a breakdown (Bearish OB).
- **Fair Value Gaps (FVG)**: 3-candle price imbalance zones showing institutional inefficiencies.
- **Liquidity Sweeps & Market Structure**: Identifies stop-hunt wicks and swing highs/lows.

### 2. Multi-Indicator Technical Analysis Suite
- **Trend**: Fast EMA (9), Slow EMA (21), Macro Trend Filter (EMA 200), SMA, MACD (12, 26, 9), Supertrend.
- **Volume**: Institutional VWAP with $\pm 1\sigma, \pm 2\sigma, \pm 3\sigma$ standard deviation bands, On-Balance Volume (OBV), and Relative Volume (RVOL).
- **Momentum & Volatility**: RSI (14) with overbought/oversold levels, Bollinger Bands with Bandwidth Squeeze detection, Average True Range (ATR), and Stochastic Oscillator (%K, %D).

### 3. Quantitative Risk Management & Execution Modeling
- **Position Sizing Algorithms**:
  - **Fixed Risk % per Trade**: Automatically calculates unit size so that loss at Stop Loss equals exactly $X\%$ of total account equity.
  - **Half-Kelly Criterion**: Mathematical optimal capital allocation based on empirical win rate and win/loss ratio.
  - **Fixed Dollar / Fixed Shares**.
- **Dynamic Trade Protections**:
  - **Dynamic ATR Stop Loss / Take Profit** (e.g. SL = $1.5 \times \text{ATR}$, TP = $3.0 \times \text{ATR}$ for 1:2 R:R).
  - **SMC Invalidation Stop**: SL placed below the underlying Order Block.
  - **Break-Even Rule**: Automatically moves SL to entry once trade hits $+1.2\text{R}$.
  - **Trailing Stop**: Trails profit by $1.5 \times \text{ATR}$ after reaching $+1.0\text{R}$.
- **Friction Modeling**: Configurable exchange commissions (% per trade) and execution slippage.

### 4. Quant Analytics & Stress Testing
- **Executive KPI Dashboard**: ROI %, Benchmark (Buy & Hold) Return, Alpha, Win Rate %, Profit Factor, Sharpe Ratio, Sortino Ratio, Calmar Ratio, Expectancy ($ / %), Realized vs Planned R:R, and Risk of Ruin %.
- **Interactive Multi-Layer Candlestick Chart**: Plotly chart with toggles for indicators, SMC zones, and trade markers with detailed hover tooltips.
- **Underwater Drawdown & Equity Curve**: Track portfolio peaks and drawdown durations.
- **Monthly Returns Heatmap**: Calendar matrix of performance (Jan–Dec & YTD).
- **Monte Carlo Reshuffling Engine**: 500+ randomized trade sequence permutations generating 5th, 25th, 50th, 75th, and 95th percentile confidence bands.
- **2D Parameter Grid Search**: Sensitivity heatmaps across 2 parameters to prevent curve-fitting.
- **Trade Execution Ledger**: Filterable, searchable table of all simulated trades with 1-click CSV export.

---

## 🛠️ Quick Start & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Install Dependencies
```bash
# In project root
python -m venv .venv
.venv\Scripts\activate      # On Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt

# In frontend directory
cd frontend
npm install
npm run build
cd ..
```

### 2. Launch the Platform
```bash
# Launch unified web server & auto-open browser on http://localhost:8000
python start.py
```
*(On Windows, you can also double-click `run.bat`)*

---

## 📊 Pre-Packaged Institutional Strategy Presets

| Strategy Preset | Category | Mechanics |
| :--- | :--- | :--- |
| **SMC Order Block & FVG Sniper** | Institutional Price Action | Buys on Bullish OB / FVG retests with Macro 200 EMA trend alignment; sells on Bearish OB retests. |
| **EMA 9/21 Momentum Trend Rider** | Trend Following | Enters Long when EMA 9 crosses above EMA 21 while Price > EMA 200. |
| **VWAP Multi-Sigma Reversion** | Volume & Mean Reversion | Exploits overextended pricing by longing touches of Lower Band (-2σ) and shorting Upper Band (+2σ). |
| **RSI Dynamic Multi-Regime** | Momentum | Buys oversold RSI (<30) during macro bull regimes; shorts overbought RSI (>70) during macro bear regimes. |
| **Bollinger Bands Squeeze & Breakout** | Volatility | Detects bandwidth compression followed by expansion outside bands. |
| **50 / 200 SMA Golden Cross** | Macro Trend | Traditional long-term moving average institutional trend filter. |

---

## 🧪 Running Unit Tests
To verify all indicator calculations, SMC zone detection, risk models, and backtesting simulation:
```bash
.venv\Scripts\python -m pytest backend/tests/test_engine.py
```

---

## 🏛️ Project Architecture
```
d:\back testing platform/
├── backend/
│   ├── app/
│   │   ├── config.py                   # App settings & default constants
│   │   ├── main.py                     # FastAPI application & static server
│   │   ├── api/
│   │   │   └── routes.py               # REST API endpoints
│   │   ├── data/
│   │   │   ├── fetcher.py              # yfinance downloader & CSV parser
│   │   │   └── sample_data.py          # Synthetic market regime generator
│   │   ├── indicators/
│   │   │   ├── trend.py                # EMA, SMA, MACD, Supertrend
│   │   │   ├── momentum.py             # RSI, Bollinger Bands, ATR, Stoch
│   │   │   ├── volume.py               # VWAP (+sigma bands), OBV, RVOL
│   │   │   ├── smc.py                  # Order Blocks, FVG, Liquidity Sweeps
│   │   │   └── indicator_manager.py    # Pipeline coordinator
│   │   └── engine/
│   │       ├── models.py               # Pydantic schemas
│   │       ├── risk_manager.py         # Position sizing, ATR SL/TP, Trailing stops
│   │       ├── strategy.py             # Strategy presets & rule evaluator
│   │       ├── execution.py            # Event-driven backtesting engine
│   │       ├── metrics.py              # Sharpe, Sortino, Drawdown, Expectancy
│   │       ├── monte_carlo.py          # 500-run trade reshuffling engine
│   │       └── optimizer.py            # 2D Grid search parameter sweep
│   └── tests/
│       └── test_engine.py              # Quantitative unit tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Layout & Tab Navigation
│   │   ├── index.css                   # Cyber-Quant Glassmorphism Design
│   │   ├── components/                 # React UI Components
│   │   └── services/api.js             # API Client
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
├── start.py                            # One-click startup script
└── run.bat                             # Windows launcher
```
