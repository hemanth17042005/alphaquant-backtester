import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from backend.app.engine.models import StrategyConfig, StrategyRule, StrategyCondition

STRATEGY_PRESETS = [
    {
        "id": "smc_orderblock_fvg",
        "name": "Smart Money Concepts: Order Block & FVG Sniper",
        "description": "Institutional trading system that buys on Bullish Order Block / Fair Value Gap re-tests with trend alignment, and sells on Bearish OB re-tests.",
        "category": "Smart Money Concepts",
        "default_timeframe": "1h",
        "direction": "both"
    },
    {
        "id": "ema_cross_9_21",
        "name": "EMA 9/21 Momentum Trend Rider",
        "description": "Enters Long when EMA 9 crosses above EMA 21 while price is above EMA 200; enters Short on downward crossover.",
        "category": "Trend Following",
        "default_timeframe": "1d",
        "direction": "both"
    },
    {
        "id": "vwap_mean_reversion",
        "name": "VWAP Multi-Sigma Institutional Reversion",
        "description": "Identifies overextended institutional pricing by longing touches of Lower VWAP Band (-2σ) and shorting Upper VWAP Band (+2σ).",
        "category": "Volume & Institutional",
        "default_timeframe": "15m",
        "direction": "both"
    },
    {
        "id": "rsi_reversal",
        "name": "RSI Dynamic Multi-Regime Mean Reversion",
        "description": "Buys oversold RSI (<30) when macro trend is bullish, and shorts overbought RSI (>70) when macro trend is bearish.",
        "category": "Momentum",
        "default_timeframe": "1d",
        "direction": "both"
    },
    {
        "id": "bollinger_squeeze_breakout",
        "name": "Bollinger Bands Squeeze & Volatility Breakout",
        "description": "Detects low-volatility compression (Bandwidth squeeze) followed by strong multi-bar expansion.",
        "category": "Volatility Breakout",
        "default_timeframe": "1d",
        "direction": "long_only"
    },
    {
        "id": "golden_death_cross",
        "name": "50 / 200 SMA Institutional Golden Cross",
        "description": "Classic macro momentum strategy that rides long-term cyclical bull and bear markets.",
        "category": "Macro Trend",
        "default_timeframe": "1d",
        "direction": "long_only"
    }
]

def evaluate_condition(
    condition: StrategyCondition,
    df: pd.DataFrame,
    idx: int,
    order_blocks: List[Dict[str, Any]],
    fair_value_gaps: List[Dict[str, Any]]
) -> bool:
    """Evaluate a single atomic trading condition on a specific bar."""
    ind_a = condition.indicator_a
    op = condition.operator
    ind_b = condition.indicator_b
    val = condition.value
    
    # Handle SMC Zone conditions
    if op == "touches_bullish_ob":
        low_val = df["low"].iloc[idx]
        for ob in order_blocks:
            if ob["type"] == "bullish_ob" and ob["start_idx"] <= idx <= ob["end_idx"]:
                if low_val <= ob["top"] and df["high"].iloc[idx] >= ob["bottom"]:
                    return True
        return False
        
    elif op == "touches_bearish_ob":
        high_val = df["high"].iloc[idx]
        for ob in order_blocks:
            if ob["type"] == "bearish_ob" and ob["start_idx"] <= idx <= ob["end_idx"]:
                if high_val >= ob["bottom"] and df["low"].iloc[idx] <= ob["top"]:
                    return True
        return False
        
    elif op == "touches_bullish_fvg":
        low_val = df["low"].iloc[idx]
        for fvg in fair_value_gaps:
            if fvg["type"] == "bullish_fvg" and fvg["start_idx"] <= idx <= fvg["end_idx"]:
                if low_val <= fvg["top"] and df["high"].iloc[idx] >= fvg["bottom"]:
                    return True
        return False

    elif op == "touches_bearish_fvg":
        high_val = df["high"].iloc[idx]
        for fvg in fair_value_gaps:
            if fvg["type"] == "bearish_fvg" and fvg["start_idx"] <= idx <= fvg["end_idx"]:
                if high_val >= fvg["bottom"] and df["low"].iloc[idx] <= fvg["top"]:
                    return True
        return False

    # Get indicator A value
    if ind_a not in df.columns:
        return False
    val_a = df[ind_a].iloc[idx]
    
    # Get comparison target (either indicator B or scalar value)
    if ind_b and ind_b in df.columns:
        target_val = df[ind_b].iloc[idx]
    elif val is not None:
        target_val = val
    else:
        return False
        
    if pd.isna(val_a) or pd.isna(target_val):
        return False
        
    if op == ">":
        return bool(val_a > target_val)
    elif op == "<":
        return bool(val_a < target_val)
    elif op == ">=":
        return bool(val_a >= target_val)
    elif op == "<=":
        return bool(val_a <= target_val)
    elif op == "crosses_above":
        if idx == 0:
            return False
        prev_a = df[ind_a].iloc[idx - 1]
        prev_b = df[ind_b].iloc[idx - 1] if ind_b in df.columns else target_val
        return bool(prev_a <= prev_b and val_a > target_val)
    elif op == "crosses_below":
        if idx == 0:
            return False
        prev_a = df[ind_a].iloc[idx - 1]
        prev_b = df[ind_b].iloc[idx - 1] if ind_b in df.columns else target_val
        return bool(prev_a >= prev_b and val_a < target_val)
        
    return False

def evaluate_rule(
    rule: Optional[StrategyRule],
    df: pd.DataFrame,
    idx: int,
    order_blocks: List[Dict[str, Any]],
    fair_value_gaps: List[Dict[str, Any]]
) -> bool:
    """Evaluate a compound StrategyRule (AND / OR conditions)."""
    if not rule or not rule.conditions:
        return False
        
    results = [evaluate_condition(c, df, idx, order_blocks, fair_value_gaps) for c in rule.conditions]
    
    if rule.logic_operator == "AND":
        return all(results)
    else:
        return any(results)

def generate_signals(
    df: pd.DataFrame,
    strategy_config: StrategyConfig,
    order_blocks: List[Dict[str, Any]],
    fair_value_gaps: List[Dict[str, Any]]
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate boolean signal masks for:
    (long_entries, long_exits, short_entries, short_exits)
    """
    n = len(df)
    long_entries = np.zeros(n, dtype=bool)
    long_exits = np.zeros(n, dtype=bool)
    short_entries = np.zeros(n, dtype=bool)
    short_exits = np.zeros(n, dtype=bool)
    
    preset = strategy_config.preset_id
    direction = strategy_config.direction
    
    allow_long = direction in ["long_only", "both"]
    allow_short = direction in ["short_only", "both"]
    
    # Check if a built-in preset was selected
    if preset == "smc_orderblock_fvg":
        # SMC Sniper Strategy:
        # Long: Price tests Bullish OB or Bullish FVG while Close > EMA Trend (or Supertrend == 1)
        # Short: Price tests Bearish OB or Bearish FVG while Close < EMA Trend (or Supertrend == -1)
        for i in range(1, n):
            c = df["close"].iloc[i]
            l = df["low"].iloc[i]
            h = df["high"].iloc[i]
            trend_filter_long = c >= df["ema_trend"].iloc[i] * 0.97
            trend_filter_short = c <= df["ema_trend"].iloc[i] * 1.03
            
            # Check Bullish OB or FVG touch
            ob_long = False
            for ob in order_blocks:
                if ob["type"] == "bullish_ob" and ob["start_idx"] <= i <= min(i + 30, ob["end_idx"]):
                    if l <= ob["top"] and c >= ob["bottom"]:
                        ob_long = True
                        break
                        
            fvg_long = False
            for fvg in fair_value_gaps:
                if fvg["type"] == "bullish_fvg" and fvg["start_idx"] <= i <= min(i + 20, fvg["end_idx"]):
                    if l <= fvg["top"] and c >= fvg["bottom"]:
                        fvg_long = True
                        break
                        
            if allow_long and (ob_long or fvg_long) and trend_filter_long:
                long_entries[i] = True
                
            # Check Bearish OB or FVG touch
            ob_short = False
            for ob in order_blocks:
                if ob["type"] == "bearish_ob" and ob["start_idx"] <= i <= min(i + 30, ob["end_idx"]):
                    if h >= ob["bottom"] and c <= ob["top"]:
                        ob_short = True
                        break
                        
            fvg_short = False
            for fvg in fair_value_gaps:
                if fvg["type"] == "bearish_fvg" and fvg["start_idx"] <= i <= min(i + 20, fvg["end_idx"]):
                    if h >= fvg["bottom"] and c <= fvg["top"]:
                        fvg_short = True
                        break
                        
            if allow_short and (ob_short or fvg_short) and trend_filter_short:
                short_entries[i] = True
                
    elif preset == "ema_cross_9_21":
        # Fast EMA crosses Slow EMA
        ema_f = df["ema_fast"].values
        ema_s = df["ema_slow"].values
        ema_t = df["ema_trend"].values
        close = df["close"].values
        
        for i in range(1, n):
            # Bullish Cross
            if ema_f[i-1] <= ema_s[i-1] and ema_f[i] > ema_s[i]:
                if allow_long and close[i] > ema_t[i] * 0.98:
                    long_entries[i] = True
                if allow_short:
                    short_exits[i] = True
                    
            # Bearish Cross
            elif ema_f[i-1] >= ema_s[i-1] and ema_f[i] < ema_s[i]:
                if allow_short and close[i] < ema_t[i] * 1.02:
                    short_entries[i] = True
                if allow_long:
                    long_exits[i] = True

    elif preset == "vwap_mean_reversion":
        # Mean Reversion at VWAP Bands
        close = df["close"].values
        vwap_l2 = df["vwap_lower_2"].values
        vwap_u2 = df["vwap_upper_2"].values
        vwap_mid = df["vwap"].values
        rsi = df["rsi"].values
        
        for i in range(1, n):
            # Price closes below -2 sigma band and RSI < 35 -> Buy Reversion
            if allow_long and close[i] < vwap_l2[i] and rsi[i] < 38:
                long_entries[i] = True
            elif close[i] >= vwap_mid[i]:
                long_exits[i] = True
                
            # Price closes above +2 sigma band and RSI > 65 -> Sell Reversion
            if allow_short and close[i] > vwap_u2[i] and rsi[i] > 62:
                short_entries[i] = True
            elif close[i] <= vwap_mid[i]:
                short_exits[i] = True

    elif preset == "rsi_reversal":
        rsi = df["rsi"].values
        close = df["close"].values
        ema_t = df["ema_trend"].values
        
        for i in range(1, n):
            # RSI oversold bounce
            if rsi[i-1] < 30 and rsi[i] >= 30:
                if allow_long and close[i] > ema_t[i] * 0.95:
                    long_entries[i] = True
            elif rsi[i] > 65:
                long_exits[i] = True
                
            # RSI overbought rejection
            if rsi[i-1] > 70 and rsi[i] <= 70:
                if allow_short and close[i] < ema_t[i] * 1.05:
                    short_entries[i] = True
            elif rsi[i] < 35:
                short_exits[i] = True

    elif preset == "bollinger_squeeze_breakout":
        close = df["close"].values
        bb_upper = df["bb_upper"].values
        bb_lower = df["bb_lower"].values
        bb_mid = df["bb_middle"].values
        bb_width = df["bb_width"].values
        
        # Squeeze threshold: lowest 20th percentile bandwidth
        squeeze_thresh = np.nanpercentile(bb_width, 25)
        
        for i in range(2, n):
            was_squeezed = bb_width[i-1] <= squeeze_thresh or bb_width[i-2] <= squeeze_thresh
            if allow_long and was_squeezed and close[i] > bb_upper[i]:
                long_entries[i] = True
            elif close[i] < bb_mid[i]:
                long_exits[i] = True

    elif preset == "golden_death_cross":
        sma_50 = df["sma_50"].values
        sma_200 = df["ema_trend"].values
        
        for i in range(1, n):
            if sma_50[i-1] <= sma_200[i-1] and sma_50[i] > sma_200[i]:
                if allow_long:
                    long_entries[i] = True
            elif sma_50[i-1] >= sma_200[i-1] and sma_50[i] < sma_200[i]:
                long_exits[i] = True
                if allow_short:
                    short_entries[i] = True
                    
    else:
        # Evaluate custom rules if provided
        for i in range(1, n):
            if allow_long and evaluate_rule(strategy_config.entry_long_rule, df, i, order_blocks, fair_value_gaps):
                long_entries[i] = True
            if evaluate_rule(strategy_config.exit_long_rule, df, i, order_blocks, fair_value_gaps):
                long_exits[i] = True
            if allow_short and evaluate_rule(strategy_config.entry_short_rule, df, i, order_blocks, fair_value_gaps):
                short_entries[i] = True
            if evaluate_rule(strategy_config.exit_short_rule, df, i, order_blocks, fair_value_gaps):
                short_exits[i] = True

    return long_entries, long_exits, short_entries, short_exits
