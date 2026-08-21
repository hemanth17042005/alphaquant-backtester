import React, { useState } from 'react';
import { Download, Search, Filter, ArrowUpDown } from 'lucide-react';
import { exportTradesCsv } from '../services/api';

export default function TradeLogTable({ trades = [] }) {
  const [filterType, setFilterType] = useState('all'); // all, wins, losses, long, short
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('trade_id');
  const [sortAsc, setSortAsc] = useState(true);

  if (!trades || trades.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        No trades executed for this strategy parameter setup.
      </div>
    );
  }

  // Filter Logic
  let filtered = trades.filter((t) => {
    if (filterType === 'wins' && t.pnl_dollar <= 0) return false;
    if (filterType === 'losses' && t.pnl_dollar > 0) return false;
    if (filterType === 'long' && t.side !== 'LONG') return false;
    if (filterType === 'short' && t.side !== 'SHORT') return false;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        t.trade_id.toString().includes(s) ||
        t.entry_time.toLowerCase().includes(s) ||
        t.exit_reason.toLowerCase().includes(s) ||
        t.side.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    exportTradesCsv(trades);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            SIMULATED TRADE EXECUTION LEDGER
          </h2>
          <span className="badge-neutral">{filtered.length} of {trades.length} Trades</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', width: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input-dark"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '28px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px' }}>
            {['all', 'wins', 'losses', 'long', 'short'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: filterType === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filterType === f ? 'var(--text-main)' : 'var(--text-dim)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            className="btn-secondary"
            onClick={handleExport}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

        </div>

      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
        <table className="quant-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr>
              <th onClick={() => handleSort('trade_id')} style={{ cursor: 'pointer' }}>#</th>
              <th onClick={() => handleSort('side')} style={{ cursor: 'pointer' }}>Side</th>
              <th onClick={() => handleSort('entry_time')} style={{ cursor: 'pointer' }}>Entry Time</th>
              <th onClick={() => handleSort('entry_price')} style={{ cursor: 'pointer' }}>Entry ($)</th>
              <th onClick={() => handleSort('exit_time')} style={{ cursor: 'pointer' }}>Exit Time</th>
              <th onClick={() => handleSort('exit_price')} style={{ cursor: 'pointer' }}>Exit ($)</th>
              <th onClick={() => handleSort('shares')} style={{ cursor: 'pointer' }}>Size</th>
              <th onClick={() => handleSort('pnl_dollar')} style={{ cursor: 'pointer' }}>Net PnL ($)</th>
              <th onClick={() => handleSort('pnl_pct')} style={{ cursor: 'pointer' }}>ROI (%)</th>
              <th onClick={() => handleSort('realized_rr')} style={{ cursor: 'pointer' }}>Realized R</th>
              <th onClick={() => handleSort('exit_reason')} style={{ cursor: 'pointer' }}>Exit Reason</th>
              <th onClick={() => handleSort('duration_bars')} style={{ cursor: 'pointer' }}>Bars</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const isWin = t.pnl_dollar > 0;
              return (
                <tr key={t.trade_id}>
                  <td style={{ color: 'var(--text-dim)' }}>{t.trade_id}</td>
                  <td>
                    <span className={t.side === 'LONG' ? 'badge-bull' : 'badge-bear'}>
                      {t.side}
                    </span>
                  </td>
                  <td>{t.entry_time}</td>
                  <td>${t.entry_price.toLocaleString()}</td>
                  <td>{t.exit_time}</td>
                  <td>${t.exit_price.toLocaleString()}</td>
                  <td>{t.shares}</td>
                  <td style={{ color: isWin ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {isWin ? '+' : ''}${t.pnl_dollar.toLocaleString()}
                  </td>
                  <td style={{ color: isWin ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {isWin ? '+' : ''}{t.pnl_pct}%
                  </td>
                  <td style={{ color: isWin ? '#00F5D4' : '#EF4444' }}>
                    {t.realized_rr > 0 ? '+' : ''}{t.realized_rr}R
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: t.exit_reason === 'Stop Loss' ? '#EF4444' : t.exit_reason === 'Take Profit' ? '#10B981' : '#94A3B8' }}>
                      {t.exit_reason}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>{t.duration_bars}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
