import React from 'react';
import { Calendar } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyReturnsHeatmap({ monthlyReturns = [] }) {
  if (!monthlyReturns || monthlyReturns.length === 0) return null;

  // Group by year
  const yearsMap = {};
  monthlyReturns.forEach((mr) => {
    if (!yearsMap[mr.year]) {
      yearsMap[mr.year] = {};
    }
    yearsMap[mr.year][mr.month] = mr.return_pct;
  });

  const years = Object.keys(yearsMap).sort((a, b) => parseInt(b) - parseInt(a));

  const getCellColor = (val) => {
    if (val === undefined || val === null) return 'rgba(255, 255, 255, 0.02)';
    if (val > 0) {
      const opacity = Math.min(0.85, Math.max(0.15, val / 15.0));
      return `rgba(16, 185, 129, ${opacity})`;
    } else if (val < 0) {
      const opacity = Math.min(0.85, Math.max(0.15, Math.abs(val) / 15.0));
      return `rgba(239, 68, 68, ${opacity})`;
    }
    return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="#00BBF9" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            MONTHLY PERFORMANCE HEATMAP (%)
          </h2>
        </div>
        <span className="badge-neutral" style={{ fontSize: '0.7rem' }}>CALENDAR ROI MATRIX</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="quant-table" style={{ textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Year</th>
              {MONTH_NAMES.map((m) => (
                <th key={m} style={{ textAlign: 'center' }}>{m}</th>
              ))}
              <th style={{ textAlign: 'center' }}>YTD</th>
            </tr>
          </thead>
          <tbody>
            {years.map((yr) => {
              let ytdProd = 1.0;
              let hasData = false;
              for (let m = 1; m <= 12; m++) {
                const ret = yearsMap[yr][m];
                if (ret !== undefined) {
                  hasData = true;
                  ytdProd *= (1.0 + ret / 100.0);
                }
              }
              const ytd = hasData ? (ytdProd - 1.0) * 100.0 : 0.0;

              return (
                <tr key={yr}>
                  <td style={{ fontWeight: 700, textAlign: 'left', color: 'var(--text-main)' }}>{yr}</td>
                  {MONTH_NAMES.map((_, idx) => {
                    const monthNum = idx + 1;
                    const val = yearsMap[yr][monthNum];
                    return (
                      <td key={monthNum} style={{ padding: '0.35rem' }}>
                        <div
                          className="heatmap-cell"
                          style={{
                            background: getCellColor(val),
                            color: val !== undefined ? '#FFFFFF' : 'var(--text-dim)',
                            padding: '0.45rem 0.2rem'
                          }}
                        >
                          {val !== undefined ? `${val > 0 ? '+' : ''}${val}%` : '-'}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '0.35rem' }}>
                    <div
                      className="heatmap-cell"
                      style={{
                        background: getCellColor(ytd),
                        fontWeight: 800,
                        padding: '0.45rem 0.3rem'
                      }}
                    >
                      {ytd > 0 ? '+' : ''}{ytd.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
