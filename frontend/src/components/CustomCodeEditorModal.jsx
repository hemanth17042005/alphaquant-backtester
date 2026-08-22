import React, { useState, useEffect } from 'react';
import {
  Code, Play, RefreshCw, X, CheckCircle2, AlertCircle,
  FileCode, Zap, TrendingUp, BarChart2, Activity, Copy
} from 'lucide-react';
import PlotWrapper from './PlotWrapper';
import { runCustomStrategyCode, fetchStarterCodeTemplate } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

const TEMPLATES = {
  dual_ema: `# Dual EMA Momentum Strategy
def generate_signals(df: pd.DataFrame) -> pd.DataFrame:
    df['ema9'] = df['close'].ewm(span=9).mean()
    df['ema21'] = df['close'].ewm(span=21).mean()
    
    df['signal'] = 0
    df.loc[df['ema9'] > df['ema21'], 'signal'] = 1
    df.loc[df['ema9'] <= df['ema21'], 'signal'] = -1
    return df
`,
  rsi_reversion: `# RSI Mean Reversion Strategy
def generate_signals(df: pd.DataFrame) -> pd.DataFrame:
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / (loss + 1e-9)
    df['rsi'] = 100 - (100 / (1 + rs))
    
    df['signal'] = 0
    df.loc[df['rsi'] < 30, 'signal'] = 1   # Oversold Buy
    df.loc[df['rsi'] > 70, 'signal'] = -1  # Overbought Exit
    return df
`,
  bollinger_breakout: `# Bollinger Volatility Breakout
def generate_signals(df: pd.DataFrame) -> pd.DataFrame:
    df['sma20'] = df['close'].rolling(20).mean()
    df['std20'] = df['close'].rolling(20).std()
    df['upper_bb'] = df['sma20'] + (df['std20'] * 2)
    df['lower_bb'] = df['sma20'] - (df['std20'] * 2)
    
    df['signal'] = 0
    df.loc[df['close'] > df['upper_bb'], 'signal'] = 1
    df.loc[df['close'] < df['lower_bb'], 'signal'] = -1
    return df
`
};

export default function CustomCodeEditorModal({
  isOpen,
  onClose,
  initialSymbol = 'BTC-USD',
  currencyPreference = 'auto'
}) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [code, setCode] = useState(TEMPLATES.dual_ema);
  const [timeframe, setTimeframe] = useState('1d');
  const [period, setPeriod] = useState('2y');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await runCustomStrategyCode({
        code,
        symbol,
        timeframe,
        period,
        initial_capital: 100000
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Execution error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !result) {
      handleExecute();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const chartData = result?.equity_curve ? [
    {
      x: result.equity_curve.map((d) => d.time),
      y: result.equity_curve.map((d) => d.equity),
      type: 'scatter',
      mode: 'lines',
      name: 'Custom Python Strategy',
      line: { color: '#00BBF9', width: 2.5 }
    }
  ] : [];

  const chartLayout = {
    autosize: true,
    height: 260,
    margin: { l: 50, r: 20, t: 20, b: 35 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8' },
    yaxis: { gridcolor: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8', tickprefix: '$' },
    showlegend: false
  };

  const m = result?.metrics || {};
  const isProfit = (m.net_profit_dollar || 0) >= 0;

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
          background: '#080B11',
          border: '1px solid rgba(0, 187, 249, 0.4)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1200px',
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
          padding: '0.85rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00BBF9, #00F5D4)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: '#080B11'
            }}>
              <Code size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F8FAFC' }}>
                  CUSTOM PYTHON STRATEGY IDE
                </h3>
                <span className="badge-bull" style={{ fontSize: '0.68rem' }}>PYTHON 3.11 EXECUTION</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Write custom quantitative indicators and vector signals with full access to pandas and numpy.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleExecute}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
            >
              <Play size={14} fill="#080B11" />
              <span>{loading ? 'Running Script...' : 'Run Python Backtest'}</span>
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

        {/* Dual-Column IDE Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.2fr) minmax(380px, 1fr)',
          gap: '1.25rem',
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          
          {/* Left Column: Code Editor & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Editor Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>TEMPLATE:</span>
                <select
                  className="input-dark"
                  onChange={(e) => setCode(TEMPLATES[e.target.value] || TEMPLATES.dual_ema)}
                  style={{ fontSize: '0.76rem', padding: '0.25rem 0.5rem' }}
                >
                  <option value="dual_ema">Dual EMA Cross</option>
                  <option value="rsi_reversion">RSI Mean Reversion</option>
                  <option value="bollinger_breakout">Bollinger Volatility Breakout</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>ASSET:</span>
                <input
                  type="text"
                  className="input-dark"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  style={{ width: '90px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {/* Code Textarea / Editor Window */}
            <div style={{
              background: '#05070B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.75rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={18}
                spellCheck="false"
                style={{
                  width: '100%',
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#00F5D4',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  resize: 'none'
                }}
              />
            </div>

            {/* Execution Error Console */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                color: '#EF4444',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Execution Results & Performance Audit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.65rem'
            }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>STRATEGY RETURN</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isProfit ? '#10B981' : '#EF4444' }}>
                  {isProfit ? '+' : ''}{m.net_profit_pct ?? 0}%
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>ALPHA SPREAD</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: (m.alpha_pct || 0) >= 0 ? '#10B981' : '#EF4444' }}>
                  {(m.alpha_pct || 0) > 0 ? '+' : ''}{m.alpha_pct ?? 0}%
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>WIN RATE</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#00F5D4' }}>
                  {m.win_rate_pct ?? 0}% ({m.winning_trades ?? 0}/{m.total_trades ?? 0})
                </span>
              </div>
            </div>

            {/* Equity Curve */}
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Activity size={15} color="#00BBF9" />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F8FAFC' }}>
                  PYTHON STRATEGY COMPOUNDING CURVE
                </h4>
              </div>
              <PlotWrapper data={chartData} layout={chartLayout} style={{ width: '100%', height: '260px' }} />
            </div>

            {/* Trade Logs List */}
            <div className="glass-panel" style={{ padding: '0.85rem', flex: 1, overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                COMPLETED TRADE EXECUTIONS ({result?.trades?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                {(result?.trades || []).map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>{t.exit_time}</span>
                    <span>Entry: ${t.entry_price} → Exit: ${t.exit_price}</span>
                    <span style={{ fontWeight: 800, color: t.pnl >= 0 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl} ({t.pnl >= 0 ? '+' : ''}{t.pnl_pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
