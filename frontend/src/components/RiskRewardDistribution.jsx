import React from 'react';
import PlotWrapper from './PlotWrapper';
import { Target, BarChart2 } from 'lucide-react';

export default function RiskRewardDistribution({ rrDistribution = [], trades = [] }) {
  if (!rrDistribution || rrDistribution.length === 0) return null;

  const buckets = rrDistribution.map((d) => d.bucket);
  const counts = rrDistribution.map((d) => d.count);
  const percentages = rrDistribution.map((d) => d.percentage);

  const colors = buckets.map((b) => {
    if (b.includes('-')) return '#EF4444';
    if (b.includes('BE')) return '#94A3B8';
    return '#10B981';
  });

  const plotData = [
    {
      type: 'bar',
      x: buckets,
      y: counts,
      text: percentages.map((p) => `${p}%`),
      textposition: 'auto',
      marker: { color: colors, opacity: 0.85, line: { color: 'rgba(255,255,255,0.1)', width: 1 } }
    }
  ];

  const layout = {
    autosize: true,
    height: 280,
    margin: { l: 40, r: 20, t: 15, b: 35 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#CBD5E1', family: 'JetBrains Mono', size: 10 }
    },
    yaxis: {
      title: 'Number of Trades',
      titlefont: { color: '#94A3B8', size: 10 },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="#00F5D4" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            REALIZED RISK-TO-REWARD (R-MULTIPLE) DISTRIBUTION
          </h2>
        </div>
        <span className="badge-neutral" style={{ fontSize: '0.7rem' }}>PAYOFF PROFILE</span>
      </div>

      <PlotWrapper
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '280px' }}
      />
    </div>
  );
}
