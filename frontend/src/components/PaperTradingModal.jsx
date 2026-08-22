import React, { useState, useEffect } from 'react';
import {
  Gamepad2, TrendingUp, TrendingDown, DollarSign, RefreshCw, X,
  ShieldCheck, AlertCircle, CheckCircle2, Trash2, ArrowUpRight, ArrowDownRight,
  Layers, Clock, Zap
} from 'lucide-react';
import SymbolSearchSelector from './SymbolSearchSelector';
import LivePriceTickerCard from './LivePriceTickerCard';
import { fetchPaperPortfolio, submitPaperOrder, closePaperPosition, resetPaperAccount } from '../services/api';
import { getCurrencySymbol, formatPrice } from '../services/currency';

export default function PaperTradingModal({
  isOpen,
  onClose,
  initialSymbol = 'BTC-USD',
  currencyPreference = 'auto'
}) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'history'

  // Order Ticket State
  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT'
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const currSym = getCurrencySymbol(symbol, currencyPreference);

  useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol);
  }, [initialSymbol]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await fetchPaperPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching paper portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPortfolio();
      const interval = setInterval(loadPortfolio, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setOrderSubmitting(true);
    try {
      const qtyNum = parseFloat(quantity);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        throw new Error('Please enter a valid positive quantity.');
      }

      const res = await submitPaperOrder({
        symbol,
        side,
        order_type: orderType,
        quantity: qtyNum,
        limit_price: limitPrice ? parseFloat(limitPrice) : null,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null
      });

      setFeedback({ type: 'success', message: res.message || 'Order executed successfully!' });
      setPortfolio(res.portfolio);
      // Reset inputs
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Order failed' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleClosePosition = async (posId) => {
    setFeedback(null);
    try {
      const res = await closePaperPosition(posId);
      setFeedback({ type: 'success', message: res.message });
      setPortfolio(res.portfolio);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to close position' });
    }
  };

  const handleResetAccount = async () => {
    if (!window.confirm('Reset virtual paper trading portfolio back to $100,000 / ₹10,00,000?')) return;
    setFeedback(null);
    try {
      const isINR = currSym === '₹';
      const cap = isINR ? 1000000 : 100000;
      const res = await resetPaperAccount(cap);
      setPortfolio(res.portfolio);
      setFeedback({ type: 'success', message: 'Paper trading account reset successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Reset failed' });
    }
  };

  const cash = portfolio?.cash ?? 100000;
  const equity = portfolio?.equity ?? 100000;
  const unrealizedPnL = portfolio?.unrealized_pnl ?? 0;
  const realizedPnL = portfolio?.realized_pnl ?? 0;
  const totalPnL = portfolio?.total_pnl ?? 0;
  const isProfit = totalPnL >= 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          background: '#0B0F19',
          border: '1px solid rgba(0, 245, 212, 0.35)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00F5D4, #00BBF9)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: '#080B11'
            }}>
              <Gamepad2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F8FAFC' }}>
                  LIVE PAPER TRADING SIMULATOR
                </h3>
                <span className="badge-bull" style={{ fontSize: '0.68rem' }}>ZERO-RISK LIVE FEED</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Execute virtual market and limit orders against real-time live stock prices with mark-to-market PnL.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleResetAccount}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Reset Virtual Funds"
            >
              Reset Funds
            </button>

            <button
              type="button"
              onClick={loadPortfolio}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
              title="Refresh Portfolio Mark-to-Market"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Portfolio Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>VIRTUAL EQUITY</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900, color: '#00F5D4' }}>
              {formatPrice(equity, symbol, currencyPreference, 2)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>AVAILABLE CASH</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC' }}>
              {formatPrice(cash, symbol, currencyPreference, 2)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>UNREALIZED PnL</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: unrealizedPnL >= 0 ? '#10B981' : '#EF4444' }}>
              {unrealizedPnL >= 0 ? '+' : ''}{formatPrice(unrealizedPnL, symbol, currencyPreference, 2)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>TOTAL NET RETURN</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: isProfit ? '#10B981' : '#EF4444' }}>
              {isProfit ? '+' : ''}{portfolio?.total_pnl_pct ?? 0}% ({formatPrice(totalPnL, symbol, currencyPreference, 2)})
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div style={{
            margin: '0.75rem 1.5rem 0',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: feedback.type === 'success' ? '#10B981' : '#EF4444',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Content: Dual-Column Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 340px) 1fr',
          gap: '1.25rem',
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Left Column: Order Ticket */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F8FAFC' }}>ORDER TICKET</h4>
              <span className="badge-neutral" style={{ fontSize: '0.68rem' }}>SIMULATED BROKER</span>
            </div>

            {/* Asset Selector & Live Quote */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
                SELECT TRADING ASSET:
              </label>
              <div style={{ position: 'relative', zIndex: 100 }}>
                <SymbolSearchSelector symbol={symbol} setSymbol={setSymbol} />
              </div>
              <div style={{ marginTop: '0.45rem' }}>
                <LivePriceTickerCard symbol={symbol} currencyPreference={currencyPreference} compact={true} />
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Buy (Long) / Sell (Short) Switch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  style={{
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: side === 'BUY' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                    color: side === 'BUY' ? '#080B11' : 'var(--text-muted)',
                    boxShadow: side === 'BUY' ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ▲ BUY / LONG
                </button>

                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  style={{
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: side === 'SELL' ? '#EF4444' : 'rgba(255, 255, 255, 0.05)',
                    color: side === 'SELL' ? '#FFFFFF' : 'var(--text-muted)',
                    boxShadow: side === 'SELL' ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ▼ SELL / SHORT
                </button>
              </div>

              {/* Order Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 700 }}>
                    ORDER TYPE:
                  </label>
                  <select
                    className="input-dark"
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    style={{ width: '100%', fontSize: '0.78rem' }}
                  >
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 700 }}>
                    SHARES / CONTRACTS:
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    className="input-dark"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Limit Price Input if Limit Order */}
              {orderType === 'LIMIT' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 700 }}>
                    LIMIT PRICE ({currSym}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 375.00"
                    className="input-dark"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              )}

              {/* Optional Stop Loss & Take Profit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 700 }}>
                    STOP LOSS ({currSym}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Optional"
                    className="input-dark"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 700 }}>
                    TAKE PROFIT ({currSym}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Optional"
                    className="input-dark"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={orderSubmitting}
                className={side === 'BUY' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  width: '100%',
                  marginTop: '0.4rem',
                  padding: '0.65rem',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  justifyContent: 'center',
                  background: side === 'SELL' ? 'linear-gradient(135deg, #EF4444, #F15BB5)' : undefined,
                  color: side === 'SELL' ? '#FFFFFF' : undefined,
                  borderColor: side === 'SELL' ? '#EF4444' : undefined
                }}
              >
                {orderSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <span>SUBMIT VIRTUAL {side} ORDER</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Positions & History Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                className={`nav-tab ${activeTab === 'positions' ? 'active' : ''}`}
                onClick={() => setActiveTab('positions')}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <Layers size={14} />
                <span>Open Positions ({portfolio?.positions?.length || 0})</span>
              </button>

              <button
                type="button"
                className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <Clock size={14} />
                <span>Trade History ({portfolio?.history?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Open Positions Table */}
            {activeTab === 'positions' && (
              <div style={{ overflowX: 'auto' }}>
                {(portfolio?.positions || []).length === 0 ? (
                  <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-subtle)'
                  }}>
                    <Gamepad2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.84rem' }}>No open virtual positions.</p>
                    <p style={{ fontSize: '0.74rem', marginTop: '0.2rem' }}>Use the order ticket on the left to place your first trade!</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '0.55rem 0.65rem' }}>ASSET</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>SIDE</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>QTY</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>ENTRY</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>CURRENT</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>UNREALIZED PnL</th>
                        <th style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(portfolio?.positions || []).map((pos) => {
                        const isPosProfit = (pos.unrealized_pnl || 0) >= 0;
                        return (
                          <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '0.55rem 0.65rem', fontWeight: 700, color: '#F8FAFC' }}>
                              {pos.symbol}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: pos.side === 'BUY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: pos.side === 'BUY' ? '#10B981' : '#EF4444'
                              }}>
                                {pos.side}
                              </span>
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {pos.quantity}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {formatPrice(pos.entry_price, pos.symbol, currencyPreference, 2)}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)', color: '#00F5D4' }}>
                              {formatPrice(pos.current_price, pos.symbol, currencyPreference, 2)}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isPosProfit ? '#10B981' : '#EF4444' }}>
                              {isPosProfit ? '+' : ''}{formatPrice(pos.unrealized_pnl, pos.symbol, currencyPreference, 2)} ({isPosProfit ? '+' : ''}{pos.unrealized_pnl_pct}%)
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleClosePosition(pos.id)}
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              >
                                Close Position
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab 2: Trade History Ledger */}
            {activeTab === 'history' && (
              <div style={{ overflowX: 'auto' }}>
                {(portfolio?.history || []).length === 0 ? (
                  <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '8px'
                  }}>
                    <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.84rem' }}>No closed trades in history yet.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '0.55rem 0.65rem' }}>TIME</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>ASSET</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>SIDE</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>QTY</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>ENTRY</th>
                        <th style={{ padding: '0.55rem 0.65rem' }}>EXIT</th>
                        <th style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>REALIZED PnL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(portfolio?.history || [])].reverse().map((trade, idx) => {
                        const isTradeProfit = (trade.realized_pnl || 0) >= 0;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '0.55rem 0.65rem', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                              {trade.closed_at?.slice(11, 19) || '---'}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontWeight: 700, color: '#F8FAFC' }}>
                              {trade.symbol}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: trade.side === 'BUY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: trade.side === 'BUY' ? '#10B981' : '#EF4444'
                              }}>
                                {trade.side}
                              </span>
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {trade.quantity}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {formatPrice(trade.entry_price, trade.symbol, currencyPreference, 2)}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {formatPrice(trade.exit_price, trade.symbol, currencyPreference, 2)}
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isTradeProfit ? '#10B981' : '#EF4444' }}>
                              {isTradeProfit ? '+' : ''}{formatPrice(trade.realized_pnl, trade.symbol, currencyPreference, 2)} ({isTradeProfit ? '+' : ''}{trade.realized_pnl_pct}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
