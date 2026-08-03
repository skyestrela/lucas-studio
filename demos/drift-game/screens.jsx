// screens.jsx — Drift screen components (composable for mobile + desktop)
// Every screen reads from useDrift() context. Layout is responsive within
// the bounds the shell gives it.

// ── shared icons ──────────────────────────────────────────────────────────
const Icon = {
  chart: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 18 18" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 L6 8 L9 10 L13 5 L16 7"/></svg>,
  grid: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 18 18" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="10" y="2" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/></svg>,
  wallet: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 18 18" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6 a2 2 0 0 1 2-2 h10 a2 2 0 0 1 2 2 v6 a2 2 0 0 1-2 2 h-10 a2 2 0 0 1-2-2 z"/><path d="M2 7 h14"/><circle cx="13" cy="11" r="1" fill={p.c||'currentColor'}/></svg>,
  trophy: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 18 18" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3 h8 v4 a4 4 0 0 1-8 0 z"/><path d="M5 4 H3 v1 a2 2 0 0 0 2 2"/><path d="M13 4 h2 v1 a2 2 0 0 1-2 2"/><path d="M7 12 h4 v2 H7z"/><path d="M6 14 h6"/></svg>,
  profile: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 18 18" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3"/><path d="M3 16 a6 6 0 0 1 12 0"/></svg>,
  lock: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="8" height="6" rx="1"/><path d="M5 6 V4 a2 2 0 0 1 4 0 V6"/></svg>,
  check: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L6 10.5 L11 4"/></svg>,
  up: (p) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 12 12" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8 L6 4 L9 8"/></svg>,
  down: (p) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 12 12" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4 L6 8 L9 4"/></svg>,
  fairness: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1 L12 3 V7 a5 5 0 0 1-5 5 a5 5 0 0 1-5-5 V3 z"/><path d="M4.5 7 L6.5 9 L9.5 5.5"/></svg>,
  arrow: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7 H11 M8 4 L11 7 L8 10"/></svg>,
  plus: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M7 3 V11 M3 7 H11"/></svg>,
  minus: (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 14 14" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M3 7 H11"/></svg>,
};

// ── DriftChart ────────────────────────────────────────────────────────────
// The signature element. Renders:
//   • dotted base line at 100
//   • light grid + Y labels
//   • drift line (grows in real time during drift phase)
//   • anchors at their Y levels — user anchor highlighted
//   • during OPEN phase: a draggable target indicator at proposedLevel
//   • during SETTLE: final value indicator + payout shimmer
function DriftChart({
  c, height = 280, width = 360, density = 'standard',
  proposedLevel, onProposeLevel,
  showAxisLabels = true,
}) {
  const d = useDrift();
  const { round, visibleSeries, lastV, allAnchors, ROUND_BASE_VALUE, ROUND_RANGE } = d;
  const padL = 16, padR = density === 'minimal' ? 16 : 54, padT = 12, padB = 12;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMin = ROUND_BASE_VALUE - ROUND_RANGE;
  const yMax = ROUND_BASE_VALUE + ROUND_RANGE;
  const y2px = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const x2px = (t) => padL + t * plotW;
  const px2y = (py) => yMax - ((py - padT) / plotH) * (yMax - yMin);

  // Build SVG path for drift line
  const pathD = React.useMemo(() => {
    if (!visibleSeries.length) return '';
    return visibleSeries.map((s, i) => `${i === 0 ? 'M' : 'L'}${x2px(s.t).toFixed(2)},${y2px(s.v).toFixed(2)}`).join(' ');
  }, [visibleSeries.length, round.id]);

  // Axis tick values
  const ticks = [88, 92, 96, 100, 104, 108, 112].filter((v) => v >= yMin && v <= yMax);

  // Drag handle for proposed level (open phase only)
  const dragging = React.useRef(false);
  const svgRef = React.useRef(null);
  const isOpen = round.phase === 'open' && !round.userAnchor;

  const onPointer = (e) => {
    if (!isOpen || !onProposeLevel) return;
    const rect = svgRef.current.getBoundingClientRect();
    const py = (e.clientY - rect.top) * (height / rect.height);
    let v = px2y(py);
    v = Math.max(yMin + 0.5, Math.min(yMax - 0.5, v));
    onProposeLevel(parseFloat(v.toFixed(2)));
  };

  // Color for the drift line tip — green if above base, red below
  const tipColor = lastV >= ROUND_BASE_VALUE ? c.up : c.down;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        width={width} height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', cursor: isOpen ? 'crosshair' : 'default', touchAction: 'none' }}
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); onPointer(e); }}
        onPointerMove={(e) => { if (dragging.current) onPointer(e); }}
        onPointerUp={(e) => { dragging.current = false; }}
      >
        {/* faint vertical column for elapsed drift */}
        {round.phase === 'drift' && visibleSeries.length > 0 && (
          <rect x={padL} y={padT}
            width={x2px(visibleSeries[visibleSeries.length - 1].t) - padL} height={plotH}
            fill={c.surfaceAlt} opacity="0.5" />
        )}

        {/* Y axis grid */}
        {ticks.map((v) => {
          const isBase = v === ROUND_BASE_VALUE;
          return (
            <g key={v}>
              <line x1={padL} x2={width - padR} y1={y2px(v)} y2={y2px(v)}
                stroke={c.hairline}
                strokeWidth={isBase ? 1 : 0.5}
                strokeDasharray={isBase ? '' : '2 4'} />
              {showAxisLabels && (
                <text x={width - padR + 8} y={y2px(v) + 4}
                  fontFamily="Geist Mono" fontSize="10" fill={isBase ? c.inkSoft : c.muted}
                  fontWeight={isBase ? 600 : 400}>
                  {v.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        {/* Bot anchors — small horizontal ticks across the plot at each level */}
        {allAnchors.filter((a) => a.id !== 'user').map((a) => {
          const y = y2px(a.level);
          const size = Math.min(18, 6 + a.stake / 10);
          return (
            <g key={a.id} opacity="0.55">
              <line x1={padL} x2={width - padR} y1={y} y2={y}
                stroke={c.faint} strokeWidth="0.5" strokeDasharray="1 3" />
              <circle cx={width - padR - 6} cy={y} r={size / 4 + 2}
                fill={c.surface} stroke={c.muted} strokeWidth="1" />
            </g>
          );
        })}

        {/* User anchor — prominent */}
        {round.userAnchor && (() => {
          const y = y2px(round.userAnchor.level);
          return (
            <g>
              <line x1={padL} x2={width - padR} y1={y} y2={y}
                stroke={c.accent} strokeWidth="1.2" strokeDasharray="4 3" />
              <rect x={padL - 2} y={y - 9} width={56} height={18} rx={4}
                fill={c.ink} />
              <text x={padL + 26} y={y + 4} textAnchor="middle"
                fontFamily="Geist Mono" fontSize="11" fontWeight="600" fill={c.surface}>
                ${round.userAnchor.stake} @ {round.userAnchor.level.toFixed(2)}
              </text>
            </g>
          );
        })()}

        {/* Proposed level indicator (open phase) */}
        {isOpen && proposedLevel != null && (() => {
          const y = y2px(proposedLevel);
          return (
            <g>
              <line x1={padL} x2={width - padR} y1={y} y2={y}
                stroke={c.ink} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
              <circle cx={width - padR - 6} cy={y} r="5" fill={c.ink} />
              <circle cx={width - padR - 6} cy={y} r="5" fill="none" stroke={c.ink} strokeWidth="6" opacity="0.15" />
            </g>
          );
        })()}

        {/* Drift line */}
        {pathD && (
          <>
            <path d={pathD} fill="none" stroke={c.ink} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />
            {/* leading tip */}
            {visibleSeries.length > 0 && (() => {
              const last = visibleSeries[visibleSeries.length - 1];
              const cx = x2px(last.t), cy = y2px(last.v);
              const isLive = round.phase === 'drift';
              return (
                <g>
                  {isLive && <circle cx={cx} cy={cy} r="6" fill={tipColor} opacity="0.18">
                    <animate attributeName="r" values="6;11;6" dur="1.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.18;0;0.18" dur="1.4s" repeatCount="indefinite" />
                  </circle>}
                  <circle cx={cx} cy={cy} r="3.5" fill={tipColor} stroke={c.surface} strokeWidth="1.5" />
                </g>
              );
            })()}
          </>
        )}

        {/* SETTLE phase: highlight final value */}
        {round.phase === 'settle' && (() => {
          const cy = y2px(round.finalValue);
          return (
            <g>
              <line x1={padL} x2={width - padR} y1={cy} y2={cy}
                stroke={tipColor} strokeWidth="1.2" strokeDasharray="4 3" />
              <rect x={width - padR - 64} y={cy - 10} width={56} height={20} rx={4}
                fill={tipColor} />
              <text x={width - padR - 36} y={cy + 4} textAnchor="middle"
                fontFamily="Geist Mono" fontSize="11" fontWeight="700" fill="#fff">
                {round.finalValue.toFixed(2)}
              </text>
            </g>
          );
        })()}

        {/* OPEN phase empty-state hint */}
        {round.phase === 'open' && visibleSeries.length === 0 && (
          <text x={padL + plotW / 2} y={padT + plotH / 2}
            textAnchor="middle" fontFamily="Geist" fontSize="11" fill={c.muted}>
            {round.userAnchor ? 'Waiting for round to start drift…' : 'Tap or drag the chart to set your anchor'}
          </text>
        )}
      </svg>
    </div>
  );
}

// ── PhaseStrip ────────────────────────────────────────────────────────────
// Round meta header: round id, phase chip, countdown bar
function PhaseStrip({ c, compact }) {
  const { round, phaseRemainingMs, phaseProgress } = useDrift();
  const phaseLabel = {
    open: 'OPEN · place your anchor',
    drift: 'DRIFT · live',
    settle: 'SETTLED',
  }[round.phase];
  const phaseColor = {
    open: c.up,
    drift: c.ink,
    settle: c.muted,
  }[round.phase];
  const sec = (phaseRemainingMs / 1000).toFixed(1);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill dot={phaseColor} bg={c.surfaceAlt} color={c.inkSoft}>{phaseLabel}</Pill>
          {!compact && <span style={{ fontFamily: MONO, fontSize: 11, color: c.muted }}>
            #{round.id}
          </span>}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: c.ink, fontVariantNumeric: 'tabular-nums' }}>
          {sec}s
        </span>
      </div>
      <div style={{ height: 2, background: c.hairline, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(1 - phaseProgress) * 100}%`,
          background: phaseColor,
          transition: round.phase === 'drift' ? 'none' : 'width 100ms linear',
        }} />
      </div>
    </div>
  );
}

// ── AnchorList ────────────────────────────────────────────────────────────
function AnchorList({ c, max = 6 }) {
  const { allAnchors, round } = useDrift();
  const sorted = [...allAnchors].sort((a, b) => b.stake - a.stake).slice(0, max);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sorted.map((a, i) => {
        const isMe = a.id === 'user';
        return (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: isMe ? c.surfaceAlt : 'transparent',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: isMe ? c.ink : c.surfaceAlt,
              color: isMe ? c.surface : c.inkSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              border: isMe ? 'none' : `1px solid ${c.hairline}`,
            }}>{(a.name || '?').slice(0, 2).toUpperCase()}</div>
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: c.ink, fontWeight: isMe ? 600 : 400 }}>
              {isMe ? 'You' : a.name}
            </span>
            <Num value={a.level} decimals={2} size={12} color={c.muted} weight={400} />
            <Money value={a.stake} size={12} color={c.ink} decimals={0} />
          </div>
        );
      })}
    </div>
  );
}

// ── FairnessBlock ────────────────────────────────────────────────────────
function FairnessBlock({ c }) {
  const { round } = useDrift();
  const revealed = round.phase === 'settle';
  return (
    <div style={{
      padding: 12, borderRadius: 10,
      background: c.surfaceAlt, border: `1px solid ${c.hairline}`,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon.fairness c={c.up} size={12} />
        <SectionLabel c={c} style={{ fontSize: 10 }}>Provably fair</SectionLabel>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SANS, fontSize: 11, color: c.muted }}>Commit hash</span>
        <Hash value={round.hash} color={c.inkSoft} size={11} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SANS, fontSize: 11, color: c.muted }}>Seed</span>
        {revealed
          ? <Hash value={'0x' + (round.seed >>> 0).toString(16).padStart(8, '0')} short={false} color={c.up} size={11} />
          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: SANS, fontSize: 11, color: c.muted }}>
              <Icon.lock c={c.muted} size={11} /> revealed at settle
            </span>
        }
      </div>
    </div>
  );
}

// ── StakeRow ──────────────────────────────────────────────────────────────
function StakeRow({ c, value, onChange, presets = [5, 25, 100], max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel c={c}>Stake</SectionLabel>
        <Money value={value} size={18} weight={600} color={c.ink} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {presets.map((p) => {
          const active = p === value;
          return (
            <button key={p} onClick={() => onChange(p)}
              style={{
                flex: 1, height: 36, borderRadius: 8,
                border: `1px solid ${active ? c.ink : c.hairline}`,
                background: active ? c.ink : c.surface,
                color: active ? c.surface : c.ink,
                fontFamily: MONO, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all .12s',
              }}>${p}</button>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${c.hairline}`, borderRadius: 8, padding: '0 4px 0 8px', height: 36 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: c.muted }}>$</span>
          <input
            type="number" value={value} min={1} max={max} step={1}
            onChange={(e) => onChange(Math.max(1, Math.min(max || 9999, Number(e.target.value) || 0)))}
            style={{
              width: 50, height: '100%', border: 'none', outline: 'none',
              background: 'transparent', textAlign: 'right',
              fontFamily: MONO, fontSize: 13, fontWeight: 600, color: c.ink,
              fontVariantNumeric: 'tabular-nums',
            }} />
        </div>
      </div>
    </div>
  );
}

// ── ResultsCard ───────────────────────────────────────────────────────────
function ResultsCard({ c }) {
  const { round } = useDrift();
  if (round.phase !== 'settle' || !round.userAnchor) {
    if (round.phase === 'settle') {
      return (
        <Card c={c} pad={14}>
          <SectionLabel c={c} style={{ marginBottom: 6 }}>Round closed</SectionLabel>
          <div style={{ fontFamily: SANS, fontSize: 13, color: c.muted, lineHeight: 1.5 }}>
            You didn't place an anchor in this round. Next round opens in {(round.phaseStartedAt + 2000 - performance.now()) / 1000 > 0 ? Math.ceil((round.phaseStartedAt + 2000 - performance.now()) / 1000) : 0}s.
          </div>
        </Card>
      );
    }
    return null;
  }
  const r = round.userResult;
  const won = r && r.net > 0;
  return (
    <Card c={c} pad={14} style={{ background: won ? c.upSoft : c.downSoft, borderColor: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: won ? c.up : c.down, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {won ? 'You won' : 'Round settled'}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: c.muted }}>#{round.id}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft }}>Your anchor</span>
        <Num value={round.userAnchor.level} size={14} color={c.ink} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft }}>Final value</span>
        <Num value={round.finalValue} size={14} color={c.ink} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft }}>Distance</span>
        <Num value={Math.abs(round.userAnchor.level - round.finalValue)} size={14} color={c.ink} />
      </div>
      <Hr c={c} style={{ margin: '10px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft }}>Payout</span>
        <Money value={r.share} size={16} color={c.ink} weight={600} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: c.ink }}>Net</span>
        <Money value={r.net} size={18} signed color={won ? c.up : c.down} weight={700} />
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FULL SCREENS
// ─────────────────────────────────────────────────────────────────────────

// LiveGame (mobile-form)
function LiveGameScreen({ c, density = 'standard', presets = [5, 25, 100], width }) {
  const d = useDrift();
  const { round, wallet, placeAnchor, pool, allAnchors, ROUND_BASE_VALUE } = d;
  const [proposed, setProposed] = React.useState(ROUND_BASE_VALUE);
  const [stake, setStake] = React.useState(presets[1] || 25);

  // Reset proposed on new round
  React.useEffect(() => {
    setProposed(ROUND_BASE_VALUE + (Math.random() - 0.5) * 4);
  }, [round.id]);

  const place = () => {
    if (round.userAnchor) return;
    placeAnchor(proposed, stake);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 16px 20px' }}>
      <PhaseStrip c={c} compact={density === 'minimal'} />

      <div style={{ margin: '0 -16px' }}>
        <DriftChart c={c} width={width} height={density === 'minimal' ? 240 : 290}
          density={density}
          proposedLevel={proposed} onProposeLevel={setProposed} />
      </div>

      {/* Pool / players */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>Pool</SectionLabel>
          <Money value={pool} size={20} color={c.ink} weight={600} />
        </Card>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>Players</SectionLabel>
          <Num value={allAnchors.length} size={20} color={c.ink} weight={600} decimals={0} />
        </Card>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>House</SectionLabel>
          <Num value={3} size={20} color={c.muted} weight={600} decimals={0} suffix="%" />
        </Card>
      </div>

      {/* Phase-specific action */}
      {round.phase === 'open' && !round.userAnchor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SectionLabel c={c}>Anchor at</SectionLabel>
            <Num value={proposed} size={22} weight={600} color={c.ink} />
          </div>
          <StakeRow c={c} value={stake} onChange={setStake} presets={presets} max={Math.floor(wallet.usd)} />
          <Btn c={c} kind="primary" size="lg" full onClick={place}
            disabled={stake > wallet.usd || stake < 1}>
            Place anchor · <Money value={stake} size={14} color="inherit" weight={600} decimals={0} />
          </Btn>
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 11, color: c.muted }}>
            Balance <Money value={wallet.usd} size={11} color={c.muted} /> · 3% rake on pool
          </div>
        </div>
      )}

      {round.phase === 'open' && round.userAnchor && (
        <Card c={c} pad={12} style={{ background: c.surfaceAlt, borderColor: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.check c={c.up} size={14} />
              <span style={{ fontFamily: SANS, fontSize: 13, color: c.ink, fontWeight: 600 }}>Anchor placed</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, color: c.muted }}>
              ${round.userAnchor.stake} @ {round.userAnchor.level.toFixed(2)}
            </span>
          </div>
        </Card>
      )}

      {round.phase === 'drift' && (
        <Card c={c} pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.up }}>
              <style>{`@keyframes drift-pulse { 0%, 100% { opacity: 1 } 50% { opacity: .3 } }`}</style>
            </span>
            <SectionLabel c={c} style={{ fontSize: 10 }}>Live</SectionLabel>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft, lineHeight: 1.5 }}>
            {round.userAnchor
              ? <>Your anchor is set at <strong style={{ color: c.ink, fontFamily: MONO }}>{round.userAnchor.level.toFixed(2)}</strong>. Line is drifting…</>
              : <>You didn't anchor this round. Watch the line settle, then play the next one.</>
            }
          </div>
        </Card>
      )}

      {round.phase === 'settle' && <ResultsCard c={c} />}

      {density !== 'minimal' && (
        <>
          <div>
            <SectionLabel c={c} style={{ marginBottom: 8 }}>Anchors in this round</SectionLabel>
            <AnchorList c={c} max={5} />
          </div>
          <FairnessBlock c={c} />
        </>
      )}
    </div>
  );
}

// Lobby — list of games. Drift currently has one game "The Line" running
// rolling minute rounds. Tease two "coming soon" variants.
function LobbyScreen({ c }) {
  const d = useDrift();
  const { round, pool, allAnchors } = d;
  const games = [
    {
      id: 'line', live: true, name: 'The Line',
      tag: 'Featured', tagColor: c.up,
      desc: 'Anchor a level on a drifting line. Closest to where it lands wins.',
      stats: [
        ['Round', `#${round.id}`],
        ['Pool', `$${pool.toFixed(0)}`],
        ['Players', `${allAnchors.length}`],
      ],
    },
    {
      id: 'sprint', live: false, name: 'Sprint',
      tag: 'Soon', tagColor: c.muted,
      desc: '5-second blitz rounds. Single-pick prediction with multipliers.',
      stats: [['Round', 'every 5s'], ['Min stake', '$1']],
    },
    {
      id: 'tide', live: false, name: 'Tide',
      tag: 'Soon', tagColor: c.muted,
      desc: 'Long-form pools. Anchor once, line drifts over 10 minutes.',
      stats: [['Round', 'every 10m'], ['Min stake', '$5']],
    },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px 20px' }}>
      <div>
        <SectionLabel c={c} style={{ marginBottom: 4 }}>Live</SectionLabel>
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: c.ink, letterSpacing: -0.4 }}>
          Pick a round
        </div>
      </div>
      {games.map((g) => (
        <Card key={g.id} c={c} pad={14}
          style={{ opacity: g.live ? 1 : 0.7, cursor: g.live ? 'pointer' : 'default' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: c.ink, letterSpacing: -0.2 }}>
                {g.name}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: c.muted, marginTop: 2, maxWidth: 280, lineHeight: 1.4 }}>
                {g.desc}
              </div>
            </div>
            <Pill dot={g.tagColor} bg={c.surfaceAlt} color={c.inkSoft}>{g.tag}</Pill>
          </div>
          <Hr c={c} style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', gap: 18 }}>
            {g.stats.map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: SANS, fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{k}</div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: c.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Wallet
function WalletScreen({ c }) {
  const d = useDrift();
  const [tab, setTab] = React.useState('deposit');
  const [amount, setAmount] = React.useState(50);
  const [currency, setCurrency] = React.useState('USD');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 16px 20px' }}>
      <div>
        <SectionLabel c={c} style={{ marginBottom: 4 }}>Balance</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <Money value={d.wallet.usd} size={36} weight={700} color={c.ink} />
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: c.muted, marginTop: 2 }}>
          + <Money value={d.wallet.usdc} currency="USDC" size={13} color={c.muted} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {['deposit', 'withdraw'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, height: 36, borderRadius: 8,
              border: `1px solid ${tab === t ? c.ink : c.hairline}`,
              background: tab === t ? c.ink : c.surface,
              color: tab === t ? c.surface : c.ink,
              fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {['USD', 'USDC'].map((cur) => (
          <button key={cur} onClick={() => setCurrency(cur)}
            style={{
              flex: 1, height: 32, borderRadius: 8,
              border: `1px solid ${currency === cur ? c.inkSoft : c.hairline}`,
              background: currency === cur ? c.surfaceAlt : c.surface,
              color: currency === cur ? c.ink : c.muted,
              fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{cur}</button>
        ))}
      </div>

      <Card c={c} pad={16}>
        <SectionLabel c={c} style={{ marginBottom: 6 }}>{tab === 'deposit' ? 'Add funds' : 'Withdraw to'}</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          {currency === 'USD' && <span style={{ fontFamily: MONO, fontSize: 32, color: c.ink, fontWeight: 600 }}>$</span>}
          <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: MONO, fontSize: 36, fontWeight: 600, color: c.ink,
              fontVariantNumeric: 'tabular-nums', padding: 0,
            }} />
          {currency === 'USDC' && <span style={{ fontFamily: SANS, fontSize: 14, color: c.muted }}>USDC</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {[20, 50, 100, 250].map((p) => (
            <button key={p} onClick={() => setAmount(p)}
              style={{
                flex: 1, height: 30, borderRadius: 7, border: `1px solid ${c.hairline}`,
                background: amount === p ? c.surfaceAlt : c.surface,
                color: c.ink, fontFamily: MONO, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>
              {currency === 'USD' ? `$${p}` : p}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tab === 'deposit' ? (
          <>
            <Card c={c} pad={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.wallet c={c.ink} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: c.ink }}>
                    {currency === 'USD' ? 'Card · 4242' : 'On-chain USDC'}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: c.muted }}>
                    {currency === 'USD' ? 'Instant · 0% fee under $500' : 'Polygon · ~$0.001 gas'}
                  </div>
                </div>
                <Icon.arrow c={c.muted} />
              </div>
            </Card>
            <Btn c={c} kind="primary" size="lg" full onClick={() => d.deposit(amount, currency)} disabled={amount < 1}>
              {tab === 'deposit' ? 'Deposit' : 'Withdraw'} <Money value={amount} currency={currency} size={14} weight={600} color="inherit" decimals={0} />
            </Btn>
          </>
        ) : (
          <Btn c={c} kind="primary" size="lg" full disabled>Withdrawals open Mon–Fri</Btn>
        )}
      </div>

      <div>
        <SectionLabel c={c} style={{ marginBottom: 8 }}>Recent activity</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { kind: 'win', round: 'r-104821', net: 38.20, t: '2m' },
            { kind: 'loss', round: 'r-104820', net: -7.40, t: '4m' },
            { kind: 'deposit', round: 'Card · 4242', net: 100, t: '1h' },
            { kind: 'win', round: 'r-104819', net: 84.50, t: '6m' },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${c.hairline}` : 'none',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {row.kind === 'win' ? <Icon.up c={c.up} /> : row.kind === 'loss' ? <Icon.down c={c.down} /> : <Icon.plus c={c.ink} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, color: c.ink, fontWeight: 500, textTransform: 'capitalize' }}>{row.kind === 'win' ? 'Won' : row.kind === 'loss' ? 'Lost' : 'Deposit'}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: c.muted }}>{row.round}</div>
              </div>
              <Money value={row.net} signed={row.kind !== 'deposit'} size={13}
                color={row.net > 0 ? c.up : row.net < 0 ? c.down : c.ink}
                weight={600} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: c.muted, minWidth: 24, textAlign: 'right' }}>{row.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Leaderboard
function LeaderboardScreen({ c }) {
  const players = [
    { rank: 1, name: 'lattice', winnings: 4820.50, streak: 14, change: 2 },
    { rank: 2, name: 'theo', winnings: 3214.00, streak: 8, change: -1 },
    { rank: 3, name: 'mira', winnings: 2987.75, streak: 11, change: 1 },
    { rank: 4, name: 'orson', winnings: 2401.20, streak: 6, change: 0 },
    { rank: 5, name: 'wave', winnings: 1955.40, streak: 4, change: 3 },
    { rank: 6, name: 'rho', winnings: 1812.10, streak: 7, change: -2 },
    { rank: 7, name: 'alex', winnings: 1660.00, streak: 3, change: 5, you: true },
    { rank: 8, name: 'kai', winnings: 1502.80, streak: 2, change: -1 },
    { rank: 9, name: 'pax', winnings: 1244.60, streak: 5, change: 0 },
    { rank: 10, name: 'ivy', winnings: 1090.20, streak: 1, change: -3 },
  ];
  const tabs = ['Today', 'Week', 'All-time'];
  const [tab, setTab] = React.useState('Week');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px 20px' }}>
      <div>
        <SectionLabel c={c} style={{ marginBottom: 4 }}>Top players</SectionLabel>
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: c.ink, letterSpacing: -0.4 }}>
          Leaderboard
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, background: c.surfaceAlt, padding: 3, borderRadius: 9 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, height: 30, borderRadius: 7, border: 'none',
              background: tab === t ? c.surface : 'transparent',
              boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
              color: tab === t ? c.ink : c.muted,
              fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{t}</button>
        ))}
      </div>
      <div>
        {players.map((p, i) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 8px', borderRadius: 8,
            background: p.you ? c.surfaceAlt : 'transparent',
            borderBottom: i < players.length - 1 && !p.you ? `1px solid ${c.hairline}` : 'none',
          }}>
            <div style={{
              width: 24, textAlign: 'center',
              fontFamily: MONO, fontSize: 12, color: p.rank <= 3 ? c.ink : c.muted,
              fontWeight: p.rank <= 3 ? 700 : 500,
            }}>{p.rank}</div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: p.you ? c.ink : c.surfaceAlt,
              color: p.you ? c.surface : c.inkSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              border: p.you ? 'none' : `1px solid ${c.hairline}`,
            }}>{p.name.slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: p.you ? 700 : 500, color: c.ink }}>
                {p.name} {p.you && <span style={{ fontWeight: 500, color: c.muted, fontSize: 11, marginLeft: 4 }}>you</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 10, color: c.muted }}>
                <span>{p.streak}W streak</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Money value={p.winnings} size={13} color={c.ink} weight={600} />
              <div style={{ fontFamily: MONO, fontSize: 10, color: p.change > 0 ? c.up : p.change < 0 ? c.down : c.muted, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                {p.change > 0 ? '▲' : p.change < 0 ? '▼' : '—'} {p.change !== 0 ? Math.abs(p.change) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile / history
function ProfileScreen({ c, onLogout }) {
  const d = useDrift();
  const wins = d.history.filter((h) => h.won).length;
  const total = d.history.length;
  const totalNet = d.history.reduce((s, h) => s + h.net, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: c.ink,
          color: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontSize: 22, fontWeight: 700,
        }}>{d.user.initial}</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: c.ink, letterSpacing: -0.3 }}>
            {d.user.display}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: c.muted }}>@{d.user.handle}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>Win rate</SectionLabel>
          <Num value={(wins / Math.max(total, 1)) * 100} decimals={0} size={20} weight={600} color={c.ink} suffix="%" />
        </Card>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>Net</SectionLabel>
          <Money value={totalNet} size={20} signed weight={600}
            color={totalNet > 0 ? c.up : totalNet < 0 ? c.down : c.ink} />
        </Card>
        <Card c={c} pad={12} style={{ flex: 1 }}>
          <SectionLabel c={c} style={{ fontSize: 10 }}>Rounds</SectionLabel>
          <Num value={total} decimals={0} size={20} weight={600} color={c.ink} />
        </Card>
      </div>

      <div>
        <SectionLabel c={c} style={{ marginBottom: 8 }}>History</SectionLabel>
        <Card c={c} pad={0}>
          {d.history.map((h, i, arr) => (
            <div key={h.id + i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${c.hairline}` : 'none',
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {h.won ? <Icon.up c={c.up} /> : <Icon.down c={c.down} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, color: c.ink, fontWeight: 500 }}>
                  <span style={{ fontFamily: MONO }}>{h.level.toFixed(2)}</span>
                  <span style={{ color: c.muted, margin: '0 6px' }}>→</span>
                  <span style={{ fontFamily: MONO }}>{h.final.toFixed(2)}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: c.muted }}>#{h.id} · {h.when}</div>
              </div>
              <Money value={h.stake} decimals={0} size={11} color={c.muted} />
              <Money value={h.net} signed size={13} color={h.won ? c.up : c.down} weight={600} />
            </div>
          ))}
        </Card>
      </div>

      <Btn c={c} kind="secondary" full size="md" onClick={onLogout}>Sign out</Btn>
    </div>
  );
}

// Login / onboarding (one screen for demo)
function LoginScreen({ c, onContinue }) {
  const [step, setStep] = React.useState(0);
  const [email, setEmail] = React.useState('alex@drift.fm');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px 24px 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <DriftMark size={36} color={c.ink} />
        </div>
        {step === 0 && (
          <>
            <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 700, color: c.ink, letterSpacing: -0.8, lineHeight: 1.05, marginBottom: 10 }}>
              60-second games.<br />
              <span style={{ color: c.muted }}>Real money.</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: c.inkSoft, lineHeight: 1.5, marginBottom: 36, maxWidth: 320 }}>
              Anchor a level on a drifting line. Closest to where it lands wins the pool. Provably fair, 3% house rake.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn c={c} kind="primary" size="lg" full onClick={() => setStep(1)}>Continue with email</Btn>
              <Btn c={c} kind="secondary" size="lg" full onClick={onContinue}>Continue as guest</Btn>
            </div>
            <div style={{ marginTop: 24, fontFamily: SANS, fontSize: 11, color: c.muted, textAlign: 'center', lineHeight: 1.5 }}>
              By continuing you confirm you're 18+ and agree to the terms.
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: c.ink, letterSpacing: -0.5, marginBottom: 8 }}>
              Sign in
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: c.muted, marginBottom: 24 }}>
              We'll send a 6-digit code.
            </div>
            <div style={{ marginBottom: 20 }}>
              <SectionLabel c={c} style={{ marginBottom: 6, fontSize: 10 }}>Email</SectionLabel>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', height: 48, padding: '0 14px',
                  border: `1px solid ${c.hairline}`, borderRadius: 12,
                  background: c.surface, color: c.ink,
                  fontFamily: SANS, fontSize: 15, outline: 'none',
                  boxSizing: 'border-box',
                }} />
            </div>
            <Btn c={c} kind="primary" size="lg" full onClick={onContinue}>Send code</Btn>
            <button onClick={() => setStep(0)}
              style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SANS, fontSize: 13, color: c.muted, textAlign: 'center' }}>← Back</button>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon.fairness c={c.muted} size={11} />
        <span style={{ fontFamily: SANS, fontSize: 11, color: c.muted }}>Provably fair · Audited by SlowMist</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, DriftChart, PhaseStrip, AnchorList, FairnessBlock,
  StakeRow, ResultsCard,
  LiveGameScreen, LobbyScreen, WalletScreen, LeaderboardScreen, ProfileScreen, LoginScreen,
});
