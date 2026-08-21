import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

def find_swing_points(
    df: pd.DataFrame,
    left_bars: int = 3,
    right_bars: int = 3
) -> pd.DataFrame:
    """
    Identify swing highs and swing lows (fractals).
    """
    df = df.copy()
    highs = df["high"].values
    lows = df["low"].values
    n = len(df)
    
    is_swing_high = np.zeros(n, dtype=bool)
    is_swing_low = np.zeros(n, dtype=bool)
    swing_high_val = np.full(n, np.nan)
    swing_low_val = np.full(n, np.nan)
    
    for i in range(left_bars, n - right_bars):
        current_h = highs[i]
        current_l = lows[i]
        
        # Check Swing High
        if all(current_h > highs[i - l] for l in range(1, left_bars + 1)) and \
           all(current_h >= highs[i + r] for r in range(1, right_bars + 1)):
            is_swing_high[i] = True
            swing_high_val[i] = current_h
            
        # Check Swing Low
        if all(current_l < lows[i - l] for l in range(1, left_bars + 1)) and \
           all(current_l <= lows[i + r] for r in range(1, right_bars + 1)):
            is_swing_low[i] = True
            swing_low_val[i] = current_l
            
    df["is_swing_high"] = is_swing_high
    df["is_swing_low"] = is_swing_low
    df["swing_high_val"] = pd.Series(swing_high_val, index=df.index).ffill()
    df["swing_low_val"] = pd.Series(swing_low_val, index=df.index).ffill()
    
    return df

def find_order_blocks(
    df: pd.DataFrame,
    swing_window: int = 3,
    min_displacement_atr_mult: float = 1.5
) -> List[Dict[str, Any]]:
    """
    Detect institutional Order Blocks (OB).
    - Bullish OB: The last down candle (close < open) before a strong displacement rally that breaks structure.
    - Bearish OB: The last up candle (close > open) before an aggressive displacement drop that breaks structure.
    """
    n = len(df)
    if n < 10:
        return []
        
    opens = df["open"].values
    highs = df["high"].values
    lows = df["low"].values
    closes = df["close"].values
    timestamps = df["timestamp"].values
    
    # Calculate simple ATR for displacement threshold
    tr = np.maximum(highs[1:] - lows[1:], np.maximum(np.abs(highs[1:] - closes[:-1]), np.abs(lows[1:] - closes[:-1])))
    atr = np.mean(tr[-50:]) if len(tr) >= 50 else np.mean(tr)
    disp_threshold = atr * min_displacement_atr_mult
    
    order_blocks = []
    
    for i in range(2, n - 3):
        # Check for Bullish Order Block
        # 1. Look for a powerful displacement green candle at i+1 or i+2
        displacement_up = (closes[i+1] - opens[i+1] > disp_threshold) or (closes[i+2] - opens[i] > disp_threshold * 1.5)
        # 2. Candle i was a down candle or indecision base
        if closes[i] <= opens[i] and displacement_up and closes[i+1] > highs[i]:
            ob_top = max(opens[i], highs[i])
            ob_bottom = lows[i]
            
            # Find if and when it was mitigated (retested)
            mitigated = False
            mitigated_index = None
            for j in range(i + 2, n):
                if lows[j] <= ob_top:
                    mitigated = True
                    mitigated_index = int(j)
                    break
                    
            order_blocks.append({
                "type": "bullish_ob",
                "start_idx": int(i),
                "start_time": str(timestamps[i]),
                "end_idx": mitigated_index if mitigated else int(n - 1),
                "end_time": str(timestamps[mitigated_index]) if mitigated else str(timestamps[-1]),
                "top": float(ob_top),
                "bottom": float(ob_bottom),
                "mitigated": mitigated,
                "volume": float(df["volume"].iloc[i])
            })
            
        # Check for Bearish Order Block
        displacement_down = (opens[i+1] - closes[i+1] > disp_threshold) or (opens[i] - closes[i+2] > disp_threshold * 1.5)
        if closes[i] >= opens[i] and displacement_down and closes[i+1] < lows[i]:
            ob_top = highs[i]
            ob_bottom = min(opens[i], lows[i])
            
            mitigated = False
            mitigated_index = None
            for j in range(i + 2, n):
                if highs[j] >= ob_bottom:
                    mitigated = True
                    mitigated_index = int(j)
                    break
                    
            order_blocks.append({
                "type": "bearish_ob",
                "start_idx": int(i),
                "start_time": str(timestamps[i]),
                "end_idx": mitigated_index if mitigated else int(n - 1),
                "end_time": str(timestamps[mitigated_index]) if mitigated else str(timestamps[-1]),
                "top": float(ob_top),
                "bottom": float(ob_bottom),
                "mitigated": mitigated,
                "volume": float(df["volume"].iloc[i])
            })
            
    return order_blocks

def find_fair_value_gaps(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Detect Fair Value Gaps (FVG) / 3-Candle Imbalances.
    - Bullish FVG: Candle 1 High < Candle 3 Low (Gap zone: [Candle 1 High, Candle 3 Low])
    - Bearish FVG: Candle 1 Low > Candle 3 High (Gap zone: [Candle 3 High, Candle 1 Low])
    """
    n = len(df)
    if n < 5:
        return []
        
    highs = df["high"].values
    lows = df["low"].values
    timestamps = df["timestamp"].values
    
    fvgs = []
    
    for i in range(1, n - 1):
        c1_high = highs[i - 1]
        c1_low = lows[i - 1]
        c3_high = highs[i + 1]
        c3_low = lows[i + 1]
        
        # Bullish FVG
        if c3_low > c1_high:
            gap_bottom = c1_high
            gap_top = c3_low
            
            # Check for fill
            mitigated = False
            mitigated_index = None
            for j in range(i + 2, n):
                if lows[j] <= gap_bottom:
                    mitigated = True
                    mitigated_index = int(j)
                    break
                    
            fvgs.append({
                "type": "bullish_fvg",
                "start_idx": int(i),
                "start_time": str(timestamps[i]),
                "end_idx": mitigated_index if mitigated else int(n - 1),
                "end_time": str(timestamps[mitigated_index]) if mitigated else str(timestamps[-1]),
                "top": float(gap_top),
                "bottom": float(gap_bottom),
                "mitigated": mitigated
            })
            
        # Bearish FVG
        elif c1_low > c3_high:
            gap_top = c1_low
            gap_bottom = c3_high
            
            mitigated = False
            mitigated_index = None
            for j in range(i + 2, n):
                if highs[j] >= gap_top:
                    mitigated = True
                    mitigated_index = int(j)
                    break
                    
            fvgs.append({
                "type": "bearish_fvg",
                "start_idx": int(i),
                "start_time": str(timestamps[i]),
                "end_idx": mitigated_index if mitigated else int(n - 1),
                "end_time": str(timestamps[mitigated_index]) if mitigated else str(timestamps[-1]),
                "top": float(gap_top),
                "bottom": float(gap_bottom),
                "mitigated": mitigated
            })
            
    return fvgs

def find_liquidity_sweeps(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """
    Detect liquidity sweeps (wicks piercing key highs/lows and immediately rejecting).
    """
    df = df.copy()
    rolling_high = df["high"].shift(1).rolling(window=window).max()
    rolling_low = df["low"].shift(1).rolling(window=window).min()
    
    # Bullish Liquidity Sweep: Low breaks below rolling low but Close closes back above
    bullish_sweep = (df["low"] < rolling_low) & (df["close"] > rolling_low)
    # Bearish Liquidity Sweep: High breaks above rolling high but Close closes back below
    bearish_sweep = (df["high"] > rolling_high) & (df["close"] < rolling_high)
    
    df["bullish_sweep"] = bullish_sweep
    df["bearish_sweep"] = bearish_sweep
    
    return df
