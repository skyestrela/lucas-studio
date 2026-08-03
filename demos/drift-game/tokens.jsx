// tokens.jsx — Design tokens + low-level primitives for Drift
// Clean fintech aesthetic: warm off-white, near-black ink, one green accent,
// muted red for losses. Geist (sans) + Geist Mono (numbers).

// ── PALETTES ───────────────────────────────────────────────────────────────
// Each palette: bg / surface / ink / muted / hairline / up / down
const PALETTES = {
  paper: {
    bg: 'oklch(0.98 0.004 80)',
    surface: '#ffffff',
    surfaceAlt: 'oklch(0.965 0.005 80)',
    ink: 'oklch(0.18 0.008 80)',
    inkSoft: 'oklch(0.32 0.008 80)',
    muted: 'oklch(0.55 0.01 80)',
    faint: 'oklch(0.78 0.008 80)',
    hairline: 'oklch(0.92 0.004 80)',
    up: 'oklch(0.62 0.16 145)',
    upSoft: 'oklch(0.94 0.04 145)',
    down: 'oklch(0.58 0.18 25)',
    downSoft: 'oklch(0.94 0.05 25)',
    accent: 'oklch(0.18 0.008 80)',
  },
  graphite: {
    bg: 'oklch(0.16 0.004 260)',
    surface: 'oklch(0.20 0.006 260)',
    surfaceAlt: 'oklch(0.23 0.006 260)',
    ink: 'oklch(0.97 0.004 260)',
    inkSoft: 'oklch(0.82 0.005 260)',
    muted: 'oklch(0.62 0.008 260)',
    faint: 'oklch(0.40 0.008 260)',
    hairline: 'oklch(0.30 0.006 260)',
    up: 'oklch(0.72 0.18 145)',
    upSoft: 'oklch(0.30 0.06 145)',
    down: 'oklch(0.68 0.20 25)',
    downSoft: 'oklch(0.30 0.08 25)',
    accent: 'oklch(0.97 0.004 260)',
  },
  sage: {
    bg: 'oklch(0.97 0.012 150)',
    surface: '#ffffff',
    surfaceAlt: 'oklch(0.955 0.014 150)',
    ink: 'oklch(0.20 0.02 150)',
    inkSoft: 'oklch(0.34 0.018 150)',
    muted: 'oklch(0.55 0.015 150)',
    faint: 'oklch(0.78 0.012 150)',
    hairline: 'oklch(0.91 0.014 150)',
    up: 'oklch(0.58 0.14 150)',
    upSoft: 'oklch(0.93 0.04 150)',
    down: 'oklch(0.58 0.16 30)',
    downSoft: 'oklch(0.94 0.05 30)',
    accent: 'oklch(0.30 0.05 150)',
  },
};

function usePalette(name) {
  return PALETTES[name] || PALETTES.paper;
}

// ── TYPE ───────────────────────────────────────────────────────────────────
const SANS = '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif';
const MONO = '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';

// ── PRIMITIVES ─────────────────────────────────────────────────────────────

// Money — mono, tabular, with sign + currency
function Money({ value, currency = 'USD', signed = false, decimals = 2, size = 14, color, weight = 500, prefix }) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value);
  const symbol = currency === 'USD' ? '$' : currency === 'USDC' ? '' : '';
  const suffix = currency === 'USDC' ? ' USDC' : '';
  return (
    <span style={{
      fontFamily: MONO, fontSize: size, fontWeight: weight,
      fontVariantNumeric: 'tabular-nums', color,
      whiteSpace: 'nowrap',
    }}>
      {prefix}
      {signed && sign}{symbol}{abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// Num — generic mono number
function Num({ value, decimals = 2, size = 14, color, weight = 500, suffix = '' }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: size, fontWeight: weight,
      fontVariantNumeric: 'tabular-nums', color, whiteSpace: 'nowrap',
    }}>
      {Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// Pill — small chip with optional dot
function Pill({ children, dot, bg, color, border, size = 11 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: SANS, fontSize: size, fontWeight: 500,
      padding: '3px 8px', borderRadius: 999,
      background: bg, color, border: border ? `1px solid ${border}` : 'none',
      letterSpacing: 0.1,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

// Button — primary / secondary / ghost
function Btn({ children, onClick, kind = 'primary', size = 'md', full, disabled, style, c }) {
  const palette = c; // pass current palette in
  const heights = { sm: 32, md: 40, lg: 48 };
  const fonts = { sm: 13, md: 14, lg: 15 };
  const h = heights[size], fs = fonts[size];
  const styles = {
    primary: { background: palette.ink, color: palette.surface, border: 'none' },
    secondary: { background: palette.surfaceAlt, color: palette.ink, border: `1px solid ${palette.hairline}` },
    ghost: { background: 'transparent', color: palette.ink, border: 'none' },
    danger: { background: palette.down, color: '#fff', border: 'none' },
    up: { background: palette.up, color: '#fff', border: 'none' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        height: h, padding: `0 ${size === 'sm' ? 12 : 18}px`, borderRadius: 10,
        fontFamily: SANS, fontSize: fs, fontWeight: 600,
        letterSpacing: -0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : undefined,
        transition: 'transform .08s, opacity .12s, background .12s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...styles[kind],
        ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.985)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
    >
      {children}
    </button>
  );
}

// Card — subtle surface
function Card({ children, c, style, pad = 16 }) {
  return (
    <div style={{
      background: c.surface,
      border: `1px solid ${c.hairline}`,
      borderRadius: 14,
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

// Divider hairline
function Hr({ c, style }) {
  return <div style={{ height: 1, background: c.hairline, ...style }} />;
}

// Section header
function SectionLabel({ children, c, style }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.6, textTransform: 'uppercase',
      color: c.muted, ...style,
    }}>{children}</div>
  );
}

// Mono hash — for fairness display
function Hash({ value, short = true, color, size = 11 }) {
  const display = short ? value.slice(0, 6) + '…' + value.slice(-4) : value;
  return (
    <span style={{
      fontFamily: MONO, fontSize: size, color,
      letterSpacing: 0.1, fontFeatureSettings: '"tnum"',
    }}>{display}</span>
  );
}

// Drift logo mark — a single drifting line abstracted to ~16px
function DriftMark({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 14 Q5 6 8 11 T 14 10 T 22 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="2.2" fill={color} />
    </svg>
  );
}

Object.assign(window, {
  PALETTES, usePalette, SANS, MONO,
  Money, Num, Pill, Btn, Card, Hr, SectionLabel, Hash, DriftMark,
});
