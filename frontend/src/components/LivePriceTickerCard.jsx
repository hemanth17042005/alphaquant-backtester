import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Activity, Zap, Radio } from 'lucide-react';
import { fetchLiveQuote } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

export default function LivePriceTickerCard({
  symbol = 'BTC-USD',
  currencyPreference = 'auto',
  compact = false,
  showHighLow = true,
  onQuoteLoaded = null
}) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currSym = getCurrencySymbol(symbol, currencyPreference);

  const loadQuote = async (sym = symbol) => {
    setLoading(true);
    try {
      const data = await fetchLiveQuote(sym);
      if (data) {
        setQuote(data);
        setLastUpdated(new Date().toLocaleTimeString());
        if (onQuoteLoaded) onQuoteLoaded(data);
      }
    } catch (err) {
      console.error('Error fetching live quote:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuote(symbol);
    // Auto-refresh quote every 15 seconds
    const interval = setInterval(() => {
      loadQuote(symbol);
    }, 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  const isUp = (quote?.change ?? 0) >= 0;
  const priceColor = isUp ? '#10B981' : '#EF4444';

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(15, 23, 42, 0.9)',
          border: `1px solid ${isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          padding: '0.25rem 0.65rem',
          borderRadius: '8px',
          boxShadow: isUp ? '0 0 12px rgba(16, 185, 129, 0.15)' : '0 0 12px rgba(239, 68, 68, 0.15)'
        }}
        title={`Live Price: ${formatPrice(quote?.current_price, symbol, currencyPreference, 2)} (${lastUpdated || 'Loading...'})`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isUp ? '#10B981' : '#EF4444',
            display: 'inline-block',
            boxShadow: `0 0 6px ${isUp ? '#10B981' : '#EF4444'}`
          }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            LIVE:
          </span>
        </div>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '0.88rem',
          color: priceColor
        }}>
          {quote ? formatPrice(quote.current_price, symbol, currencyPreference, 2) : '---'}
        </span>

        {quote && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: priceColor,
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem'
          }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? '+' : ''}{quote.change_pct}%
          </span>
        )}

        <button
          type="button"
          onClick={() => loadQuote(symbol)}
          disabled={loading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Refresh Live Quote"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
        border: `1px solid ${isUp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '10px',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: isUp ? '0 0 15px rgba(16, 185, 129, 0.15)' : '0 0 15px rgba(239, 68, 68, 0.15)'
      }}
    >
      {/* Left: Ticker & Live Pulse Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          background: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          padding: '0.35rem 0.55rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isUp ? '#10B981' : '#EF4444',
            display: 'inline-block',
            boxShadow: `0 0 8px ${isUp ? '#10B981' : '#EF4444'}`
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: priceColor, letterSpacing: '0.04em' }}>
            {quote?.market_status || 'LIVE'}
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#F8FAFC' }}>
              {symbol}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {quote?.name ? `• ${quote.name}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Current Live Price & Day Delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 900,
          fontSize: '1.25rem',
          color: priceColor,
          letterSpacing: '-0.02em'
        }}>
          {quote ? formatPrice(quote.current_price, symbol, currencyPreference, 2) : 'Loading...'}
        </span>

        {quote && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: priceColor,
              display: 'flex',
              alignItems: 'center'
            }}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{formatPrice(quote.change, symbol, currencyPreference, 2)} ({isUp ? '+' : ''}{quote.change_pct}%)
            </span>
          </div>
        )}
      </div>

      {/* Right: Day High / Low Stats & Refresh */}
      {showHighLow && quote && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            <div>
              <span>24h High: </span>
              <strong style={{ color: '#F8FAFC' }}>{formatPrice(quote.day_high, symbol, currencyPreference, 2)}</strong>
            </div>
            <div>
              <span>24h Low: </span>
              <strong style={{ color: '#F8FAFC' }}>{formatPrice(quote.day_low, symbol, currencyPreference, 2)}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadQuote(symbol)}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '26px' }}
            title="Fetch Latest Tick"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Fetching...' : 'Live'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
