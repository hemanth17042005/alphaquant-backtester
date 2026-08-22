import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { testAlertWebhook } from '../services/api';

export default function AlertsConfigModal({
  isOpen,
  onClose,
  symbol = 'BTC-USD'
}) {
  const [platform, setPlatform] = useState('discord'); // 'discord' | 'telegram'
  const [destination, setDestination] = useState('');
  const [chatId, setChatId] = useState('');
  const [alertType, setAlertType] = useState('both');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleTestAlert = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      if (!destination.trim()) {
        throw new Error(`Please enter your ${platform === 'discord' ? 'Discord Webhook URL' : 'Telegram Bot Token'}.`);
      }
      if (platform === 'telegram' && !chatId.trim()) {
        throw new Error('Please enter your Telegram Chat ID.');
      }

      const res = await testAlertWebhook({
        platform,
        destination: destination.trim(),
        chat_id: chatId.trim() || null,
        symbol
      });

      setFeedback({ type: 'success', message: res.message || 'Test alert delivered successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to dispatch alert' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          background: '#0B0F19',
          border: '1px solid rgba(0, 187, 249, 0.4)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Header */}
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
              background: 'linear-gradient(135deg, #00BBF9, #9B5DE5)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: '#080B11'
            }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F8FAFC' }}>
                TRADE SIGNAL WEBHOOK ALERTS
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Receive instant notifications when AI forecasts or SMC strategies trigger.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTestAlert} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Platform Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
              SELECT ALERT DESTINATION:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPlatform('discord')}
                style={{
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: `1px solid ${platform === 'discord' ? '#00BBF9' : 'var(--border-subtle)'}`,
                  background: platform === 'discord' ? 'rgba(0, 187, 249, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: platform === 'discord' ? '#00BBF9' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🎮 Discord Webhook
              </button>

              <button
                type="button"
                onClick={() => setPlatform('telegram')}
                style={{
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: `1px solid ${platform === 'telegram' ? '#00F5D4' : 'var(--border-subtle)'}`,
                  background: platform === 'telegram' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: platform === 'telegram' ? '#00F5D4' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ✈️ Telegram Bot
              </button>
            </div>
          </div>

          {/* Webhook URL / Token */}
          {platform === 'discord' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
                DISCORD WEBHOOK URL:
              </label>
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                className="input-dark"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              />
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  TELEGRAM BOT TOKEN:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                  className="input-dark"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  TELEGRAM CHAT ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 987654321 or @your_channel"
                  className="input-dark"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  required
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                />
              </div>
            </>
          )}

          {/* Trigger Condition Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 700 }}>
              TRIGGER CONDITIONS:
            </label>
            <select
              className="input-dark"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              style={{ width: '100%', fontSize: '0.8rem' }}
            >
              <option value="both">All Signals (AI Forecast Breakouts & Strategy Orders)</option>
              <option value="ai_only">AI High-Conviction Breakouts Only (&gt;75% Conviction)</option>
              <option value="strategy_only">SMC Execution Orders Only (Entry / Stop / Target)</option>
            </select>
          </div>

          {/* Feedback */}
          {feedback && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: feedback.type === 'success' ? '#10B981' : '#EF4444',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', fontWeight: 800, fontSize: '0.82rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Dispatching Test...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Test Alert to {platform === 'discord' ? 'Discord' : 'Telegram'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
