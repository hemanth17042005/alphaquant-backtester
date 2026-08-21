import React from 'react';
import { ShieldCheck, Percent, DollarSign, ArrowUpRight, Anchor, RefreshCw } from 'lucide-react';

export default function RiskManagementPanel({ riskConfig, setRiskConfig, onRunBacktest }) {
  const updateRisk = (key, val) => {
    const updated = {
      ...riskConfig,
      [key]: val
    };
    setRiskConfig(updated);
    if (onRunBacktest) {
      onRunBacktest(updated);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="#10B981" />
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            QUANTITATIVE RISK MANAGEMENT & POSITION SIZING
          </h2>
        </div>
        <span className="badge-bull" style={{ fontSize: '0.7rem' }}>DYNAMIC ATR & KELLY</span>
      </div>

      {/* Sizing & Capital Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
        
        {/* Initial Capital */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Initial Account Capital ($)
          </label>
          <input
            type="number"
            className="input-dark"
            value={riskConfig.initial_capital}
            onChange={(e) => updateRisk('initial_capital', parseFloat(e.target.value) || 100000)}
            step="1000"
          />
        </div>

        {/* Position Sizing Mode */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Position Sizing Algorithm
          </label>
          <select
            className="input-dark"
            value={riskConfig.position_sizing_mode}
            onChange={(e) => updateRisk('position_sizing_mode', e.target.value)}
          >
            <option value="fixed_risk_pct">Fixed Risk % per Trade (Standard)</option>
            <option value="kelly">Half-Kelly Criterion (Optimal Growth)</option>
            <option value="fixed_cash">Fixed Dollar Amount ($)</option>
            <option value="fixed_shares">Fixed Shares / Contracts</option>
          </select>
        </div>

        {/* Risk Percentage / Sizing Value */}
        {riskConfig.position_sizing_mode === 'fixed_risk_pct' && (
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              Equity Risk per Trade (% Equity)
            </label>
            <input
              type="number"
              className="input-dark"
              value={riskConfig.risk_per_trade_pct * 100}
              onChange={(e) => updateRisk('risk_per_trade_pct', (parseFloat(e.target.value) || 2.0) / 100)}
              step="0.5"
              min="0.1"
              max="20"
            />
          </div>
        )}

        {/* Stop Loss Model */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Stop Loss Execution Type
          </label>
          <select
            className="input-dark"
            value={riskConfig.stop_loss_type}
            onChange={(e) => updateRisk('stop_loss_type', e.target.value)}
          >
            <option value="atr">ATR Volatility Multiple (Dynamic)</option>
            <option value="smc_structure">SMC Structure (Behind Order Block)</option>
            <option value="fixed_pct">Fixed Percentage (%)</option>
          </select>
        </div>

        {/* Stop Loss Distance */}
        {riskConfig.stop_loss_type === 'atr' && (
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              SL Distance (× ATR)
            </label>
            <input
              type="number"
              className="input-dark"
              value={riskConfig.stop_loss_value}
              onChange={(e) => updateRisk('stop_loss_value', parseFloat(e.target.value) || 1.5)}
              step="0.1"
            />
          </div>
        )}

        {/* Planned Risk to Reward Target */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
            Target Risk-to-Reward Ratio (R:R)
          </label>
          <input
            type="number"
            className="input-dark"
            value={riskConfig.take_profit_value}
            onChange={(e) => updateRisk('take_profit_value', parseFloat(e.target.value) || 2.0)}
            step="0.25"
            min="0.5"
            max="10.0"
          />
        </div>

      </div>

      {/* Dynamic Protections: Trailing Stop, Break-Even & Slippage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
        
        {/* Break-Even Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="be_toggle"
            checked={riskConfig.use_break_even}
            onChange={(e) => updateRisk('use_break_even', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <label htmlFor="be_toggle" style={{ fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
            Move to Break-Even at <strong>+{riskConfig.break_even_rr || 1.2}R</strong>
          </label>
        </div>

        {/* Trailing Stop Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="trail_toggle"
            checked={riskConfig.use_trailing_stop}
            onChange={(e) => updateRisk('use_trailing_stop', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <label htmlFor="trail_toggle" style={{ fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
            Trailing Stop (Activates at <strong>+{riskConfig.trailing_activation_rr || 1.0}R</strong>)
          </label>
        </div>

        {/* Commission & Slippage */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Exchange Fee: <strong>{((riskConfig.commission_rate || 0.0005) * 100).toFixed(2)}%</strong> • Slippage: <strong>{((riskConfig.slippage_pct || 0.0005) * 100).toFixed(2)}%</strong>
        </div>

      </div>

    </div>
  );
}
