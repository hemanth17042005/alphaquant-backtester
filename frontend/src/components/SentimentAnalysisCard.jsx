import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Flame, Compass, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchMarketSentiment } from '../services/api';

export default function SentimentAnalysisCard({ symbol = 'BTC-USD' }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSentiment = async (sym = symbol) => {
    setLoading(true);
    try {
      const data = await fetchMarketSentiment(sym);
      setSentiment(data);
    } catch (err) {
      console.error('Error fetching sentiment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSentiment(symbol);
  }, [symbol]);

  const score = sentiment?.sentiment_score ?? 0;
  const fg = sentiment?.fear_greed_index ?? 50;
  const isBull = score >= 0.1;
  const isBear = score <= -0.1;
  const badgeColor = isBull ? '#10B981' : isBear ? '#EF4444' : '#FEE440';

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(0, 187, 249, 0.15)',
            border: '1px solid rgba(0, 187, 249, 0.3)',
            borderRadius: '6px',
            padding: '0.35rem',
            color: '#00BBF9'
          }}>
            <Newspaper size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F8FAFC' }}>
              NEWS & AI MARKET SENTIMENT ({symbol})
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadSentiment(symbol)}
          disabled={loading}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
          title="Refresh Sentiment Scrapes"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Analyzing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Fear & Greed Speedometer Strip */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            FINBERT SENTIMENT BIAS:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              background: badgeColor,
              color: '#080B11'
            }}>
              {sentiment?.sentiment_label || 'NEUTRAL'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: badgeColor }}>
              {score > 0 ? '+' : ''}{score}
            </span>
          </div>
        </div>

        {/* Bullish vs Bearish Ratio Bar */}
        <div style={{ flex: 1, minWidth: '160px', maxWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            <span style={{ color: '#10B981', fontWeight: 700 }}>Bullish {sentiment?.bullish_pct ?? 50}%</span>
            <span style={{ color: '#EF4444', fontWeight: 700 }}>Bearish {sentiment?.bearish_pct ?? 25}%</span>
          </div>
          <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${sentiment?.bullish_pct ?? 50}%`, background: '#10B981' }} />
            <div style={{ width: `${sentiment?.neutral_pct ?? 25}%`, background: '#FEE440' }} />
            <div style={{ width: `${sentiment?.bearish_pct ?? 25}%`, background: '#EF4444' }} />
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>FEAR & GREED</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 900, color: fg >= 50 ? '#10B981' : '#EF4444' }}>
            {fg} / 100
          </div>
        </div>
      </div>

      {/* Scraped Headline Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {(sentiment?.articles || []).map((art, idx) => {
          const isArtBull = art.polarity === 'BULLISH';
          const isArtBear = art.polarity === 'BEARISH';
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    background: isArtBull ? 'rgba(16, 185, 129, 0.15)' : isArtBear ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    color: isArtBull ? '#10B981' : isArtBear ? '#EF4444' : 'var(--text-muted)'
                  }}>
                    {art.polarity}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {art.publisher} • {art.published_at}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {art.title}
                </div>
              </div>

              {art.link && art.link !== '#' && (
                <a
                  href={art.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
                  title="Read Article"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
