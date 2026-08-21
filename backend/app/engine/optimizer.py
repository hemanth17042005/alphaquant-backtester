import numpy as np
import pandas as pd
from typing import List, Dict, Any

from backend.app.engine.models import (
    OptimizeRequest, OptimizeResult, OptimizeGridPoint, BacktestRequest, StrategyConfig, IndicatorConfig, RiskConfig
)
from backend.app.data.fetcher import fetch_market_data
from backend.app.engine.execution import run_backtest_simulation

def run_grid_optimization(request: OptimizeRequest) -> OptimizeResult:
    """
    Run 2D Parameter Grid Optimization and compute performance surface.
    """
    # Fetch market data once
    df = fetch_market_data(
        symbol=request.symbol,
        timeframe=request.timeframe,
        period=request.period
    )
    
    px = request.param_x
    py = request.param_y
    
    x_values = np.arange(px.min_val, px.max_val + (px.step / 2.0), px.step)
    y_values = np.arange(py.min_val, py.max_val + (py.step / 2.0), py.step)
    
    # Cap total iterations to 50 for rapid response
    if len(x_values) * len(y_values) > 64:
        x_values = np.linspace(px.min_val, px.max_val, 7)
        y_values = np.linspace(py.min_val, py.max_val, 7)
        
    grid_points: List[OptimizeGridPoint] = []
    best_x = float(x_values[0])
    best_y = float(y_values[0])
    best_metric = -999999.0
    
    for xv in x_values:
        for yv in y_values:
            xv = float(round(xv, 2))
            yv = float(round(yv, 2))
            
            # Clone base configs
            ind_dict = request.base_indicators.model_dump()
            risk_dict = request.base_risk.model_dump()
            
            # Apply Param X
            if px.name in ind_dict:
                ind_dict[px.name] = int(xv) if "period" in px.name or "len" in px.name or "ema" in px.name else xv
            elif px.name in risk_dict:
                risk_dict[px.name] = xv
                
            # Apply Param Y
            if py.name in ind_dict:
                ind_dict[py.name] = int(yv) if "period" in py.name or "len" in py.name or "ema" in py.name else yv
            elif py.name in risk_dict:
                risk_dict[py.name] = yv
                
            bt_req = BacktestRequest(
                symbol=request.symbol,
                timeframe=request.timeframe,
                period=request.period,
                strategy=StrategyConfig(preset_id=request.strategy_preset),
                indicators=IndicatorConfig(**ind_dict),
                risk=RiskConfig(**risk_dict)
            )
            
            try:
                res = run_backtest_simulation(df, bt_req)
                metrics = res.metrics
                
                if request.metric_target == "sharpe_ratio":
                    m_val = metrics.sharpe_ratio
                elif request.metric_target == "profit_factor":
                    m_val = metrics.profit_factor if metrics.profit_factor < 50 else 50.0
                elif request.metric_target == "net_profit_pct":
                    m_val = metrics.net_profit_pct
                elif request.metric_target == "win_rate_pct":
                    m_val = metrics.win_rate_pct
                else:
                    m_val = metrics.sharpe_ratio
                    
                trades_cnt = metrics.total_trades
                win_rt = metrics.win_rate_pct
                
            except Exception:
                m_val = 0.0
                trades_cnt = 0
                win_rt = 0.0
                
            grid_points.append(OptimizeGridPoint(
                param_x_val=xv,
                param_y_val=yv,
                metric_val=round(float(m_val), 2),
                trades_count=trades_cnt,
                win_rate=round(float(win_rt), 1)
            ))
            
            if m_val > best_metric and trades_cnt >= 3:
                best_metric = m_val
                best_x = xv
                best_y = yv
                
    if best_metric == -999999.0 and grid_points:
        best_metric = grid_points[0].metric_val
        best_x = grid_points[0].param_x_val
        best_y = grid_points[0].param_y_val
        
    return OptimizeResult(
        param_x_name=px.name,
        param_y_name=py.name,
        metric_name=request.metric_target,
        best_x=best_x,
        best_y=best_y,
        best_metric_val=round(best_metric, 2),
        grid=grid_points
    )
