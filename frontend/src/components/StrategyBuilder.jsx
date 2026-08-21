import React from 'react';
import { Sliders, Layers, Sparkles, BookOpen, Check } from 'lucide-react';

export default function StrategyBuilder({
  presets = [],
  strategyConfig,
  setStrategyConfig,
  indicatorConfig,
  setIndicatorConfig,
  onRunBacktest
}) {
  const handlePresetSelect = (preset) => {
    const updated = {
      ...strategyConfig,
      preset_id: preset.id,
      name: preset.name,
      description: preset.description,
      direction: strategyConfig.direction || preset.direction || 'both'
    };
    setStrategyConfig(updated);
    if (onRunBacktest) {
      onRunBacktest(updated, indicatorConfig);
    }
  };

  const handleDirectionChange = (newDirection) => {
    const updated = {
      ...strategyConfig,
      direction: newDirection
    };
    setStrategyConfig(updated);
    if (onRunBacktest) {
      onRunBacktest(updated, indicatorConfig);
    }
  };

  const updateIndicator = (key, val) => {
    const updated = {
      ...indicatorConfig,
      [key]: typeof val === 'number' ? val : parseFloat(val) || val
    };
    setIndicatorConfig(updated);
    if (onRunBacktest) {
      onRunBacktest(strategyConfig, updated);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      
      {/* Header with Direction Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            STRATEGY & INDICATOR LOGIC
          </h2>
        </div>
        
        {/* Trade Direction Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>DIRECTION:</span>
          <select
            className="input-dark"
            value={strategyConfig.direction || 'both'}
            onChange={(e) => handleDirectionChange(e.target.value)}
            style={{
              width: '130px',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '0.35rem 0.6rem',
              borderColor: 'var(--accent-primary)',
              background: 'rgba(15, 23, 42, 0.95)'
            }}
          >
            <option value="both">Long & Short</option>
            <option value="long_only">Long Only</option>
            <option value="short_only">Short Only</option>
          </select>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Select Institutional Strategy Model
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
          {presets.map((p) => {
            const isSelected = strategyConfig.preset_id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handlePresetSelect(p)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(0, 245, 212, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1.5px solid ${isSelected ? '#00F5D4' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 16px rgba(0, 245, 212, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#00F5D4' : '#F8FAFC' }}>
                      {p.name}
                    </span>
                    {isSelected && <Check size={15} color="#00F5D4" />}
                  </div>
                  <span className="badge-neutral" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicator Fine-Tuning Parameters */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sliders size={14} /> Indicator Parameters & SMC Sensitivity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              Fast EMA Length
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.ema_fast}
              onChange={(e) => updateIndicator('ema_fast', parseInt(e.target.value) || 9)}
              min="2"
              max="50"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              Slow EMA Length
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.ema_slow}
              onChange={(e) => updateIndicator('ema_slow', parseInt(e.target.value) || 21)}
              min="5"
              max="100"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              Trend Baseline (EMA)
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.ema_trend}
              onChange={(e) => updateIndicator('ema_trend', parseInt(e.target.value) || 200)}
              min="50"
              max="500"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              RSI Period
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.rsi_period}
              onChange={(e) => updateIndicator('rsi_period', parseInt(e.target.value) || 14)}
              min="2"
              max="50"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              Bollinger Std Dev (σ)
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.bb_std}
              onChange={(e) => updateIndicator('bb_std', parseFloat(e.target.value) || 2.0)}
              step="0.1"
              min="1.0"
              max="4.0"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
              ATR Volatility Period
            </label>
            <input
              type="number"
              className="input-dark"
              value={indicatorConfig.atr_period}
              onChange={(e) => updateIndicator('atr_period', parseInt(e.target.value) || 14)}
              min="5"
              max="50"
            />
          </div>

        </div>
      </div>

    </div>
  );
}
