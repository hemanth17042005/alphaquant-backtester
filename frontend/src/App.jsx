import React, { useState, useEffect } from 'react';
import {
  TrendingUp, BarChart2, ShieldCheck, Flame, Sliders, FileText,
  Layers, AlertTriangle, RefreshCw, BrainCircuit
} from 'lucide-react';

import Header from './components/Header';
import WelcomePage from './components/WelcomePage';
import PricePredictorView from './components/PricePredictorView';
import MetricsGrid from './components/MetricsGrid';
import StrategyBuilder from './components/StrategyBuilder';
import RiskManagementPanel from './components/RiskManagementPanel';
import CandlestickChart from './components/CandlestickChart';
import EquityDrawdownChart from './components/EquityDrawdownChart';
import MonthlyReturnsHeatmap from './components/MonthlyReturnsHeatmap';
import RiskRewardDistribution from './components/RiskRewardDistribution';
import MonteCarloView from './components/MonteCarloView';
import OptimizationHeatmap from './components/OptimizationHeatmap';
import TradeLogTable from './components/TradeLogTable';

import { fetchSymbols, fetchPresets, fetchMarketHistory, runBacktest } from './services/api';

export default function App() {
  // Top-Level View Mode: Welcome Landing Screen vs Active Terminal
  const [showWelcome, setShowWelcome] = useState(true);

  // Active Application Mode: 'predictor' (AI Price Forecaster) vs 'backtester' (Algorithmic Backtester)
  const [activeMode, setActiveMode] = useState('predictor');

  // Terminal Navigation State (for Backtester mode)
  const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'analytics', 'monte_carlo', 'optimization', 'trades'

  // Backtest Config State
  const [symbol, setSymbol] = useState('BTC-USD');
  const [timeframe, setTimeframe] = useState('1d');
  const [period, setPeriod] = useState('2y');

  const [popularSymbols, setPopularSymbols] = useState([]);
  const [presets, setPresets] = useState([]);

  const [strategyConfig, setStrategyConfig] = useState({
    preset_id: 'smc_orderblock_fvg',
    name: 'Smart Money Concept Sniper',
    description: 'Institutional Order Block + FVG Re-test Strategy',
    direction: 'both'
  });

  const [indicatorConfig, setIndicatorConfig] = useState({
    ema_fast: 9,
    ema_slow: 21,
    ema_trend: 200,
    rsi_period: 14,
    rsi_overbought: 70.0,
    rsi_oversold: 30.0,
    bb_period: 20,
    bb_std: 2.0,
    atr_period: 14
  });

  const [riskConfig, setRiskConfig] = useState({
    initial_capital: 100000.0,
    position_sizing_mode: 'fixed_risk_pct',
    risk_per_trade_pct: 0.02,
    fixed_cash_amount: 10000.0,
    fixed_shares_count: 100.0,
    kelly_fraction: 0.5,
    stop_loss_type: 'atr',
    stop_loss_value: 1.5,
    take_profit_type: 'atr',
    take_profit_value: 3.0,
    trailing_stop_activation_r: 1.0,
    breakeven_activation_r: 1.2,
    commission_rate: 0.0005,
    slippage_pct: 0.0005
  });

  // Backtest Execution Results State
  const [backtestResult, setBacktestResult] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Backtest runner
  const executeBacktest = async (customSym, customPresetId, customTf, customPeriod, customStrat, customRisk, customIndicators) => {
    setLoading(true);
    setError(null);
    const targetSymbol = customSym || symbol;
    const targetTf = customTf || timeframe;
    const targetPeriod = customPeriod || period;
    const targetRisk = customRisk || riskConfig;
    const targetIndicators = customIndicators || indicatorConfig;

    let targetStrategy = customStrat ? { ...customStrat } : { ...strategyConfig };
    if (customPresetId) {
      const matched = presets.find(p => p.id === customPresetId);
      if (matched) {
        targetStrategy = {
          preset_id: matched.id,
          name: matched.name,
          description: matched.description,
          direction: targetStrategy.direction || matched.direction || 'both'
        };
      } else {
        targetStrategy.preset_id = customPresetId;
      }
    }
    setStrategyConfig(targetStrategy);

    try {
      const [hist, btRes] = await Promise.all([
        fetchMarketHistory(targetSymbol, targetTf, targetPeriod),
        runBacktest({
          symbol: targetSymbol,
          timeframe: targetTf,
          period: targetPeriod,
          strategy: targetStrategy,
          indicators: targetIndicators,
          risk: targetRisk
        })
      ]);

      setMarketData(hist);
      setBacktestResult(btRes);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Backtest simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Load initial symbols & presets
  useEffect(() => {
    async function init() {
      try {
        const [symData, presetData] = await Promise.all([
          fetchSymbols(),
          fetchPresets()
        ]);
        setPopularSymbols(symData.popular || []);
        setPresets(presetData.presets || []);
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    init();
  }, []);

  // Handle symbol change from Header / Search
  const handleSymbolChange = (newSym) => {
    setSymbol(newSym);
    if (activeMode === 'backtester') {
      executeBacktest(newSym);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTf) => {
    setTimeframe(newTf);
    if (activeMode === 'backtester') {
      executeBacktest(symbol, strategyConfig.preset_id, newTf, period);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (activeMode === 'backtester') {
      executeBacktest(symbol, strategyConfig.preset_id, timeframe, newPeriod);
    }
  };

  // Launch from Welcome preset cards
  const handleLaunchPreset = (targetSym, targetPresetId) => {
    setSymbol(targetSym);
    setActiveMode('backtester');
    setShowWelcome(false);
    executeBacktest(targetSym, targetPresetId);
  };

  // Launch AI Price Predictor directly from start
  const handleLaunchPredictor = (targetSym) => {
    if (targetSym) setSymbol(targetSym);
    setActiveMode('predictor');
    setShowWelcome(false);
  };

  // If Welcome Landing Page active
  if (showWelcome) {
    return (
      <WelcomePage
        onEnterTerminal={() => {
          setShowWelcome(false);
          setActiveMode('backtester');
          if (!backtestResult || !marketData) {
            executeBacktest();
          }
        }}
        onLaunchPreset={handleLaunchPreset}
        onLaunchPredictor={handleLaunchPredictor}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.25rem' }}>
      
      {/* Universal Header Bar with Mode Switcher */}
      <Header
        symbol={symbol}
        setSymbol={handleSymbolChange}
        timeframe={timeframe}
        setTimeframe={handleTimeframeChange}
        period={period}
        setPeriod={handlePeriodChange}
        onRunBacktest={() => executeBacktest()}
        loading={loading}
        popularSymbols={popularSymbols}
        onOpenWelcome={() => setShowWelcome(true)}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Mode 1: AI Price Predictor Workspace */}
      {activeMode === 'predictor' && (
        <PricePredictorView
          initialSymbol={symbol}
          key={`predictor-${symbol}`}
        />
      )}

      {/* Mode 2: Quantitative Algorithmic Backtester Workspace */}
      {activeMode === 'backtester' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* 8 Metric KPI Cards Grid */}
          <MetricsGrid metrics={backtestResult?.metrics} />

          {/* Strategy Control Sidebar & Interactive Visualization Workspace */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 360px) 1fr',
            gap: '1.25rem',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Strategy & Risk Configurations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <StrategyBuilder
                presets={presets}
                strategyConfig={strategyConfig}
                setStrategyConfig={setStrategyConfig}
                indicatorConfig={indicatorConfig}
                setIndicatorConfig={setIndicatorConfig}
                onRunBacktest={(updatedStrat, updatedInd) => executeBacktest(symbol, updatedStrat.preset_id, timeframe, period, updatedStrat, riskConfig, updatedInd)}
              />

              <RiskManagementPanel
                riskConfig={riskConfig}
                setRiskConfig={setRiskConfig}
                onRunBacktest={(updatedRisk) => executeBacktest(symbol, strategyConfig.preset_id, timeframe, period, strategyConfig, updatedRisk, indicatorConfig)}
              />
            </div>

            {/* Right Column: Multi-Tab Institutional Analytics */}
            <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '680px' }}>
              
              {/* Workspace Navigation Tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.85rem',
                marginBottom: '1.25rem',
                overflowX: 'auto'
              }}>
                <button
                  id="tab-chart"
                  className={`nav-tab ${activeTab === 'chart' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chart')}
                >
                  <TrendingUp size={15} />
                  <span>SMC Candlestick Chart</span>
                </button>

                <button
                  id="tab-analytics"
                  className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart2 size={15} />
                  <span>Portfolio & Returns</span>
                </button>

                <button
                  id="tab-monte-carlo"
                  className={`nav-tab ${activeTab === 'monte_carlo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('monte_carlo')}
                >
                  <Flame size={15} />
                  <span>Monte Carlo Stress Test</span>
                </button>

                <button
                  id="tab-optimization"
                  className={`nav-tab ${activeTab === 'optimization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('optimization')}
                >
                  <Sliders size={15} />
                  <span>2D Parameter Grid</span>
                </button>

                <button
                  id="tab-trades"
                  className={`nav-tab ${activeTab === 'trades' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trades')}
                >
                  <FileText size={15} />
                  <span>Trade Execution Log ({backtestResult?.trades?.length || 0})</span>
                </button>
              </div>

              {/* Tab 1: Interactive Candlestick Chart with SMC Zones */}
              {activeTab === 'chart' && (
                <CandlestickChart
                  symbol={symbol}
                  timeframe={timeframe}
                  candles={marketData?.candles || []}
                  marketData={marketData}
                  orderBlocks={marketData?.order_blocks || []}
                  fairValueGaps={marketData?.fair_value_gaps || []}
                  trades={backtestResult?.trades || []}
                />
              )}

              {/* Tab 2: Portfolio Equity vs Buy & Hold + Underwater Drawdown + Monthly Heatmap */}
              {activeTab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <EquityDrawdownChart
                    equityCurve={backtestResult?.equity_curve || []}
                    initialCapital={riskConfig.initial_capital}
                  />
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)',
                    gap: '1.25rem'
                  }}>
                    <RiskRewardDistribution trades={backtestResult?.trades || []} />
                    <MonthlyReturnsHeatmap monthlyReturns={backtestResult?.metrics?.monthly_returns || {}} />
                  </div>
                </div>
              )}

              {/* Tab 3: 500-Run Monte Carlo Simulation */}
              {activeTab === 'monte_carlo' && (
                <MonteCarloView
                  trades={backtestResult?.trades || []}
                  initialCapital={riskConfig.initial_capital}
                />
              )}

              {/* Tab 4: 2D Parameter Grid Optimization Sensitivity */}
              {activeTab === 'optimization' && (
                <OptimizationHeatmap
                  symbol={symbol}
                  timeframe={timeframe}
                  period={period}
                  strategyConfig={strategyConfig}
                  indicatorConfig={indicatorConfig}
                  riskConfig={riskConfig}
                />
              )}

              {/* Tab 5: Trade Execution Ledger */}
              {activeTab === 'trades' && (
                <TradeLogTable trades={backtestResult?.trades || []} />
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
