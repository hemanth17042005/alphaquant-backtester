import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

def calculate_ema(series: pd.Series, period: int = 9) -> pd.Series:
    """Calculate Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()

def calculate_sma(series: pd.Series, period: int = 20) -> pd.Series:
    """Calculate Simple Moving Average."""
    return series.rolling(window=period).mean()

def calculate_macd(
    series: pd.Series,
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9
) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """
    Calculate MACD Line, Signal Line, and Histogram.
    """
    ema_fast = series.ewm(span=fast_period, adjust=False).mean()
    ema_slow = series.ewm(span=slow_period, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def calculate_supertrend(
    df: pd.DataFrame,
    period: int = 10,
    multiplier: float = 3.0
) -> Tuple[pd.Series, pd.Series]:
    """
    Calculate Supertrend Indicator and Trend Direction (1 for Bullish, -1 for Bearish).
    """
    high = df["high"]
    low = df["low"]
    close = df["close"]
    
    # Calculate True Range
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    
    hl2 = (high + low) / 2.0
    basic_upper = hl2 + (multiplier * atr)
    basic_lower = hl2 - (multiplier * atr)
    
    final_upper = pd.Series(index=df.index, dtype="float64")
    final_lower = pd.Series(index=df.index, dtype="float64")
    trend = pd.Series(index=df.index, dtype="int64")
    supertrend = pd.Series(index=df.index, dtype="float64")
    
    final_upper.iloc[0] = basic_upper.iloc[0]
    final_lower.iloc[0] = basic_lower.iloc[0]
    trend.iloc[0] = 1
    supertrend.iloc[0] = final_lower.iloc[0]
    
    for i in range(1, len(df)):
        # Upper band
        if basic_upper.iloc[i] < final_upper.iloc[i-1] or close.iloc[i-1] > final_upper.iloc[i-1]:
            final_upper.iloc[i] = basic_upper.iloc[i]
        else:
            final_upper.iloc[i] = final_upper.iloc[i-1]
            
        # Lower band
        if basic_lower.iloc[i] > final_lower.iloc[i-1] or close.iloc[i-1] < final_lower.iloc[i-1]:
            final_lower.iloc[i] = basic_lower.iloc[i]
        else:
            final_lower.iloc[i] = final_lower.iloc[i-1]
            
        # Trend
        prev_trend = trend.iloc[i-1]
        if prev_trend == 1 and close.iloc[i] < final_lower.iloc[i]:
            curr_trend = -1
        elif prev_trend == -1 and close.iloc[i] > final_upper.iloc[i]:
            curr_trend = 1
        else:
            curr_trend = prev_trend
            
        trend.iloc[i] = curr_trend
        supertrend.iloc[i] = final_lower.iloc[i] if curr_trend == 1 else final_upper.iloc[i]
        
    return supertrend, trend
