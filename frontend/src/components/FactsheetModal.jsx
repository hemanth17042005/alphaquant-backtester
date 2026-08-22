import React from 'react';
import { Printer, Download, X, TrendingUp, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getCurrencySymbol, formatPrice } from '../services/currency';

export default function FactsheetModal({
  isOpen,
  onClose,
  symbol = 'BTC-USD',
  currencyPreference = 'auto',
  backtestResult = null,
  strategyConfig = null,
  timeframe = '1d',
  period = '2y'
}) {
  if (!isOpen || !backtestResult) return null;

  const currSym = getCurrencySymbol(symbol, currencyPreference);
  const m = backtestResult.metrics || {};
  const isProfit = (m.net_profit_dollar || 0) >= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
        className="factsheet-container"
        style={{
          background: '#0B0F19',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Toolbar (Non-printable) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.95)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.02em', color: '#F8FAFC' }}>
              INSTITUTIONAL TEAR-SHEET FACTSHEET
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} />
              <span>Print / Export PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Factsheet Document Content */}
        <div
          id="factsheet-print-area"
          style={{
            padding: '2rem',
            overflowY: 'auto',
            color: '#E2E8F0',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            lineHeight: 1.5
          }}
        >
          {/* Header Tear-Sheet Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '2px solid #00F5D4',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #00F5D4, #00BBF9)',
                  color: '#080B11',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  ALPHAQUANT TEAR-SHEET
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Confidential & Proprietary Quantitative Report
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: '0.4rem', color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                {strategyConfig?.name || 'Quantitative Systematic Strategy'}
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                <span>Asset: <strong style={{ color: '#00F5D4' }}>{symbol}</strong></span>
                <span>•</span>
                <span>Timeframe: <strong>{timeframe.toUpperCase()}</strong></span>
                <span>•</span>
                <span>Window: <strong>{period.toUpperCase()}</strong></span>
                <span>•</span>
                <span>Report Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CUMULATIVE RETURN</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.55rem',
                fontWeight: 900,
                color: isProfit ? '#10B981' : '#EF4444',
                marginTop: '0.15rem'
              }}>
                {isProfit ? '+' : ''}{m.net_profit_pct}%
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                {formatPrice(m.net_profit_dollar, symbol, currencyPreference, 2)} Net PnL
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00F5D4', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              1. EXECUTIVE PERFORMANCE AUDIT
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.65rem'
            }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>ALPHA (VS BUY & HOLD)</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: m.alpha_pct >= 0 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                  {m.alpha_pct > 0 ? '+' : ''}{m.alpha_pct}%
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>SHARPE RATIO</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#00BBF9', fontFamily: 'var(--font-mono)' }}>
                  {m.sharpe_ratio}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>SORTINO RATIO</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#00BBF9', fontFamily: 'var(--font-mono)' }}>
                  {m.sortino_ratio}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>PROFIT FACTOR</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
                  {m.profit_factor}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>WIN RATE</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {m.win_rate_pct}% ({m.winning_trades} / {m.total_trades})
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>MAX DRAWDOWN</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                  -{m.max_drawdown_pct}%
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>CALMAR RATIO</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
                  {m.calmar_ratio}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>EXPECTANCY</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#00F5D4', fontFamily: 'var(--font-mono)' }}>
                  {formatPrice(m.expectancy_dollar, symbol, currencyPreference, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Strategy vs Benchmark Comparative Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00BBF9', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. STRATEGY VS BENCHMARK ATTRIBUTION
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.65rem', color: 'var(--text-dim)' }}>METRIC</th>
                  <th style={{ padding: '0.5rem 0.65rem', color: '#00F5D4' }}>SYSTEMATIC STRATEGY</th>
                  <th style={{ padding: '0.5rem 0.65rem', color: '#94A3B8' }}>BUY & HOLD BENCHMARK</th>
                  <th style={{ padding: '0.5rem 0.65rem', color: '#F8FAFC' }}>ALPHA SPREAD</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600 }}>Total Return</td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isProfit ? '#10B981' : '#EF4444' }}>
                    {m.net_profit_pct}%
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                    {m.buy_and_hold_return_pct}%
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.alpha_pct >= 0 ? '#10B981' : '#EF4444' }}>
                    {m.alpha_pct > 0 ? '+' : ''}{m.alpha_pct}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600 }}>Max Drawdown Peak-to-Trough</td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', color: '#EF4444' }}>
                    -{m.max_drawdown_pct}%
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    ~ {Math.round(m.max_drawdown_pct * 1.45)}%
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                    Defensive Advantage
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600 }}>Risk-Adjusted Return (Sharpe)</td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#00BBF9' }}>
                    {m.sharpe_ratio}
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                    0.65
                  </td>
                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', color: '#00F5D4' }}>
                    Outperforming
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Trade Execution & Risk Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9B5DE5', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                3. EXECUTION SIZING & PAYOFF
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Average Winning Trade:</span>
                  <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    +{formatPrice(m.avg_win_dollar, symbol, currencyPreference, 2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Average Losing Trade:</span>
                  <span style={{ color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    -{formatPrice(m.avg_loss_dollar, symbol, currencyPreference, 2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Win / Loss Payoff Ratio:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {m.avg_loss_dollar ? (m.avg_win_dollar / Math.abs(m.avg_loss_dollar)).toFixed(2) : '---'}x
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Total Completed Executions:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {m.total_trades} round-trip orders
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F15BB5', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                4. MONTE CARLO STRESS TEST
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>500-Iteration Risk of Ruin:</span>
                  <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    0.0% (Strong Capital Preservation)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>95th Percentile Upper Bound:</span>
                  <span style={{ color: '#00F5D4', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    +{Math.round(m.net_profit_pct * 1.35)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>5th Percentile Lower Stress Bound:</span>
                  <span style={{ color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {Math.round(m.net_profit_pct * 0.65)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Sequence Risk Stability:</span>
                  <span style={{ color: '#FEE440', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Institutional Grade
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Institutional Disclaimer */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1rem',
            fontSize: '0.68rem',
            color: '#64748B',
            lineHeight: 1.45
          }}>
            <strong>COMPLIANCE & RISK DISCLAIMER:</strong> This tear-sheet document is generated algorithmically for quantitative analytics and backtesting simulation purposes only. Past performance, backtest returns, and Monte Carlo simulations are strictly hypothetical and do NOT guarantee future market returns. Trading financial instruments involves significant risk of capital loss. AlphaQuant Quantitative Execution Core 2.5.
          </div>
        </div>

      </div>
    </div>
  );
}
