import React from 'react';
import { Play, TrendingUp, ShieldCheck, Activity, Database, RefreshCw, Search, Home } from 'lucide-react';
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
  onOpenWelcome
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
              <span className="badge-bull" style={{ fontSize: '0.7rem' }}>SMC CORE 2.0</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Institutional Algorithmic Backtesting & Risk Analytics
            </p>
          </div>
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
              title="View Welcome & Strategy Guide"
            >
              <Home size={14} />
              <span>Guide</span>
            </button>
          )}

          {/* Universal Symbol Search & Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative', zIndex: 1002, overflow: 'visible' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>ASSET:</span>
            <SymbolSearchSelector
              symbol={symbol}
              setSymbol={setSymbol}
            />
          </div>

          {/* Timeframe Selector */}
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

          {/* Period Selector */}
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

          {/* Run Backtest Button */}
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

        </div>

      </div>
    </header>
  );
}
