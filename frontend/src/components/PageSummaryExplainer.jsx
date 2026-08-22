import React, { useState } from 'react';
import {
  BookOpen, Sparkles, TrendingUp, TrendingDown, ShieldCheck,
  BrainCircuit, Activity, BarChart2, Layers, HelpCircle,
  ChevronDown, ChevronUp, Zap, Target, Flame, Sliders, FileText,
  AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle, Check
} from 'lucide-react';
import { getCurrencySymbol, formatPrice } from '../services/currency';

export default function PageSummaryExplainer({
  mode = 'predictor', // 'predictor' | 'backtester'
  symbol = 'BTC-USD',
  currencyPreference = 'auto',
  predictionData = null,
  horizonDays = '30',
  backtestResult = null,
  strategyConfig = null
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currSym = getCurrencySymbol(symbol, currencyPreference);

  if (mode === 'predictor') {
    const isBullish = predictionData?.direction?.includes('BULL');
    const isBearish = predictionData?.direction?.includes('BEAR');
    const dirColor = isBullish ? '#10B981' : isBearish ? '#EF4444' : '#FEE440';
    
    // Quantitative Buying Decision Engine
    const changePct = predictionData?.predicted_change_pct ?? 0;
    const conviction = predictionData?.ai_confidence_pct ?? 50;
    const hitRate = predictionData?.evaluation_metrics?.directional_accuracy_pct ?? 60;

    let buyVerdict = {
      title: 'CONSIDER BUYING (FAVORABLE ACCUMULATION)',
      subtext: `Positive algorithmic expectation for the next ${horizonDays} days with favorable risk-reward.`,
      badgeColor: '#10B981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.4)',
      icon: CheckCircle2,
      strategy: `AI models project a ${changePct > 0 ? '+' : ''}${changePct}% move. Optimal entry is on intraday dips near support (${formatPrice(predictionData?.support_level, symbol, currencyPreference, 2)}) with an upside target of ${formatPrice(predictionData?.target_price, symbol, currencyPreference, 2)}.`
    };

    if (changePct > 0 && (conviction < 65 || hitRate < 55)) {
      buyVerdict = {
        title: 'CONSIDER MODERATE BUY / PARTIAL ACCUMULATION',
        subtext: `Modest upside trajectory projected for the ${horizonDays}-day horizon; scale in with partial position sizing.`,
        badgeColor: '#00F5D4',
        badgeBg: 'rgba(0, 245, 212, 0.15)',
        badgeBorder: 'rgba(0, 245, 212, 0.4)',
        icon: TrendingUp,
        strategy: `Upside is projected at +${changePct}%, but model conviction is moderate (${conviction}%). Stagger entries in tranches and maintain strict stop losses below ${formatPrice(predictionData?.support_level, symbol, currencyPreference, 2)}.`
      };
    } else if (changePct <= 0 && changePct >= -2.5) {
      buyVerdict = {
        title: 'HOLD / WAIT FOR PULLBACK (NEUTRAL CONSOLIDATION)',
        subtext: `Flat or range-bound price action projected for the next ${horizonDays} days.`,
        badgeColor: '#FEE440',
        badgeBg: 'rgba(254, 228, 64, 0.15)',
        badgeBorder: 'rgba(254, 228, 64, 0.4)',
        icon: AlertCircle,
        strategy: `Neutral forecast (${changePct}%). Better risk-reward opportunities may present themselves after a confirmed breakout above ${formatPrice(predictionData?.resistance_level, symbol, currencyPreference, 2)} or test of major support.`
      };
    } else if (changePct < -2.5) {
      buyVerdict = {
        title: 'EXERCISE CAUTION / AVOID BUYING (BEARISH DRIFT)',
        subtext: `Downward momentum or elevated tail risk projected for the ${horizonDays}-day horizon.`,
        badgeColor: '#EF4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeBorder: 'rgba(239, 68, 68, 0.4)',
        icon: ShieldAlert,
        strategy: `Ensemble models project a ${changePct}% decline. Avoid aggressive long positioning until the asset stabilizes and forms a base above support.`
      };
    }

    const VerdictIcon = buyVerdict.icon;

    return (
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          marginTop: '1.5rem',
          borderTop: '2px solid var(--accent-primary)',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 11, 17, 0.95) 100%)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'rgba(0, 245, 212, 0.15)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: '8px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F5D4'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  EXECUTIVE SUMMARY & BUYING VERDICT <span style={{ color: 'var(--accent-primary)' }}>({symbol} • {currSym})</span>
                </h3>
                <span className="badge-neutral" style={{ fontSize: '0.68rem' }}>DEEP TECHNICAL EXPLAINER</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Comprehensive forecast synthesis, {horizonDays}-day buy/hold assessment, and complete metric breakdowns.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            <span>{isExpanded ? 'Collapse Summary' : 'Expand Summary'}</span>
          </button>
        </div>

        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. Actionable Horizon Buy/Hold Consideration Verdict */}
            {predictionData && (
              <div style={{
                background: buyVerdict.badgeBg,
                border: `1px solid ${buyVerdict.badgeBorder}`,
                borderRadius: '10px',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                boxShadow: `0 0 20px ${buyVerdict.badgeBg}`
              }}>
                <VerdictIcon size={24} color={buyVerdict.badgeColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: buyVerdict.badgeColor,
                        color: '#080B11'
                      }}>
                        {horizonDays}-DAY ACTIONABLE SIGNAL
                      </span>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: buyVerdict.badgeColor }}>
                        {buyVerdict.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      AI Conviction: <strong style={{ color: '#F8FAFC' }}>{conviction}%</strong> • Target: <strong style={{ color: '#00F5D4' }}>{formatPrice(predictionData.target_price, symbol, currencyPreference, 2)}</strong>
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                    {buyVerdict.subtext} {buyVerdict.strategy}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Dynamic AI Synthesis Card */}
            {predictionData && (
              <div style={{
                background: 'rgba(0, 245, 212, 0.05)',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}>
                <Sparkles size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', lineHeight: 1.55, color: '#E2E8F0' }}>
                  <strong style={{ color: '#00F5D4' }}>AI Technical Breakdown for {symbol}: </strong>
                  The ensemble machine learning pipeline projects a{' '}
                  <strong style={{ color: dirColor }}>{predictionData.direction}</strong> trajectory toward a target of{' '}
                  <strong style={{ color: '#00F5D4' }}>{formatPrice(predictionData.target_price, symbol, currencyPreference, 2)}</strong>{' '}
                  ({changePct > 0 ? '+' : ''}{changePct}%) with an AI Conviction Score of{' '}
                  <strong style={{ color: '#00BBF9' }}>{conviction}%</strong>. Out-of-sample directional backtesting achieved{' '}
                  <strong>{hitRate}%</strong> historical hit rate. Projected key support floor is at{' '}
                  <strong>{formatPrice(predictionData.support_level, symbol, currencyPreference, 2)}</strong> and upper volatility resistance is at{' '}
                  <strong>{formatPrice(predictionData.resistance_level, symbol, currencyPreference, 2)}</strong>.
                </div>
              </div>
            )}

            {/* 3. Mandatory Risk & Legal Disclaimer (Not Guaranteed) */}
            <div style={{
              background: 'rgba(254, 228, 64, 0.05)',
              border: '1px solid rgba(254, 228, 64, 0.25)',
              borderRadius: '8px',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <AlertTriangle size={18} color="#FEE440" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                <strong style={{ color: '#FEE440' }}>DISCLAIMER (PROJECTIONS ARE NOT GUARANTEED): </strong>
                Machine learning forecast targets, statistical corridors (80% & 95%), and directional indicators are algorithmic estimations calculated strictly from historical mathematical data and probabilities. Financial markets involve inherent volatility and substantial risk of capital loss. <strong>Past performance and algorithmic projections do NOT guarantee future price returns.</strong> This content is generated for educational, quantitative research, and analytical purposes only and does NOT constitute financial, investment, or trading advice.
              </div>
            </div>

            {/* 2. Structured 3-Column Explainer Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              
              {/* Box A: The Interactive Forecast Chart Elements */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#00F5D4' }}>
                  <Activity size={16} />
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>1. FORECAST TRAJECTORY CHART</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  <div>
                    <strong style={{ color: '#94A3B8' }}>• Grey Solid Line (Historical Price): </strong>
                    Actual past closing prices retrieved from live market feeds used for training.
                  </div>
                  <div>
                    <strong style={{ color: '#00F5D4' }}>• Cyan Solid Line (ML Predicted Trajectory): </strong>
                    The consensus expected trajectory calculated from multi-lag features and autoregressive momentum.
                  </div>
                  <div>
                    <strong style={{ color: 'rgba(0, 245, 212, 0.8)' }}>• Cyan Shaded Band (80% & 95% Confidence Corridor): </strong>
                    The statistical cone of probability. Wider corridors reflect higher market volatility and longer forecasting horizons.
                  </div>
                  <div>
                    <strong style={{ color: '#10B981' }}>• Green Dotted Line (Bull Case +2σ): </strong>
                    Optimistic upper 97.7th percentile breakout scenario under strong momentum acceleration.
                  </div>
                  <div>
                    <strong style={{ color: '#EF4444' }}>• Red Dotted Line (Bear Case -2σ): </strong>
                    Downside 2.3rd percentile stress test floor representing adverse tail-risk protection levels.
                  </div>
                </div>
              </div>

              {/* Box B: The 6 KPI Metrics Cards */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#00BBF9' }}>
                  <Target size={16} />
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>2. PREDICTOR KPI CARDS</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Target Price & % Return: </strong>
                    Point-forecast for the end of the selected horizon period (7d to 90d) relative to the latest close.
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• AI Directional Bias: </strong>
                    Categorized signal (<span style={{ color: '#10B981' }}>Strong Bullish</span>, <span style={{ color: '#00F5D4' }}>Moderately Bullish</span>, <span style={{ color: '#FEE440' }}>Neutral/Range</span>, or <span style={{ color: '#EF4444' }}>Bearish</span>).
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• AI Conviction Score: </strong>
                    Mathematical probability that price stays within the favorable side of the confidence corridor.
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Out-of-Sample Hit Rate: </strong>
                    Backtested accuracy on un-seen historical data points (evaluated via R² and RMSE error variance).
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Support & Resistance: </strong>
                    Derived from 20-day Bollinger bounds, Average True Range (ATR), and high-volume density nodes.
                  </div>
                </div>
              </div>

              {/* Box C: Multi-Model Consensus & Feature Attribution */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#9B5DE5' }}>
                  <Layers size={16} />
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>3. MODEL ARCHITECTURES & FEATURES</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Multi-Lag Ridge (L2): </strong>
                    Penalized linear regression preventing overfitting across 1d, 3d, 5d, 10d, and 20d return features.
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Momentum & Volatility AR: </strong>
                    Autoregressive exponential moving average with ATR volatility scaling.
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Fourier Harmonic Waves: </strong>
                    Decomposes underlying periodic seasonality and cyclical swing rhythms.
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Geometric Brownian Motion (GBM): </strong>
                    Stochastic Monte Carlo drift with historical asset drift (μ) and annualized variance (σ).
                  </div>
                  <div>
                    <strong style={{ color: '#F8FAFC' }}>• Feature Attribution: </strong>
                    Ranks which technical signals (EMA, RSI, MACD, OBV, Volatility) exerted the strongest mathematical weight.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    );
  }

  // Backtester Mode
  const isProfit = (backtestResult?.metrics?.net_profit_dollar || 0) >= 0;
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        marginTop: '0',
        borderTop: '2px solid #9B5DE5',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 11, 17, 0.95) 100%)',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(155, 93, 229, 0.15)',
            border: '1px solid rgba(155, 93, 229, 0.3)',
            borderRadius: '8px',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9B5DE5'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                STRATEGY PERFORMANCE SUMMARY & QUANTITATIVE GUIDE <span style={{ color: '#9B5DE5' }}>({symbol} • {currSym})</span>
              </h3>
              <span className="badge-neutral" style={{ fontSize: '0.68rem' }}>ANALYTICS BREAKDOWN</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              In-depth explanation of strategy metrics, Smart Money Concepts (SMC), drawdowns, and Monte Carlo stress tests.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          <span>{isExpanded ? 'Collapse Summary' : 'Expand Summary'}</span>
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Executive Performance Badge Card */}
          {backtestResult?.metrics && (
            <div style={{
              background: 'rgba(155, 93, 229, 0.06)',
              border: '1px solid rgba(155, 93, 229, 0.25)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem'
            }}>
              <Zap size={20} color="#9B5DE5" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', lineHeight: 1.55, color: '#E2E8F0' }}>
                <strong style={{ color: '#9B5DE5' }}>Executive Strategy Audit ({strategyConfig?.name || 'Current Setup'}): </strong>
                Over the simulated period on {symbol}, the algorithm generated{' '}
                <strong style={{ color: isProfit ? '#10B981' : '#EF4444' }}>
                  {isProfit ? '+' : ''}{backtestResult.metrics.net_profit_pct}% ROI ({formatPrice(backtestResult.metrics.net_profit_dollar, symbol, currencyPreference, 0)})
                </strong>{' '}
                with an Alpha of <strong style={{ color: backtestResult.metrics.alpha_pct >= 0 ? '#10B981' : '#EF4444' }}>{backtestResult.metrics.alpha_pct > 0 ? '+' : ''}{backtestResult.metrics.alpha_pct}%</strong> against the Buy & Hold benchmark. Win Rate was{' '}
                <strong style={{ color: '#00F5D4' }}>{backtestResult.metrics.win_rate_pct}%</strong> across {backtestResult.metrics.total_trades} trades with a Profit Factor of{' '}
                <strong style={{ color: '#00BBF9' }}>{backtestResult.metrics.profit_factor}</strong> and a Sharpe Ratio of <strong>{backtestResult.metrics.sharpe_ratio}</strong>. Maximum historical peak-to-trough drawdown was limited to{' '}
                <strong style={{ color: '#EF4444' }}>-{backtestResult.metrics.max_drawdown_pct}%</strong>.
              </div>
            </div>
          )}

          {/* 4-Column Detailed Explainer Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            
            {/* Box 1: SMC Candlestick Chart */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#00F5D4' }}>
                <TrendingUp size={16} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>1. SMC CANDLESTICK CHART</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <div>
                  <strong style={{ color: '#00F5D4' }}>• Cyan / Red Candlesticks: </strong>
                  Green/Cyan for bullish expansion bars; Red/Pink for bearish downward continuation bars.
                </div>
                <div>
                  <strong style={{ color: '#00F5D4' }}>• Green / Red Shaded Zones (Order Blocks): </strong>
                  Institutional accumulation/distribution price levels where high-volume smart money resting orders reside.
                </div>
                <div>
                  <strong style={{ color: '#00BBF9' }}>• Cyan Dashed Zones (Fair Value Gaps): </strong>
                  3-candle liquidity imbalances where price moved rapidly, creating magnet re-test zones.
                </div>
                <div>
                  <strong style={{ color: '#FEE440' }}>• Green ▲ & Red ▼ Markers: </strong>
                  Exact historical execution points showing strategy Entry, Take Profit, and Stop Loss exits.
                </div>
              </div>
            </div>

            {/* Box 2: Portfolio Equity & Underwater Drawdowns */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#00BBF9' }}>
                <BarChart2 size={16} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>2. PORTFOLIO & DRAWDOWNS</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <div>
                  <strong style={{ color: '#00F5D4' }}>• Cyan Strategy Line: </strong>
                  Cumulative compounding equity progression of the simulated account over time.
                </div>
                <div>
                  <strong style={{ color: '#94A3B8' }}>• Grey Dashed Line (Buy & Hold): </strong>
                  Passive benchmark holding the asset 100% of the time (indicates pure Alpha generation).
                </div>
                <div>
                  <strong style={{ color: '#EF4444' }}>• Red Shaded Lower Graph (Underwater Drawdown): </strong>
                  Depth and time spent below previous portfolio all-time highs (measures psychological stress tolerance).
                </div>
              </div>
            </div>

            {/* Box 3: Monte Carlo Reshuffling Stress Test */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#F15BB5' }}>
                <Flame size={16} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>3. MONTE CARLO STRESS TEST</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <div>
                  <strong style={{ color: '#F8FAFC' }}>• 500-Run Random Shuffling: </strong>
                  Randomizes trade execution order without replacement to eliminate lucky streak bias and test sequence risk.
                </div>
                <div>
                  <strong style={{ color: '#10B981' }}>• 95th Percentile: </strong>
                  Optimistic equity trajectory under favorable trade sequencing.
                </div>
                <div>
                  <strong style={{ color: '#EF4444' }}>• 5th Percentile (Worst Case): </strong>
                  Conservative worst-case scenario under severe consecutive loss clustering.
                </div>
                <div>
                  <strong style={{ color: '#00F5D4' }}>• Risk of Ruin (%): </strong>
                  Probability of the account ever breaching a critical drawdown threshold before recovery.
                </div>
              </div>
            </div>

            {/* Box 4: 2D Grid Optimization & Trade Ledger */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', color: '#9B5DE5' }}>
                <Sliders size={16} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800 }}>4. OPTIMIZATION & TRADE AUDIT</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <div>
                  <strong style={{ color: '#F8FAFC' }}>• 2D Sensitivity Heatmap: </strong>
                  Tests parameter stability across 25 combinations (e.g. Fast vs Slow EMA) to detect curve-fitting risks.
                </div>
                <div>
                  <strong style={{ color: '#F8FAFC' }}>• Realized R:R vs Planned R:R: </strong>
                  Calculates whether average winning trades genuinely outweigh losing trades after slippage & commissions.
                </div>
                <div>
                  <strong style={{ color: '#F8FAFC' }}>• Trade Execution Log: </strong>
                  Audited record of every entry price, exit timestamp, position size, and net PnL with CSV export.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
