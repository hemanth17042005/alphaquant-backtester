import React, { useState, useEffect } from 'react';
import PlotWrapper from './PlotWrapper';
import { TrendingUp, ShieldAlert, Maximize2, Minimize2 } from 'lucide-react';
import { getCurrencySymbol } from '../services/currency';

export default function EquityDrawdownChart({ equityCurve = [], symbol = 'BTC-USD', currencyPreference = 'auto' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    height: isFullscreen ? (window.innerHeight ? window.innerHeight - 110 : 700) : 440,
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
    <div
      className="glass-panel"
      style={isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        background: '#080B11',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        border: 'none',
        overflow: 'hidden'
      } : {
        padding: '1.25rem',
        marginBottom: '1.25rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            PORTFOLIO EQUITY & UNDERWATER DRAWDOWN ({currSym})
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge-bull" style={{ fontSize: '0.7rem' }}>STRATEGY VS BUY & HOLD</span>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: isFullscreen ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: isFullscreen ? '#00F5D4' : 'var(--text-muted)',
              background: isFullscreen ? 'rgba(0, 245, 212, 0.15)' : undefined
            }}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Chart"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <PlotWrapper
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 100px)' : '440px' }}
        />
      </div>
    </div>
  );
}
