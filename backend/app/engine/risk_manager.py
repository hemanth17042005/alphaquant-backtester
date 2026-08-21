import numpy as np
from typing import Tuple, Optional, Dict, Any
from backend.app.engine.models import RiskConfig

def calculate_sl_tp(
    side: str,
    entry_price: float,
    atr: float,
    risk_config: RiskConfig,
    structure_sl: Optional[float] = None
) -> Tuple[float, float, float]:
    """
    Calculate (Stop Loss Price, Take Profit Price, Planned R:R).
    """
    sl_type = risk_config.stop_loss_type
    sl_val = risk_config.stop_loss_value
    tp_type = risk_config.take_profit_type
    tp_val = risk_config.take_profit_value
    
    # Calculate SL Price
    if side == "LONG":
        if sl_type == "atr":
            sl_price = entry_price - (sl_val * max(atr, entry_price * 0.005))
        elif sl_type == "fixed_pct":
            sl_price = entry_price * (1.0 - (sl_val / 100.0))
        elif sl_type == "smc_structure" and structure_sl is not None and structure_sl < entry_price:
            sl_price = structure_sl * 0.999
        else:
            sl_price = entry_price * 0.98  # default 2%
            
        risk_per_unit = max(entry_price - sl_price, entry_price * 0.001)
        
        # Calculate TP Price
        if tp_type == "rr_multiple":
            planned_rr = tp_val
            tp_price = entry_price + (planned_rr * risk_per_unit)
        elif tp_type == "atr":
            tp_price = entry_price + (tp_val * atr)
            planned_rr = (tp_price - entry_price) / risk_per_unit
        elif tp_type == "fixed_pct":
            tp_price = entry_price * (1.0 + (tp_val / 100.0))
            planned_rr = (tp_price - entry_price) / risk_per_unit
        else:
            planned_rr = 2.0
            tp_price = entry_price + (2.0 * risk_per_unit)
            
    else:  # SHORT
        if sl_type == "atr":
            sl_price = entry_price + (sl_val * max(atr, entry_price * 0.005))
        elif sl_type == "fixed_pct":
            sl_price = entry_price * (1.0 + (sl_val / 100.0))
        elif sl_type == "smc_structure" and structure_sl is not None and structure_sl > entry_price:
            sl_price = structure_sl * 1.001
        else:
            sl_price = entry_price * 1.02  # default 2%
            
        risk_per_unit = max(sl_price - entry_price, entry_price * 0.001)
        
        if tp_type == "rr_multiple":
            planned_rr = tp_val
            tp_price = entry_price - (planned_rr * risk_per_unit)
        elif tp_type == "atr":
            tp_price = entry_price - (tp_val * atr)
            planned_rr = (entry_price - tp_price) / risk_per_unit
        elif tp_type == "fixed_pct":
            tp_price = entry_price * (1.0 - (tp_val / 100.0))
            planned_rr = (entry_price - tp_price) / risk_per_unit
        else:
            planned_rr = 2.0
            tp_price = entry_price - (2.0 * risk_per_unit)
            
    return float(sl_price), float(tp_price), float(planned_rr)

def calculate_position_size(
    equity: float,
    cash: float,
    entry_price: float,
    stop_loss_price: float,
    risk_config: RiskConfig,
    historical_win_rate: float = 0.5,
    historical_win_loss_ratio: float = 1.5
) -> float:
    """
    Calculate position size (number of shares / contracts) based on risk model.
    """
    if entry_price <= 0 or equity <= 0:
        return 0.0
        
    mode = risk_config.position_sizing_mode
    risk_unit = abs(entry_price - stop_loss_price)
    
    if mode == "fixed_risk_pct":
        # Risk amount = Equity * risk_per_trade_pct
        risk_dollar = equity * risk_config.risk_per_trade_pct
        if risk_unit > 0:
            shares = risk_dollar / risk_unit
        else:
            shares = (equity * 0.1) / entry_price
            
    elif mode == "fixed_cash":
        shares = risk_config.fixed_cash_amount / entry_price
        
    elif mode == "fixed_shares":
        shares = risk_config.fixed_shares_count
        
    elif mode == "kelly":
        # Kelly Criterion: f* = (p * b - q) / b where p = win_rate, q = 1-p, b = win_loss_ratio
        p = max(0.2, min(0.8, historical_win_rate))
        q = 1.0 - p
        b = max(0.5, historical_win_loss_ratio)
        kelly_fraction = (p * b - q) / b
        kelly_fraction = max(0.01, min(0.25, kelly_fraction * risk_config.kelly_fraction))
        risk_dollar = equity * kelly_fraction
        if risk_unit > 0:
            shares = risk_dollar / risk_unit
        else:
            shares = (equity * 0.1) / entry_price
    else:
        shares = (equity * 0.05) / entry_price
        
    # Cap by available buying power / margin (max 95% of cash)
    max_affordable_shares = (cash * 0.95) / entry_price
    shares = min(shares, max_affordable_shares)
    
    return max(0.0, float(shares))

def update_trailing_stop_and_be(
    side: str,
    entry_price: float,
    current_high: float,
    current_low: float,
    current_sl: float,
    atr: float,
    planned_rr: float,
    risk_config: RiskConfig
) -> float:
    """
    Update stop loss price if Break-Even or Trailing Stop conditions are triggered.
    """
    risk_distance = abs(entry_price - current_sl)
    if risk_distance <= 0:
        return current_sl
        
    new_sl = current_sl
    
    if side == "LONG":
        unrealized_r = (current_high - entry_price) / risk_distance
        
        # 1. Break-Even Trigger
        if risk_config.use_break_even and unrealized_r >= risk_config.break_even_rr:
            # Move to entry price + slight buffer for fees
            be_price = entry_price * 1.0005
            if be_price > new_sl:
                new_sl = be_price
                
        # 2. Trailing Stop Trigger
        if risk_config.use_trailing_stop and unrealized_r >= risk_config.trailing_activation_rr:
            trail_price = current_high - (risk_config.trailing_distance_atr * atr)
            if trail_price > new_sl:
                new_sl = trail_price
                
    else:  # SHORT
        unrealized_r = (entry_price - current_low) / risk_distance
        
        # 1. Break-Even Trigger
        if risk_config.use_break_even and unrealized_r >= risk_config.break_even_rr:
            be_price = entry_price * 0.9995
            if be_price < new_sl:
                new_sl = be_price
                
        # 2. Trailing Stop Trigger
        if risk_config.use_trailing_stop and unrealized_r >= risk_config.trailing_activation_rr:
            trail_price = current_low + (risk_config.trailing_distance_atr * atr)
            if trail_price < new_sl:
                new_sl = trail_price
                
    return float(new_sl)
