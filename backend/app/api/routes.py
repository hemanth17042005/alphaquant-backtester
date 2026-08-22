from fastapi import APIRouter, HTTPException, UploadFile, File, Response, Request
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import math
import io
import csv
from typing import List, Dict, Any, Optional

from backend.app.data.fetcher import (
    fetch_market_data, POPULAR_SYMBOLS, parse_uploaded_csv, search_symbols, fetch_live_quote
)
from backend.app.data.sample_data import SAMPLE_PRESETS
from backend.app.indicators.indicator_manager import calculate_all_indicators
from backend.app.engine.models import (
    BacktestRequest, BacktestResult, MonteCarloRequest, MonteCarloResult,
    OptimizeRequest, OptimizeResult, PredictionRequest, PredictionResult
)
from backend.app.engine.execution import run_backtest_simulation
from backend.app.engine.monte_carlo import run_monte_carlo_simulation
from backend.app.engine.optimizer import run_grid_optimization
from backend.app.engine.strategy import STRATEGY_PRESETS
from backend.app.engine.ml_predictor import generate_price_prediction
from backend.app.engine.paper_trader import (
    get_paper_portfolio, execute_paper_order, close_paper_position, reset_paper_account
)
from backend.app.engine.sentiment_analyzer import fetch_market_sentiment
from backend.app.engine.alert_dispatcher import test_alert_dispatch
from backend.app.engine.portfolio_optimizer import run_multi_asset_portfolio
from backend.app.engine.code_runner import execute_custom_strategy, DEFAULT_STARTER_CODE

router = APIRouter(prefix="/api")

@router.api_route("/health", methods=["GET", "POST"])
async def health_check():
    return {"status": "ok", "version": "2.5.0", "engine": "AlphaQuant Execution Core"}

@router.api_route("/symbols", methods=["GET", "POST"])
async def get_popular_symbols():
    return {
        "popular": POPULAR_SYMBOLS,
        "sample_presets": SAMPLE_PRESETS
    }

@router.api_route("/symbols/search", methods=["GET", "POST"])
async def search_market_symbols(request: Request, q: str = ""):
    """Search any stock, crypto, ETF, forex, or index across global markets. Supports both GET and POST."""
    search_q = q
    if not search_q and request.method == "POST":
        try:
            body = await request.json()
            search_q = body.get("q", "") or body.get("query", "")
        except Exception:
            pass
    results = search_symbols(search_q)
    return {"query": search_q, "results": results}

@router.api_route("/quote/live", methods=["GET", "POST"])
async def get_live_quote(request: Request, symbol: str = "BTC-USD"):
    """Fetch live real-time market quote, day change, day high/low, and market status."""
    sym = symbol
    if request.method == "POST":
        try:
            body = await request.json()
            sym = body.get("symbol", sym)
        except Exception:
            pass
    quote = fetch_live_quote(sym)
    return quote

# ----------------- LIVE PAPER TRADING SIMULATOR ENDPOINTS -----------------

@router.api_route("/paper/portfolio", methods=["GET", "POST"])
async def get_paper_portfolio_route():
    """Retrieve virtual paper trading portfolio balance, open positions, and history."""
    return get_paper_portfolio()

@router.api_route("/paper/order", methods=["POST"])
async def execute_paper_order_route(request: Request):
    """Execute a virtual paper trading market, limit, or stop order against live prices."""
    try:
        body = await request.json()
        symbol = body.get("symbol", "BTC-USD")
        side = body.get("side", "BUY")
        order_type = body.get("order_type", "MARKET")
        quantity = float(body.get("quantity", 1.0))
        limit_price = body.get("limit_price")
        stop_loss = body.get("stop_loss")
        take_profit = body.get("take_profit")
        
        result = execute_paper_order(
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            limit_price=limit_price,
            stop_loss=stop_loss,
            take_profit=take_profit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.api_route("/paper/close", methods=["POST"])
async def close_paper_position_route(request: Request):
    """Close an open paper trading position at live market price."""
    try:
        body = await request.json()
        position_id = body.get("position_id")
        if not position_id:
            raise HTTPException(status_code=400, detail="position_id is required")
        result = close_paper_position(position_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.api_route("/paper/reset", methods=["POST"])
async def reset_paper_account_route(request: Request):
    """Reset virtual paper trading funds and open positions."""
    try:
        body = {}
        try:
            body = await request.json()
        except Exception:
            pass
        initial_capital = float(body.get("initial_capital", 100000.0))
        result = reset_paper_account(initial_capital)
        return {"success": True, "message": f"Account reset to ${initial_capital:,.2f}", "portfolio": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- AI MARKET SENTIMENT ENDPOINT -----------------

@router.api_route("/sentiment/news", methods=["GET", "POST"])
async def get_market_sentiment_route(request: Request, symbol: str = "BTC-USD"):
    """Fetch live news headlines and calculate NLP FinBERT sentiment polarity & Fear/Greed index."""
    sym = symbol
    if request.method == "POST":
        try:
            body = await request.json()
            sym = body.get("symbol", sym)
        except Exception:
            pass
    return fetch_market_sentiment(sym)

# ----------------- TELEGRAM & DISCORD WEBHOOK ALERTS ENDPOINT -----------------

@router.api_route("/alerts/webhook/test", methods=["POST"])
async def test_alert_route(request: Request):
    """Dispatch a test trade alert payload to Discord Webhook or Telegram Bot."""
    try:
        body = await request.json()
        platform = body.get("platform", "discord")
        destination = body.get("destination", "")
        chat_id = body.get("chat_id")
        symbol = body.get("symbol", "BTC-USD")
        
        if not destination:
            raise HTTPException(status_code=400, detail="Webhook URL or Bot Token is required.")
            
        result = test_alert_dispatch(platform, destination, chat_id, symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- MULTI-ASSET PORTFOLIO OPTIMIZER ENDPOINT -----------------

@router.api_route("/portfolio/multi_asset", methods=["POST"])
async def run_multi_asset_route(request: Request):
    """Backtest a multi-asset basket with weights, correlation matrix, and combined equity curve."""
    try:
        body = await request.json()
        basket = body.get("basket", [])
        timeframe = body.get("timeframe", "1d")
        period = body.get("period", "1y")
        initial_capital = float(body.get("initial_capital", 100000.0))
        
        result = run_multi_asset_portfolio(basket, timeframe, period, initial_capital)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- CUSTOM PYTHON STRATEGY CODE RUNNER ENDPOINT -----------------

@router.api_route("/strategy/custom_code", methods=["POST"])
async def execute_custom_strategy_route(request: Request):
    """Execute in-browser Python strategy script and compute full backtest metrics."""
    try:
        body = await request.json()
        code = body.get("code", "")
        symbol = body.get("symbol", "BTC-USD")
        timeframe = body.get("timeframe", "1d")
        period = body.get("period", "2y")
        initial_capital = float(body.get("initial_capital", 100000.0))
        
        if not code.strip():
            raise HTTPException(status_code=400, detail="Python strategy code is empty.")
            
        result = execute_custom_strategy(code, symbol, timeframe, period, initial_capital)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.api_route("/strategy/custom_code/template", methods=["GET"])
async def get_starter_code_template():
    return {"starter_code": DEFAULT_STARTER_CODE}

@router.api_route("/strategies/presets", methods=["GET", "POST"])
async def get_strategy_presets():
    return {"presets": STRATEGY_PRESETS}

@router.api_route("/data/history", methods=["GET", "POST"])
async def get_market_history(
    request: Request,
    symbol: str = "BTC-USD",
    timeframe: str = "1d",
    period: str = "2y",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Fetch historical OHLCV data + indicators. Supports both GET and POST."""
    sym = symbol
    tf = timeframe
    per = period
    s_date = start_date
    e_date = end_date

    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                sym = body.get("symbol", sym)
                tf = body.get("timeframe", tf)
                per = body.get("period", per)
                s_date = body.get("start_date", s_date)
                e_date = body.get("end_date", e_date)
        except Exception:
            pass

    try:
        df = fetch_market_data(
            symbol=sym,
            timeframe=tf,
            period=per,
            start_date=s_date,
            end_date=e_date
        )
        
        # Calculate full suite of indicators
        indicator_data = calculate_all_indicators(df)
        df_calc = indicator_data["df"]
        
        # Convert to dict for JSON serialization
        records = df_calc.to_dict(orient="records")
        # Sanitize NaNs/Infs to None
        for row in records:
            for k, v in row.items():
                if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    row[k] = None
                elif pd.isna(v):
                    row[k] = None
                    
        return {
            "symbol": sym,
            "timeframe": tf,
            "bars_count": len(records),
            "candles": records,
            "order_blocks": indicator_data["order_blocks"][:30],
            "fair_value_gaps": indicator_data["fair_value_gaps"][:30]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/backtest/run", response_model=BacktestResult)
async def execute_backtest(request: BacktestRequest):
    try:
        df = fetch_market_data(
            symbol=request.symbol,
            timeframe=request.timeframe,
            period=request.period,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        result = run_backtest_simulation(df, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Backtest execution failed: {str(e)}")

@router.post("/backtest/monte-carlo", response_model=MonteCarloResult)
async def execute_monte_carlo(request: MonteCarloRequest):
    try:
        result = run_monte_carlo_simulation(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Monte Carlo simulation failed: {str(e)}")

@router.post("/backtest/optimize", response_model=OptimizeResult)
async def execute_optimization(request: OptimizeRequest):
    try:
        result = run_grid_optimization(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parameter optimization failed: {str(e)}")

@router.api_route("/predict/run", methods=["GET", "POST"], response_model=PredictionResult)
async def execute_price_prediction(
    request: Request,
    symbol: str = "BTC-USD",
    timeframe: str = "1d",
    period: str = "2y",
    horizon_days: int = 30,
    model_type: str = "ensemble"
):
    """
    Execute Quantitative Machine Learning Price Prediction across any stock, crypto,
    ETF, or index globally with multi-scale feature learning, confidence bounds,
    out-of-sample directional accuracy, and driver attribution. Supports GET and POST.
    """
    sym = symbol
    tf = timeframe
    per = period
    horizon = horizon_days
    m_type = model_type

    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                sym = body.get("symbol", sym)
                tf = body.get("timeframe", tf)
                per = body.get("period", per)
                horizon = int(body.get("horizon_days", horizon))
                m_type = body.get("model_type", m_type)
        except Exception:
            pass

    try:
        df = fetch_market_data(
            symbol=sym,
            timeframe=tf,
            period=per
        )
        
        result = generate_price_prediction(
            df=df,
            symbol=sym,
            horizon_days=horizon,
            model_type=m_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Price prediction failed: {str(e)}")

@router.post("/data/upload")
async def upload_custom_data(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = parse_uploaded_csv(contents)
        records = df.to_dict(orient="records")
        return {
            "filename": file.filename,
            "bars_count": len(records),
            "start_time": records[0]["timestamp"] if records else None,
            "end_time": records[-1]["timestamp"] if records else None,
            "candles": records[:500]  # preview first 500
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

@router.post("/export/csv")
async def export_trades_csv(trades: List[Dict[str, Any]]):
    """Generate CSV file content for trade history."""
    if not trades:
        raise HTTPException(status_code=400, detail="No trades to export")
        
    output = io.StringIO()
    fieldnames = list(trades[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for t in trades:
        writer.writerow(t)
        
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=backtest_trades.csv"}
    )
