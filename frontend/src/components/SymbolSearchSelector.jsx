import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronDown, Check, Sparkles, X, TrendingUp } from 'lucide-react';
import { searchSymbols } from '../services/api';

const CATEGORIES = ['All', 'Stocks', 'Crypto', 'Indices', 'Forex', 'Commodities', 'Sample Data'];

export default function SymbolSearchSelector({ symbol, setSymbol, onSelectSymbol }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSymbols(query);
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (sym) => {
    setSymbol(sym);
    setIsOpen(false);
    setQuery('');
    if (onSelectSymbol) onSelectSymbol(sym);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (results.length > 0) {
        handleSelect(results[0].symbol);
      } else if (query.trim().length > 0) {
        handleSelect(query.trim().toUpperCase());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Filter results by category
  const filteredResults = results.filter((r) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Stocks' && (r.category === 'Stocks' || r.category === 'US Equities' || r.category === 'Global Equities')) return true;
    if (selectedCategory === 'Crypto' && r.category === 'Crypto') return true;
    if (selectedCategory === 'Indices' && (r.category === 'Indices' || r.category === 'Indices & ETFs' || r.category === 'ETFs')) return true;
    if (selectedCategory === 'Forex' && r.category === 'Forex') return true;
    if (selectedCategory === 'Commodities' && (r.category === 'Commodities' || r.category === 'Commodities & Futures')) return true;
    if (selectedCategory === 'Sample Data' && r.category === 'Sample Data') return true;
    return false;
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', zIndex: 10005 }}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          minWidth: '220px',
          cursor: 'pointer',
          padding: '0.5rem 0.85rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-accent)',
          borderRadius: '8px',
          boxShadow: isOpen ? '0 0 12px rgba(0, 245, 212, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <Globe size={15} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: '#00F5D4' }}>
            {symbol}
          </span>
        </div>
        <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Autocomplete Dropdown Flyout */}
      {isOpen && (
        <>
          {/* Backdrop overlay to capture clicks and guarantee top layer */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99990,
              background: 'rgba(0, 0, 0, 0.25)'
            }}
            onClick={() => setIsOpen(false)}
          />

          <div
            className="search-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '440px',
              maxWidth: '92vw',
              zIndex: 99999,
              padding: '1rem',
              background: '#0F172A',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 245, 212, 0.25)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '12px'
            }}
          >
            {/* Search Input Bar */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
              <input
                type="text"
                className="input-dark"
                placeholder="Search any stock, crypto, forex, ETF..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  paddingLeft: '36px',
                  paddingRight: query ? '32px' : '12px',
                  paddingTop: '0.65rem',
                  paddingBottom: '0.65rem',
                  fontSize: '0.88rem',
                  background: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid var(--accent-primary)'
                }}
              />
              {query && (
                <X
                  size={14}
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-dim)' }}
                />
              )}
            </div>

            {/* Quick Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: selectedCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                    color: selectedCategory === cat ? '#080B11' : 'var(--text-main)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Direct Custom Ticker Option */}
            {query.trim().length > 0 && (
              <div
                onClick={() => handleSelect(query.trim().toUpperCase())}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(0, 245, 212, 0.12)',
                  border: '1px dashed var(--accent-primary)',
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ fontSize: '0.82rem', color: '#00F5D4' }}>
                  Simulate ticker: <strong>{query.trim().toUpperCase()}</strong>
                </div>
                <span className="badge-bull" style={{ fontSize: '0.65rem' }}>PRESS ENTER</span>
              </div>
            )}

            {/* Results List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  Searching global financial markets...
                </div>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((item) => {
                  const isCurrent = symbol === item.symbol;
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => handleSelect(item.symbol)}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        background: isCurrent ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: isCurrent ? '1px solid rgba(0, 245, 212, 0.4)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: isCurrent ? '#00F5D4' : '#F8FAFC' }}>
                            {item.symbol}
                          </span>
                          {item.exchange && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>
                              {item.exchange}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                          {item.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge-neutral" style={{ fontSize: '0.65rem' }}>
                          {item.category || 'Stock'}
                        </span>
                        {isCurrent && <Check size={14} color="#00F5D4" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  No exact match found. Type any symbol like <code>TSLA</code>, <code>INFY.NS</code>, <code>GC=F</code> and press Enter!
                </div>
              )}
            </div>

            {/* Popular Quick Chips Footer */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.75rem', paddingTop: '0.6rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                ⚡ Trending Global Quick-Picks:
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['NVDA', 'BTC-USD', 'SPY', 'INFY.NS', 'PLTR', 'AAPL', 'GC=F', 'SAMPLE_BULL'].map((quickSym) => (
                  <span
                    key={quickSym}
                    onClick={() => handleSelect(quickSym)}
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      background: symbol === quickSym ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: symbol === quickSym ? '#00F5D4' : '#CBD5E1',
                      border: symbol === quickSym ? '1px solid #00F5D4' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {quickSym}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
