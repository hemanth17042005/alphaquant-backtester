import numpy as np
from typing import List
from backend.app.engine.models import (
    TradeLogItem, MonteCarloRequest, MonteCarloResult, MonteCarloPercentilePath
)

def run_monte_carlo_simulation(request: MonteCarloRequest) -> MonteCarloResult:
    """
    Run Monte Carlo trade reshuffling simulations to assess strategy robustness.
    """
    trades = request.trades
    initial_cap = request.initial_capital
    n_sims = max(50, min(1000, request.num_simulations))
    
    if not trades:
        # Default empty result
        return MonteCarloResult(
            num_simulations=n_sims,
            median_final_equity=initial_cap,
            p5_final_equity=initial_cap,
            p95_final_equity=initial_cap,
            prob_profit_pct=0.0,
            prob_drawdown_over_10_pct=0.0,
            prob_drawdown_over_20_pct=0.0,
            prob_drawdown_over_30_pct=0.0,
            percentile_paths=[],
            simulated_drawdowns=[]
        )
        
    pnl_dollars = np.array([t.pnl_dollar for t in trades])
    n_trades = len(pnl_dollars)
    
    simulated_curves = np.zeros((n_sims, n_trades + 1))
    simulated_drawdowns = np.zeros(n_sims)
    final_equities = np.zeros(n_sims)
    
    np.random.seed(42)
    
    for i in range(n_sims):
        # Sample with replacement
        shuffled_pnls = np.random.choice(pnl_dollars, size=n_trades, replace=True)
        equity_path = np.zeros(n_trades + 1)
        equity_path[0] = initial_cap
        
        curr_eq = initial_cap
        peak_eq = initial_cap
        max_dd_pct = 0.0
        
        for j, pnl in enumerate(shuffled_pnls):
            curr_eq += pnl
            equity_path[j + 1] = max(0.0, curr_eq)
            if curr_eq > peak_eq:
                peak_eq = curr_eq
            if peak_eq > 0:
                dd_pct = ((peak_eq - curr_eq) / peak_eq) * 100.0
                if dd_pct > max_dd_pct:
                    max_dd_pct = dd_pct
                    
        simulated_curves[i, :] = equity_path
        simulated_drawdowns[i] = max_dd_pct
        final_equities[i] = equity_path[-1]
        
    # Percentiles across trade steps
    p5_curve = np.percentile(simulated_curves, 5, axis=0)
    p25_curve = np.percentile(simulated_curves, 25, axis=0)
    p50_curve = np.percentile(simulated_curves, 50, axis=0)
    p75_curve = np.percentile(simulated_curves, 75, axis=0)
    p95_curve = np.percentile(simulated_curves, 95, axis=0)
    
    prob_profit = float(np.mean(final_equities > initial_cap) * 100.0)
    prob_dd_10 = float(np.mean(simulated_drawdowns >= 10.0) * 100.0)
    prob_dd_20 = float(np.mean(simulated_drawdowns >= 20.0) * 100.0)
    prob_dd_30 = float(np.mean(simulated_drawdowns >= 30.0) * 100.0)
    
    percentile_paths = [
        MonteCarloPercentilePath(percentile="p5", equity_curve=[round(x, 2) for x in p5_curve]),
        MonteCarloPercentilePath(percentile="p25", equity_curve=[round(x, 2) for x in p25_curve]),
        MonteCarloPercentilePath(percentile="p50", equity_curve=[round(x, 2) for x in p50_curve]),
        MonteCarloPercentilePath(percentile="p75", equity_curve=[round(x, 2) for x in p75_curve]),
        MonteCarloPercentilePath(percentile="p95", equity_curve=[round(x, 2) for x in p95_curve]),
    ]
    
    return MonteCarloResult(
        num_simulations=n_sims,
        median_final_equity=round(float(np.median(final_equities)), 2),
        p5_final_equity=round(float(np.percentile(final_equities, 5)), 2),
        p95_final_equity=round(float(np.percentile(final_equities, 95)), 2),
        prob_profit_pct=round(prob_profit, 2),
        prob_drawdown_over_10_pct=round(prob_dd_10, 2),
        prob_drawdown_over_20_pct=round(prob_dd_20, 2),
        prob_drawdown_over_30_pct=round(prob_dd_30, 2),
        percentile_paths=percentile_paths,
        simulated_drawdowns=[round(float(x), 2) for x in simulated_drawdowns[:100]]
    )
