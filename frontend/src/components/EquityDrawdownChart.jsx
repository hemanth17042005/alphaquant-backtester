import React from 'react';
import PlotWrapper from './PlotWrapper';
import { TrendingUp, ShieldAlert } from 'lucide-react';
import { getCurrencySymbol } from '../services/currency';

export default function EquityDrawdownChart({ equityCurve = [], symbol = 'BTC-USD', currencyPreference = 'auto' }) {
  if (!equityCurve || equityCurve.length === 0) {
    return null;
  }

  const currSym = getCurrencySymbol(symbol, currencyPreference);
  const timestamps = equityCurve.map((pt) => pt.timestamp);
  const equities = equityCurve.map((pt) => pt.equity);
  const benchmarks = equityCurve.map((pt) => pt.benchmark_equity);
  const drawdowns = equityCurve.map((pt) => -pt.drawdown_pct);

  const plotData = [
    // 1. Strategy Equity Curve
    {
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: equities,
      name: 'AlphaQuant Strategy',
      line: { color: '#00F5D4', width: 2.5 },
      xaxis: 'x',
      yaxis: 'y'
    },
    // 2. Buy & Hold Benchmark
    {
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: benchmarks,
      name: 'Buy & Hold Benchmark',
      line: { color: '#94A3B8', width: 1.5, dash: 'dash' },
      xaxis: 'x',
      yaxis: 'y'
    },
    // 3. Underwater Drawdown
    {
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: drawdowns,
      name: 'Drawdown (%)',
      line: { color: '#EF4444', width: 1.2 },
      fill: 'tozeroy',
      fillcolor: 'rgba(239, 68, 68, 0.2)',
      xaxis: 'x',
      yaxis: 'y2'
    }
  ];

  const layout = {
    autosize: true,
    height: 440,
    margin: { l: 65, r: 25, t: 20, b: 35 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
    xaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 9 },
      showticklabels: false,
      anchor: 'y'
    },
    yaxis: {
      title: `Portfolio Value (${currSym})`,
      titlefont: { color: '#94A3B8', size: 10 },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 },
      domain: [0.35, 1.0]
    },
    yaxis2: {
      title: 'Drawdown (%)',
      titlefont: { color: '#EF4444', size: 10 },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#EF4444', family: 'JetBrains Mono', size: 10 },
      domain: [0.0, 0.28],
      range: [Math.min(...drawdowns) * 1.15, 0]
    },
    legend: {
      orientation: 'h',
      y: 1.08,
      x: 0,
      font: { color: '#CBD5E1', size: 11 }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            PORTFOLIO EQUITY & UNDERWATER DRAWDOWN
          </h2>
        </div>
        <span className="badge-bull" style={{ fontSize: '0.7rem' }}>STRATEGY VS BUY & HOLD</span>
      </div>

      <PlotWrapper
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '440px' }}
      />
    </div>
  );
}
