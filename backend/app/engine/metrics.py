import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime

from backend.app.engine.models import PerformanceMetrics, TradeLogItem, EquityPoint, MonthlyReturn

def calculate_performance_metrics(
    trades: List[TradeLogItem],
    equity_curve: List[EquityPoint],
    initial_capital: float,
    benchmark_start_price: float,
    benchmark_end_price: float,
    timeframe: str = "1d"
) -> PerformanceMetrics:
    """
    Calculate comprehensive institutional performance and risk metrics.
    """
    total_trades = len(trades)
    
    if total_trades == 0 or len(equity_curve) == 0:
        # Return neutral defaults if no trades were executed
        return PerformanceMetrics(
            initial_capital=initial_capital,
            final_equity=initial_capital,
            net_profit_dollar=0.0,
            net_profit_pct=0.0,
            cagr_pct=0.0,
            benchmark_return_pct=0.0,
            alpha_pct=0.0,
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate_pct=0.0,
            loss_rate_pct=0.0,
            profit_factor=0.0,
            avg_win_dollar=0.0,
            avg_loss_dollar=0.0,
            win_loss_ratio=0.0,
            largest_win_dollar=0.0,
            largest_loss_dollar=0.0,
            avg_planned_rr=0.0,
            avg_realized_rr=0.0,
            expectancy_dollar=0.0,
            expectancy_pct=0.0,
            max_drawdown_dollar=0.0,
            max_drawdown_pct=0.0,
            max_drawdown_duration_bars=0,
            sharpe_ratio=0.0,
            sortino_ratio=0.0,
            calmar_ratio=0.0,
            risk_of_ruin_pct=0.0,
            max_consecutive_wins=0,
            max_consecutive_losses=0,
            avg_trade_duration_bars=0.0,
            exposure_time_pct=0.0
        )
        
    final_equity = equity_curve[-1].equity
    net_profit_dollar = final_equity - initial_capital
    net_profit_pct = (net_profit_dollar / initial_capital) * 100.0
    
    # Benchmark Return
    if benchmark_start_price > 0:
        benchmark_return_pct = ((benchmark_end_price - benchmark_start_price) / benchmark_start_price) * 100.0
    else:
        benchmark_return_pct = 0.0
        
    alpha_pct = net_profit_pct - benchmark_return_pct
    
    # Trade Win/Loss Breakdown
    winning_trades_list = [t for t in trades if t.pnl_dollar > 0]
    losing_trades_list = [t for t in trades if t.pnl_dollar <= 0]
    
    winning_trades = len(winning_trades_list)
    losing_trades = len(losing_trades_list)
    
    win_rate_pct = (winning_trades / total_trades) * 100.0
    loss_rate_pct = (losing_trades / total_trades) * 100.0
    
    gross_profits = sum(t.pnl_dollar for t in winning_trades_list)
    gross_losses = abs(sum(t.pnl_dollar for t in losing_trades_list))
    
    if gross_losses > 0:
        profit_factor = gross_profits / gross_losses
    else:
        profit_factor = 999.0 if gross_profits > 0 else 0.0
        
    avg_win_dollar = (gross_profits / winning_trades) if winning_trades > 0 else 0.0
    avg_loss_dollar = (gross_losses / losing_trades) if losing_trades > 0 else 0.0
    
    win_loss_ratio = (avg_win_dollar / avg_loss_dollar) if avg_loss_dollar > 0 else 0.0
    
    largest_win_dollar = max((t.pnl_dollar for t in trades), default=0.0)
    largest_loss_dollar = min((t.pnl_dollar for t in trades), default=0.0)
    
    avg_planned_rr = float(np.mean([t.planned_rr for t in trades])) if trades else 0.0
    avg_realized_rr = float(np.mean([t.realized_rr for t in trades])) if trades else 0.0
    
    # Expectancy: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
    p_win = winning_trades / total_trades
    p_loss = losing_trades / total_trades
    expectancy_dollar = (p_win * avg_win_dollar) - (p_loss * avg_loss_dollar)
    expectancy_pct = (expectancy_dollar / initial_capital) * 100.0
    
    # Maximum Drawdown
    drawdown_pcts = [pt.drawdown_pct for pt in equity_curve]
    drawdown_dollars = [pt.drawdown_dollar for pt in equity_curve]
    max_drawdown_pct = max(drawdown_pcts) if drawdown_pcts else 0.0
    max_drawdown_dollar = max(drawdown_dollars) if drawdown_dollars else 0.0
    
    # Max Drawdown Duration (consecutive bars under water)
    max_dd_duration = 0
    curr_dd_duration = 0
    for pt in equity_curve:
        if pt.drawdown_pct > 0.001:
            curr_dd_duration += 1
            if curr_dd_duration > max_dd_duration:
                max_dd_duration = curr_dd_duration
        else:
            curr_dd_duration = 0
            
    # Time-adjusted Annual Returns and Volatility
    n_bars = len(equity_curve)
    bars_per_year = 252 if timeframe == "1d" else (252 * 7 if timeframe == "1h" else 252 * 26)
    years = max(0.1, n_bars / bars_per_year)
    
    cagr_pct = (((final_equity / initial_capital) ** (1.0 / years)) - 1.0) * 100.0 if final_equity > 0 else -100.0
    
    # Periodic Returns for Sharpe & Sortino
    equities = np.array([pt.equity for pt in equity_curve])
    returns = np.diff(equities) / equities[:-1]
    
    risk_free_rate = 0.03  # 3% annual risk free
    daily_rf = risk_free_rate / bars_per_year
    
    excess_returns = returns - daily_rf
    mean_excess = np.mean(excess_returns)
    std_returns = np.std(returns)
    
    if std_returns > 1e-8:
        sharpe_ratio = float((mean_excess / std_returns) * np.sqrt(bars_per_year))
    else:
        sharpe_ratio = 0.0
        
    downside_returns = returns[returns < 0]
    downside_std = np.std(downside_returns) if len(downside_returns) > 1 else std_returns
    
    if downside_std > 1e-8:
        sortino_ratio = float((mean_excess / downside_std) * np.sqrt(bars_per_year))
    else:
        sortino_ratio = 0.0
        
    if max_drawdown_pct > 0:
        calmar_ratio = float(cagr_pct / max_drawdown_pct)
    else:
        calmar_ratio = 99.0 if cagr_pct > 0 else 0.0
        
    # Risk of Ruin (formula based on win rate and payoff ratio)
    if p_win > 0 and win_loss_ratio > 0:
        z = (1.0 - (p_win - p_loss)) / (1.0 + (p_win - p_loss)) if (p_win > p_loss) else 1.0
        risk_of_ruin_pct = float(min(100.0, max(0.0, (z ** 10) * 100.0)))
    else:
        risk_of_ruin_pct = 100.0
        
    # Consecutive Wins and Losses
    max_c_wins = 0
    max_c_losses = 0
    c_w = 0
    c_l = 0
    for t in trades:
        if t.pnl_dollar > 0:
            c_w += 1
            c_l = 0
            if c_w > max_c_wins:
                max_c_wins = c_w
        else:
            c_l += 1
            c_w = 0
            if c_l > max_c_losses:
                max_c_losses = c_l
                
    durations = [t.duration_bars for t in trades]
    avg_trade_duration_bars = float(np.mean(durations)) if durations else 0.0
    
    # Exposure time (% of bars with an active position)
    total_bars_in_trades = sum(durations)
    exposure_time_pct = min(100.0, (total_bars_in_trades / n_bars) * 100.0) if n_bars > 0 else 0.0
    
    return PerformanceMetrics(
        initial_capital=round(initial_capital, 2),
        final_equity=round(final_equity, 2),
        net_profit_dollar=round(net_profit_dollar, 2),
        net_profit_pct=round(net_profit_pct, 2),
        cagr_pct=round(cagr_pct, 2),
        benchmark_return_pct=round(benchmark_return_pct, 2),
        alpha_pct=round(alpha_pct, 2),
        total_trades=total_trades,
        winning_trades=winning_trades,
        losing_trades=losing_trades,
        win_rate_pct=round(win_rate_pct, 2),
        loss_rate_pct=round(loss_rate_pct, 2),
        profit_factor=round(profit_factor, 2),
        avg_win_dollar=round(avg_win_dollar, 2),
        avg_loss_dollar=round(avg_loss_dollar, 2),
        win_loss_ratio=round(win_loss_ratio, 2),
        largest_win_dollar=round(largest_win_dollar, 2),
        largest_loss_dollar=round(largest_loss_dollar, 2),
        avg_planned_rr=round(avg_planned_rr, 2),
        avg_realized_rr=round(avg_realized_rr, 2),
        expectancy_dollar=round(expectancy_dollar, 2),
        expectancy_pct=round(expectancy_pct, 2),
        max_drawdown_dollar=round(max_drawdown_dollar, 2),
        max_drawdown_pct=round(max_drawdown_pct, 2),
        max_drawdown_duration_bars=max_dd_duration,
        sharpe_ratio=round(sharpe_ratio, 2),
        sortino_ratio=round(sortino_ratio, 2),
        calmar_ratio=round(calmar_ratio, 2),
        risk_of_ruin_pct=round(risk_of_ruin_pct, 2),
        max_consecutive_wins=max_c_wins,
        max_consecutive_losses=max_c_losses,
        avg_trade_duration_bars=round(avg_trade_duration_bars, 1),
        exposure_time_pct=round(exposure_time_pct, 1)
    )

def calculate_monthly_returns(equity_curve: List[EquityPoint]) -> List[MonthlyReturn]:
    """
    Aggregate equity curve points into year-month percentage return cells.
    """
    if not equity_curve:
        return []
        
    records = []
    for pt in equity_curve:
        try:
            # Parse timestamp
            dt_str = pt.timestamp.split("T")[0]
            dt = datetime.strptime(dt_str, "%Y-%m-%d")
            records.append({
                "year": dt.year,
                "month": dt.month,
                "equity": pt.equity
            })
        except Exception:
            continue
            
    if not records:
        return []
        
    df = pd.DataFrame(records)
    monthly = []
    
    for (year, month), group in df.groupby(["year", "month"]):
        first_eq = group["equity"].iloc[0]
        last_eq = group["equity"].iloc[-1]
        m_ret = ((last_eq - first_eq) / first_eq) * 100.0 if first_eq > 0 else 0.0
        monthly.append(MonthlyReturn(
            year=int(year),
            month=int(month),
            return_pct=round(float(m_ret), 2)
        ))
        
    return monthly

def calculate_rr_distribution(trades: List[TradeLogItem]) -> List[Dict[str, Any]]:
    """
    Compute histogram buckets of realized R-multiples (e.g. <-2R, -1R, 0R, +1R, +2R, +3R+).
    """
    if not trades:
        return []
        
    bins = [-999.0, -1.5, -0.75, -0.1, 0.5, 1.5, 2.5, 999.0]
    labels = ["< -1.5R", "-1.0R", "BE / Scratch", "+1.0R", "+2.0R", "+3.0R+"]
    
    rr_vals = [t.realized_rr for t in trades]
    counts, _ = np.histogram(rr_vals, bins=bins)
    
    distribution = []
    for lbl, cnt in zip(labels, counts):
        distribution.append({
            "bucket": lbl,
            "count": int(cnt),
            "percentage": round((cnt / len(trades)) * 100.0, 1)
        })
        
    return distribution
