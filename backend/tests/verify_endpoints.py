import requests
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print(f"Testing AlphaQuant API on {BASE_URL}...")

    # 1. Health
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[PASS] /api/health OK")

    # 2. Symbols
    r = requests.get(f"{BASE_URL}/api/symbols")
    assert r.status_code == 200
    assert "popular" in r.json()
    print("[PASS] /api/symbols OK")

    # 3. Presets
    r = requests.get(f"{BASE_URL}/api/strategies/presets")
    assert r.status_code == 200
    presets = r.json()["presets"]
    assert len(presets) >= 6
    print(f"[PASS] /api/strategies/presets OK ({len(presets)} presets loaded)")

    # 4. History & Indicator calculation
    r = requests.post(f"{BASE_URL}/api/data/history?symbol=SAMPLE_BULL&timeframe=1d&period=2y")
    assert r.status_code == 200
    hist = r.json()
    assert hist["bars_count"] > 0
    assert len(hist["candles"]) > 0
    assert "ema_fast" in hist["candles"][0]
    assert "vwap" in hist["candles"][0]
    print(f"[PASS] /api/data/history OK ({hist['bars_count']} candles computed with indicators & SMC zones)")

    # 5. Run Backtest
    bt_payload = {
        "symbol": "SAMPLE_BULL",
        "timeframe": "1d",
        "period": "2y",
        "strategy": {
            "preset_id": "smc_orderblock_fvg",
            "name": "Smart Money Concepts Sniper",
            "direction": "both"
        },
        "indicators": {
            "ema_fast": 9,
            "ema_slow": 21,
            "ema_trend": 200,
            "rsi_period": 14,
            "bb_std": 2.0
        },
        "risk": {
            "initial_capital": 100000.0,
            "position_sizing_mode": "fixed_risk_pct",
            "risk_per_trade_pct": 0.02,
            "stop_loss_type": "atr",
            "stop_loss_value": 1.5,
            "take_profit_type": "rr_multiple",
            "take_profit_value": 2.0,
            "use_trailing_stop": True,
            "use_break_even": True
        }
    }
    r = requests.post(f"{BASE_URL}/api/backtest/run", json=bt_payload)
    assert r.status_code == 200
    res = r.json()
    assert "metrics" in res
    assert "trades" in res
    assert "equity_curve" in res
    print(f"[PASS] /api/backtest/run OK: Net ROI: {res['metrics']['net_profit_pct']}%, Win Rate: {res['metrics']['win_rate_pct']}%, Trades: {res['metrics']['total_trades']}, Sharpe: {res['metrics']['sharpe_ratio']}")

    # 6. Run Monte Carlo
    mc_payload = {
        "trades": res["trades"],
        "initial_capital": 100000.0,
        "num_simulations": 100
    }
    r = requests.post(f"{BASE_URL}/api/backtest/monte-carlo", json=mc_payload)
    assert r.status_code == 200
    mc_res = r.json()
    assert mc_res["num_simulations"] == 100
    print(f"[PASS] /api/backtest/monte-carlo OK: Prob Profit: {mc_res['prob_profit_pct']}%, Median Equity: ${mc_res['median_final_equity']}")

    # 7. Run 2D Optimization
    opt_payload = {
        "symbol": "SAMPLE_BULL",
        "timeframe": "1d",
        "period": "2y",
        "strategy_preset": "ema_cross_9_21",
        "param_x": {
            "name": "ema_fast",
            "param_type": "indicator",
            "min_val": 5.0,
            "max_val": 15.0,
            "step": 5.0
        },
        "param_y": {
            "name": "ema_slow",
            "param_type": "indicator",
            "min_val": 20.0,
            "max_val": 40.0,
            "step": 10.0
        },
        "metric_target": "sharpe_ratio"
    }
    r = requests.post(f"{BASE_URL}/api/backtest/optimize", json=opt_payload)
    assert r.status_code == 200
    opt_res = r.json()
    assert len(opt_res["grid"]) > 0
    print(f"[PASS] /api/backtest/optimize OK: Optimal {opt_res['param_x_name']}={opt_res['best_x']}, {opt_res['param_y_name']}={opt_res['best_y']}, Best Sharpe: {opt_res['best_metric_val']}")

    # 8. Frontend HTML & Asset Serving
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200
    assert "<title>AlphaQuant" in r.text
    print("[PASS] Frontend Single-Page App Index HTML serving OK")

    print("\nALL PLATFORM ENDPOINTS & STATIC ASSETS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
