import React, { useState } from 'react';
import { Sparkles, Search, Layers, ShieldCheck, TrendingUp, X, ArrowRight, Zap, Target } from 'lucide-react';

export default function WelcomeBanner({ onGetStarted }) {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('alphaquant_welcome_dismissed') !== 'true';
  });

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('alphaquant_welcome_dismissed', 'true');
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.25rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 14, 20, 0.95) 100%)',
        border: '1px solid rgba(0, 245, 212, 0.3)',
        borderRadius: '14px',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 245, 212, 0.05)'
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title="Dismiss welcome message"
      >
        <X size={14} />
      </button>

      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
          padding: '0.4rem',
          borderRadius: '8px',
          color: '#080B11',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #FFFFFF 0%, #00F5D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to AlphaQuant Platform
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Next-Generation Systematic Strategy Backtesting, Smart Money Concepts (SMC) & Institutional Risk Analytics
          </p>
        </div>
      </div>

      {/* 3 Step Quick Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '0.85rem',
        marginTop: '1rem'
      }}>
        
        {/* Step 1 */}
        <div style={{
          background: 'rgba(0, 245, 212, 0.04)',
          border: '1px solid rgba(0, 245, 212, 0.15)',
          padding: '0.85rem 1rem',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Search size={15} color="#00F5D4" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#00F5D4' }}>
              1. Universal Market Search
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Search <strong>ANY</strong> stock worldwide (US, India, Europe, Asia), crypto, forex, commodity, or instant synthetic market regimes.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'rgba(0, 187, 249, 0.04)',
          border: '1px solid rgba(0, 187, 249, 0.15)',
          padding: '0.85rem 1rem',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Layers size={15} color="#00BBF9" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#00BBF9' }}>
              2. SMC & Indicator Models
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Select institutional Order Blocks, Fair Value Gaps (FVG), VWAP bands, EMA 9/21, or RSI divergence strategies.
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'rgba(155, 93, 229, 0.04)',
          border: '1px solid rgba(155, 93, 229, 0.15)',
          padding: '0.85rem 1rem',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} color="#9B5DE5" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9B5DE5' }}>
              3. Quant Risk & Stress Test
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Analyze Sharpe, Sortino, max drawdowns, position sizing (Kelly/ATR), and run 500-iteration Monte Carlo ruin simulations.
          </p>
        </div>

      </div>

    </div>
  );
}
