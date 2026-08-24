import React from 'react';
import {
  Play, TrendingUp, ShieldCheck, Activity, Database, RefreshCw, Search, Home,
  BrainCircuit, Coins, IndianRupee, DollarSign, Gamepad2, FileText,
  Briefcase, Bell, Code, User, Lock, LogOut, KeyRound
} from 'lucide-react';
import SymbolSearchSelector from './SymbolSearchSelector';
import LivePriceTickerCard from './LivePriceTickerCard';
import { getCurrencySymbol } from '../services/currency';

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
  onOpenFactsheet,
  onOpenPaperTrading,
  onOpenPortfolio,
  onOpenAlerts,
  onOpenCodeEditor,
  activeMode = 'backtester',
  setActiveMode,
  currencyPreference = 'auto',
  setCurrencyPreference,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const activeCurrencySymbol = getCurrencySymbol(symbol, currencyPreference);

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

          {/* 1-Click Institutional Factsheet PDF Export */}
          {onOpenFactsheet && (
            <button
              type="button"
              id="btn-open-factsheet"
              onClick={onOpenFactsheet}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(0, 245, 212, 0.3)',
                color: '#00F5D4'
              }}
              title="Generate Goldman Sachs / BlackRock Style Strategy Factsheet (PDF)"
            >
              <FileText size={14} />
              <span>Factsheet (PDF)</span>
            </button>
          )}

          {/* Live Paper Trading Simulator */}
          {onOpenPaperTrading && (
            <button
              type="button"
              id="btn-open-paper-trading"
              onClick={onOpenPaperTrading}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(241, 91, 181, 0.4)',
                color: '#F15BB5'
              }}
              title="Open Live Paper Trading Simulation with Virtual Funds"
            >
              <Gamepad2 size={14} />
              <span>Paper Trading</span>
            </button>
          )}

          {/* Multi-Asset Portfolio Rebalancer */}
          {onOpenPortfolio && (
            <button
              type="button"
              id="btn-open-portfolio"
              onClick={onOpenPortfolio}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(155, 93, 229, 0.4)',
                color: '#9B5DE5'
              }}
              title="Multi-Asset Basket & Correlation Matrix"
            >
              <Briefcase size={14} />
              <span>Portfolio Basket</span>
            </button>
          )}

          {/* Trade Signal Webhook Alerts */}
          {onOpenAlerts && (
            <button
              type="button"
              id="btn-open-alerts"
              onClick={onOpenAlerts}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(0, 187, 249, 0.4)',
                color: '#00BBF9'
              }}
              title="Configure Telegram & Discord Webhook Signals"
            >
              <Bell size={14} />
              <span>Alerts</span>
            </button>
          )}

          {/* Custom Python Strategy IDE */}
          {onOpenCodeEditor && (
            <button
              type="button"
              id="btn-open-code-editor"
              onClick={onOpenCodeEditor}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(0, 245, 212, 0.4)',
                color: '#00F5D4'
              }}
              title="Write & Execute Custom Python Strategies in Browser"
            >
              <Code size={14} />
              <span>Python IDE</span>
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

          {/* Real-time Live Price Badge */}
          <LivePriceTickerCard
            symbol={symbol}
            currencyPreference={currencyPreference}
            compact={true}
          />

          {/* Currency Preference Selector */}
          {setCurrencyPreference && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>CURR:</span>
              <select
                className="input-dark"
                value={currencyPreference}
                onChange={(e) => setCurrencyPreference(e.target.value)}
                style={{ width: '90px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeCurrencySymbol === '₹' ? '#00BBF9' : '#00F5D4' }}
                title="Select Currency Display"
              >
                <option value="auto">Auto ({getCurrencySymbol(symbol, 'auto')})</option>
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          )}

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

          {/* User Authentication & Profile Badge */}
          {currentUser ? (
            <div
              id="header-user-profile-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(0, 245, 212, 0.35)',
                borderRadius: '24px',
                padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(0, 245, 212, 0.15)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onOpenAuth && onOpenAuth('profile')}
              title="Open User Profile & Settings"
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00F5D4, #00BBF9)',
                color: '#080B11',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                position: 'relative'
              }}>
                {(currentUser.full_name || currentUser.email || 'Q').slice(0, 2).toUpperCase()}
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '1px solid #080B11'
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                  {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Trader'}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#00F5D4', fontWeight: 600, letterSpacing: '0.03em' }}>
                  {currentUser.tier || 'PRO'}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              id="btn-header-signin"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="btn-secondary"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: 'rgba(0, 245, 212, 0.4)',
                color: '#00F5D4',
                background: 'rgba(0, 245, 212, 0.08)'
              }}
              title="Sign In / Register with Email & OTP"
            >
              <Lock size={14} />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
