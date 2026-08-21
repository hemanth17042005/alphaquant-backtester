import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

from backend.app.engine.models import (
    BacktestRequest, BacktestResult, TradeLogItem, EquityPoint, PerformanceMetrics
)
from backend.app.indicators.indicator_manager import calculate_all_indicators
from backend.app.engine.strategy import generate_signals
from backend.app.engine.risk_manager import (
    calculate_sl_tp, calculate_position_size, update_trailing_stop_and_be
)
from backend.app.engine.metrics import (
    calculate_performance_metrics, calculate_monthly_returns, calculate_rr_distribution
)

def run_backtest_simulation(
    df: pd.DataFrame,
    request: BacktestRequest
) -> BacktestResult:
    """
    Execute full event-driven bar-by-bar backtest.
    """
    # 1. Calculate Indicators & SMC Zones
    ind_cfg = request.indicators
    indicator_data = calculate_all_indicators(
        df=df,
        ema_fast_len=ind_cfg.ema_fast,
        ema_slow_len=ind_cfg.ema_slow,
        ema_trend_len=ind_cfg.ema_trend,
        rsi_len=ind_cfg.rsi_period,
        bb_len=ind_cfg.bb_period,
        bb_std=ind_cfg.bb_std,
        atr_len=ind_cfg.atr_period
    )
    
    df_calc = indicator_data["df"]
    order_blocks = indicator_data["order_blocks"]
    fair_value_gaps = indicator_data["fair_value_gaps"]
    
    # 2. Generate Entry/Exit Signals
    long_entries, long_exits, short_entries, short_exits = generate_signals(
        df=df_calc,
        strategy_config=request.strategy,
        order_blocks=order_blocks,
        fair_value_gaps=fair_value_gaps
    )
    
    # 3. Initialize Execution State
    risk = request.risk
    cash = float(risk.initial_capital)
    equity = float(risk.initial_capital)
    peak_equity = float(risk.initial_capital)
    
    benchmark_shares = (risk.initial_capital / df_calc["close"].iloc[0]) if df_calc["close"].iloc[0] > 0 else 0
    
    trades: List[TradeLogItem] = []
    equity_curve: List[EquityPoint] = []
    
    # Active Position Tracking
    in_position = False
    pos_side: Optional[str] = None
    pos_entry_price = 0.0
    pos_shares = 0.0
    pos_entry_time = ""
    pos_entry_idx = 0
    pos_sl = 0.0
    pos_tp = 0.0
    pos_planned_rr = 2.0
    pos_value = 0.0
    
    trade_id_counter = 1
    n_bars = len(df_calc)
    
    timestamps = df_calc["timestamp"].values
    opens = df_calc["open"].values
    highs = df_calc["high"].values
    lows = df_calc["low"].values
    closes = df_calc["close"].values
    atrs = df_calc["atr"].values
    
    # 4. Bar-by-Bar Simulation Loop
    for i in range(n_bars):
        curr_time = str(timestamps[i])
        curr_open = float(opens[i])
        curr_high = float(highs[i])
        curr_low = float(lows[i])
        curr_close = float(closes[i])
        curr_atr = float(atrs[i]) if not pd.isna(atrs[i]) else (curr_close * 0.015)
        
        # --- A. Manage Active Position (Intra-bar Check) ---
        if in_position:
            # 1. Update Trailing Stop / Break-Even
            pos_sl = update_trailing_stop_and_be(
                side=pos_side,
                entry_price=pos_entry_price,
                current_high=curr_high,
                current_low=curr_low,
                current_sl=pos_sl,
                atr=curr_atr,
                planned_rr=pos_planned_rr,
                risk_config=risk
            )
            
            # 2. Check Exits (Stop Loss / Take Profit / Signal Exit)
            exit_triggered = False
            exit_price = curr_close
            exit_reason = "Signal Exit"
            
            if pos_side == "LONG":
                # Check Stop Loss
                if curr_low <= pos_sl:
                    exit_triggered = True
                    # Slippage penalty on SL fill
                    exit_price = min(curr_open, pos_sl) * (1.0 - risk.slippage_pct)
                    exit_reason = "Stop Loss"
                # Check Take Profit
                elif curr_high >= pos_tp:
                    exit_triggered = True
                    exit_price = pos_tp * (1.0 - risk.slippage_pct)
                    exit_reason = "Take Profit"
                # Check Signal Exit
                elif long_exits[i]:
                    exit_triggered = True
                    exit_price = curr_close * (1.0 - risk.slippage_pct)
                    exit_reason = "Rule Signal Exit"
                    
            elif pos_side == "SHORT":
                # Check Stop Loss
                if curr_high >= pos_sl:
                    exit_triggered = True
                    exit_price = max(curr_open, pos_sl) * (1.0 + risk.slippage_pct)
                    exit_reason = "Stop Loss"
                # Check Take Profit
                elif curr_low <= pos_tp:
                    exit_triggered = True
                    exit_price = pos_tp * (1.0 + risk.slippage_pct)
                    exit_reason = "Take Profit"
                # Check Signal Exit
                elif short_exits[i]:
                    exit_triggered = True
                    exit_price = curr_close * (1.0 + risk.slippage_pct)
                    exit_reason = "Rule Signal Exit"
                    
            # 3. Process Exit Execution
            if exit_triggered:
                if pos_side == "LONG":
                    gross_pnl = (exit_price - pos_entry_price) * pos_shares
                else:
                    gross_pnl = (pos_entry_price - exit_price) * pos_shares
                    
                commission_entry = pos_entry_price * pos_shares * risk.commission_pct
                commission_exit = exit_price * pos_shares * risk.commission_pct
                total_comm = commission_entry + commission_exit
                slippage_cost = (pos_entry_price + exit_price) * pos_shares * risk.slippage_pct
                
                net_pnl = gross_pnl - total_comm
                pnl_pct = (net_pnl / (pos_entry_price * pos_shares)) * 100.0 if pos_shares > 0 else 0.0
                
                risk_unit = abs(pos_entry_price - pos_sl) if abs(pos_entry_price - pos_sl) > 0 else (pos_entry_price * 0.01)
                realized_rr = (net_pnl / (risk_unit * pos_shares)) if pos_shares > 0 else 0.0
                
                cash += (pos_entry_price * pos_shares) + net_pnl
                
                duration = i - pos_entry_idx
                
                trades.append(TradeLogItem(
                    trade_id=trade_id_counter,
                    symbol=request.symbol,
                    side=pos_side,
                    entry_time=pos_entry_time,
                    entry_price=round(pos_entry_price, 2),
                    exit_time=curr_time,
                    exit_price=round(exit_price, 2),
                    shares=round(pos_shares, 4),
                    position_value=round(pos_entry_price * pos_shares, 2),
                    pnl_dollar=round(net_pnl, 2),
                    pnl_pct=round(pnl_pct, 2),
                    realized_rr=round(realized_rr, 2),
                    planned_rr=round(pos_planned_rr, 2),
                    stop_loss_price=round(pos_sl, 2),
                    take_profit_price=round(pos_tp, 2),
                    exit_reason=exit_reason,
                    commission=round(total_comm, 2),
                    slippage=round(slippage_cost, 2),
                    duration_bars=max(1, duration)
                ))
                
                trade_id_counter += 1
                in_position = False
                pos_side = None
                pos_shares = 0.0
                
        # --- B. Process New Entry Signals (if not in position) ---
        if not in_position:
            # Check Long Entry
            if long_entries[i]:
                entry_price = curr_close * (1.0 + risk.slippage_pct)
                sl_price, tp_price, planned_rr = calculate_sl_tp(
                    side="LONG",
                    entry_price=entry_price,
                    atr=curr_atr,
                    risk_config=risk
                )
                
                shares = calculate_position_size(
                    equity=equity,
                    cash=cash,
                    entry_price=entry_price,
                    stop_loss_price=sl_price,
                    risk_config=risk
                )
                
                if shares > 0 and (shares * entry_price) <= cash:
                    in_position = True
                    pos_side = "LONG"
                    pos_entry_price = entry_price
                    pos_shares = shares
                    pos_entry_time = curr_time
                    pos_entry_idx = i
                    pos_sl = sl_price
                    pos_tp = tp_price
                    pos_planned_rr = planned_rr
                    pos_value = shares * entry_price
                    cash -= pos_value
                    
            # Check Short Entry
            elif short_entries[i] and risk.allow_shorting:
                entry_price = curr_close * (1.0 - risk.slippage_pct)
                sl_price, tp_price, planned_rr = calculate_sl_tp(
                    side="SHORT",
                    entry_price=entry_price,
                    atr=curr_atr,
                    risk_config=risk
                )
                
                shares = calculate_position_size(
                    equity=equity,
                    cash=cash,
                    entry_price=entry_price,
                    stop_loss_price=sl_price,
                    risk_config=risk
                )
                
                if shares > 0 and (shares * entry_price) <= cash:
                    in_position = True
                    pos_side = "SHORT"
                    pos_entry_price = entry_price
                    pos_shares = shares
                    pos_entry_time = curr_time
                    pos_entry_idx = i
                    pos_sl = sl_price
                    pos_tp = tp_price
                    pos_planned_rr = planned_rr
                    pos_value = shares * entry_price
                    cash -= pos_value

        # --- C. Calculate Bar-End Mark-to-Market Equity ---
        if in_position:
            if pos_side == "LONG":
                unrealized_pnl = (curr_close - pos_entry_price) * pos_shares
            else:
                unrealized_pnl = (pos_entry_price - curr_close) * pos_shares
            current_equity = cash + (pos_entry_price * pos_shares) + unrealized_pnl
        else:
            current_equity = cash
            
        equity = current_equity
        if equity > peak_equity:
            peak_equity = equity
            
        dd_dollar = peak_equity - equity
        dd_pct = (dd_dollar / peak_equity) * 100.0 if peak_equity > 0 else 0.0
        
        benchmark_eq = benchmark_shares * curr_close
        
        equity_curve.append(EquityPoint(
            timestamp=curr_time,
            equity=round(equity, 2),
            cash=round(cash, 2),
            drawdown_dollar=round(dd_dollar, 2),
            drawdown_pct=round(dd_pct, 2),
            benchmark_equity=round(benchmark_eq, 2)
        ))
        
    # --- D. Finalize Metrics & Distributions ---
    metrics = calculate_performance_metrics(
        trades=trades,
        equity_curve=equity_curve,
        initial_capital=risk.initial_capital,
        benchmark_start_price=opens[0],
        benchmark_end_price=closes[-1],
        timeframe=request.timeframe
    )
    
    monthly_returns = calculate_monthly_returns(equity_curve)
    rr_dist = calculate_rr_distribution(trades)
    
    return BacktestResult(
        symbol=request.symbol,
        timeframe=request.timeframe,
        period=request.period,
        metrics=metrics,
        trades=trades,
        equity_curve=equity_curve,
        monthly_returns=monthly_returns,
        rr_distribution=rr_dist,
        order_blocks=order_blocks[:30],  # Return latest 30 zones for crisp chart display
        fair_value_gaps=fair_value_gaps[:30]
    )
