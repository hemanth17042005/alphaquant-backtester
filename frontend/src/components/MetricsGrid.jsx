import React from 'react';
import { TrendingUp, Award, ShieldAlert, Zap, Target, DollarSign, PieChart, Activity, IndianRupee } from 'lucide-react';
import { getCurrencySymbol, formatPrice, formatCurrencyAmount } from '../services/currency';

export default function MetricsGrid({ metrics, symbol = 'BTC-USD', currencyPreference = 'auto' }) {
  if (!metrics) return null;

  const isProfit = metrics.net_profit_dollar >= 0;
  const isAlpha = metrics.alpha_pct >= 0;
  const currSym = getCurrencySymbol(symbol, currencyPreference);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '0.85rem',
      marginBottom: '1.25rem'
    }}>
      
      {/* 1. Net Profit */}
      <div className="kpi-card glass-panel" style={{ borderLeft: `3px solid ${isProfit ? '#10B981' : '#EF4444'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Strategy Net ROI ({currSym})</span>
          {currSym === '₹' ? <IndianRupee size={16} color={isProfit ? '#10B981' : '#EF4444'} /> : <DollarSign size={16} color={isProfit ? '#10B981' : '#EF4444'} />}
        </div>
        <div className="kpi-value" style={{ color: isProfit ? '#10B981' : '#EF4444' }}>
          {isProfit ? '+' : ''}{metrics.net_profit_pct}%
        </div>
        <div className="kpi-sub">
          {isProfit ? '+' : ''}{formatPrice(metrics.net_profit_dollar, symbol, currencyPreference, 0)} • Alpha: {isAlpha ? '+' : ''}{metrics.alpha_pct}%
        </div>
      </div>

      {/* 2. Win Rate */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Win Rate</span>
          <Award size={16} color="#00F5D4" />
        </div>
        <div className="kpi-value" style={{ color: '#00F5D4' }}>
          {metrics.win_rate_pct}%
        </div>
        <div className="kpi-sub">
          {metrics.winning_trades} Wins / {metrics.losing_trades} Losses ({metrics.total_trades} Total)
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Profit Factor</span>
          <Zap size={16} color="#00BBF9" />
        </div>
        <div className="kpi-value" style={{ color: '#00BBF9' }}>
          {metrics.profit_factor >= 999 ? '∞' : metrics.profit_factor}
        </div>
        <div className="kpi-sub">
          Avg Win: {formatPrice(metrics.avg_win_dollar, symbol, currencyPreference, 0)} / Loss: {formatPrice(metrics.avg_loss_dollar, symbol, currencyPreference, 0)}
        </div>
      </div>

      {/* 4. Maximum Drawdown */}
      <div className="kpi-card glass-panel" style={{ borderLeft: '3px solid #EF4444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Max Drawdown</span>
          <ShieldAlert size={16} color="#EF4444" />
        </div>
        <div className="kpi-value" style={{ color: '#EF4444' }}>
          -{metrics.max_drawdown_pct}%
        </div>
        <div className="kpi-sub">
          -{formatPrice(metrics.max_drawdown_dollar, symbol, currencyPreference, 0)} ({metrics.max_drawdown_duration_bars} bars under water)
        </div>
      </div>

      {/* 5. Risk-Adjusted Ratios */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Sharpe / Sortino</span>
          <Activity size={16} color="#9B5DE5" />
        </div>
        <div className="kpi-value" style={{ color: '#9B5DE5' }}>
          {metrics.sharpe_ratio}
        </div>
        <div className="kpi-sub">
          Sortino: {metrics.sortino_ratio} • Calmar: {metrics.calmar_ratio}
        </div>
      </div>

      {/* 6. Expectancy */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Trade Expectancy</span>
          <Target size={16} color="#F15BB5" />
        </div>
        <div className="kpi-value" style={{ color: '#F15BB5' }}>
          {metrics.expectancy_dollar >= 0 ? '+' : ''}{formatPrice(metrics.expectancy_dollar, symbol, currencyPreference, 0)}
        </div>
        <div className="kpi-sub">
          {metrics.expectancy_pct}% per trade • CAGR: {metrics.cagr_pct}%
        </div>
      </div>

      {/* 7. Realized R:R Ratio */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Realized R:R</span>
          <TrendingUp size={16} color="#00F5D4" />
        </div>
        <div className="kpi-value" style={{ color: '#00F5D4' }}>
          1 : {metrics.avg_realized_rr}
        </div>
        <div className="kpi-sub">
          Planned R:R: 1 : {metrics.avg_planned_rr} (Win/Loss: {metrics.win_loss_ratio})
        </div>
      </div>

      {/* 8. Risk of Ruin & Exposure */}
      <div className="kpi-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="kpi-label">Risk of Ruin</span>
          <PieChart size={16} color={metrics.risk_of_ruin_pct > 5 ? '#EF4444' : '#10B981'} />
        </div>
        <div className="kpi-value" style={{ color: metrics.risk_of_ruin_pct > 5 ? '#EF4444' : '#10B981' }}>
          {metrics.risk_of_ruin_pct}%
        </div>
        <div className="kpi-sub">
          Exposure: {metrics.exposure_time_pct}% • Max Consec Loss: {metrics.max_consecutive_losses}
        </div>
      </div>

    </div>
  );
}
