import React from 'react';
import { Play, TrendingUp, ShieldCheck, Activity, Database, RefreshCw, Search, Home, BrainCircuit } from 'lucide-react';
import SymbolSearchSelector from './SymbolSearchSelector';

export default function Header({
  symbol,
  setSymbol,
  timeframe,
  setTimeframe,
  period,
  setPeriod,
  onRunBacktest,
  loading,
  popularSymbols = [],
  onOpenWelcome,
  activeMode = 'backtester',
  setActiveMode
}) {
  return (
    <header
      className="glass-panel"
      style={{
        padding: '0.85rem 1.5rem',
        marginBottom: '1.25rem',
        position: 'relative',
        zIndex: 1000,
        overflow: 'visible'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', overflow: 'visible' }}>
        
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: onOpenWelcome ? 'pointer' : 'default' }}
            onClick={onOpenWelcome}
            title="Return to Welcome Overview"
          >
            <div style={{
              background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B11',
              boxShadow: '0 0 15px rgba(0, 245, 212, 0.4)'
            }}>
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  ALPHA<span style={{ color: 'var(--accent-primary)' }}>QUANT</span>
                </h1>
                <span className="badge-bull" style={{ fontSize: '0.7rem' }}>PRO 2.5</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeMode === 'predictor' ? 'AI Machine Learning Price Forecasting' : 'Institutional Algorithmic Backtesting'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {setActiveMode && (
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3px',
              gap: '4px'
            }}>
              <button
                type="button"
                id="btn-mode-predictor"
                onClick={() => setActiveMode('predictor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeMode === 'predictor' ? 'linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 187, 249, 0.2))' : 'transparent',
                  color: activeMode === 'predictor' ? '#00F5D4' : 'var(--text-muted)',
                  boxShadow: activeMode === 'predictor' ? '0 0 10px rgba(0, 245, 212, 0.25)' : 'none',
                  borderBottom: activeMode === 'predictor' ? '2px solid #00F5D4' : '2px solid transparent'
                }}
              >
                <BrainCircuit size={15} />
                <span>AI Price Predictor</span>
              </button>

              <button
                type="button"
                id="btn-mode-backtester"
                onClick={() => setActiveMode('backtester')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeMode === 'backtester' ? 'linear-gradient(135deg, rgba(155, 93, 229, 0.2), rgba(0, 187, 249, 0.2))' : 'transparent',
                  color: activeMode === 'backtester' ? '#9B5DE5' : 'var(--text-muted)',
                  boxShadow: activeMode === 'backtester' ? '0 0 10px rgba(155, 93, 229, 0.25)' : 'none',
                  borderBottom: activeMode === 'backtester' ? '2px solid #9B5DE5' : '2px solid transparent'
                }}
              >
                <TrendingUp size={15} />
                <span>Strategy Backtester</span>
              </button>
            </div>
          )}
        </div>

        {/* Market Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1001, overflow: 'visible' }}>
          
          {/* Overview button */}
          {onOpenWelcome && (
            <button
              type="button"
              onClick={onOpenWelcome}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="View Welcome & Mode Selection"
            >
              <Home size={14} />
              <span>Start Menu</span>
            </button>
          )}

          {/* Universal Symbol Search & Selector (Always active) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative', zIndex: 1002, overflow: 'visible' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>ASSET:</span>
            <SymbolSearchSelector
              symbol={symbol}
              setSymbol={setSymbol}
            />
          </div>

          {/* Timeframe Selector (Backtester Mode) */}
          {activeMode === 'backtester' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>TF:</span>
                <select
                  className="input-dark"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  style={{ width: '95px', fontFamily: 'var(--font-mono)' }}
                >
                  <option value="15m">15m</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PERIOD:</span>
                <select
                  className="input-dark"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  style={{ width: '105px', fontFamily: 'var(--font-mono)' }}
                >
                  <option value="60d">60 Days</option>
                  <option value="6mo">6 Months</option>
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                  <option value="5y">5 Years</option>
                </select>
              </div>

              <button
                id="run-backtest-btn"
                className="btn-primary"
                onClick={onRunBacktest}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, minWidth: '155px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Simulating...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="#080B11" />
                    <span>Run Strategy</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
