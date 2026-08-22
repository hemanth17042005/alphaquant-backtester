import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

from backend.app.data.fetcher import fetch_market_data

logger = logging.getLogger(__name__)

def run_multi_asset_portfolio(
    basket: List[Dict[str, Any]],
    timeframe: str = "1d",
    period: str = "1y",
    initial_capital: float = 100000.0
) -> Dict[str, Any]:
    """
    Simulate a multi-asset quantitative portfolio with dynamic weights and correlation matrix.
    basket format: [{"symbol": "BTC-USD", "weight": 40}, {"symbol": "NVDA", "weight": 30}, ...]
    """
    if not basket or len(basket) == 0:
        basket = [
            {"symbol": "BTC-USD", "weight": 40},
            {"symbol": "NVDA", "weight": 30},
            {"symbol": "RELIANCE.NS", "weight": 30}
        ]
        
    # Normalize weights
    total_raw_weight = sum(float(item.get("weight", 1)) for item in basket)
    if total_raw_weight <= 0:
        total_raw_weight = 1.0
        
    normalized_basket = []
    for item in basket:
        sym = item.get("symbol", "BTC-USD").upper().strip()
        w = float(item.get("weight", 1)) / total_raw_weight
        normalized_basket.append({"symbol": sym, "weight": round(w, 4)})
        
    # Fetch returns for all assets
    price_series = {}
    return_series = {}
    
    for item in normalized_basket:
        sym = item["symbol"]
        df = fetch_market_data(sym, timeframe=timeframe, period=period, use_cache=True)
        if len(df) > 0:
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df = df.sort_values("timestamp").drop_duplicates("timestamp")
            df = df.set_index("timestamp")
            price_series[sym] = df["close"]
            return_series[sym] = df["close"].pct_change().dropna()
            
    if not return_series:
        raise ValueError("Could not retrieve market data for any asset in the basket.")
        
    # Combine returns into single DataFrame
    returns_df = pd.DataFrame(return_series).dropna()
    if len(returns_df) < 5:
        raise ValueError("Insufficient overlapping historical data points across basket assets.")
        
    # 1. Compute Correlation Matrix
    corr_matrix = returns_df.corr().round(3).to_dict()
    
    # 2. Compute Weighted Portfolio Daily Returns
    weights_array = np.array([item["weight"] for item in normalized_basket if item["symbol"] in returns_df.columns])
    weights_array = weights_array / np.sum(weights_array)  # re-normalize for available assets
    
    port_daily_returns = (returns_df * weights_array).sum(axis=1)
    
    # 3. Compute Portfolio Compounding Equity Curve
    cum_returns = (1 + port_daily_returns).cumprod()
    equity_curve = (cum_returns * initial_capital).round(2)
    
    final_equity = float(equity_curve.iloc[-1])
    total_return_pct = round(((final_equity - initial_capital) / initial_capital) * 100, 2)
    
    # 4. Portfolio Metrics
    annualized_factor = 252 if timeframe == "1d" else 252 * 6.5
    mean_ret = port_daily_returns.mean()
    std_ret = port_daily_returns.std()
    
    annualized_ret = mean_ret * annualized_factor
    annualized_vol = std_ret * np.sqrt(annualized_factor)
    sharpe = round((annualized_ret - 0.03) / annualized_vol, 2) if annualized_vol > 0 else 0.0
    
    # Max Drawdown
    running_max = equity_curve.cummax()
    drawdown = (equity_curve - running_max) / running_max
    max_drawdown_pct = round(abs(float(drawdown.min())) * 100, 2)
    
    # Format equity curve for Plotly chart
    chart_points = [
        {"time": ts.strftime("%Y-%m-%d"), "equity": float(val)}
        for ts, val in zip(equity_curve.index, equity_curve.values)
    ]
    
    # Individual asset contributions
    asset_breakdowns = []
    for item in normalized_basket:
        sym = item["symbol"]
        if sym in price_series and len(price_series[sym]) > 0:
            first_p = float(price_series[sym].iloc[0])
            last_p = float(price_series[sym].iloc[-1])
            asset_ret = round(((last_p - first_p) / first_p) * 100, 2)
            asset_breakdowns.append({
                "symbol": sym,
                "weight_pct": round(item["weight"] * 100, 1),
                "total_return_pct": asset_ret,
                "volatility_pct": round(float(return_series[sym].std() * np.sqrt(annualized_factor) * 100), 2)
            })
            
    return {
        "basket": normalized_basket,
        "initial_capital": initial_capital,
        "final_equity": round(final_equity, 2),
        "total_return_pct": total_return_pct,
        "sharpe_ratio": sharpe,
        "max_drawdown_pct": max_drawdown_pct,
        "annualized_volatility_pct": round(annualized_vol * 100, 2),
        "correlation_matrix": corr_matrix,
        "asset_breakdowns": asset_breakdowns,
        "equity_curve": chart_points[-200:],  # latest 200 data points for responsive UI rendering
        "total_bars": len(returns_df)
    }
