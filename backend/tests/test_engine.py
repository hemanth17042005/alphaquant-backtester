import pytest
import pandas as pd
import numpy as np

from backend.app.data.sample_data import generate_market_regime
from backend.app.indicators.indicator_manager import calculate_all_indicators
from backend.app.engine.models import (
    BacktestRequest, StrategyConfig, IndicatorConfig, RiskConfig, MonteCarloRequest,
    OptimizeParam, OptimizeRequest
)
from backend.app.engine.execution import run_backtest_simulation
from backend.app.engine.monte_carlo import run_monte_carlo_simulation
from backend.app.engine.optimizer import run_grid_optimization

def test_sample_data_generation():
    df = generate_market_regime(regime_type="bull", n_bars=100)
    assert len(df) == 100
    assert "open" in df.columns
    assert "high" in df.columns
    assert "low" in df.columns
    assert "close" in df.columns
    assert "volume" in df.columns
    assert (df["high"] >= df["low"]).all()

def test_indicators_and_smc_calculation():
    df = generate_market_regime(regime_type="bull", n_bars=150)
    data = calculate_all_indicators(df)
    df_calc = data["df"]
    
    assert "ema_fast" in df_calc.columns
    assert "ema_slow" in df_calc.columns
    assert "rsi" in df_calc.columns
    assert "bb_upper" in df_calc.columns
    assert "vwap" in df_calc.columns
    assert "is_swing_high" in df_calc.columns
    
    # Check order blocks and FVGs
    assert isinstance(data["order_blocks"], list)
    assert isinstance(data["fair_value_gaps"], list)

def test_backtest_smc_execution():
    df = generate_market_regime(regime_type="bull", n_bars=250)
    req = BacktestRequest(
        symbol="SAMPLE_BULL",
        strategy=StrategyConfig(preset_id="smc_orderblock_fvg", direction="both"),
        indicators=IndicatorConfig(),
        risk=RiskConfig(initial_capital=50000.0, risk_per_trade_pct=0.02)
    )
    res = run_backtest_simulation(df, req)
    
    assert res.metrics.initial_capital == 50000.0
    assert res.metrics.final_equity > 0
    assert len(res.equity_curve) == len(df)
    assert len(res.trades) >= 0

def test_backtest_ema_cross_execution():
    df = generate_market_regime(regime_type="volatile_breakout", n_bars=300)
    req = BacktestRequest(
        symbol="SAMPLE_BREAKOUT",
        strategy=StrategyConfig(preset_id="ema_cross_9_21", direction="both"),
        indicators=IndicatorConfig(ema_fast=9, ema_slow=21),
        risk=RiskConfig(initial_capital=100000.0, risk_per_trade_pct=0.01)
    )
    res = run_backtest_simulation(df, req)
    
    assert res.metrics.initial_capital == 100000.0
    assert res.metrics.total_trades > 0
    assert res.metrics.sharpe_ratio is not None
    assert res.metrics.max_drawdown_pct >= 0.0

def test_monte_carlo_simulation():
    df = generate_market_regime(regime_type="bull", n_bars=250)
    req = BacktestRequest(
        symbol="SAMPLE_BULL",
        strategy=StrategyConfig(preset_id="ema_cross_9_21", direction="both")
    )
    res = run_backtest_simulation(df, req)
    
    mc_req = MonteCarloRequest(
        trades=res.trades,
        initial_capital=100000.0,
        num_simulations=50
    )
    mc_res = run_monte_carlo_simulation(mc_req)
    assert mc_res.num_simulations == 50
    assert len(mc_res.percentile_paths) == 5

if __name__ == "__main__":
    test_sample_data_generation()
    test_indicators_and_smc_calculation()
    test_backtest_smc_execution()
    test_backtest_ema_cross_execution()
    test_monte_carlo_simulation()
    print("All quantitative backtesting unit tests PASSED successfully!")
