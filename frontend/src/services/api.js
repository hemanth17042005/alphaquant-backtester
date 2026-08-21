const API_BASE = '/api';

export async function fetchSymbols() {
  const res = await fetch(`${API_BASE}/symbols`);
  if (!res.ok) throw new Error('Failed to fetch symbols');
  return res.json();
}

export async function searchSymbols(query) {
  const res = await fetch(`${API_BASE}/symbols/search?q=${encodeURIComponent(query || '')}`);
  if (!res.ok) throw new Error('Failed to search symbols');
  return res.json();
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/strategies/presets`);
  if (!res.ok) throw new Error('Failed to fetch strategy presets');
  return res.json();
}

export async function fetchMarketHistory(symbol, timeframe = '1d', period = '2y') {
  const res = await fetch(`${API_BASE}/data/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&period=${period}`, {
    method: 'POST'
  });
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
