/**
 * Currency utility for intelligent detection between Indian Rupee (₹) and US Dollar ($).
 * Automatically detects Indian market equities (NSE .NS, BSE .BO, NIFTY, SENSEX, INR)
 * and allows manual user currency toggling.
 */

export function getCurrencySymbol(ticker = '', currencyPreference = 'auto') {
  if (currencyPreference === 'INR' || currencyPreference === '₹') return '₹';
  if (currencyPreference === 'USD' || currencyPreference === '$') return '$';
  
  if (!ticker) return '$';
  const sym = String(ticker).toUpperCase();
  if (
    sym.endsWith('.NS') ||
    sym.endsWith('.BO') ||
    sym.startsWith('^NSE') ||
    sym.startsWith('^BSE') ||
    sym.includes('NIFTY') ||
    sym.includes('SENSEX') ||
    sym.includes('INR') ||
    sym.includes('MRF') ||
    sym.includes('RELIANCE') ||
    sym.includes('TCS') ||
    sym.includes('HDFC')
  ) {
    return '₹';
  }
  return '$';
}

export function formatPrice(value, ticker = '', currencyPreference = 'auto', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '---';
  const symbol = getCurrencySymbol(ticker, currencyPreference);
  const num = Number(value);
  const locale = symbol === '₹' ? 'en-IN' : 'en-US';
  const formattedNum = num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${symbol}${formattedNum}`;
}

export function formatCurrencyAmount(value, ticker = '', currencyPreference = 'auto', decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '---';
  const symbol = getCurrencySymbol(ticker, currencyPreference);
  const num = Number(value);
  const locale = symbol === '₹' ? 'en-IN' : 'en-US';
  const formattedNum = num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${symbol}${formattedNum}`;
}
