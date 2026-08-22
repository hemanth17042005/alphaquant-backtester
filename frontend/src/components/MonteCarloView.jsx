import React, { useState } from 'react';
import PlotWrapper from './PlotWrapper';
import { Shuffle, RefreshCw, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { runMonteCarlo } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

export default function MonteCarloView({ trades = [], initialCapital = 100000, symbol = 'BTC-USD', currencyPreference = 'auto' }) {
  const [numSims, setNumSims] = useState(500);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currSym = getCurrencySymbol(symbol, currencyPreference);

  const handleRunSimulation = async () => {
    if (!trades || trades.length < 3) {
      setError('At least 3 trades are required to run Monte Carlo simulations.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await runMonteCarlo({
        trades: trades,
        initial_capital: initialCapital,
        num_simulations: parseInt(numSims) || 500
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Build Plot Data
  let plotData = [];
  if (result && result.percentile_paths) {
    const pPaths = {};
    result.percentile_paths.forEach((p) => {
      pPaths[p.percentile] = p.equity_curve;
    });

    const xSteps = pPaths['p50'] ? pPaths['p50'].map((_, idx) => `Trade ${idx}`) : [];

    plotData = [
      // 95th Percentile (Best Case)
      {
        type: 'scatter',
        mode: 'lines',
        x: xSteps,
        y: pPaths['p95'],
        name: '95th Percentile (Best)',
        line: { color: '#10B981', width: 1.5, dash: 'dot' }
      },
      // 75th Percentile
      {
        type: 'scatter',
        mode: 'lines',
        x: xSteps,
        y: pPaths['p75'],
        name: '75th Percentile',
        line: { color: 'rgba(0, 245, 212, 0.5)', width: 1 }
      },
      // 50th Percentile (Median)
      {
        type: 'scatter',
        mode: 'lines',
        x: xSteps,
        y: pPaths['p50'],
        name: '50th Percentile (Median)',
        line: { color: '#00F5D4', width: 2.5 }
      },
      // 25th Percentile
      {
        type: 'scatter',
        mode: 'lines',
        x: xSteps,
        y: pPaths['p25'],
        name: '25th Percentile',
        line: { color: 'rgba(239, 68, 68, 0.5)', width: 1 }
      },
      // 5th Percentile (Worst Case)
      {
        type: 'scatter',
        mode: 'lines',
        x: xSteps,
        y: pPaths['p5'],
        name: '5th Percentile (Worst)',
        line: { color: '#EF4444', width: 1.5, dash: 'dot' }
      }
    ];
  }

  const layout = {
    autosize: true,
    height: 380,
    margin: { l: 65, r: 25, t: 20, b: 35 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 9 }
    },
    yaxis: {
      title: `Simulated Equity (${currSym})`,
      titlefont: { color: '#94A3B8', size: 10 },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 }
    },
    legend: {
      orientation: 'h',
      y: 1.08,
      x: 0,
      font: { color: '#CBD5E1', size: 10 }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={18} color="#F15BB5" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            MONTE CARLO RESHUFFLING & RUIN STRESS TEST ({currSym})
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <select
            className="input-dark"
            value={numSims}
            onChange={(e) => setNumSims(e.target.value)}
            style={{ width: '130px', fontSize: '0.8rem' }}
          >
            <option value="200">200 Iterations</option>
            <option value="500">500 Iterations</option>
            <option value="1000">1,000 Iterations</option>
          </select>

          <button
            className="btn-primary"
            onClick={handleRunSimulation}
            disabled={loading || trades.length < 3}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Shuffle size={14} />}
            <span>{result ? 'Re-Simulate' : 'Run 500 Sims'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Probability Cards */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          
          <div className="kpi-card glass-panel">
            <span className="kpi-label">Median Final Equity</span>
            <div className="kpi-value" style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>
              {formatPrice(result.median_final_equity, symbol, currencyPreference, 0)}
            </div>
            <div className="kpi-sub">5th%: {formatPrice(result.p5_final_equity, symbol, currencyPreference, 0)} | 95th%: {formatPrice(result.p95_final_equity, symbol, currencyPreference, 0)}</div>
          </div>

          <div className="kpi-card glass-panel">
            <span className="kpi-label">Prob. of Profit</span>
            <div className="kpi-value" style={{ color: '#10B981', fontSize: '1.25rem' }}>
              {result.prob_profit_pct}%
            </div>
            <div className="kpi-sub">Odds of finishing in positive PnL</div>
          </div>

          <div className="kpi-card glass-panel">
            <span className="kpi-label">Prob. Drawdown &gt; 10%</span>
            <div className="kpi-value" style={{ color: result.prob_drawdown_over_10_pct > 30 ? '#EF4444' : '#00BBF9', fontSize: '1.25rem' }}>
              {result.prob_drawdown_over_10_pct}%
            </div>
            <div className="kpi-sub">&gt;20% DD: {result.prob_drawdown_over_20_pct}% | &gt;30% DD: {result.prob_drawdown_over_30_pct}%</div>
          </div>

        </div>
      )}

      {/* Fan Chart */}
      {result ? (
        <PlotWrapper
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: '380px' }}
        />
      ) : (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Click <strong>"Run 500 Sims"</strong> to resample historical trade permutations and generate risk confidence bands.
        </div>
      )}

    </div>
  );
}
