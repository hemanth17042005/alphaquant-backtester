import React, { useState } from 'react';
import {
  TrendingUp, Play, ShieldCheck, Layers, Activity, Search,
  ArrowRight, Sparkles, CheckCircle2, BarChart2, PieChart,
  Zap, Globe, Target, BrainCircuit, LineChart, Cpu, ArrowUpRight
} from 'lucide-react';
import SymbolSearchSelector from './SymbolSearchSelector';

export default function WelcomePage({ onEnterTerminal, onLaunchPreset, onLaunchPredictor }) {
  const [searchSym, setSearchSym] = useState('');

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
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      category: 'US Equities',
      presetId: 'vwap_mean_reversion',
      strategyTitle: 'VWAP Institutional Reversion',
      accent: '#9B5DE5',
      badge: 'AI & TECH'
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
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      category: 'Indian Equities',
      presetId: 'smc_orderblock_fvg',
      strategyTitle: 'SMC Liquidity & OB Sniper',
      accent: '#F15BB5',
      badge: 'NSE MEGA'
    },
    {
      symbol: '^NSEI',
      name: 'NIFTY 50 Index',
      category: 'Indices',
      presetId: 'rsi_divergence',
      strategyTitle: 'RSI Dynamic Divergence',
      accent: '#00F5D4',
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
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
              <span className="badge-bull" style={{ fontSize: '0.72rem' }}>v2.5 PRO</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Institutional Algorithmic Suite & AI Price Forecaster</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onLaunchPredictor ? onLaunchPredictor('BTC-USD') : onEnterTerminal()}
            className="btn-secondary"
            style={{
              padding: '0.65rem 1.2rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: '10px',
              borderColor: 'rgba(0, 245, 212, 0.4)',
              color: '#00F5D4'
            }}
          >
            <BrainCircuit size={17} />
            <span>AI Price Predictor</span>
          </button>

          <button
            onClick={onEnterTerminal}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.3rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              borderRadius: '10px'
            }}
          >
            <span>Backtest Terminal</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto 3rem auto' }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          background: 'rgba(0, 245, 212, 0.1)',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={15} color="#00F5D4" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00F5D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Machine Learning Price Forecasting & Institutional Strategy Engine
          </span>
        </div>

        <h1 style={{
          fontSize: '3.1rem',
          lineHeight: '1.15',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          marginBottom: '1.15rem',
          background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Predict Price Trajectories & Backtest Quant Strategies
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: '2.5rem',
          maxWidth: '780px',
          margin: '0 auto 2.5rem auto'
        }}>
          Select an intelligent mode below: Train <strong style={{ color: '#00F5D4' }}>multi-model machine learning predictors</strong> with 95% confidence intervals, or run <strong style={{ color: '#00BBF9' }}>Smart Money Concept (SMC) backtests</strong> across <strong style={{ color: '#F8FAFC' }}>ANY stock globally</strong>.
        </p>

        {/* ======================================================== */}
        {/* TWO PRIMARY MODE CARDS: AI PREDICTOR VS BACKTESTER       */}
        {/* ======================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left',
          marginBottom: '2.5rem'
        }}>
          
          {/* Option 1: AI Price Predictor (NEW) */}
          <div
            className="glass-panel"
            onClick={() => onLaunchPredictor ? onLaunchPredictor(searchSym || 'BTC-USD') : onEnterTerminal()}
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid rgba(0, 245, 212, 0.4)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(0, 245, 212, 0.06) 100%)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 245, 212, 0.2), 0 0 25px rgba(0, 245, 212, 0.3)';
              e.currentTarget.style.borderColor = '#00F5D4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(0, 245, 212, 0.4)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'rgba(0, 245, 212, 0.15)',
              color: '#00F5D4',
              border: '1px solid rgba(0, 245, 212, 0.4)'
            }}>
              FEATURED ML SUITE
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B11',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
            }}>
              <BrainCircuit size={28} strokeWidth={2.2} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#F8FAFC', marginBottom: '0.4rem' }}>
              AI Price Predictor
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Train quantitative Ensemble, Ridge Regression, Fourier Cyclics, and GBM models to forecast future stock price trajectories with 80% & 95% confidence corridor bands.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#00F5D4', fontWeight: 700 }}>
                <Zap size={15} />
                <span>Search Any Market & Predict Price</span>
              </div>
              <div style={{
                background: '#00F5D4',
                color: '#080B11',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span>Launch Predictor</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>

          {/* Option 2: Algorithmic Strategy Backtester */}
          <div
            className="glass-panel"
            onClick={onEnterTerminal}
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid rgba(155, 93, 229, 0.35)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(155, 93, 229, 0.06) 100%)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(155, 93, 229, 0.2), 0 0 25px rgba(155, 93, 229, 0.3)';
              e.currentTarget.style.borderColor = '#9B5DE5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(155, 93, 229, 0.35)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'rgba(155, 93, 229, 0.15)',
              color: '#9B5DE5',
              border: '1px solid rgba(155, 93, 229, 0.4)'
            }}>
              SMC & RISK ENGINE
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #9B5DE5 0%, #00BBF9 100%)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B11',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(155, 93, 229, 0.4)'
            }}>
              <TrendingUp size={28} strokeWidth={2.2} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#F8FAFC', marginBottom: '0.4rem' }}>
              Strategy Backtester
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Execute Smart Money Concepts (Order Blocks, FVG), dynamic ATR risk controls, 500-iteration Monte Carlo stress simulations, and 2D parameter grid optimization.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#9B5DE5', fontWeight: 700 }}>
                <Activity size={15} />
                <span>Simulate & Stress-Test Systems</span>
              </div>
              <div style={{
                background: 'rgba(155, 93, 229, 0.2)',
                color: '#F8FAFC',
                border: '1px solid #9B5DE5',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span>Launch Backtester</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Universal Search Spotlight Section */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        border: '1px solid rgba(0, 245, 212, 0.25)',
        marginBottom: '2.5rem',
        background: 'rgba(15, 23, 42, 0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC' }}>
                Universal Global Stock & Asset Search
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Search any ticker worldwide across US Stocks, Indian Equities (NSE/BSE), Cryptos, Indices, Forex, and Commodities:
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <SymbolSearchSelector
              symbol={searchSym || 'BTC-USD'}
              setSymbol={(sym) => {
                setSearchSym(sym);
                if (onLaunchPredictor) onLaunchPredictor(sym);
              }}
            />

            <button
              onClick={() => onLaunchPredictor ? onLaunchPredictor(searchSym || 'BTC-USD') : onEnterTerminal()}
              className="btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.84rem' }}
            >
              <BrainCircuit size={16} />
              <span>Predict Price Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
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
            <BrainCircuit size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#F8FAFC' }}>
            Multi-Model AI Price Forecasting
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Multi-lag regression, Fourier wave harmonics, and Geometric Brownian Motion with 80% & 95% confidence corridor bands and feature driver attribution.
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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#F8FAFC' }}>
            Smart Money Concepts (SMC)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#F8FAFC' }}>
            Institutional Risk Engine
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Dynamic ATR Stop Loss / Take Profit, Trailing Stops, Break-Even protection, and Half-Kelly Criterion position sizing with commission & slippage simulation.
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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#F8FAFC' }}>
            Monte Carlo & 2D Grid Search
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            500-iteration trade sequence reshuffling confidence fans, risk of ruin probabilities, and 2D parameter sensitivity optimization surfaces.
          </p>
        </div>

      </div>

      {/* Quick-Start Preset Launcher Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC' }}>
              ⚡ 1-Click Asset Launcher Cards
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click any asset below to immediately predict price or run quantitative backtests:
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onLaunchPredictor ? onLaunchPredictor('BTC-USD') : onEnterTerminal()}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', color: '#00F5D4', borderColor: 'rgba(0, 245, 212, 0.4)' }}
            >
              <BrainCircuit size={14} />
              <span>Launch Predictor</span>
            </button>
            <button onClick={onEnterTerminal} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              Open Terminal →
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem'
        }}>
          {PRESET_CARDS.map((card) => (
            <div
              key={card.symbol}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                padding: '1.1rem',
                borderRadius: '12px',
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
                paddingTop: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.4rem'
              }}>
                <button
                  type="button"
                  onClick={() => onLaunchPredictor ? onLaunchPredictor(card.symbol) : onEnterTerminal()}
                  style={{
                    background: 'rgba(0, 245, 212, 0.12)',
                    border: '1px solid rgba(0, 245, 212, 0.3)',
                    color: '#00F5D4',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Run AI Price Prediction"
                >
                  <BrainCircuit size={12} />
                  <span>AI Predict</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchPreset(card.symbol, card.presetId)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: '#F8FAFC',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Run Backtest Strategy"
                >
                  <Play size={12} fill="#F8FAFC" />
                  <span>Backtest</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
