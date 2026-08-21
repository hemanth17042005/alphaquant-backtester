import React, { useState } from 'react';
import PlotWrapper from './PlotWrapper';
import { Sliders, Play, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { runOptimization } from '../services/api';

export default function OptimizationHeatmap({
  symbol = 'BTC-USD',
  timeframe = '1d',
  period = '2y',
  strategyPreset = 'ema_cross_9_21',
  indicatorConfig,
  riskConfig
}) {
  const [paramXName, setParamXName] = useState('ema_fast');
  const [paramXMin, setParamXMin] = useState(5);
  const [paramXMax, setParamXMax] = useState(15);
  const [paramXStep, setParamXStep] = useState(2);

  const [paramYName, setParamYName] = useState('ema_slow');
  const [paramYMin, setParamYMin] = useState(15);
  const [paramYMax, setParamYMax] = useState(45);
  const [paramYStep, setParamYStep] = useState(5);

  const [targetMetric, setTargetMetric] = useState('sharpe_ratio');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runOptimization({
        symbol,
        timeframe,
        period,
        strategy_preset: strategyPreset,
        param_x: {
          name: paramXName,
          param_type: 'indicator',
          min_val: parseFloat(paramXMin),
          max_val: parseFloat(paramXMax),
          step: parseFloat(paramXStep)
        },
        param_y: {
          name: paramYName,
          param_type: 'indicator',
          min_val: parseFloat(paramYMin),
          max_val: parseFloat(paramYMax),
          step: parseFloat(paramYStep)
        },
        metric_target: targetMetric,
        base_indicators: indicatorConfig,
        base_risk: riskConfig
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  // Build 2D Heatmap Grid
  let plotData = [];
  if (result && result.grid) {
    const xVals = Array.from(new Set(result.grid.map((g) => g.param_x_val))).sort((a, b) => a - b);
    const yVals = Array.from(new Set(result.grid.map((g) => g.param_y_val))).sort((a, b) => a - b);

    const zMatrix = [];
    for (let yi = 0; yi < yVals.length; yi++) {
      const row = [];
      for (let xi = 0; xi < xVals.length; xi++) {
        const pt = result.grid.find((g) => g.param_x_val === xVals[xi] && g.param_y_val === yVals[yi]);
        row.push(pt ? pt.metric_val : 0);
      }
      zMatrix.push(row);
    }

    plotData = [
      {
        type: 'heatmap',
        x: xVals.map((v) => `${result.param_x_name}=${v}`),
        y: yVals.map((v) => `${result.param_y_name}=${v}`),
        z: zMatrix,
        colorscale: [
          [0, '#EF4444'],
          [0.35, '#0F172A'],
          [0.7, '#00BBF9'],
          [1, '#00F5D4']
        ],
        hoverongaps: false
      }
    ];
  }

  const layout = {
    autosize: true,
    height: 380,
    margin: { l: 80, r: 25, t: 20, b: 50 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 9 },
      gridcolor: 'rgba(255,255,255,0.05)'
    },
    yaxis: {
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 9 },
      gridcolor: 'rgba(255,255,255,0.05)'
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#00BBF9" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            2D PARAMETER GRID SEARCH & ROBUSTNESS HEATMAP
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <select
            className="input-dark"
            value={targetMetric}
            onChange={(e) => setTargetMetric(e.target.value)}
            style={{ width: '150px', fontSize: '0.8rem' }}
          >
            <option value="sharpe_ratio">Target: Sharpe Ratio</option>
            <option value="profit_factor">Target: Profit Factor</option>
            <option value="net_profit_pct">Target: Net Profit %</option>
            <option value="win_rate_pct">Target: Win Rate %</option>
          </select>

          <button
            className="btn-primary"
            onClick={handleRunOptimization}
            disabled={loading}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="#080B11" />}
            <span>Run Grid Sweep</span>
          </button>
        </div>
      </div>

      {/* Sweep Range Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
        
        {/* Param X */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Parameter X (Horizontal Axis)
          </label>
          <select
            className="input-dark"
            value={paramXName}
            onChange={(e) => setParamXName(e.target.value)}
            style={{ marginBottom: '0.35rem' }}
          >
            <option value="ema_fast">Fast EMA Length</option>
            <option value="rsi_period">RSI Period</option>
            <option value="stop_loss_value">SL ATR Multiplier</option>
            <option value="take_profit_value">Target R:R Ratio</option>
          </select>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input type="number" className="input-dark" placeholder="Min" value={paramXMin} onChange={(e) => setParamXMin(e.target.value)} style={{ fontSize: '0.75rem' }} />
            <input type="number" className="input-dark" placeholder="Max" value={paramXMax} onChange={(e) => setParamXMax(e.target.value)} style={{ fontSize: '0.75rem' }} />
            <input type="number" className="input-dark" placeholder="Step" value={paramXStep} onChange={(e) => setParamXStep(e.target.value)} style={{ fontSize: '0.75rem' }} />
          </div>
        </div>

        {/* Param Y */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Parameter Y (Vertical Axis)
          </label>
          <select
            className="input-dark"
            value={paramYName}
            onChange={(e) => setParamYName(e.target.value)}
            style={{ marginBottom: '0.35rem' }}
          >
            <option value="ema_slow">Slow EMA Length</option>
            <option value="ema_trend">Trend 200 EMA</option>
            <option value="take_profit_value">Target R:R Ratio</option>
            <option value="stop_loss_value">SL ATR Multiplier</option>
          </select>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input type="number" className="input-dark" placeholder="Min" value={paramYMin} onChange={(e) => setParamYMin(e.target.value)} style={{ fontSize: '0.75rem' }} />
            <input type="number" className="input-dark" placeholder="Max" value={paramYMax} onChange={(e) => setParamYMax(e.target.value)} style={{ fontSize: '0.75rem' }} />
            <input type="number" className="input-dark" placeholder="Step" value={paramYStep} onChange={(e) => setParamYStep(e.target.value)} style={{ fontSize: '0.75rem' }} />
          </div>
        </div>

      </div>

      {error && (
        <div style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Best Result Banner */}
      {result && (
        <div style={{ background: 'rgba(0, 245, 212, 0.08)', border: '1px solid rgba(0, 245, 212, 0.3)', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem' }}>
            Optimal Solution: <strong>{result.param_x_name} = {result.best_x}</strong>, <strong>{result.param_y_name} = {result.best_y}</strong>
          </span>
          <span className="badge-bull">
            Peak {result.metric_name}: {result.best_metric_val}
          </span>
        </div>
      )}

      {/* Heatmap Canvas */}
      {result ? (
        <PlotWrapper
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: '380px' }}
        />
      ) : (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Click <strong>"Run Grid Sweep"</strong> to compute parameter sensitivity matrix and discover robust parameter plateaus.
        </div>
      )}

    </div>
  );
}
