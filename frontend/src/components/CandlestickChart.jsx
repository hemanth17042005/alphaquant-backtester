import React, { useState, useEffect } from 'react';
import PlotWrapper from './PlotWrapper';
import { Eye, EyeOff, Maximize2, Minimize2, Layers } from 'lucide-react';

export default function CandlestickChart({
  candles = [],
  marketData = null,
  trades = [],
  orderBlocks = [],
  fairValueGaps = [],
  symbol = 'BTC-USD',
  timeframe = '1d'
}) {
  const [showEMA, setShowEMA] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showSMC, setShowSMC] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actualCandles = (candles && candles.length > 0) ? candles : (marketData?.candles || []);
  const actualOBs = (orderBlocks && orderBlocks.length > 0) ? orderBlocks : (marketData?.order_blocks || []);
  const actualFVGs = (fairValueGaps && fairValueGaps.length > 0) ? fairValueGaps : (marketData?.fair_value_gaps || []);

  if (!actualCandles || actualCandles.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        No price data loaded. Click "Run Strategy" to simulate.
      </div>
    );
  }

  const timestamps = actualCandles.map((c) => c.timestamp);
  const opens = actualCandles.map((c) => c.open);
  const highs = actualCandles.map((c) => c.high);
  const lows = actualCandles.map((c) => c.low);
  const closes = actualCandles.map((c) => c.close);

  const plotData = [
    // 1. Candlestick series
    {
      type: 'candlestick',
      x: timestamps,
      open: opens,
      high: highs,
      low: lows,
      close: closes,
      name: symbol,
      increasing: { line: { color: '#00F5D4', width: 1 }, fillcolor: '#00F5D4' },
      decreasing: { line: { color: '#FF3366', width: 1 }, fillcolor: '#FF3366' },
      xaxis: 'x',
      yaxis: 'y'
    }
  ];

  // 2. EMA Overlays
  if (showEMA && actualCandles[0]?.ema_fast !== undefined) {
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: actualCandles.map((c) => c.ema_fast),
      name: 'Fast EMA',
      line: { color: '#00BBF9', width: 1.5 },
      opacity: 0.85
    });
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: actualCandles.map((c) => c.ema_slow),
      name: 'Slow EMA',
      line: { color: '#9B5DE5', width: 1.5 },
      opacity: 0.85
    });
    if (actualCandles[0]?.ema_trend !== undefined) {
      plotData.push({
        type: 'scatter',
        mode: 'lines',
        x: timestamps,
        y: actualCandles.map((c) => c.ema_trend),
        name: 'Trend EMA 200',
        line: { color: '#FEE440', width: 1.8, dash: 'dot' },
        opacity: 0.7
      });
    }
  }

  // 3. VWAP Overlays
  if (showVWAP && actualCandles[0]?.vwap !== undefined) {
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: actualCandles.map((c) => c.vwap),
      name: 'VWAP',
      line: { color: '#F15BB5', width: 1.8 },
      opacity: 0.9
    });
    if (actualCandles[0]?.vwap_upper_2 !== undefined) {
      plotData.push({
        type: 'scatter',
        mode: 'lines',
        x: timestamps,
        y: actualCandles.map((c) => c.vwap_upper_2),
        name: 'VWAP +2σ',
        line: { color: 'rgba(241, 91, 181, 0.4)', width: 1, dash: 'dash' }
      });
      plotData.push({
        type: 'scatter',
        mode: 'lines',
        x: timestamps,
        y: actualCandles.map((c) => c.vwap_lower_2),
        name: 'VWAP -2σ',
        line: { color: 'rgba(241, 91, 181, 0.4)', width: 1, dash: 'dash' }
      });
    }
  }

  // 4. Bollinger Bands
  if (showBB && actualCandles[0]?.bb_upper !== undefined) {
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: actualCandles.map((c) => c.bb_upper),
      name: 'BB Upper',
      line: { color: 'rgba(255, 255, 255, 0.25)', width: 1 }
    });
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: timestamps,
      y: actualCandles.map((c) => c.bb_lower),
      name: 'BB Lower',
      line: { color: 'rgba(255, 255, 255, 0.25)', width: 1 },
      fill: 'tonexty',
      fillcolor: 'rgba(255, 255, 255, 0.02)'
    });
  }

  // 5. Trade Entry & Exit Markers
  if (showTrades && trades.length > 0) {
    const longEntries = trades.filter((t) => t.side === 'LONG');
    const shortEntries = trades.filter((t) => t.side === 'SHORT');
    const exits = trades;

    if (longEntries.length > 0) {
      plotData.push({
        type: 'scatter',
        mode: 'markers',
        x: longEntries.map((t) => t.entry_time),
        y: longEntries.map((t) => t.entry_price * 0.995),
        name: 'Long Entry',
        marker: { symbol: 'triangle-up', size: 12, color: '#00F5D4', line: { color: '#080B11', width: 1 } },
        text: longEntries.map((t) => `LONG #${t.trade_id}<br>Entry: $${t.entry_price}<br>SL: $${t.stop_loss_price}<br>TP: $${t.take_profit_price}`),
        hoverinfo: 'text'
      });
    }

    if (shortEntries.length > 0) {
      plotData.push({
        type: 'scatter',
        mode: 'markers',
        x: shortEntries.map((t) => t.entry_time),
        y: shortEntries.map((t) => t.entry_price * 1.005),
        name: 'Short Entry',
        marker: { symbol: 'triangle-down', size: 12, color: '#FF3366', line: { color: '#080B11', width: 1 } },
        text: shortEntries.map((t) => `SHORT #${t.trade_id}<br>Entry: $${t.entry_price}<br>SL: $${t.stop_loss_price}<br>TP: $${t.take_profit_price}`),
        hoverinfo: 'text'
      });
    }

    plotData.push({
      type: 'scatter',
      mode: 'markers',
      x: exits.map((t) => t.exit_time),
      y: exits.map((t) => t.exit_price),
      name: 'Trade Exit',
      marker: {
        symbol: exits.map((t) => (t.pnl_dollar >= 0 ? 'circle' : 'x')),
        size: 9,
        color: exits.map((t) => (t.pnl_dollar >= 0 ? '#10B981' : '#EF4444'))
      },
      text: exits.map((t) => `EXIT #${t.trade_id} (${t.exit_reason})<br>Price: $${t.exit_price}<br>PnL: ${t.pnl_dollar >= 0 ? '+' : ''}$${t.pnl_dollar} (${t.pnl_pct}%)<br>Realized R:R: ${t.realized_rr}R`),
      hoverinfo: 'text'
    });
  }

  // 6. Build Layout Shapes for SMC Order Blocks & FVGs
  const shapes = [];
  if (showSMC) {
    // Order Blocks
    actualOBs.forEach((ob) => {
      shapes.push({
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: ob.start_time,
        x1: ob.end_time,
        y0: ob.bottom,
        y1: ob.top,
        fillcolor: ob.type === 'bullish_ob' ? 'rgba(0, 245, 212, 0.12)' : 'rgba(255, 51, 102, 0.12)',
        line: {
          color: ob.type === 'bullish_ob' ? 'rgba(0, 245, 212, 0.6)' : 'rgba(255, 51, 102, 0.6)',
          width: 1,
          dash: 'dot'
        }
      });
    });

    // Fair Value Gaps
    actualFVGs.forEach((fvg) => {
      shapes.push({
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: fvg.start_time,
        x1: fvg.end_time,
        y0: fvg.bottom,
        y1: fvg.top,
        fillcolor: fvg.type === 'bullish_fvg' ? 'rgba(0, 187, 249, 0.10)' : 'rgba(155, 93, 229, 0.10)',
        line: {
          color: fvg.type === 'bullish_fvg' ? 'rgba(0, 187, 249, 0.5)' : 'rgba(155, 93, 229, 0.5)',
          width: 1
        }
      });
    });
  }

  const layout = {
    autosize: true,
    height: isFullscreen ? (window.innerHeight ? window.innerHeight - 110 : 700) : 520,
    margin: { l: 55, r: 25, t: 30, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      rangeslider: { visible: false },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 },
      linecolor: 'rgba(255, 255, 255, 0.1)'
    },
    yaxis: {
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      tickfont: { color: '#94A3B8', family: 'JetBrains Mono', size: 10 },
      linecolor: 'rgba(255, 255, 255, 0.1)',
      side: 'right'
    },
    legend: {
      orientation: 'h',
      y: 1.08,
      x: 0,
      font: { color: '#CBD5E1', size: 11 }
    },
    shapes: shapes
  };

  return (
    <div
      className="glass-panel"
      style={isFullscreen ? {
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
        marginBottom: '1.25rem',
        position: 'relative'
      }}
    >
      
      {/* Chart Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#F8FAFC' }}>
            {symbol}
          </span>
          <span className="badge-neutral" style={{ fontSize: '0.7rem' }}>
            {timeframe.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ({actualCandles.length} Bars)
          </span>
        </div>

        {/* Toggle Overlays & Fullscreen Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          
          <button
            type="button"
            onClick={() => setShowSMC(!showSMC)}
            className={`btn-secondary ${showSMC ? 'active' : ''}`}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: showSMC ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: showSMC ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: showSMC ? '#00F5D4' : 'var(--text-muted)'
            }}
          >
            <Layers size={13} />
            <span>SMC Zones ({actualOBs.length + actualFVGs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEMA(!showEMA)}
            className={`btn-secondary ${showEMA ? 'active' : ''}`}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: showEMA ? 'rgba(0, 187, 249, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: showEMA ? '#00BBF9' : 'var(--border-subtle)',
              color: showEMA ? '#00BBF9' : 'var(--text-muted)'
            }}
          >
            <span>EMA 9/21/200</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVWAP(!showVWAP)}
            className={`btn-secondary ${showVWAP ? 'active' : ''}`}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: showVWAP ? 'rgba(241, 91, 181, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: showVWAP ? '#F15BB5' : 'var(--border-subtle)',
              color: showVWAP ? '#F15BB5' : 'var(--text-muted)'
            }}
          >
            <span>VWAP Bands</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrades(!showTrades)}
            className={`btn-secondary ${showTrades ? 'active' : ''}`}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: showTrades ? 'rgba(254, 228, 64, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: showTrades ? '#FEE440' : 'var(--border-subtle)',
              color: showTrades ? '#FEE440' : 'var(--text-muted)'
            }}
          >
            <span>Trades ({trades.length})</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: isFullscreen ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: isFullscreen ? '#00F5D4' : 'var(--text-muted)',
              background: isFullscreen ? 'rgba(0, 245, 212, 0.15)' : undefined
            }}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Chart"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>

        </div>

      </div>

      {/* Plotly Canvas */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <PlotWrapper
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 100px)' : '520px' }}
        />
      </div>

    </div>
  );
}
