import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

from backend.app.indicators.trend import calculate_ema, calculate_sma, calculate_macd, calculate_supertrend
from backend.app.indicators.momentum import calculate_rsi, calculate_bollinger_bands, calculate_atr, calculate_stochastic
from backend.app.indicators.volume import calculate_vwap, calculate_obv, calculate_volume_sma
from backend.app.indicators.smc import find_swing_points, find_order_blocks, find_fair_value_gaps, find_liquidity_sweeps

def calculate_all_indicators(
    df: pd.DataFrame,
    ema_fast_len: int = 9,
    ema_slow_len: int = 21,
    ema_trend_len: int = 200,
    rsi_len: int = 14,
    bb_len: int = 20,
    bb_std: float = 2.0,
    atr_len: int = 14
) -> Dict[str, Any]:
    """
    Calculate full indicator suite and return populated dataframe + SMC zones.
    """
    df = df.copy()
    
    # 1. Moving Averages
    df["ema_fast"] = calculate_ema(df["close"], ema_fast_len)
    df["ema_slow"] = calculate_ema(df["close"], ema_slow_len)
    df["ema_trend"] = calculate_ema(df["close"], ema_trend_len)
    df["sma_20"] = calculate_sma(df["close"], 20)
    df["sma_50"] = calculate_sma(df["close"], 50)
    
    # 2. MACD
    macd, signal, hist = calculate_macd(df["close"])
    df["macd_line"] = macd
    df["macd_signal"] = signal
    df["macd_hist"] = hist
    
    # 3. Supertrend
    st_val, st_dir = calculate_supertrend(df)
    df["supertrend"] = st_val
    df["supertrend_dir"] = st_dir
    
    # 4. Momentum: RSI, ATR, BB, Stoch
    df["rsi"] = calculate_rsi(df["close"], rsi_len)
    df["atr"] = calculate_atr(df, atr_len)
    
    bb_upper, bb_mid, bb_lower, bb_pct_b, bb_width = calculate_bollinger_bands(df["close"], bb_len, bb_std)
    df["bb_upper"] = bb_upper
    df["bb_middle"] = bb_mid
    df["bb_lower"] = bb_lower
    df["bb_pct_b"] = bb_pct_b
    df["bb_width"] = bb_width
    
    stoch_k, stoch_d = calculate_stochastic(df)
    df["stoch_k"] = stoch_k
    df["stoch_d"] = stoch_d
    
    # 5. Volume: VWAP, OBV, Vol SMA
    vwap, vwap_u1, vwap_l1, vwap_u2, vwap_l2 = calculate_vwap(df)
    df["vwap"] = vwap
    df["vwap_upper_1"] = vwap_u1
    df["vwap_lower_1"] = vwap_l1
    df["vwap_upper_2"] = vwap_u2
    df["vwap_lower_2"] = vwap_l2
    df["obv"] = calculate_obv(df)
    vol_sma, rvol = calculate_volume_sma(df)
    df["vol_sma"] = vol_sma
    df["rvol"] = rvol
    
    # 6. Smart Money Concepts: Order Blocks, FVGs, Sweeps
    df = find_swing_points(df)
    df = find_liquidity_sweeps(df)
    order_blocks = find_order_blocks(df)
    fair_value_gaps = find_fair_value_gaps(df)
    
    return {
        "df": df,
        "order_blocks": order_blocks,
        "fair_value_gaps": fair_value_gaps
    }
