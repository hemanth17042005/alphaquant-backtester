const API_BASE = '/api';

export async function fetchSymbols() {
  const res = await fetch(`${API_BASE}/symbols`);
  if (!res.ok) throw new Error('Failed to fetch symbols');
  return res.json();
}

export async function searchSymbols(query) {
  try {
    const res = await fetch(`${API_BASE}/symbols/search?q=${encodeURIComponent(query || '')}`);
    if (!res.ok) {
      // Fallback to POST if GET fails
      const postRes = await fetch(`${API_BASE}/symbols/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query || '' })
      });
      if (postRes.ok) return postRes.json();
      throw new Error(`Search error (HTTP ${res.status})`);
    }
    return res.json();
  } catch (err) {
    console.error('searchSymbols error:', err);
    return { query: query || '', results: [] };
  }
}

export async function fetchLiveQuote(symbol) {
  try {
    let res = await fetch(`${API_BASE}/quote/live?symbol=${encodeURIComponent(symbol || 'BTC-USD')}`);
    if (!res.ok) {
      res = await fetch(`${API_BASE}/quote/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol || 'BTC-USD' })
      });
    }
    if (res.ok) return await res.json();
    throw new Error(`Quote error (HTTP ${res.status})`);
  } catch (err) {
    console.error('fetchLiveQuote error:', err);
    return null;
  }
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/strategies/presets`);
  if (!res.ok) throw new Error('Failed to fetch strategy presets');
  return res.json();
}

export async function fetchMarketHistory(symbol, timeframe = '1d', period = '2y') {
  let res = await fetch(`${API_BASE}/data/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, timeframe, period })
  });
  if (!res.ok) {
    // Fallback to query parameter GET request
    res = await fetch(`${API_BASE}/data/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&period=${period}`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch history' }));
    throw new Error(err.detail || 'Failed to fetch history');
  }
  return res.json();
}

export async function runBacktest(backtestRequest) {
  const res = await fetch(`${API_BASE}/backtest/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backtestRequest)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Backtest failed' }));
    throw new Error(err.detail || 'Backtest failed');
  }
  return res.json();
}

export async function runPricePrediction(predictionRequest) {
  const res = await fetch(`${API_BASE}/predict/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(predictionRequest)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Price prediction failed' }));
    throw new Error(err.detail || 'Price prediction failed');
  }
  return res.json();
}

export async function runMonteCarlo(monteCarloRequest) {
  const res = await fetch(`${API_BASE}/backtest/monte-carlo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monteCarloRequest)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Monte Carlo simulation failed' }));
    throw new Error(err.detail || 'Monte Carlo failed');
  }
  return res.json();
}

export async function runOptimization(optimizeRequest) {
  const res = await fetch(`${API_BASE}/backtest/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optimizeRequest)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Optimization failed' }));
    throw new Error(err.detail || 'Optimization failed');
  }
  return res.json();
}

export async function uploadCustomCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/data/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function exportTradesCsv(trades) {
  const res = await fetch(`${API_BASE}/export/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trades)
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backtest_trades_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ----------------- PAPER TRADING CLIENT API -----------------

export async function fetchPaperPortfolio() {
  const res = await fetch(`${API_BASE}/paper/portfolio`);
  if (!res.ok) throw new Error('Failed to fetch paper portfolio');
  return res.json();
}

export async function submitPaperOrder(orderData) {
  const res = await fetch(`${API_BASE}/paper/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Order execution failed' }));
    throw new Error(err.detail || 'Order execution failed');
  }
  return res.json();
}

export async function closePaperPosition(positionId) {
  const res = await fetch(`${API_BASE}/paper/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position_id: positionId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to close position' }));
    throw new Error(err.detail || 'Failed to close position');
  }
  return res.json();
}

export async function resetPaperAccount(initialCapital = 100000) {
  const res = await fetch(`${API_BASE}/paper/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initial_capital: initialCapital })
  });
  if (!res.ok) throw new Error('Failed to reset account');
  return res.json();
}

// ----------------- AI MARKET SENTIMENT CLIENT API -----------------

export async function fetchMarketSentiment(symbol) {
  try {
    let res = await fetch(`${API_BASE}/sentiment/news?symbol=${encodeURIComponent(symbol || 'BTC-USD')}`);
    if (!res.ok) {
      res = await fetch(`${API_BASE}/sentiment/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol || 'BTC-USD' })
      });
    }
    if (res.ok) return await res.json();
    throw new Error(`Sentiment error (HTTP ${res.status})`);
  } catch (err) {
    console.error('fetchMarketSentiment error:', err);
    return null;
  }
}

// ----------------- TELEGRAM & DISCORD WEBHOOK ALERTS CLIENT API -----------------

export async function testAlertWebhook(alertData) {
  const res = await fetch(`${API_BASE}/alerts/webhook/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to deliver webhook alert' }));
    throw new Error(err.detail || 'Webhook dispatch failed');
  }
  return res.json();
}

// ----------------- MULTI-ASSET PORTFOLIO CLIENT API -----------------

export async function runMultiAssetPortfolio(portfolioData) {
  const res = await fetch(`${API_BASE}/portfolio/multi_asset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(portfolioData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Multi-asset portfolio simulation failed' }));
    throw new Error(err.detail || 'Portfolio backtest failed');
  }
  return res.json();
}

// ----------------- CUSTOM PYTHON STRATEGY CODE RUNNER CLIENT API -----------------

export async function runCustomStrategyCode(codeData) {
  const res = await fetch(`${API_BASE}/strategy/custom_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(codeData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Custom strategy execution failed' }));
    throw new Error(err.detail || 'Strategy execution failed');
  }
  return res.json();
}

export async function fetchStarterCodeTemplate() {
  const res = await fetch(`${API_BASE}/strategy/custom_code/template`);
  if (!res.ok) throw new Error('Failed to load starter code');
  return res.json();
}

// ----------------- USER AUTHENTICATION & EMAIL OTP CLIENT API -----------------

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function verifyEmailOtp(verifyData) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
    throw new Error(err.detail || 'Invalid or expired verification code');
  }
  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function resendOtp(email) {
  const res = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to resend code' }));
    throw new Error(err.detail || 'Failed to resend verification code');
  }
  return res.json();
}

export async function fetchCurrentUser(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    return null;
  }
}



