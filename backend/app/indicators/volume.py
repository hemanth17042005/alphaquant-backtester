import pandas as pd
import numpy as np
from typing import Tuple

def calculate_vwap(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
    """
    Calculate Volume Weighted Average Price (VWAP) and Standard Deviation Bands (+1/-1, +2/-2 sigma).
    """
    high = df["high"]
    low = df["low"]
    close = df["close"]
    volume = df["volume"]
    
    typical_price = (high + low + close) / 3.0
    tp_volume = typical_price * volume
    
    # Check if timestamp contains date to anchor VWAP or use rolling / cumulative
    cum_vol = volume.cumsum().replace(0, np.nan)
    cum_tp_vol = tp_volume.cumsum()
    
    vwap = cum_tp_vol / cum_vol
    
    # Calculate VWAP Variance / Standard Deviation
    cum_tp_sq_vol = (typical_price ** 2 * volume).cumsum()
    variance = (cum_tp_sq_vol / cum_vol) - (vwap ** 2)
    variance = variance.clip(lower=0)
    stdev = np.sqrt(variance)
    
    vwap_upper_1 = vwap + (1.0 * stdev)
    vwap_lower_1 = vwap - (1.0 * stdev)
    vwap_upper_2 = vwap + (2.0 * stdev)
    vwap_lower_2 = vwap - (2.0 * stdev)
    
    return (
        vwap.fillna(close),
        vwap_upper_1.fillna(close * 1.01),
        vwap_lower_1.fillna(close * 0.99),
        vwap_upper_2.fillna(close * 1.02),
        vwap_lower_2.fillna(close * 0.98),
    )

def calculate_obv(df: pd.DataFrame) -> pd.Series:
    """Calculate On-Balance Volume (OBV)."""
    close = df["close"]
    volume = df["volume"]
    
    direction = np.sign(close.diff().fillna(0))
    direction.iloc[0] = 0
    obv = (direction * volume).cumsum()
    return obv

def calculate_volume_sma(df: pd.DataFrame, period: int = 20) -> Tuple[pd.Series, pd.Series]:
    """Calculate Volume Moving Average and Relative Volume (RVOL)."""
    vol_sma = df["volume"].rolling(window=period).mean()
    rvol = df["volume"] / vol_sma.replace(0, np.nan)
    return vol_sma.fillna(df["volume"]), rvol.fillna(1.0)
