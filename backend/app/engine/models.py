from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal

class IndicatorConfig(BaseModel):
    ema_fast: int = 9
    ema_slow: int = 21
    ema_trend: int = 200
    rsi_period: int = 14
    rsi_overbought: float = 70.0
    rsi_oversold: float = 30.0
    bb_period: int = 20
    bb_std: float = 2.0
    atr_period: int = 14
    vwap_enabled: bool = True
    smc_displacement_mult: float = 1.5

class RiskConfig(BaseModel):
    initial_capital: float = 100000.0
    position_sizing_mode: Literal["fixed_risk_pct", "fixed_cash", "fixed_shares", "kelly"] = "fixed_risk_pct"
    risk_per_trade_pct: float = 0.02  # 2% account equity risk per trade
    fixed_cash_amount: float = 10000.0
    fixed_shares_count: float = 100.0
    kelly_fraction: float = 0.5       # Half-Kelly for safety
    
    stop_loss_type: Literal["atr", "fixed_pct", "smc_structure", "none"] = "atr"
    stop_loss_value: float = 1.5      # 1.5 * ATR or 1.5%
    
    take_profit_type: Literal["rr_multiple", "atr", "fixed_pct", "none"] = "rr_multiple"
    take_profit_value: float = 2.0    # 2.0 R:R or 2.0 * ATR or 3.0%
    
    use_trailing_stop: bool = True
    trailing_activation_rr: float = 1.0  # Activate trailing stop after +1R
    trailing_distance_atr: float = 1.5   # Trail by 1.5 * ATR
    
    use_break_even: bool = True
    break_even_rr: float = 1.2          # Move SL to entry after +1.2R
    
    commission_pct: float = 0.001       # 0.1% per trade
    slippage_pct: float = 0.0005        # 0.05% slippage
    allow_shorting: bool = True

class StrategyCondition(BaseModel):
    indicator_a: str                  # e.g. "close", "ema_fast", "rsi", "price"
    operator: Literal[">", "<", ">=", "<=", "crosses_above", "crosses_below", "touches_bullish_ob", "touches_bearish_ob", "touches_bullish_fvg", "touches_bearish_fvg"]
    indicator_b: Optional[str] = None # e.g. "ema_slow", "vwap_lower_1", "bb_lower"
    value: Optional[float] = None     # e.g. 30.0 for RSI

class StrategyRule(BaseModel):
    name: str = "Custom Rule"
    conditions: List[StrategyCondition] = []
    logic_operator: Literal["AND", "OR"] = "AND"

class StrategyConfig(BaseModel):
    preset_id: Optional[str] = "smc_orderblock_fvg"
    name: str = "Smart Money Concept Sniper"
    description: str = "Institutional Order Block + FVG Re-test Strategy"
    direction: Literal["long_only", "short_only", "both"] = "both"
    entry_long_rule: Optional[StrategyRule] = None
    exit_long_rule: Optional[StrategyRule] = None
    entry_short_rule: Optional[StrategyRule] = None
    exit_short_rule: Optional[StrategyRule] = None
    custom_script: Optional[str] = None

class BacktestRequest(BaseModel):
    symbol: str = "BTC-USD"
    timeframe: str = "1d"
    period: str = "2y"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    strategy: StrategyConfig = Field(default_factory=StrategyConfig)
    indicators: IndicatorConfig = Field(default_factory=IndicatorConfig)
    risk: RiskConfig = Field(default_factory=RiskConfig)

class TradeLogItem(BaseModel):
    trade_id: int
    symbol: str
    side: Literal["LONG", "SHORT"]
    entry_time: str
    entry_price: float
    exit_time: str
    exit_price: float
    shares: float
    position_value: float
    pnl_dollar: float
    pnl_pct: float
    realized_rr: float
    planned_rr: float
    stop_loss_price: float
    take_profit_price: float
    exit_reason: str
    commission: float
    slippage: float
    duration_bars: int

class EquityPoint(BaseModel):
    timestamp: str
    equity: float
    cash: float
    drawdown_dollar: float
    drawdown_pct: float
    benchmark_equity: float

class MonthlyReturn(BaseModel):
    year: int
    month: int
    return_pct: float

class PerformanceMetrics(BaseModel):
    initial_capital: float
    final_equity: float
    net_profit_dollar: float
    net_profit_pct: float
    cagr_pct: float
    benchmark_return_pct: float
    alpha_pct: float
    
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    loss_rate_pct: float
    
    profit_factor: float
    avg_win_dollar: float
    avg_loss_dollar: float
    win_loss_ratio: float
    largest_win_dollar: float
    largest_loss_dollar: float
    
    avg_planned_rr: float
    avg_realized_rr: float
    expectancy_dollar: float
    expectancy_pct: float
    
    max_drawdown_dollar: float
    max_drawdown_pct: float
    max_drawdown_duration_bars: int
    
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    risk_of_ruin_pct: float
    
    max_consecutive_wins: int
    max_consecutive_losses: int
    avg_trade_duration_bars: float
    exposure_time_pct: float

class BacktestResult(BaseModel):
    symbol: str
    timeframe: str
    period: str
    metrics: PerformanceMetrics
    trades: List[TradeLogItem]
    equity_curve: List[EquityPoint]
    monthly_returns: List[MonthlyReturn]
    rr_distribution: List[Dict[str, Any]]
    order_blocks: List[Dict[str, Any]] = []
    fair_value_gaps: List[Dict[str, Any]] = []

class MonteCarloRequest(BaseModel):
    trades: List[TradeLogItem]
    initial_capital: float = 100000.0
    num_simulations: int = 500
    confidence_level: float = 0.95

class MonteCarloPercentilePath(BaseModel):
    percentile: str  # "p5", "p25", "p50", "p75", "p95"
    equity_curve: List[float]

class MonteCarloResult(BaseModel):
    num_simulations: int
    median_final_equity: float
    p5_final_equity: float
    p95_final_equity: float
    prob_profit_pct: float
    prob_drawdown_over_10_pct: float
    prob_drawdown_over_20_pct: float
    prob_drawdown_over_30_pct: float
    percentile_paths: List[MonteCarloPercentilePath]
    simulated_drawdowns: List[float]

class OptimizeParam(BaseModel):
    name: str
    param_type: Literal["indicator", "risk"]
    min_val: float
    max_val: float
    step: float

class OptimizeRequest(BaseModel):
    symbol: str = "BTC-USD"
    timeframe: str = "1d"
    period: str = "2y"
    strategy_preset: str = "ema_cross"
    param_x: OptimizeParam
    param_y: OptimizeParam
    metric_target: Literal["sharpe_ratio", "profit_factor", "net_profit_pct", "win_rate_pct"] = "sharpe_ratio"
    base_indicators: IndicatorConfig = Field(default_factory=IndicatorConfig)
    base_risk: RiskConfig = Field(default_factory=RiskConfig)

class OptimizeGridPoint(BaseModel):
    param_x_val: float
    param_y_val: float
    metric_val: float
    trades_count: int
    win_rate: float

class OptimizeResult(BaseModel):
    param_x_name: str
    param_y_name: str
    metric_name: str
    best_x: float
    best_y: float
    best_metric_val: float
    grid: List[OptimizeGridPoint]
