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
