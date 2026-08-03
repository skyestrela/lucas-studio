// Currency module — exposes window.CURRENCY (state) + window.fmtPrice(n)
// Re-rendering is handled by keying App on currency so every $x is recomputed.

const CURRENCIES = {
  USD: { symbol: "$",  rate: 1.00, code: "USD", label: "US Dollar" },
  GBP: { symbol: "£",  rate: 0.79, code: "GBP", label: "British Pound" },
  EUR: { symbol: "€",  rate: 0.92, code: "EUR", label: "Euro" },
  INR: { symbol: "₹",  rate: 83.5, code: "INR", label: "Indian Rupee" },
  JPY: { symbol: "¥",  rate: 155,  code: "JPY", label: "Japanese Yen" },
};

window.CURRENCY = "USD";

function fmtPrice(usd, opts = {}) {
  const c = CURRENCIES[window.CURRENCY] || CURRENCIES.USD;
  const value = usd * c.rate;
  // JPY has no decimals
  const decimals = c.code === "JPY" || c.code === "INR" ? 0 : (opts.decimals ?? 2);
  const rounded = decimals === 0 ? Math.round(value) : value.toFixed(decimals);
  const display = decimals === 0
    ? Number(rounded).toLocaleString()
    : Number(rounded).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return c.symbol + display;
}

Object.assign(window, { CURRENCIES, fmtPrice });
