import React, { useState, useEffect } from 'react';
import {
  Briefcase, TrendingUp, TrendingDown, Layers, PieChart,
  Plus, Trash2, RefreshCw, X, Sliders, Activity
} from 'lucide-react';
import PlotWrapper from './PlotWrapper';
import { runMultiAssetPortfolio } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

const DEFAULT_BASKET = [
  { symbol: 'BTC-USD', weight: 40 },
  { symbol: 'NVDA', weight: 30 },
  { symbol: 'RELIANCE.NS', weight: 30 }
];

export default function MultiAssetPortfolioModal({
  isOpen,
  onClose,
  currencyPreference = 'auto'
}) {
  const [basket, setBasket] = useState(DEFAULT_BASKET);
  const [timeframe, setTimeframe] = useState('1d');
  const [period, setPeriod] = useState('1y');
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const executePortfolioSimulation = async () => {
    setLoading(true);
    try {
      const data = await runMultiAssetPortfolio({
        basket,
        timeframe,
        period,
        initial_capital: 100000
      });
      setPortfolioData(data);
    } catch (err) {
      console.error('Portfolio backtest error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executePortfolioSimulation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWeightChange = (index, val) => {
    const updated = [...basket];
    updated[index].weight = Math.max(1, parseInt(val) || 1);
    setBasket(updated);
  };

  const handleRemoveAsset = (index) => {
    if (basket.length <= 1) return;
    setBasket(basket.filter((_, i) => i !== index));
  };

  const handleAddAsset = () => {
    if (!newSymbol.trim()) return;
    setBasket([...basket, { symbol: newSymbol.trim().toUpperCase(), weight: 25 }]);
    setNewSymbol('');
  };

  const totalRawWeight = basket.reduce((acc, curr) => acc + (parseInt(curr.weight) || 1), 0);

  // Plotly chart data for Portfolio Cumulative Equity
  const chartData = portfolioData?.equity_curve ? [
    {
      x: portfolioData.equity_curve.map((d) => d.time),
      y: portfolioData.equity_curve.map((d) => d.equity),
      type: 'scatter',
      mode: 'lines',
      name: 'Combined Multi-Asset Portfolio',
      line: { color: '#00F5D4', width: 2.5 }
    }
  ] : [];

  const chartLayout = {
    autosize: true,
    height: 320,
    margin: { l: 50, r: 20, t: 30, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8' },
    yaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8', tickprefix: '$' },
    showlegend: false
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          background: '#0B0F19',
          border: '1px solid rgba(155, 93, 229, 0.4)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #9B5DE5, #F15BB5)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: '#080B11'
            }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F8FAFC' }}>
                MULTI-ASSET PORTFOLIO REBALANCER & CORRELATION MATRIX
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Combine custom equity baskets with dynamic weight allocations, cross-asset correlations, and portfolio metrics.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={executePortfolioSimulation}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Rebalancing...' : 'Rebalance & Simulate'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Portfolio Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>PORTFOLIO RETURN</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900, color: (portfolioData?.total_return_pct || 0) >= 0 ? '#10B981' : '#EF4444' }}>
              {(portfolioData?.total_return_pct || 0) > 0 ? '+' : ''}{portfolioData?.total_return_pct ?? 0}%
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>SHARPE RATIO</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#00BBF9' }}>
              {portfolioData?.sharpe_ratio ?? 0}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>MAX DRAWDOWN</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#EF4444' }}>
              -{portfolioData?.max_drawdown_pct ?? 0}%
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>ANNUALIZED VOLATILITY</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#FEE440' }}>
              {portfolioData?.annualized_volatility_pct ?? 0}%
            </div>
          </div>
        </div>

        {/* Dual-Column Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 360px) 1fr',
          gap: '1.25rem',
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          
          {/* Left Column: Basket Allocation Builder */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F8FAFC' }}>ASSET ALLOCATION</h4>
              <span className="badge-neutral" style={{ fontSize: '0.68rem' }}>{basket.length} ASSETS</span>
            </div>

            {/* Asset Allocation Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {basket.map((item, idx) => {
                const normPct = Math.round(((parseInt(item.weight) || 1) / totalRawWeight) * 100);
                return (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#00F5D4' }}>
                        {item.symbol}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: '#F8FAFC' }}>
                          {normPct}%
                        </span>
                        {basket.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(idx)}
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                            title="Remove Asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={item.weight}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Add Asset Row */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Ticker (e.g. TATAPOWER.NS, AAPL)"
                className="input-dark"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              />
              <button
                type="button"
                onClick={handleAddAsset}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

          </div>

          {/* Right Column: Chart & Correlation Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Portfolio Growth Chart */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Activity size={16} color="var(--accent-primary)" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F8FAFC' }}>
                  PORTFOLIO COMPOUNDING RETURN CURVE
                </h4>
              </div>
              <PlotWrapper data={chartData} layout={chartLayout} style={{ width: '100%', height: '320px' }} />
            </div>

            {/* Correlation Heatmap Table */}
            {portfolioData?.correlation_matrix && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <Layers size={16} color="#9B5DE5" />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F8FAFC' }}>
                    CROSS-ASSET HISTORICAL CORRELATION MATRIX
                  </h4>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                        <th style={{ padding: '0.45rem', textAlign: 'left' }}>ASSET</th>
                        {Object.keys(portfolioData.correlation_matrix).map((sym, idx) => (
                          <th key={idx} style={{ padding: '0.45rem', color: '#00F5D4' }}>{sym}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(portfolioData.correlation_matrix).map(([rowSym, rowCols], rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', textAlign: 'center' }}>
                          <td style={{ padding: '0.45rem', fontWeight: 700, textAlign: 'left', color: '#F8FAFC' }}>{rowSym}</td>
                          {Object.values(rowCols).map((val, cIdx) => {
                            const numVal = parseFloat(val);
                            const cellBg = numVal === 1
                              ? 'rgba(0, 245, 212, 0.15)'
                              : numVal > 0.5
                              ? 'rgba(16, 185, 129, 0.15)'
                              : numVal < -0.2
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(255, 255, 255, 0.03)';
                            return (
                              <td key={cIdx} style={{ padding: '0.45rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: cellBg }}>
                                {numVal.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
