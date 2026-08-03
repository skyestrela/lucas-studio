/* Shared components for Maison Corval */
const { useState, useEffect, useMemo, useRef } = React;

// ---- Bottle (CSS-drawn placeholder) ----
function Bottle({ wine, size = 'md' }) {
  if (!wine) return null;
  const labelBgMap = {
    parchment: '#f3ede0',
    ivory: '#fbf6e6',
    mist: '#f4eee4',
    ochre: '#e8d49a',
    pearl: '#efe7d2',
    slate: '#d9d3c6',
    fern: '#e7ead0',
    rose: '#efd9d5'
  };
  return (
    <div className="bottle-stage" style={{ '--bottle-color': wine.color }}>
      <div className="bottle">
        <div className="foil" />
        <div className="neck" />
        <div className="shoulder" />
        <div className="body" />
        <div className="label" style={{ background: labelBgMap[wine.label] || '#f3ede0' }}>
          <div className="lcuvee">Maison Corval</div>
          <div className="lcrest" />
          <div className="lname">{wine.name}</div>
          <div className="lvin">{wine.vintage}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Logo ----
function Logo({ tone = 'ink' }) {
  const c = tone === 'cream' ? 'var(--cream)' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: c }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2 L22 14 C22 19 18 24 14 26 C10 24 6 19 6 14 Z" stroke={c} strokeWidth="1" fill="none"/>
        <circle cx="14" cy="14" r="3" stroke={c} strokeWidth="1" fill="none"/>
        <path d="M14 11 V17 M11 14 H17" stroke={c} strokeWidth="0.6"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>Maison Corval</span>
        <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 3, opacity: 0.6 }}>Négociant · est. 1894</span>
      </div>
    </div>
  );
}

// ---- Crest divider ----
function CrestDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--ink-mute)' }}>
      <div className="hair" style={{ flex: 1 }} />
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 0 L14 7 L7 14 L0 7 Z" stroke="currentColor" fill="none"/></svg>
      <div className="hair" style={{ flex: 1 }} />
    </div>
  );
}

// ---- Score crest ----
function ScoreCrest({ score, critic }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: '1px solid var(--gold)', padding: '6px 10px', color: 'var(--ink)' }}>
      <span className="serif" style={{ fontSize: 22, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{critic}</span>
    </div>
  );
}

// ---- Price ----
function Price({ amount }) {
  return <span>${amount.toFixed(2)}</span>;
}

// ---- Quantity stepper ----
function Qty({ value, onChange, min = 1, max = 24 }) {
  return (
    <div className="qty">
      <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="val mono">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

// ---- Toast ----
function Toast({ message, onDone }) {
  useEffect(() => { if (message) { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); } }, [message]);
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--cream)', padding: '14px 22px',
      fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
      zIndex: 200, boxShadow: '0 12px 30px rgba(20,16,14,0.3)'
    }} className="fade-in">{message}</div>
  );
}

// ---- Tasting bar ----
function TasteBar({ label, value }) {
  return (
    <div className="wheel-row">
      <span className="lab">{label}</span>
      <div className="bar" style={{ '--w': `${value}%` }} />
    </div>
  );
}

Object.assign(window, { Bottle, Logo, CrestDivider, ScoreCrest, Price, Qty, Toast, TasteBar });
