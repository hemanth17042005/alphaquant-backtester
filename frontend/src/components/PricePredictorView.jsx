import React, { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, TrendingDown, Target, BrainCircuit, Activity,
  Sliders, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap,
  BarChart3, RefreshCw, Layers, Compass, HelpCircle, AlertCircle, CheckCircle2,
  Coins, Maximize2, Minimize2, X
} from 'lucide-react';

import SymbolSearchSelector from './SymbolSearchSelector';
import PlotWrapper from './PlotWrapper';
import { runPricePrediction } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

const QUICK_TICKERS = [
  { symbol: 'BTC-USD', label: 'BTC', cat: 'Crypto' },
  { symbol: 'NVDA', label: 'NVIDIA', cat: 'US Tech' },
  { symbol: 'MRF.NS', label: 'MRF Tyres', cat: 'NSE India' },
  { symbol: 'RELIANCE.NS', label: 'Reliance', cat: 'NSE India' },
  { symbol: 'TATAPOWER.NS', label: 'Tata Power', cat: 'NSE India' },
  { symbol: 'AAPL', label: 'Apple', cat: 'US Stock' },
  { symbol: '^NSEI', label: 'NIFTY 50', cat: 'NSE Index' },
  { symbol: 'SPY', label: 'S&P 500', cat: 'Index' },
  { symbol: 'TSLA', label: 'Tesla', cat: 'US Stock' },
  { symbol: 'GC=F', label: 'Gold', cat: 'Commodity' }
];

export default function PricePredictorView({ initialSymbol = 'BTC-USD', currencyPreference: propCurrency, onCurrencyChange }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [horizonDays, setHorizonDays] = useState(30);
  const [modelType, setModelType] = useState('ensemble');
  const [period, setPeriod] = useState('2y');
  const [timeframe, setTimeframe] = useState('1d');
  const [currencyMode, setCurrencyMode] = useState(propCurrency || 'auto');
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);

  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeCurrencySymbol = getCurrencySymbol(symbol, currencyMode);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsChartFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPrediction = async (sym = symbol, horizon = horizonDays, model = modelType, trainPeriod = period) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runPricePrediction({
        symbol: sym,
        timeframe,
        period: trainPeriod,
        horizon_days: parseInt(horizon, 10),
        model_type: model
      });
      setPredictionData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Price prediction calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(initialSymbol, 30, 'ensemble', '2y');
  }, []);

  const handleSymbolChange = (newSym) => {
    setSymbol(newSym);
    fetchPrediction(newSym, horizonDays, modelType, period);
  };

  const handleHorizonChange = (newHorizon) => {
    const val = parseInt(newHorizon, 10);
    setHorizonDays(val);
    fetchPrediction(symbol, val, modelType, period);
  };

  const handleModelChange = (newModel) => {
    setModelType(newModel);
    fetchPrediction(symbol, horizonDays, newModel, period);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchPrediction(symbol, horizonDays, modelType, newPeriod);
  };

  const handleCurrencyChange = (newCurr) => {
    setCurrencyMode(newCurr);
    if (onCurrencyChange) onCurrencyChange(newCurr);
  };

  // Build Plotly Forecast Trajectory Chart
  const buildForecastPlot = () => {
    if (!predictionData) return { data: [], layout: {} };

    const hist = predictionData.historical_data || [];
    const forecast = predictionData.forecast_series || [];

    const histX = hist.map((h) => h.timestamp);
    const histClose = hist.map((h) => h.close);

    const forecastX = forecast.map((f) => f.date);
    const forecastPrice = forecast.map((f) => f.predicted_price);
    const upper95 = forecast.map((f) => f.upper_95);
    const lower95 = forecast.map((f) => f.lower_95);
    const upper80 = forecast.map((f) => f.upper_80);
    const lower80 = forecast.map((f) => f.lower_80);
    const bullScenario = forecast.map((f) => f.bull_scenario);
    const bearScenario = forecast.map((f) => f.bear_scenario);

    // Bridge last historical point to first forecast point
    const bridgeX = histX.length > 0 ? [histX[histX.length - 1], ...forecastX] : forecastX;
    const bridgePrice = histClose.length > 0 ? [histClose[histClose.length - 1], ...forecastPrice] : forecastPrice;
    const bridgeUpper95 = histClose.length > 0 ? [histClose[histClose.length - 1], ...upper95] : upper95;
    const bridgeLower95 = histClose.length > 0 ? [histClose[histClose.length - 1], ...lower95] : lower95;
    const bridgeUpper80 = histClose.length > 0 ? [histClose[histClose.length - 1], ...upper80] : upper80;
    const bridgeLower80 = histClose.length > 0 ? [histClose[histClose.length - 1], ...lower80] : lower80;
    const bridgeBull = histClose.length > 0 ? [histClose[histClose.length - 1], ...bullScenario] : bullScenario;
    const bridgeBear = histClose.length > 0 ? [histClose[histClose.length - 1], ...bearScenario] : bearScenario;

    const plotData = [
      // 1. Shaded 95% Confidence Interval Band
      {
        name: '95% Confidence Corridor (Upper)',
        type: 'scatter',
        x: bridgeX,
        y: bridgeUpper95,
        mode: 'lines',
        line: { color: 'transparent' },
        showlegend: false,
        hoverinfo: 'skip'
      },
      {
        name: '95% Confidence Interval',
        type: 'scatter',
        x: bridgeX,
        y: bridgeLower95,
        mode: 'lines',
        fill: 'tonexty',
        fillcolor: 'rgba(0, 245, 212, 0.08)',
        line: { color: 'transparent' },
        hoverinfo: 'skip'
      },
      // 2. Shaded 80% Confidence Interval Band
      {
        name: '80% Confidence Corridor (Upper)',
        type: 'scatter',
        x: bridgeX,
        y: bridgeUpper80,
        mode: 'lines',
        line: { color: 'transparent' },
        showlegend: false,
        hoverinfo: 'skip'
      },
      {
        name: '80% Confidence Corridor',
        type: 'scatter',
        x: bridgeX,
        y: bridgeLower80,
        mode: 'lines',
        fill: 'tonexty',
        fillcolor: 'rgba(0, 187, 249, 0.16)',
        line: { color: 'transparent' },
        hoverinfo: 'skip'
      },
      // 3. Optimistic Bull Path (+2 sigma)
      {
        name: 'Bull Case (+2σ Target)',
        type: 'scatter',
        mode: 'lines',
        x: bridgeX,
        y: bridgeBull,
        line: { color: '#10B981', width: 1.5, dash: 'dot' }
      },
      // 4. Stress Bear Path (-2 sigma)
      {
        name: 'Bear Case (-2σ Risk)',
        type: 'scatter',
        mode: 'lines',
        x: bridgeX,
        y: bridgeBear,
        line: { color: '#EF4444', width: 1.5, dash: 'dot' }
      },
      // 5. Historical Actual Price Line
      {
        name: 'Historical Market Price',
        type: 'scatter',
        mode: 'lines',
        x: histX,
        y: histClose,
        line: { color: '#94A3B8', width: 2.2 }
      },
      // 6. ML Predicted Future Trajectory
      {
        name: '🔮 ML Predicted Trajectory',
        type: 'scatter',
        mode: 'lines+markers',
        x: bridgeX,
        y: bridgePrice,
        line: { color: '#00F5D4', width: 3.2 },
        marker: { size: 4, color: '#00F5D4' }
      }
    ];

    const minPrice = Math.min(...histClose, ...lower95) * 0.96;
    const maxPrice = Math.max(...histClose, ...upper95) * 1.04;

    const layout = {
      autosize: true,
      height: isChartFullscreen ? (window.innerHeight ? window.innerHeight - 110 : 700) : 480,
      margin: { l: 65, r: 35, t: 25, b: 45 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      xaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 },
        showspikes: true,
        spikecolor: '#00F5D4',
        spikethickness: 1,
        spikedash: 'dot'
      },
      yaxis: {
        title: `Price (${activeCurrencySymbol})`,
        titlefont: { color: '#94A3B8', size: 11 },
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 11 },
        range: [minPrice, maxPrice],
        showspikes: true,
        spikecolor: '#00F5D4',
        spikethickness: 1
      },
      legend: {
        orientation: 'h',
        y: 1.08,
        x: 0,
        font: { color: '#CBD5E1', size: 11 }
      },
      hovermode: 'x unified'
    };

    return { data: plotData, layout };
  };

  const { data: chartData, layout: chartLayout } = buildForecastPlot();

  const isBullish = predictionData?.direction?.includes('BULL');
  const isBearish = predictionData?.direction?.includes('BEAR');
  const dirColor = isBullish ? '#10B981' : isBearish ? '#EF4444' : '#FEE440';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Control Bar with absolute high z-index & visible overflow */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          position: 'relative',
          zIndex: 1000,
          overflow: 'visible'
        }}
      >
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00F5D4 0%, #9B5DE5 100%)',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B11',
              boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
            }}>
              <BrainCircuit size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  AI QUANTITATIVE <span style={{ color: 'var(--accent-primary)' }}>PRICE PREDICTOR</span>
                </h1>
                <span className="badge-bull" style={{ fontSize: '0.7rem' }}>MULTI-MODEL ML</span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: activeCurrencySymbol === '₹' ? 'rgba(0, 187, 249, 0.15)' : 'rgba(0, 245, 212, 0.15)',
                  color: activeCurrencySymbol === '₹' ? '#00BBF9' : '#00F5D4',
                  border: `1px solid ${activeCurrencySymbol === '₹' ? 'rgba(0, 187, 249, 0.4)' : 'rgba(0, 245, 212, 0.4)'}`
                }}>
                  {activeCurrencySymbol === '₹' ? '₹ INR (Indian Rupee)' : '$ USD (Dollar)'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Multi-lag feature learning, cyclical Fourier decomposition & probabilistic confidence corridor
              </p>
            </div>
          </div>

          {/* Quick Popular Ticker Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>POPULAR:</span>
            {QUICK_TICKERS.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => handleSymbolChange(t.symbol)}
                className={`btn-secondary ${symbol === t.symbol ? 'active' : ''}`}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.74rem',
                  borderRadius: '6px',
                  borderColor: symbol === t.symbol ? 'var(--accent-primary)' : undefined,
                  color: symbol === t.symbol ? '#00F5D4' : undefined,
                  background: symbol === t.symbol ? 'rgba(0, 245, 212, 0.12)' : undefined
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* Universal Search, Currency & Horizon Parameter Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 300px) 130px 1fr 1fr 1fr auto',
          gap: '0.85rem',
          alignItems: 'center',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          position: 'relative',
          zIndex: 1001,
          overflow: 'visible'
        }}>
          
          {/* Universal Stock Search */}
          <div style={{ position: 'relative', zIndex: 1002, overflow: 'visible' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 700 }}>
              SEARCH ANY STOCK / ASSET (GLOBAL):
            </label>
            <SymbolSearchSelector
              symbol={symbol}
              setSymbol={handleSymbolChange}
            />
          </div>

          {/* Currency Toggle (Auto / INR / USD) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 700 }}>
              CURRENCY:
            </label>
            <select
              className="input-dark"
              value={currencyMode}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeCurrencySymbol === '₹' ? '#00BBF9' : '#00F5D4' }}
            >
              <option value="auto">Auto ({getCurrencySymbol(symbol, 'auto')})</option>
              <option value="INR">₹ INR (Rupee)</option>
              <option value="USD">$ USD (Dollar)</option>
            </select>
          </div>

          {/* Forecast Horizon */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 700 }}>
              FORECAST HORIZON:
            </label>
            <select
              className="input-dark"
              value={horizonDays}
              onChange={(e) => handleHorizonChange(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            >
              <option value="7">7 Days (Short Term)</option>
              <option value="14">14 Days (2 Weeks)</option>
              <option value="30">30 Days (1 Month)</option>
              <option value="60">60 Days (2 Months)</option>
              <option value="90">90 Days (Quarter)</option>
            </select>
          </div>

          {/* ML Model Architecture */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 700 }}>
              AI PREDICTOR MODEL:
            </label>
            <select
              className="input-dark"
              value={modelType}
              onChange={(e) => handleModelChange(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            >
              <option value="ensemble">🔮 Ensemble AI Pro (Weighted Consensus)</option>
              <option value="ridge">📈 Multi-Lag Ridge Regression (L2)</option>
              <option value="momentum">⚡ Momentum & Volatility AR</option>
              <option value="fourier">🌊 Fourier Cyclic Harmonic Waves</option>
              <option value="gbm">🎲 Geometric Brownian Motion (GBM)</option>
            </select>
          </div>

          {/* Historical Training Window */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 700 }}>
              TRAINING DATA WINDOW:
            </label>
            <select
              className="input-dark"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            >
              <option value="6mo">6 Months History</option>
              <option value="1y">1 Year History</option>
              <option value="2y">2 Years History (Recommended)</option>
              <option value="5y">5 Years History</option>
            </select>
          </div>

          {/* Re-train / Predict Button */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              id="btn-train-predict"
              className="btn-primary"
              onClick={() => fetchPrediction(symbol, horizonDays, modelType, period)}
              disabled={loading}
              style={{ minWidth: '145px', height: '38px', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Learning...</span>
                </>
              ) : (
                <>
                  <Zap size={16} fill="#080B11" />
                  <span>Train & Predict</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Key Machine Learning KPI Cards Grid with Dynamic Rupee / Dollar Formatting */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Card 1: Target Price & Horizon Return */}
        <div className="metric-card" style={{ borderColor: isBullish ? 'rgba(16, 185, 129, 0.3)' : isBearish ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
          <span className="metric-title">TARGET PRICE ({horizonDays}D)</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span className="metric-value" style={{ color: dirColor }}>
              {predictionData ? formatPrice(predictionData.target_price, symbol, currencyMode, 2) : '---'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
            {predictionData?.predicted_change_pct >= 0 ? (
              <ArrowUpRight size={15} color="#10B981" />
            ) : (
              <ArrowDownRight size={15} color="#EF4444" />
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: predictionData?.predicted_change_pct >= 0 ? '#10B981' : '#EF4444' }}>
              {predictionData?.predicted_change_pct > 0 ? '+' : ''}
              {predictionData ? predictionData.predicted_change_pct : '0.0'}%
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              vs Last {formatPrice(predictionData?.last_price, symbol, currencyMode, 2)}
            </span>
          </div>
        </div>

        {/* Card 2: AI Direction & Signal */}
        <div className="metric-card">
          <span className="metric-title">AI DIRECTIONAL BIAS</span>
          <div style={{ marginTop: '0.45rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-display)',
              background: isBullish ? 'rgba(16, 185, 129, 0.15)' : isBearish ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 228, 64, 0.15)',
              color: dirColor,
              border: `1px solid ${dirColor}40`
            }}>
              {isBullish ? <TrendingUp size={16} /> : isBearish ? <TrendingDown size={16} /> : <Activity size={16} />}
              <span>{predictionData ? predictionData.direction : 'ANALYZING...'}</span>
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
            Signal: <strong style={{ color: '#F8FAFC' }}>{predictionData?.recommendation || 'NEUTRAL'}</strong>
          </span>
        </div>

        {/* Card 3: AI Model Confidence Score */}
        <div className="metric-card">
          <span className="metric-title">AI CONVICTION SCORE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span className="metric-value" style={{ color: '#00F5D4' }}>
              {predictionData ? `${predictionData.ai_confidence_pct}%` : '---'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>High Conviction</span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', marginTop: '0.45rem', overflow: 'hidden' }}>
            <div style={{
              width: `${predictionData?.ai_confidence_pct || 50}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00F5D4, #00BBF9)',
              borderRadius: '3px'
            }} />
          </div>
        </div>

        {/* Card 4: Historical Directional Hit Rate */}
        <div className="metric-card">
          <span className="metric-title">OUT-OF-SAMPLE HIT RATE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span className="metric-value" style={{ color: '#9B5DE5' }}>
              {predictionData?.evaluation_metrics ? `${predictionData.evaluation_metrics.directional_accuracy_pct}%` : '---'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
            R² Score: <strong style={{ color: '#F8FAFC' }}>{predictionData?.evaluation_metrics?.r2_score}</strong> | RMSE: <strong style={{ color: '#F8FAFC' }}>{predictionData?.evaluation_metrics?.rmse}</strong>
          </span>
        </div>

        {/* Card 5: Predicted Support Level */}
        <div className="metric-card">
          <span className="metric-title">PROJECTED SUPPORT FLOOR</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span className="metric-value" style={{ color: '#00BBF9' }}>
              {predictionData ? formatPrice(predictionData.support_level, symbol, currencyMode, 2) : '---'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
            Key Structural Floor Barrier
          </span>
        </div>

        {/* Card 6: Predicted Resistance Ceiling */}
        <div className="metric-card">
          <span className="metric-title">PROJECTED RESISTANCE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
            <span className="metric-value" style={{ color: '#F15BB5' }}>
              {predictionData ? formatPrice(predictionData.resistance_level, symbol, currencyMode, 2) : '---'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
            Upper Volatility Expansion Target
          </span>
        </div>

      </div>

      {/* Main Interactive Forecast Chart (Supports Full-Screen Modal) */}
      <div
        className="glass-panel"
        style={isChartFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999999,
          background: '#080B11',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          border: 'none',
          overflow: 'hidden'
        } : {
          padding: '1.25rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              HISTORICAL TRAJECTORY & ML PREDICTIVE PATH ({symbol} • {activeCurrencySymbol})
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#00F5D4' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F5D4', display: 'inline-block' }} />
                Forecast Center
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(0, 245, 212, 0.6)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(0, 245, 212, 0.25)', display: 'inline-block' }} />
                80%/95% Confidence Corridor
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#10B981' }}>
                <span style={{ width: '8px', height: '2px', background: '#10B981', display: 'inline-block' }} />
                Bull Case
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#EF4444' }}>
                <span style={{ width: '8px', height: '2px', background: '#EF4444', display: 'inline-block' }} />
                Bear Case
              </span>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={() => setIsChartFullscreen(!isChartFullscreen)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: isChartFullscreen ? 'var(--accent-primary)' : undefined,
                color: isChartFullscreen ? '#00F5D4' : undefined,
                background: isChartFullscreen ? 'rgba(0, 245, 212, 0.15)' : undefined
              }}
              title={isChartFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Chart"}
            >
              {isChartFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isChartFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
            </button>
          </div>
        </div>

        {/* Plotly Interactive Render */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <PlotWrapper
            data={chartData}
            layout={chartLayout}
            style={{ width: '100%', height: isChartFullscreen ? 'calc(100vh - 100px)' : '480px' }}
          />
        </div>

      </div>

      {/* Two-Column Deep Learning Diagnostics & Multi-Model Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)',
        gap: '1.25rem',
        alignItems: 'start',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left: Multi-Model Consensus Breakdown */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              MULTI-MODEL QUANTITATIVE CONSENSUS ({activeCurrencySymbol})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(predictionData?.model_comparisons || []).map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F8FAFC' }}>
                      {m.model_name}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                      {m.conviction}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {m.methodology}
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '105px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.92rem', color: '#00F5D4' }}>
                    {formatPrice(m.target_price, symbol, currencyMode, 2)}
                  </span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.expected_change_pct >= 0 ? '#10B981' : '#EF4444' }}>
                    {m.expected_change_pct >= 0 ? '+' : ''}{m.expected_change_pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Feature Importance & Drivers */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              MACHINE LEARNING FEATURE ATTRIBUTION
            </h3>
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Top technical & cyclical factors influencing current forecast trajectory:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(predictionData?.feature_drivers || []).map((f, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    {f.importance_pct}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(f.importance_pct * 3.5, 100)}%`,
                    height: '100%',
                    background: idx === 0
                      ? 'linear-gradient(90deg, #00F5D4, #00BBF9)'
                      : idx === 1
                      ? 'linear-gradient(90deg, #00BBF9, #9B5DE5)'
                      : 'rgba(0, 245, 212, 0.5)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
