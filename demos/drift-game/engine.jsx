// engine.jsx — Drift game engine. Single React context that owns:
//   • round lifecycle (open → drift → settle → next)
//   • a seedable PRNG that drives the drift line so it's "provably fair"
//   • simulated other players' anchors per round
//   • the user's wallet, anchor placements, and payout history
//
// One game called "The Line". Every round:
//   OPEN  (10s)  — anchor placement window
//   DRIFT (18s)  — line walks; no new anchors
//   SETTLE (2s)  — payout reveal, then next round
//
// Payout model: pari-mutuel, 3% house rake.
//   Each anchor a_i with stake s_i at level y_i scored as w_i = s_i / (1 + |y_i - final|^1.4).
//   Player share = (total_pool * 0.97) * (w_i / sum(w_j)).
//   Net = share - s_i.
// This makes near-anchors big winners, far-anchors small losers,
// and rewards larger stakes proportionally.

const PHASE_DURATIONS = { open: 10000, drift: 18000, settle: 2000 };
const ROUND_BASE_VALUE = 100;
const ROUND_RANGE = 12; // visible y range ±

// Mulberry32 — small fast deterministic PRNG. seed is 32-bit unsigned.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller — standard normal from two uniforms
function gaussian(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Generate the full drift series for a round given a seed. Returns an array
// of {t, v} samples covering the DRIFT phase. Mild mean-reversion keeps it
// readable; drift step is small relative to the visible range.
function generateDrift(seed, ticks = 90) {
  const rng = mulberry32(seed);
  const series = [];
  let v = ROUND_BASE_VALUE;
  const mu = 0.04;       // pull toward base
  const sigma = 0.55;    // step size
  // Pre-bias the round so not every line just wiggles around 100 — pick a
  // drift direction with mild magnitude so the final lands somewhere in
  // [base ± ~6] but with variety
  const bias = (rng() - 0.5) * 0.12;
  for (let i = 0; i < ticks; i++) {
    v = v + mu * (ROUND_BASE_VALUE - v) + sigma * gaussian(rng) + bias;
    series.push({ t: i / (ticks - 1), v });
  }
  return series;
}

// Fake hash: deterministic-looking hex of the seed, padded out
function seedToHash(seed) {
  const hex = (seed >>> 0).toString(16).padStart(8, '0');
  // pad to 64 chars with seeded noise
  const rng = mulberry32(seed ^ 0x9e3779b9);
  let out = hex;
  while (out.length < 64) out += Math.floor(rng() * 16).toString(16);
  return '0x' + out.slice(0, 64);
}

// Generate simulated bot anchors for a round. Returns array of
// { id, name, level, stake, color }.
const BOT_NAMES = ['lattice', 'mira', 'kai', 'orson', 'nine', 'rho', 'sav', 'theo', 'wave', 'zed', 'hex', 'ivy', 'odd', 'pax'];
function generateBots(seed, target) {
  const rng = mulberry32(seed ^ 0xa5a5a5a5);
  const n = 6 + Math.floor(rng() * 7); // 6–12 bots
  const bots = [];
  for (let i = 0; i < n; i++) {
    // Stronger players cluster around what we'll end at (gives the user a
    // visible "crowd"); also include occasional contrarians.
    const informed = rng() > 0.35;
    const center = informed ? target + (rng() - 0.5) * 4 : ROUND_BASE_VALUE + (rng() - 0.5) * 8;
    const level = Math.max(88, Math.min(112, center + gaussian(rng) * 1.2));
    const stake = [5, 10, 10, 25, 25, 50, 100][Math.floor(rng() * 7)];
    bots.push({
      id: 'bot-' + i,
      name: BOT_NAMES[Math.floor(rng() * BOT_NAMES.length)],
      level,
      stake,
      color: `oklch(0.62 0.08 ${Math.floor(rng() * 360)})`,
    });
  }
  return bots;
}

// Scoring & payout
function scoreAnchor(level, stake, finalValue) {
  const dist = Math.abs(level - finalValue);
  return stake / (1 + Math.pow(dist, 1.4));
}

function settleRound(anchors, finalValue, rake = 0.03) {
  const pool = anchors.reduce((s, a) => s + a.stake, 0);
  const after = pool * (1 - rake);
  const scored = anchors.map((a) => ({ ...a, score: scoreAnchor(a.level, a.stake, finalValue) }));
  const totalScore = scored.reduce((s, a) => s + a.score, 0) || 1;
  return scored.map((a) => {
    const share = after * (a.score / totalScore);
    return { ...a, share, net: share - a.stake };
  });
}

// ── Engine context ─────────────────────────────────────────────────────────

const DriftCtx = React.createContext(null);

function useDrift() {
  return React.useContext(DriftCtx);
}

function DriftProvider({ children, demoMode = true }) {
  // Wallet + user identity
  const [wallet, setWallet] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('drift:wallet') || 'null');
      if (saved) return saved;
    } catch {}
    return { usd: 248.50, usdc: 120.00 };
  });
  const [user] = React.useState({
    handle: 'alex',
    display: 'Alex',
    initial: 'A',
    color: 'oklch(0.55 0.18 28)',
  });

  // History
  const [history, setHistory] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('drift:history') || 'null');
      if (saved) return saved;
    } catch {}
    // Seed history for demo
    return [
      { id: 'r-104821', when: '2m ago', level: 101.20, stake: 25, final: 101.45, net: 38.20, won: true },
      { id: 'r-104820', when: '4m ago', level: 98.50, stake: 10, final: 103.10, net: -7.40, won: false },
      { id: 'r-104819', when: '6m ago', level: 100.00, stake: 50, final: 100.05, net: 84.50, won: true },
      { id: 'r-104818', when: '8m ago', level: 95.20, stake: 25, final: 99.80, net: -19.10, won: false },
      { id: 'r-104817', when: '10m ago', level: 102.00, stake: 10, final: 102.40, net: 14.80, won: true },
      { id: 'r-104816', when: '12m ago', level: 100.50, stake: 25, final: 96.20, net: -22.50, won: false },
      { id: 'r-104815', when: '14m ago', level: 99.80, stake: 100, final: 99.95, net: 156.20, won: true },
    ];
  });

  // Round state — driven by a single rAF/timer loop. We keep "round" as a
  // React state object so screens re-render at appropriate beats, and keep
  // the high-frequency drift sample index in a ref to avoid re-rendering at
  // 60Hz.
  const [round, setRound] = React.useState(() => initRound(104822));
  const driftIndex = React.useRef(0);
  const [, forceTick] = React.useReducer((x) => (x + 1) % 1000000, 0);
  const phaseStart = React.useRef(performance.now());

  function initRound(id) {
    const seed = Math.floor(Math.random() * 0xffffffff) ^ (id * 2654435761);
    const series = generateDrift(seed);
    const finalValue = series[series.length - 1].v;
    const bots = generateBots(seed, finalValue);
    const anchors = bots.map((b) => ({ ...b, kind: 'bot' }));
    return {
      id, seed, hash: seedToHash(seed),
      phase: 'open', phaseStartedAt: performance.now(),
      series, finalValue,
      anchors,
      userAnchor: null,
      lastSettlement: null,
    };
  }

  // Round loop
  React.useEffect(() => {
    let raf;
    function tick() {
      const now = performance.now();
      const elapsed = now - phaseStart.current;
      const dur = PHASE_DURATIONS[round.phase];
      if (elapsed >= dur) {
        // advance
        if (round.phase === 'open') {
          phaseStart.current = now;
          setRound((r) => ({ ...r, phase: 'drift', phaseStartedAt: now }));
        } else if (round.phase === 'drift') {
          // settle: compute payouts
          const all = [...round.anchors];
          if (round.userAnchor) all.push({ ...round.userAnchor, kind: 'user' });
          const results = settleRound(all, round.finalValue);
          const me = results.find((r) => r.kind === 'user');
          phaseStart.current = now;
          setRound((r) => ({
            ...r, phase: 'settle', phaseStartedAt: now,
            results, userResult: me || null,
          }));
          if (me) {
            // Update wallet + history
            setWallet((w) => {
              const next = { ...w, usd: w.usd + me.share };
              try { localStorage.setItem('drift:wallet', JSON.stringify(next)); } catch {}
              return next;
            });
            setHistory((h) => {
              const next = [{
                id: 'r-' + round.id, when: 'just now',
                level: me.level, stake: me.stake, final: round.finalValue,
                net: me.net, won: me.net > 0,
              }, ...h].slice(0, 30);
              try { localStorage.setItem('drift:history', JSON.stringify(next)); } catch {}
              return next;
            });
          }
        } else if (round.phase === 'settle') {
          phaseStart.current = now;
          driftIndex.current = 0;
          setRound(initRound(round.id + 1));
        }
      } else if (round.phase === 'drift') {
        // advance drift index
        const idx = Math.min(round.series.length - 1, Math.floor((elapsed / dur) * round.series.length));
        if (idx !== driftIndex.current) {
          driftIndex.current = idx;
          forceTick();
        }
      } else {
        // open / settle — still trigger 4-5 redraws/sec so countdowns tick
        forceTick();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [round.id, round.phase]);

  // Public helpers
  const placeAnchor = React.useCallback((level, stake, currency = 'USD') => {
    if (round.phase !== 'open') return false;
    if (round.userAnchor) return false;
    const balance = currency === 'USD' ? wallet.usd : wallet.usdc;
    if (stake > balance) return false;
    setWallet((w) => {
      const k = currency === 'USD' ? 'usd' : 'usdc';
      const next = { ...w, [k]: w[k] - stake };
      try { localStorage.setItem('drift:wallet', JSON.stringify(next)); } catch {}
      return next;
    });
    setRound((r) => ({
      ...r,
      userAnchor: {
        id: 'user',
        name: user.handle,
        level,
        stake,
        color: user.color,
        currency,
      },
    }));
    return true;
  }, [round.phase, round.userAnchor, wallet, user]);

  const deposit = React.useCallback((amount, currency = 'USD') => {
    setWallet((w) => {
      const k = currency === 'USD' ? 'usd' : 'usdc';
      const next = { ...w, [k]: w[k] + amount };
      try { localStorage.setItem('drift:wallet', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Round phase progress
  const now = performance.now();
  const phaseElapsed = now - round.phaseStartedAt;
  const phaseDur = PHASE_DURATIONS[round.phase];
  const phaseProgress = Math.min(1, phaseElapsed / phaseDur);
  const phaseRemainingMs = Math.max(0, phaseDur - phaseElapsed);

  // Current drift sample (during drift phase the line grows; during open we
  // show a flat hint at base, during settle we show the full line)
  let visibleSeries;
  if (round.phase === 'open') visibleSeries = [];
  else if (round.phase === 'drift') visibleSeries = round.series.slice(0, driftIndex.current + 1);
  else visibleSeries = round.series;
  const lastV = visibleSeries.length ? visibleSeries[visibleSeries.length - 1].v : ROUND_BASE_VALUE;

  // Pool
  const allAnchors = round.userAnchor ? [...round.anchors, round.userAnchor] : round.anchors;
  const pool = allAnchors.reduce((s, a) => s + a.stake, 0);

  const value = {
    user, wallet, history,
    round, allAnchors, pool, visibleSeries, lastV,
    phaseProgress, phaseRemainingMs,
    placeAnchor, deposit,
    ROUND_BASE_VALUE, ROUND_RANGE,
  };

  return <DriftCtx.Provider value={value}>{children}</DriftCtx.Provider>;
}

Object.assign(window, { DriftProvider, useDrift, generateDrift, ROUND_BASE_VALUE, ROUND_RANGE });
