import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_market_regime(
    regime_type: str = "bull",
    n_bars: int = 500,
    start_price: float = 100.0,
    timeframe: str = "1d",
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate realistic synthetic OHLCV market regime data.
    Regime types:
    - 'bull': Upward trending market with healthy pullbacks & order blocks
    - 'bear': Downward trending sell-off with sharp relief rallies
    - 'chop': Sideways rangebound oscillating market (mean-reverting)
    - 'volatile_breakout': Low volatility consolidation followed by violent explosive breakout
    """
    np.random.seed(seed)
    
    if timeframe == "1d":
        dt_step = timedelta(days=1)
    elif timeframe == "1h":
        dt_step = timedelta(hours=1)
    elif timeframe == "15m":
        dt_step = timedelta(minutes=15)
    else:
        dt_step = timedelta(days=1)
        
    start_date = datetime.now() - (n_bars * dt_step)
    dates = [start_date + i * dt_step for i in range(n_bars)]
    
    if regime_type == "bull":
        drift = 0.0012
        vol = 0.015
        returns = np.random.normal(drift, vol, n_bars)
        # Add a couple of sharp liquidity sweep dips
        for dip_idx in [120, 280, 410]:
            if dip_idx < n_bars:
                returns[dip_idx] = -0.04
                returns[dip_idx+1] = 0.035
    elif regime_type == "bear":
        drift = -0.0015
        vol = 0.022
        returns = np.random.normal(drift, vol, n_bars)
        # Add bear market bounce bull traps
        for trap_idx in [150, 320]:
            if trap_idx < n_bars:
                returns[trap_idx] = 0.05
                returns[trap_idx+1] = -0.06
    elif regime_type == "chop":
        # Mean reverting Ornstein-Uhlenbeck style
        drift = 0.0
        vol = 0.012
        prices = [start_price]
        theta = 0.05
        mu = start_price
        for _ in range(1, n_bars):
            prev = prices[-1]
            shock = np.random.normal(0, vol * prev)
            p = prev + theta * (mu - prev) + shock
            prices.append(max(10.0, p))
        returns = np.diff(prices) / prices[:-1]
        returns = np.insert(returns, 0, 0.0)
    elif regime_type == "volatile_breakout":
        # First 300 bars low vol range, then explosive trend
        returns_p1 = np.random.normal(0.0001, 0.007, 300)
        returns_p2 = np.random.normal(0.0035, 0.025, n_bars - 300)
        returns = np.concatenate([returns_p1, returns_p2])
    else:
        returns = np.random.normal(0.0005, 0.018, n_bars)

    # Compute Close Prices
    price_series = start_price * np.cumprod(1 + returns)
    
    # Generate realistic Open, High, Low, Volume
    opens = []
    highs = []
    lows = []
    closes = []
    volumes = []
    
    for i in range(n_bars):
        c = float(price_series[i])
        if i == 0:
            o = float(start_price)
        else:
            gap = np.random.normal(0, 0.002 * c)
            o = float(closes[-1] + gap)
            
        intraday_vol = abs(np.random.normal(0.012, 0.006)) * c
        h = max(o, c) + abs(np.random.normal(0.4, 0.2)) * intraday_vol
        l = min(o, c) - abs(np.random.normal(0.4, 0.2)) * intraday_vol
        
        # Ensure high is max, low is min
        h = max(h, o, c)
        l = min(l, o, c, h * 0.999)
        
        base_vol = 1_000_000
        vol_multiplier = 1.0 + (abs(c - o) / o) * 15.0 + np.random.exponential(0.5)
        v = int(base_vol * vol_multiplier)
        
        opens.append(round(o, 2))
        highs.append(round(h, 2))
        lows.append(round(l, 2))
        closes.append(round(c, 2))
        volumes.append(v)
        
    df = pd.DataFrame({
        "timestamp": [d.isoformat() for d in dates],
        "open": opens,
        "high": highs,
        "low": lows,
        "close": closes,
        "volume": volumes
    })
    
    return df

SAMPLE_PRESETS = {
    "SAMPLE_BULL": {
        "name": "Synthetic Alpha Bull Market (Trending Up + SMC Pullbacks)",
        "symbol": "SAMPLE_BULL",
        "description": "500-bar upward trend with high institutional displacement and order block retests.",
        "regime": "bull"
    },
    "SAMPLE_BEAR": {
        "name": "Synthetic Tech Sell-Off (Bearish Downtrend & Bull Traps)",
        "symbol": "SAMPLE_BEAR",
        "description": "500-bar aggressive downtrend with bear flag traps and liquidity sweeps.",
        "regime": "bear"
    },
    "SAMPLE_CHOP": {
        "name": "Synthetic Rangebound Consolidation (Mean Reversion)",
        "symbol": "SAMPLE_CHOP",
        "description": "500-bar sideways channel ideal for RSI and Bollinger Band mean-reversion tests.",
        "regime": "chop"
    },
    "SAMPLE_BREAKOUT": {
        "name": "Synthetic Volatility Squeeze & Institutional Breakout",
        "symbol": "SAMPLE_BREAKOUT",
        "description": "Squeeze consolidation followed by explosive multi-sigma volume expansion.",
        "regime": "volatile_breakout"
    }
}
