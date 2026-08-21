import React from 'react';
import {
  TrendingUp, Play, ShieldCheck, Layers, Activity, Search,
  ArrowRight, Sparkles, CheckCircle2, BarChart2, PieChart,
  Zap, Globe, Target
} from 'lucide-react';

export default function WelcomePage({ onEnterTerminal, onLaunchPreset }) {
  const PRESET_CARDS = [
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin USD',
      category: 'Crypto',
      presetId: 'smc_orderblock_fvg',
      strategyTitle: 'SMC Order Block & FVG Sniper',
      accent: '#00F5D4',
      badge: 'POPULAR'
    },
    {
      symbol: 'MRF.NS',
      name: 'MRF Limited (Tyres)',
      category: 'Indian Equities',
      presetId: 'ema_cross_9_21',
      strategyTitle: 'EMA 9/21 Trend Rider',
      accent: '#00BBF9',
      badge: 'NSE INDIA'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      category: 'US Equities',
      presetId: 'vwap_mean_reversion',
      strategyTitle: 'VWAP Institutional Reversion',
      accent: '#9B5DE5',
      badge: 'TECH'
    },
    {
      symbol: '^NSEI',
      name: 'NIFTY 50 Index',
      category: 'Indices',
      presetId: 'rsi_divergence',
      strategyTitle: 'RSI Dynamic Divergence',
      accent: '#F15BB5',
      badge: 'BENCHMARK'
    },
    {
      symbol: 'GC=F',
      name: 'Gold Futures',
      category: 'Commodities',
      presetId: 'bollinger_squeeze',
      strategyTitle: 'Bollinger Volatility Squeeze',
      accent: '#FEE440',
      badge: 'COMMODITY'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#080B11',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.5)'
          }}>
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                ALPHA<span style={{ color: 'var(--accent-primary)' }}>QUANT</span>
              </span>
              <span className="badge-bull" style={{ fontSize: '0.72rem' }}>v2.0 PRO</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Institutional Algorithmic Strategy Suite</span>
          </div>
        </div>

        <button
          onClick={onEnterTerminal}
          className="btn-primary"
          style={{
            padding: '0.75rem 1.4rem',
            fontSize: '0.92rem',
            fontWeight: 800,
            borderRadius: '10px'
          }}
        >
          <span>Enter Terminal</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3.5rem auto' }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          background: 'rgba(0, 245, 212, 0.1)',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={15} color="#00F5D4" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00F5D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Next-Gen Algorithmic Backtesting & Risk Intelligence
          </span>
        </div>

        <h1 style={{
          fontSize: '3rem',
          lineHeight: '1.15',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Institutional Trading Backtesting Platform
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: '2.5rem',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto'
        }}>
          Stop guessing market direction. Backtest precision quantitative strategies with 
          <strong style={{ color: '#00F5D4' }}> Smart Money Concepts (SMC Order Blocks & FVG)</strong>, 
          dynamic position sizing, and 500-run Monte Carlo stress tests across 
          <strong style={{ color: '#00BBF9' }}> ANY stock, crypto, index, forex, or commodity</strong> worldwide.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onEnterTerminal}
            className="btn-primary"
            style={{
              padding: '1rem 2.2rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: '12px',
              boxShadow: '0 0 35px rgba(0, 245, 212, 0.5)'
            }}
          >
            <Play size={20} fill="#080B11" />
            <span>Launch Backtest Terminal</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => onLaunchPreset('BTC-USD', 'smc_orderblock_fvg')}
            className="btn-secondary"
            style={{
              padding: '1rem 1.8rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '12px'
            }}
          >
            <Zap size={18} color="#00F5D4" />
            <span>Quick Demo: Bitcoin SMC</span>
          </button>
        </div>

      </div>

      {/* 4 Core Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3.5rem'
      }}>
        
        {/* Feature 1 */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(0, 245, 212, 0.2)' }}>
          <div style={{
            background: 'rgba(0, 245, 212, 0.12)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#00F5D4'
          }}>
            <Globe size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#F8FAFC' }}>
            Universal Market Search
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Search and backtest <strong>ANY</strong> stock worldwide (US stocks, Indian NSE/BSE, Europe, Asia), Cryptocurrencies, Indices (Nifty 50, S&P 500), Forex, and Commodities.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(0, 187, 249, 0.2)' }}>
          <div style={{
            background: 'rgba(0, 187, 249, 0.12)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#00BBF9'
          }}>
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#F8FAFC' }}>
            Smart Money Concepts (SMC)
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Algorithmic detection of institutional Order Blocks (OB), 3-candle Fair Value Gaps (FVG), Liquidity Sweeps, and multi-sigma VWAP deviation bands.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(155, 93, 229, 0.2)' }}>
          <div style={{
            background: 'rgba(155, 93, 229, 0.12)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#9B5DE5'
          }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#F8FAFC' }}>
            Institutional Risk Modeling
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Dynamic ATR Stop Loss / Take Profit (1:2 R:R), Trailing Stops, Break-Even protection, and Half-Kelly Criterion position sizing with commission & slippage simulation.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(241, 91, 181, 0.2)' }}>
          <div style={{
            background: 'rgba(241, 91, 181, 0.12)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#F15BB5'
          }}>
            <Activity size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#F8FAFC' }}>
            Monte Carlo & 2D Grid Search
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            500-iteration trade sequence reshuffling confidence fans, risk of ruin probabilities, and 2D parameter sensitivity optimization surfaces.
          </p>
        </div>

      </div>

      {/* Quick-Start Preset Launcher Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC' }}>
              ⚡ 1-Click Strategy Launchers
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click any market preset below to immediately load the asset and run backtesting in the terminal:
            </p>
          </div>
          <button onClick={onEnterTerminal} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            Open Blank Terminal →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem'
        }}>
          {PRESET_CARDS.map((card) => (
            <div
              key={card.symbol}
              onClick={() => onLaunchPreset(card.symbol, card.presetId)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                padding: '1.1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = card.accent;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px ${card.accent}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1rem', color: card.accent }}>
                    {card.symbol}
                  </span>
                  <span className="badge-neutral" style={{ fontSize: '0.65rem' }}>
                    {card.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {card.name}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {card.strategyTitle}
                </span>
                <Play size={13} color={card.accent} fill={card.accent} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
