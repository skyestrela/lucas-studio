// ── Cursor Glow ──
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('cursorGlow');
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// ── Scroll Reveal ──
var observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

// Note: .project/.about-card elements may not exist yet — render.js re-observes after fetch.
// Scroll fallback for project reveal
function checkProjectsOnScroll() {
  document.querySelectorAll('.project:not(.visible), .about-card:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', checkProjectsOnScroll, { passive: true });

// ── Count Up Animation ──
var statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + (target > 10 ? '+' : '');
      }, 30);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.01, rootMargin: '0px' });

// Note: .stat-num and .project/.about-card elements may not exist yet when main.js runs.
// render.js re-observes them after fetching content from /api/content.
// As a fallback, a scroll listener handles stats count-up for elements not caught by IntersectionObserver.
let statsCounted = false;
function checkStatsOnScroll() {
  if (statsCounted) return;
  let allCounted = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    if (el.textContent.trim() !== '0') return;
    allCounted = false;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current + (target > 10 ? '+' : '');
      }, 30);
      statObserver.unobserve(el);
    }
  });
  if (allCounted) { statsCounted = true; window.removeEventListener('scroll', checkStatsOnScroll); }
}
window.addEventListener('scroll', checkStatsOnScroll, { passive: true });

// ── Canvas Utils ──
function getCtx(id, w, h) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h, canvas };
}

// ═════════════════════════════════════════
// KeyTune: Full tuning meter + strobe rings + waveform + mini keyboard
// ═════════════════════════════════════════
function drawKeyTune(time) {
  const setup = getCtx('keytuneCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2, cy = h * 0.48;
  const radius = Math.min(w * 0.35, h * 0.40);
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;

  // Outer glow ring
  ctx.save();
  ctx.shadowBlur = 25;
  ctx.shadowColor = 'rgba(110,231,183,0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 12, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(110,231,183,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Color zones with thicker arcs
  const zones = [
    { from: startAngle, to: startAngle + 0.1, color: 'rgba(239,68,68,0.1)' },
    { from: startAngle + 0.1, to: startAngle + 0.22, color: 'rgba(249,115,22,0.13)' },
    { from: startAngle + 0.22, to: startAngle + 0.38, color: 'rgba(234,179,8,0.16)' },
    { from: startAngle + 0.38, to: Math.PI * 1.5 - 0.1, color: 'rgba(110,231,183,0.22)' },
    { from: Math.PI * 1.5 - 0.1, to: Math.PI * 1.5 + 0.1, color: 'rgba(110,231,183,0.35)' },
    { from: Math.PI * 1.5 + 0.1, to: endAngle - 0.38, color: 'rgba(110,231,183,0.22)' },
    { from: endAngle - 0.38, to: endAngle - 0.22, color: 'rgba(234,179,8,0.16)' },
    { from: endAngle - 0.22, to: endAngle - 0.1, color: 'rgba(249,115,22,0.13)' },
    { from: endAngle - 0.1, to: endAngle, color: 'rgba(239,68,68,0.1)' },
  ];
  zones.forEach(z => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, z.from, z.to);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 22;
    ctx.stroke();
  });

  // Tick marks
  for (let i = -50; i <= 50; i += 2) {
    const angle = startAngle + (i + 50) / 100 * (endAngle - startAngle);
    const isMajor = i % 10 === 0;
    const inner = radius - (isMajor ? 15 : 8);
    const outer = radius + (isMajor ? 6 : 2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = isMajor ? 1.5 : 0.5;
    ctx.stroke();
  }

  // "0" label at center
  const centerAngle = Math.PI * 1.5;
  ctx.font = '700 9px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.textAlign = 'center';
  ctx.fillText('0', cx + Math.cos(centerAngle) * (radius + 18), cy + Math.sin(centerAngle) * (radius + 18) + 3);

  // Strobe spinner rings around hub
  const strobeColors = ['#6ee7b7', '#f59e0b', '#22d3ee', '#a78bfa', '#f43f5e'];
  for (let ring = 0; ring < 3; ring++) {
    const r = 26 + ring * 8;
    const barCount = 16;
    const spinDir = ring % 2 === 0 ? 1 : -1;
    const spinSpeed = 0.0008 + ring * 0.0004;
    for (let b = 0; b < barCount; b++) {
      const angle = (b / barCount) * Math.PI * 2 + time * spinSpeed * spinDir;
      const barLen = 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (r - barLen), cy + Math.sin(angle) * (r - barLen));
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      const alpha = 0.15 + Math.sin(angle * 3 + time * 0.003) * 0.1;
      ctx.strokeStyle = strobeColors[ring] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Needle — oscillates gently, like a real tuning reading
  const cents = Math.sin(time * 0.002) * 6 + Math.sin(time * 0.0047) * 4 + Math.sin(time * 0.0089) * 1.5;
  const needleAngle = startAngle + (cents + 50) / 100 * (endAngle - startAngle);
  const needleLen = radius * 0.82;
  const inTune = Math.abs(cents) < 5;
  const needleColor = inTune ? '#6ee7b7' : Math.abs(cents) < 15 ? '#eab308' : '#ef4444';

  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = needleColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
  ctx.strokeStyle = needleColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Center hub
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
  grad.addColorStop(0, needleColor);
  grad.addColorStop(1, '#0ea573');
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Info inside arc
  const iY = cy + 14;
  ctx.textAlign = 'center';
  ctx.font = '600 9px "Space Grotesk"';
  ctx.fillStyle = inTune ? '#6ee7b7' : 'rgba(255,255,255,0.3)';
  const statusText = inTune ? '♪ IN TUNE' : cents < 0 ? '♭ FLAT' : '♯ SHARP';
  ctx.fillText(statusText, cx, iY);

  ctx.font = '800 26px "Syne"';
  ctx.fillStyle = '#e8e8ed';
  ctx.fillText('A4', cx, iY + 30);

  ctx.font = '600 16px "JetBrains Mono"';
  ctx.fillStyle = inTune ? '#6ee7b7' : '#eab308';
  ctx.fillText((cents >= 0 ? '+' : '') + cents.toFixed(0) + '¢', cx, iY + 50);

  ctx.font = '400 10px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('440.00 Hz', cx, iY + 64);

  // Stretch label
  ctx.font = '500 8px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(34,211,238,0.4)';
  ctx.fillText('⟡ STRETCH', cx, iY - 10);

  // Mini waveform at bottom
  const waveY = h - 42;
  const waveH = 16;
  const waveW = w * 0.6;
  const waveX = (w - waveW) / 2;
  ctx.beginPath();
  for (let x = 0; x < waveW; x += 2) {
    const t = x / waveW;
    const amp = Math.sin(t * Math.PI) * waveH;
    const val = Math.sin((x * 0.08 + time * 0.005)) * amp * 0.6 + Math.sin((x * 0.15 + time * 0.008)) * amp * 0.3;
    if (x === 0) ctx.moveTo(waveX + x, waveY + val);
    else ctx.lineTo(waveX + x, waveY + val);
  }
  ctx.strokeStyle = 'rgba(110,231,183,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Mini piano keyboard
  const kw = 240, kh = 24, kx = cx - kw / 2, ky = h - kh - 8;
  const whiteW = kw / 15;
  for (let i = 0; i < 15; i++) {
    const isA = i === 7;
    ctx.fillStyle = isA ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(kx + i * whiteW, ky, whiteW - 1, kh);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(kx + i * whiteW, ky, whiteW - 1, kh);
  }
  const blackPattern = [1, 1, 0, 1, 1, 1, 0];
  for (let i = 0; i < 14; i++) {
    if (blackPattern[i % 7]) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const bx = kx + (i + 0.65) * whiteW;
      const bw = whiteW * 0.55;
      ctx.beginPath();
      ctx.roundRect(bx, ky, bw, kh * 0.6, [0, 0, 2, 2]);
      ctx.fill();
    }
  }

  // Label
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(110,231,183,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('KEYTUNE PIANO TUNER PRO', 14, 18);
}

// ═════════════════════════════════════════
// Money Stack: Score cards + calculator + trending spark
// ═════════════════════════════════════════
function drawMoneyStack(time) {
  const setup = getCtx('moneystackCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(110,231,183,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('151 METHODS · 16 CATEGORIES', 14, 18);

  // Top trending spark line
  const sparkY = 35;
  ctx.beginPath();
  for (let x = 14; x < w - 14; x += 3) {
    const t = (x - 14) / (w - 28);
    const val = Math.sin(t * 6 + time * 0.002) * 8 + Math.sin(t * 12 + time * 0.003) * 3;
    if (x === 14) ctx.moveTo(x, sparkY + val);
    else ctx.lineTo(x, sparkY + val);
  }
  ctx.strokeStyle = 'rgba(110,231,183,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Score cards
  const methods = [
    { name: 'AI SaaS', score: 9.1, color: '#a78bfa' },
    { name: 'Freelance', score: 8.2, color: '#6ee7b7' },
    { name: 'Content', score: 7.4, color: '#22d3ee' },
    { name: 'E-com', score: 6.8, color: '#f59e0b' },
    { name: 'Passive', score: 5.9, color: '#f43f5e' },
  ];

  const cardW = 64, cardH = 170, gap = 12;
  const totalW = methods.length * cardW + (methods.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const baseY = h - 28;

  methods.forEach((m, i) => {
    const x = startX + i * (cardW + gap);
    const progress = Math.min(1, (time - 300) / 1000 + i * 0.1);
    const animScore = m.score * progress;
    const barH = (animScore / 10) * (cardH - 50);

    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.beginPath();
    ctx.roundRect(x, baseY - cardH, cardW, cardH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Score bar
    const barGrad = ctx.createLinearGradient(0, baseY, 0, baseY - barH);
    barGrad.addColorStop(0, m.color + '20');
    barGrad.addColorStop(1, m.color + '80');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(x + 6, baseY - barH - 4, cardW - 12, barH, 3);
    ctx.fill();

    // Top glow line
    if (barH > 20) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = m.color + '60';
      ctx.fillStyle = m.color;
      ctx.fillRect(x + 6, baseY - barH - 4, cardW - 12, 2);
      ctx.restore();
    }

    // Score circle at top
    const circR = 14;
    const circY = baseY - barH - 24;
    ctx.beginPath();
    ctx.arc(x + cardW / 2, circY, circR, -Math.PI / 2, -Math.PI / 2 + (animScore / 10) * Math.PI * 2);
    ctx.strokeStyle = m.color + '80';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + cardW / 2, circY, circR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Score number inside circle
    ctx.font = '700 10px "Syne"';
    ctx.fillStyle = m.color;
    ctx.textAlign = 'center';
    ctx.fillText(animScore.toFixed(1), x + cardW / 2, circY + 4);

    // Category label
    ctx.font = '500 8px "Space Grotesk"';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(m.name, x + cardW / 2, baseY + 16);
  });

  // "SELF-EVOLVING" badge
  ctx.font = '600 7px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(110,231,183,0.25)';
  ctx.textAlign = 'right';
  ctx.fillText('SELF-EVOLVING', w - 14, 18);

  // Tiny evolution dots
  for (let i = 0; i < 5; i++) {
    const dotX = w - 14 - i * 8;
    ctx.beginPath();
    ctx.arc(dotX, 28, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(110,231,183,${0.1 + Math.sin(time * 0.003 + i) * 0.1})`;
    ctx.fill();
  }
}

// ═════════════════════════════════════════
// LeafyLife: Bloom grid + plant + leaves + AI badge
// ═════════════════════════════════════════
function drawLeafyLife(time) {
  const setup = getCtx('leafylifeCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(110,231,183,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('LEAFYLIFE PRO · 30+ PAGES', 14, 18);
  ctx.fillStyle = 'rgba(34,211,238,0.25)';
  ctx.textAlign = 'right';
  ctx.fillText('AI POWERED', w - 14, 18);

  // Bloom coverage grid (12 months)
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const bloomData = [0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.0, 0.95, 0.7, 0.4, 0.25, 0.15];
  const gx = 24, gy = 36;
  const gw = w - 48, gh = 70;
  const cellW = gw / 12, cellH = gh;

  // Grid label
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(110,231,183,0.4)';
  ctx.textAlign = 'left';
  ctx.fillText('BLOOM COVERAGE', gx, gy - 6);

  months.forEach((m, i) => {
    const x = gx + i * cellW;
    const intensity = bloomData[i] * Math.min(1, (time - 200) / 700);
    const r = Math.floor(20 + intensity * 40);
    const g = Math.floor(intensity * 180 + 40);
    const b = Math.floor(30 + intensity * 50);
    const a = 0.12 + intensity * 0.35;

    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.roundRect(x + 1, gy, cellW - 2, cellH, 3);
    ctx.fill();
    ctx.strokeStyle = `rgba(110,231,183,${0.03 + intensity * 0.1})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Plant count dots
    if (intensity > 0.4) {
      const dots = Math.floor(intensity * 4);
      for (let d = 0; d < dots; d++) {
        ctx.beginPath();
        ctx.arc(x + cellW / 2 - (dots - 1) * 4 + d * 8, gy + 12 + d * 14, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,231,183,${0.15 + intensity * 0.2})`;
        ctx.fill();
      }
    }

    ctx.font = '600 8px "Space Grotesk"';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'center';
    ctx.fillText(m, x + cellW / 2, gy + cellH + 13);
  });

  // Coverage %
  const coverage = Math.min(83, (time - 200) / 700 * 83);
  ctx.font = '700 11px "Syne"';
  ctx.fillStyle = '#6ee7b7';
  ctx.textAlign = 'right';
  ctx.fillText(coverage.toFixed(0) + '%', w - 24, gy - 6);

  // XP badge
  const xpX = 24, xpY = gy + cellH + 26;
  ctx.font = '600 8px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(245,158,11,0.4)';
  ctx.textAlign = 'left';
  ctx.fillText('✦ XP LV.12', xpX, xpY);

  // Plant stem + leaves
  const px = w / 2, py = h - 16;
  ctx.strokeStyle = 'rgba(110,231,183,0.25)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.bezierCurveTo(px, py - 20, px - 5, py - 40, px, py - 65);
  ctx.stroke();

  // Leaves
  const leaves = [
    { y: -18, r: -0.4, s: 16, phase: 0 },
    { y: -32, r: 0.35, s: 13, phase: 1 },
    { y: -48, r: -0.25, s: 11, phase: 2 },
    { y: -58, r: 0.5, s: 8, phase: 3 },
  ];
  leaves.forEach(l => {
    ctx.save();
    ctx.translate(px, py + l.y);
    ctx.rotate(l.r + Math.sin(time * 0.002 + l.phase) * 0.06);
    const leafAlpha = 0.2 + Math.sin(time * 0.001 + l.phase) * 0.05;
    ctx.fillStyle = `rgba(110,231,183,${leafAlpha})`;
    ctx.beginPath();
    ctx.ellipse(l.s * 0.55, 0, l.s, l.s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(l.s * 0.9, 0);
    ctx.strokeStyle = `rgba(110,231,183,${leafAlpha * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  });

  // Floating particles (pollen / spores)
  for (let i = 0; i < 15; i++) {
    const seed = i * 137.508;
    const px2 = (seed * 2.3) % w;
    const baseY2 = (seed * 1.7 + time * 0.015) % (h - 60);
    const size = 1.5 + (seed % 3);
    const alpha = 0.08 + Math.sin(time * 0.001 + seed) * 0.06;
    ctx.beginPath();
    ctx.arc(px2, 40 + baseY2, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(110,231,183,${alpha})`;
    ctx.fill();
  }
}

// ═════════════════════════════════════════
// Mission Control: Agent fleet + memory palace + data flows
// ═════════════════════════════════════════
function drawMissionControl(time) {
  const setup = getCtx('missioncontrolCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(167,139,250,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('MISSION CONTROL · AGENT OPS', 14, 18);

  // Central MC node
  const mcX = w / 2, mcY = h * 0.4;
  const mcR = 20;

  // Pulse rings from MC
  for (let p = 0; p < 3; p++) {
    const r = mcR + 25 + p * 22 + ((time * 0.02 + p * 40) % 80);
    const alpha = Math.max(0, 0.12 - ((time * 0.02 + p * 40) % 80) / 80 * 0.12);
    ctx.beginPath();
    ctx.arc(mcX, mcY, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Agent nodes orbiting MC
  const agents = [
    { label: 'A1', dist: 85, angle: 0, color: '#6ee7b7' },
    { label: 'A2', dist: 95, angle: Math.PI * 0.55, color: '#22d3ee' },
    { label: 'A3', dist: 80, angle: Math.PI * 1.1, color: '#f59e0b' },
    { label: 'A4', dist: 100, angle: Math.PI * 1.55, color: '#f43f5e' },
    { label: 'A5', dist: 90, angle: Math.PI * 0.25, color: '#a78bfa' },
    { label: 'A6', dist: 75, angle: Math.PI * 0.85, color: '#22d3ee' },
  ];

  agents.forEach((a, i) => {
    const ax = mcX + Math.cos(a.angle + time * 0.0003) * a.dist;
    const ay = mcY + Math.sin(a.angle + time * 0.0003) * a.dist * 0.65;
    const active = Math.sin(time * 0.003 + i * 1.2) > 0.3;

    // Connection line to MC
    ctx.beginPath();
    ctx.moveTo(mcX, mcY);
    ctx.lineTo(ax, ay);
    ctx.strokeStyle = `rgba(167,139,250,${active ? 0.15 : 0.05})`;
    ctx.lineWidth = 1;
    ctx.setLineDash(active ? [] : [3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Data packet traveling along line
    const t = ((time * 0.0008 + i * 0.17) % 1);
    const dx = mcX + (ax - mcX) * t;
    const dy = mcY + (ay - mcY) * t;
    ctx.beginPath();
    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167,139,250,${active ? 0.5 : 0.15})`;
    ctx.fill();

    // Agent node
    ctx.save();
    if (active) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = a.color + '40';
    }
    ctx.beginPath();
    ctx.arc(ax, ay, 10, 0, Math.PI * 2);
    ctx.fillStyle = active ? a.color + '15' : 'rgba(255,255,255,0.02)';
    ctx.fill();
    ctx.strokeStyle = active ? a.color + '60' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Agent label
    ctx.font = '600 7px "JetBrains Mono"';
    ctx.fillStyle = active ? a.color + '80' : 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText(a.label, ax, ay + 3);

    // Status dot
    ctx.beginPath();
    ctx.arc(ax + 8, ay - 8, 2, 0, Math.PI * 2);
    ctx.fillStyle = active ? a.color : 'rgba(255,255,255,0.08)';
    ctx.fill();
  });

  // MC center node
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(167,139,250,0.3)';
  const mcGrad = ctx.createRadialGradient(mcX, mcY, 0, mcX, mcY, mcR);
  mcGrad.addColorStop(0, 'rgba(167,139,250,0.2)');
  mcGrad.addColorStop(1, 'rgba(167,139,250,0.05)');
  ctx.beginPath();
  ctx.arc(mcX, mcY, mcR, 0, Math.PI * 2);
  ctx.fillStyle = mcGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(167,139,250,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.font = '700 10px "Syne"';
  ctx.fillStyle = 'rgba(167,139,250,0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('MC', mcX, mcY + 4);

  // Memory palace section at bottom
  const memY = h - 55;
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(34,211,238,0.25)';
  ctx.textAlign = 'left';
  ctx.fillText('MEMORY PALACE', 14, memY);

  const memNodes = [];
  for (let i = 0; i < 18; i++) {
    const seed = i * 97.3;
    const mx = 14 + (i % 6) * 62 + (seed % 20);
    const my = memY + 8 + Math.floor(i / 6) * 14 + Math.sin(time * 0.001 + i) * 2;
    memNodes.push({ x: mx, y: my });
  }

  // Wiki-links between memory nodes
  for (let i = 0; i < memNodes.length; i++) {
    for (let j = i + 1; j < memNodes.length; j++) {
      const dx = memNodes[j].x - memNodes[i].x;
      const dy = memNodes[j].y - memNodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 65) {
        ctx.beginPath();
        ctx.moveTo(memNodes[i].x, memNodes[i].y);
        ctx.lineTo(memNodes[j].x, memNodes[j].y);
        ctx.strokeStyle = 'rgba(34,211,238,0.05)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  memNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34,211,238,0.15)';
    ctx.fill();
  });

  // Health indicator
  const healthScore = 96 + Math.sin(time * 0.001) * 2;
  ctx.font = '600 7px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(34,211,238,0.3)';
  ctx.textAlign = 'right';
  ctx.fillText('HEALTH ' + healthScore.toFixed(0) + '/100', w - 14, h - 8);
}

// ═════════════════════════════════════════
// Brew Monitor: Coffee-themed gauges + uptime + latency
// ═════════════════════════════════════════
function drawBrewMonitor(time) {
  const setup = getCtx('brewmonitorCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const crema = '#c8813a';
  const caramel = '#d4962a';
  const latte = '#e8c99a';

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(200,129,58,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('BREW MONITOR // SYSTEM OPS', 14, 18);

  // 4 circular gauges
  const gauges = [
    { label: 'CPU', x: 90, y: 100, val: 0.35 + Math.sin(time * 0.001) * 0.15, color: crema },
    { label: 'MEM', x: 200, y: 100, val: 0.62 + Math.sin(time * 0.0008) * 0.1, color: caramel },
    { label: 'DISK', x: 310, y: 100, val: 0.78 + Math.sin(time * 0.0005) * 0.05, color: latte },
  ];

  gauges.forEach(g => {
    const r = 36;
    const startA = -Math.PI / 2;

    // Background arc
    ctx.beginPath();
    ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,129,58,0.06)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Value arc
    const endA = startA + Math.max(0.01, g.val) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r, startA, endA);
    const arcColor = g.val > 0.8 ? '#ff4444' : g.val > 0.6 ? caramel : crema;
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Percentage
    ctx.font = '700 16px "Syne"';
    ctx.fillStyle = arcColor;
    ctx.textAlign = 'center';
    ctx.fillText((g.val * 100).toFixed(0) + '%', g.x, g.y + 6);

    // Label
    ctx.font = '500 8px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(200,129,58,0.4)';
    ctx.fillText(g.label, g.x, g.y + r + 16);
  });

  // Latency heatmap grid
  const hmX = 20, hmY = 170, hmW = w - 40, hmH = 40;
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(200,129,58,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('LATENCY HEATMAP', hmX, hmY - 6);

  const cols = 24, rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellW = hmW / cols, cellH = hmH / rows;
      const x = hmX + c * cellW, y = hmY + r * cellH;
      const val = (Math.sin(c * 0.3 + r + time * 0.002) + 1) / 2;
      const rr = Math.floor(val * 200 + 40);
      const gg = Math.floor((1 - val) * 80 + 40);
      const bb = Math.floor((1 - val) * 20);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.15 + val * 0.35})`;
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    }
  }

  // Uptime bar
  const upY = hmY + hmH + 18;
  const upW = w - 40;
  ctx.fillStyle = 'rgba(200,129,58,0.15)';
  ctx.fillRect(hmX, upY, upW, 6);
  const uptimeRatio = 0.997;
  ctx.fillStyle = '#44ff88';
  ctx.fillRect(hmX, upY, upW * uptimeRatio, 6);
  ctx.font = '500 8px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(200,129,58,0.35)';
  ctx.textAlign = 'left';
  ctx.fillText('UPTIME 99.7%', hmX, upY + 18);

  // Coffee steam effect (subtle)
  for (let i = 0; i < 5; i++) {
    const sx = 370 + Math.sin(time * 0.003 + i) * 8;
    const sy = upY - 30 - i * 18 - Math.sin(time * 0.002 + i * 0.5) * 5;
    const alpha = 0.06 - i * 0.01;
    ctx.beginPath();
    ctx.arc(sx, sy, 4 + i * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,129,58,${Math.max(0, alpha)})`;
    ctx.fill();
  }
}

// ═════════════════════════════════════════
// Neural Feed: Cyberpunk news feed + scanlines
// ═════════════════════════════════════════
function drawNeuralFeed(time) {
  const setup = getCtx('neuralfeedCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const cyan = '#00ffff';
  const magenta = '#ff00ff';
  const green = '#00ff41';

  // Header with Orbitron-style
  ctx.font = '700 9px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(0,255,255,0.35)';
  ctx.textAlign = 'left';
  ctx.fillText('NEURAL FEED // AI BRIEFING', 14, 18);

  // Scanlines overlay effect
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, y, w, 1);
  }

  // Feed items
  const feedItems = [
    { source: 'ARXIV', title: 'GPT-5 Architecture Leak', cat: 'RESEARCH', color: cyan },
    { source: 'REUTERS', title: 'EU AI Act Phase 2 Begins', cat: 'POLICY', color: green },
    { source: 'TECHCRUNCH', title: 'Anthropic Raises $4B', cat: 'INDUSTRY', color: magenta },
    { source: 'HF', title: 'New 70B Open Model Released', cat: 'TOOLS', color: cyan },
    { source: 'WIRED', title: 'AI Coding Tools Top $1B ARR', cat: 'INDUSTRY', color: green },
  ];

  const itemH = 38;
  const startY = 30;
  feedItems.forEach((item, i) => {
    const y = startY + i * itemH;
    const progress = Math.min(1, (time - 100 - i * 150) / 500);
    if (progress <= 0) return;

    // Source tag
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.font = '700 7px "JetBrains Mono"';
    ctx.fillStyle = item.color + '80';
    ctx.fillText(item.source, 16, y + 10);

    // Category tag
    const catX = 16 + ctx.measureText(item.source).width + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    const catW = ctx.measureText(item.cat).width + 8;
    ctx.fillRect(catX, y + 2, catW, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText(item.cat, catX + 4, y + 10);

    // Title
    ctx.font = '500 10px "Space Grotesk"';
    ctx.fillStyle = `rgba(255,255,255,${0.4 * progress})`;
    ctx.fillText(item.title, 16, y + 26);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(16, y + itemH - 4);
    ctx.lineTo(w - 16, y + itemH - 4);
    ctx.strokeStyle = 'rgba(0,255,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Blinking indicator
    const blink = Math.sin(time * 0.005 + i) > 0 ? 0.8 : 0.2;
    ctx.beginPath();
    ctx.arc(w - 20, y + 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = item.color + Math.floor(blink * 255).toString(16).padStart(2, '0');
    ctx.fill();

    ctx.restore();
  });

  // Live indicator
  const blinkOn = Math.sin(time * 0.005) > 0;
  ctx.beginPath();
  ctx.arc(w - 20, 12, 4, 0, Math.PI * 2);
  ctx.fillStyle = blinkOn ? 'rgba(255,0,255,0.7)' : 'rgba(255,0,255,0.15)';
  ctx.fill();
  if (blinkOn) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = magenta;
    ctx.fill();
    ctx.restore();
  }
  ctx.font = '600 7px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(255,0,255,0.4)';
  ctx.textAlign = 'right';
  ctx.fillText('LIVE', w - 28, 15);

  // Bottom: glitch line
  const glitchY = h - 10;
  ctx.beginPath();
  ctx.moveTo(0, glitchY);
  for (let x = 0; x < w; x += 2) {
    const yOff = Math.sin(x * 0.05 + time * 0.01) * 2;
    ctx.lineTo(x, glitchY + yOff);
  }
  ctx.strokeStyle = 'rgba(0,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ═════════════════════════════════════════
// AI Business Intel: B2B landing page preview
// ═════════════════════════════════════════
function drawB2BIntel(time) {
  const setup = getCtx('b2bintelCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const red = '#dc1e1e';
  const gold = '#ffd700';
  const darkRed = '#b01818';

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(220,30,30,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText('AI BUSINESS INTELLIGENCE', 14, 18);

  // Hero area
  const progress = Math.min(1, (time - 100) / 600);

  // Badge
  ctx.save();
  ctx.globalAlpha = progress;
  const badgeW = 80, badgeH = 16;
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.roundRect(w / 2 - badgeW / 2, 28, badgeW, badgeH, 8);
  ctx.fill();
  ctx.font = '700 7px "JetBrains Mono"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('URGENT ALERT', w / 2, 40);

  // Main headline
  ctx.font = '800 22px "Syne"';
  ctx.fillStyle = '#fff';
  ctx.fillText('Stay Ahead of', w / 2, 72);
  ctx.fillStyle = gold;
  ctx.fillText('Every AI Change', w / 2, 94);

  // CTA button
  const btnW = 140, btnH = 32;
  const btnX = w / 2 - btnW / 2, btnY = 108;
  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
  btnGrad.addColorStop(0, red);
  btnGrad.addColorStop(1, darkRed);
  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.fill();
  ctx.font = '700 10px "JetBrains Mono"';
  ctx.fillStyle = '#fff';
  ctx.fillText('GET ACCESS NOW →', w / 2, btnY + 20);

  // Feature pills
  const features = ['Real-time Alerts', 'Competitor Tracking', 'AI Policy Monitor'];
  features.forEach((f, i) => {
    const fx = 14 + i * 128;
    const fy = 156;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(fx, fy, 120, 40, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Icon dot
    ctx.beginPath();
    ctx.arc(fx + 14, fy + 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = gold + '40';
    ctx.fill();
    ctx.font = '600 9px "Space Grotesk"';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText(f, fx + 24, fy + 18);

    // Subtext
    ctx.font = '400 7px "Space Grotesk"';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('Monitor 24/7', fx + 24, fy + 32);
  });

  // Pricing tiers (3 cards)
  const tiers = [
    { name: 'Starter', price: '$49', color: 'rgba(255,255,255,0.04)', accent: 'rgba(255,215,0,0.2)' },
    { name: 'Pro', price: '$149', color: 'rgba(220,30,30,0.08)', accent: red },
    { name: 'Enterprise', price: '$499', color: 'rgba(255,255,255,0.04)', accent: 'rgba(255,215,0,0.2)' },
  ];
  const tierW = 110, tierH = 56;
  const tierGap = 10;
  const tierStartX = (w - (tiers.length * tierW + (tiers.length - 1) * tierGap)) / 2;
  const tierY = 210;

  tiers.forEach((t, i) => {
    const tx = tierStartX + i * (tierW + tierGap);
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.roundRect(tx, tierY, tierW, tierH, 6);
    ctx.fill();
    if (t.accent === red) {
      ctx.strokeStyle = red + '40';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = '600 8px "Space Grotesk"';
    ctx.fillStyle = t.accent;
    ctx.textAlign = 'center';
    ctx.fillText(t.name, tx + tierW / 2, tierY + 16);

    ctx.font = '800 16px "Syne"';
    ctx.fillStyle = '#fff';
    ctx.fillText(t.price, tx + tierW / 2, tierY + 36);

    ctx.font = '400 7px "Space Grotesk"';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('/month', tx + tierW / 2 + 20, tierY + 36);
  });

  // "Most Popular" badge on Pro
  const proX = tierStartX + 1 * (tierW + tierGap);
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.roundRect(proX + tierW / 2 - 30, tierY - 8, 60, 14, 7);
  ctx.fill();
  ctx.font = '700 6px "JetBrains Mono"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('POPULAR', proX + tierW / 2, tierY - 0);

  ctx.restore();
}

// ═════════════════════════════════════════
// Fasting Quest: Smart fasting tracker with AI food detection
// ═════════════════════════════════════════
function drawFastingQuest(time) {
  const setup = getCtx('fastingquestCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const green = '#4ade80';
  const darkGreen = '#166534';
  const softGreen = 'rgba(74,222,128,0.15)';

  // Title
  ctx.font = '700 10px "Syne"';
  ctx.fillStyle = green;
  ctx.textAlign = 'left';
  ctx.fillText('FASTING QUEST', 14, 22);

  // Fasting timer circle
  const cx = 100, cy = 140, r = 50;
  const fastingHours = 14 + Math.sin(time / 3000) * 2;
  const progress = Math.min(1, Math.max(0, fastingHours / 16));

  // Background ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(74,222,128,0.1)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Progress ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.strokeStyle = green;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Timer text
  ctx.font = '800 22px "Syne"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(Math.floor(fastingHours) + 'h', cx, cy - 2);
  ctx.font = '400 8px "Space Grotesk"';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('of 16h goal', cx, cy + 14);

  // Status badge
  const badgeY = cy + r + 16;
  ctx.beginPath();
  ctx.roundRect(cx - 32, badgeY, 64, 18, 9);
  ctx.fillStyle = 'rgba(74,222,128,0.15)';
  ctx.fill();
  ctx.font = '600 7px "Space Grotesk"';
  ctx.fillStyle = green;
  ctx.fillText('FASTING', cx, badgeY + 12);

  // Right side: meal log entries
  const meals = [
    { time: '12:30', name: 'Grilled Chicken Salad', cal: 420, icon: '🥗' },
    { time: '19:15', name: 'Salmon & Veggie Bowl', cal: 580, icon: '🐟' },
    { time: '08:00', name: 'Coffee (Black)', cal: 5, icon: '☕' },
  ];

  ctx.textAlign = 'left';
  const mealStartX = 180;
  meals.forEach((m, i) => {
    const my = 68 + i * 68;

    // Meal card bg
    ctx.fillStyle = softGreen;
    ctx.beginPath();
    ctx.roundRect(mealStartX, my, 200, 56, 8);
    ctx.fill();

    // Emoji
    ctx.font = '20px sans-serif';
    ctx.fillText(m.icon, mealStartX + 10, my + 30);

    // Name
    ctx.font = '600 10px "Space Grotesk"';
    ctx.fillStyle = '#fff';
    ctx.fillText(m.name, mealStartX + 40, my + 20);

    // Time + Cals
    ctx.font = '400 8px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(m.time + ' · ' + m.cal + ' cal', mealStartX + 40, my + 38);

    // AI badge
    ctx.fillStyle = green + '30';
    ctx.beginPath();
    ctx.roundRect(mealStartX + 150, my + 6, 40, 16, 4);
    ctx.fill();
    ctx.font = '600 6px "JetBrains Mono"';
    ctx.fillStyle = green;
    ctx.fillText('AI ✓', mealStartX + 155, my + 18);
  });

  // Achievement bar
  const achY = 258;
  ctx.fillStyle = 'rgba(74,222,128,0.08)';
  ctx.beginPath();
  ctx.roundRect(14, achY, w - 28, 14, 7);
  ctx.fill();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.roundRect(14, achY, (w - 28) * 0.7, 14, 7);
  ctx.fill();
  ctx.font = '600 7px "Space Grotesk"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('🔥 7-Day Streak · Level 5', w / 2, achY + 10);

  ctx.restore();
}

// ═════════════════════════════════════════
// Carrylink: Business card studio preview + affiliate seal + QR pattern
// ═════════════════════════════════════════
function drawCarrylink(time) {
  const setup = getCtx('carrylinkCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  // Warm editorial palette (matches Carrylink's actual design system)
  const ink = '#2a2520';
  const ink60 = 'rgba(42,37,32,0.6)';
  const ink30 = 'rgba(42,37,32,0.3)';
  const ink15 = 'rgba(42,37,32,0.15)';
  const ink08 = 'rgba(42,37,32,0.08)';
  const accent = '#c2703a';     // warm terracotta/amber
  const accentLight = '#d4962a';

  // Header
  ctx.font = '500 8px "Space Grotesk"';
  ctx.fillStyle = ink30;
  ctx.textAlign = 'left';
  ctx.fillText('CARRYLINK · CARD STUDIO', 14, 18);

  // Affiliate code badge
  ctx.font = '600 7px "JetBrains Mono"';
  ctx.fillStyle = accent;
  ctx.textAlign = 'right';
  ctx.fillText('crly.to/STUDIO', w - 14, 18);

  // ── Business Card (centered, rotated slightly) ──
  const cardW = 240, cardH = 140;
  const cardX = (w - cardW) / 2;
  const cardY = (h - cardH) / 2 + 10;

  ctx.save();
  ctx.translate(cardX + cardW / 2, cardY + cardH / 2);
  ctx.rotate(Math.sin(time * 0.0005) * 0.012); // subtle breath
  ctx.translate(-(cardX + cardW / 2), -(cardY + cardH / 2));

  // Card shadow
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(42,37,32,0.18)';
  ctx.shadowOffsetY = 4;
  // Card background
  ctx.fillStyle = '#faf7f2';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.fill();
  ctx.restore();

  // Card border
  ctx.strokeStyle = 'rgba(42,37,32,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 8);
  ctx.stroke();

  // Foil border shimmer (tier upgrade effect)
  const shimmerX = ((time * 0.3) % (cardW + 60)) - 30;
  const shimmerGrad = ctx.createLinearGradient(cardX - 30 + shimmerX, cardY, cardX + 30 + shimmerX, cardY);
  shimmerGrad.addColorStop(0, 'rgba(194,112,58,0)');
  shimmerGrad.addColorStop(0.5, 'rgba(194,112,58,0.4)');
  shimmerGrad.addColorStop(1, 'rgba(194,112,58,0)');
  ctx.strokeStyle = shimmerGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, 7);
  ctx.stroke();

  // Name text (italic serif)
  ctx.font = '600 24px "Syne"';
  ctx.fillStyle = ink;
  ctx.textAlign = 'left';
  ctx.fillText('Lucas Estrela', cardX + 24, cardY + 38);

  // Title
  ctx.font = '400 11px "Space Grotesk"';
  ctx.fillStyle = ink60;
  ctx.fillText('Founder · Lucas Studios', cardX + 24, cardY + 56);

  // Separator line
  ctx.beginPath();
  ctx.moveTo(cardX + 24, cardY + 66);
  ctx.lineTo(cardX + cardW - 24, cardY + 66);
  ctx.strokeStyle = ink08;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Contact details (small mono)
  ctx.font = '400 9px "JetBrains Mono"';
  ctx.fillStyle = ink30;
  ctx.fillText('lucas@lucasstudio.dev', cardX + 24, cardY + 82);
  ctx.fillText('skyestrela.io', cardX + 24, cardY + 96);

  // Affiliate short link (accent color)
  ctx.font = '600 11px "JetBrains Mono"';
  ctx.fillStyle = accent;
  ctx.fillText('crly.to/studio', cardX + 24, cardY + 118);

  // ── Generative Seal (7×7 identicon) ──
  const sealX = cardX + cardW - 56;
  const sealY = cardY + 32;
  const sealR = 22;
  const seed = 42;
  function hash(n) { let x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }

  // Seal circle
  ctx.beginPath();
  ctx.arc(sealX + sealR, sealY + sealR, sealR + 4, 0, Math.PI * 2);
  ctx.strokeStyle = ink15;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 7×7 bilateral pattern (left side mirrored)
  const gridSize = 7;
  const cellSize = (sealR * 2 - 8) / gridSize;
  const sealGridX = sealX + sealR - (gridSize * cellSize) / 2 + 4;
  const sealGridY = sealY + sealR - (gridSize * cellSize) / 2 + 4;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= 3; col++) {
      const idx = row * 4 + col;
      const filled = hash(seed + idx) > 0.48;
      if (!filled) continue;
      const mirrorCols = col < 3 ? [col, gridSize - 1 - col] : [col];
      mirrorCols.forEach(mc => {
        const px = sealGridX + mc * cellSize;
        const py = sealGridY + row * cellSize;
        ctx.fillStyle = accent + '60';
        ctx.beginPath();
        ctx.roundRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1, 1);
        ctx.fill();
      });
    }
  }

  // Tier label under seal
  ctx.font = '600 7px "JetBrains Mono"';
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.fillText('GOLD', sealX + sealR, sealY + sealR + sealR + 16);

  // ── QR Code pattern (bottom right of card) ──
  const qrX = cardX + cardW - 56;
  const qrY = cardY + cardH - 52;
  const qrSize = 32;
  const qrCell = qrSize / 7;

  // QR finder patterns (3 corners)
  [[qrX - 6, qrY - 6], [qrX + qrSize - 1, qrY - 6], [qrX - 6, qrY + qrSize - 1]].forEach(([fx, fy]) => {
    ctx.strokeStyle = ink15;
    ctx.lineWidth = 1;
    ctx.strokeRect(fx, fy, 7, 7);
  });

  // Data modules
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (hash(r * 7 + c + 100) > 0.5) {
        ctx.fillStyle = ink + '20';
        ctx.fillRect(qrX + c * qrCell, qrY + r * qrCell, qrCell - 0.5, qrCell - 0.5);
      }
    }
  }

  ctx.restore(); // end card rotation

  // ── Tier badges across bottom ──
  const tiers = [
    { label: 'BRONZE', color: '#b87333', finish: 'Matte' },
    { label: 'SILVER', color: '#c0c0c0', finish: 'Matte' },
    { label: 'GOLD', color: '#d4af37', finish: 'Gloss' },
    { label: 'OBSIDIAN', color: '#1a1a2e', finish: 'Letterpress' },
  ];
  const tierStartX = 20;
  const tierY2 = h - 18;
  const tierW2 = 85;
  const tierGap2 = 8;

  tiers.forEach((t, i) => {
    const tx = tierStartX + i * (tierW2 + tierGap2);
    const progress = Math.min(1, (time - 300 - i * 150) / 400);
    if (progress <= 0) return;

    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = ink08;
    ctx.beginPath();
    ctx.roundRect(tx, tierY2, tierW2, 12, 6);
    ctx.fill();

    // Tier color dot
    ctx.beginPath();
    ctx.arc(tx + 10, tierY2 + 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = t.color;
    ctx.fill();

    // Label
    ctx.font = '600 7px "JetBrains Mono"';
    ctx.fillStyle = ink30;
    ctx.textAlign = 'left';
    ctx.fillText(t.label, tx + 17, tierY2 + 9);

    // Finish label
    ctx.font = '400 7px "Space Grotesk"';
    ctx.fillStyle = ink15;
    ctx.textAlign = 'right';
    ctx.fillText(t.finish, tx + tierW2 - 4, tierY2 + 9);

    ctx.restore();
  });
}

// ── Astrology Compass ──
function drawAstrologyCompass(time) {
  const result = getCtx('astrologycompassCanvas', 400, 280);
  if (!result) return;
  const { ctx, w: W, h: H } = result;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.38;
  const t = time / 1000;

  // Background — deep space
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Tiny stars
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 137.5) % W);
    const sy = ((i * 97.3 + 23) % H);
    const bright = 0.15 + 0.15 * Math.sin(t * 0.5 + i);
    ctx.fillStyle = `rgba(255,255,255,${bright})`;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Outer ring — gold glow
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,215,0,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Second ring
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.92, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,215,0,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Zodiac sign glyphs around the wheel
  const SIGNS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = cx + Math.cos(angle) * R * 0.85;
    const y = cy + Math.sin(angle) * R * 0.85;

    // 30° sector lines
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * R * 0.55, cy + Math.sin(angle) * R * 0.55);
    ctx.lineTo(cx + Math.cos(angle) * R * 0.95, cy + Math.sin(angle) * R * 0.95);
    ctx.strokeStyle = 'rgba(255,215,0,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Sign glyph
    ctx.fillStyle = 'rgba(255,215,0,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(SIGNS[i], x, y);
  }

  // House cusps (12 lines from center)
  for (let i = 0; i < 12; i++) {
    const offset = t * 0.02; // slow rotation
    const angle = (i * 30 + offset - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * R * 0.55, cy + Math.sin(angle) * R * 0.55);
    ctx.strokeStyle = i === 0 ? 'rgba(255,215,0,0.4)' : 'rgba(148,163,184,0.12)';
    ctx.lineWidth = i === 0 ? 1.5 : 0.5;
    ctx.stroke();
  }

  // Planet dots orbiting at different speeds
  const planets = [
    { name: '☉', dist: 0.30, speed: 1.0, color: '#ffd700', size: 4 },
    { name: '☽', dist: 0.35, speed: 13.0, color: '#c8c8d0', size: 3 },
    { name: '☿', dist: 0.40, speed: 4.1, color: '#94a3b8', size: 2.5 },
    { name: '♀', dist: 0.42, speed: 1.6, color: '#f472b6', size: 2.5 },
    { name: '♂', dist: 0.38, speed: 0.8, color: '#ef4444', size: 2.5 },
    { name: '♃', dist: 0.48, speed: 0.08, color: '#fbbf24', size: 3.5 },
    { name: '♄', dist: 0.52, speed: 0.03, color: '#a78bfa', size: 3 },
  ];

  planets.forEach((p, i) => {
    const angle = (t * p.speed * 8 + i * 51) % 360;
    const rad = (angle - 90) * Math.PI / 180;
    const px = cx + Math.cos(rad) * R * p.dist;
    const py = cy + Math.sin(rad) * R * p.dist;

    // Glow
    ctx.beginPath();
    ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace(')', ',0.15)').replace('rgb', 'rgba').replace('#', '');
    // Use hex-based glow
    const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
    glowGrad.addColorStop(0, p.color + '40');
    glowGrad.addColorStop(1, p.color + '00');
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  // Compass needle — rotates slowly
  const needleAngle = (t * 12) % 360;
  const needleRad = (needleAngle - 90) * Math.PI / 180;
  const needleLen = R * 0.42;

  // North pointer (gold)
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(needleRad) * needleLen, cy + Math.sin(needleRad) * needleLen);
  ctx.lineTo(cx + Math.cos(needleRad + Math.PI/2) * 4, cy + Math.sin(needleRad + Math.PI/2) * 4);
  ctx.lineTo(cx + Math.cos(needleRad - Math.PI/2) * 4, cy + Math.sin(needleRad - Math.PI/2) * 4);
  ctx.closePath();
  ctx.fillStyle = '#ffd700';
  ctx.fill();

  // South pointer (dark)
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(needleRad + Math.PI) * needleLen * 0.6, cy + Math.sin(needleRad + Math.PI) * needleLen * 0.6);
  ctx.lineTo(cx + Math.cos(needleRad + Math.PI/2) * 3, cy + Math.sin(needleRad + Math.PI/2) * 3);
  ctx.lineTo(cx + Math.cos(needleRad - Math.PI/2) * 3, cy + Math.sin(needleRad - Math.PI/2) * 3);
  ctx.closePath();
  ctx.fillStyle = 'rgba(148,163,184,0.4)';
  ctx.fill();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.fill();

  // House keyword labels (inner)
  const HOUSES = ['Self','Money','Talk','Home','Create','Health','Love','Change','Quest','Career','Hopes','Hidden'];
  ctx.font = '7px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const x = cx + Math.cos(angle) * R * 0.22;
    const y = cy + Math.sin(angle) * R * 0.22;
    ctx.fillStyle = 'rgba(148,163,184,0.35)';
    ctx.fillText(HOUSES[i], x, y);
  }

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 10px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ASTROLOGY COMPASS', cx, 18);

  ctx.fillStyle = 'rgba(148,163,184,0.5)';
  ctx.font = '8px "Space Grotesk", sans-serif';
  ctx.fillText('COSMIC GPS', cx, 30);

  // Bottom info
  ctx.fillStyle = 'rgba(139,92,246,0.6)';
  ctx.font = '7px "Space Grotesk", sans-serif';
  ctx.fillText('☿ DIRECT · 🌑 NEW MOON', cx, H - 14);

  // Aspect line example (pulsing)
  const aspectAlpha = 0.15 + 0.1 * Math.sin(t * 2);
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.15, cy - R * 0.2);
  ctx.lineTo(cx + R * 0.25, cy + R * 0.15);
  ctx.strokeStyle = `rgba(34,197,94,${aspectAlpha})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Trine line
  const trineAlpha = 0.1 + 0.08 * Math.sin(t * 1.5 + 1);
  ctx.beginPath();
  ctx.moveTo(cx + R * 0.1, cy - R * 0.25);
  ctx.lineTo(cx - R * 0.05, cy + R * 0.3);
  ctx.stroke();
  ctx.strokeStyle = `rgba(34,197,94,${trineAlpha})`;
  ctx.stroke();
}

// ── Animation Loop ──
// Canvas animation map — only draws if the canvas exists in DOM
const canvasDrawMap = {
  keytuneCanvas: drawKeyTune,
  moneystackCanvas: drawMoneyStack,
  leafylifeCanvas: drawLeafyLife,
  missioncontrolCanvas: drawMissionControl,
  brewmonitorCanvas: drawBrewMonitor,
  neuralfeedCanvas: drawNeuralFeed,
  carrylinkCanvas: drawCarrylink,
  b2bintelCanvas: drawB2BIntel,
  fastingquestCanvas: drawFastingQuest,
  astrologycompassCanvas: drawAstrologyCompass,
  storagespaceCanvas: drawStorageSpace,
  cortexCanvas: drawCortex,
  pulseCanvas: drawPulse,
};

let startTime = null;
function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const time = timestamp - startTime;
  for (const [id, drawFn] of Object.entries(canvasDrawMap)) {
    if (document.getElementById(id)) drawFn(time);
  }
  requestAnimationFrame(animate);
}
// Start animation after render.js has populated the DOM
// render.js runs first (loaded before main.js), so canvases already exist
requestAnimationFrame(animate);

// ── Smooth Scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Nav Active State ──
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
  });
});

function drawStorageSpace(time) {
  const setup = getCtx('storagespaceCanvas', 400, 280);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  // Colors from Storage Space design system
  const bg = '#080c14';
  const surface = '#0d1220';
  const border = 'rgba(99,130,201,0.18)';
  const accent = '#3b82f6';
  const indigo = '#6366f1';
  const violet = '#8b5cf6';
  const emerald = '#22c55e';
  const text1 = '#e8edf7';
  const text2 = '#8b9ab8';
  const text3 = '#505f7a';

  // Animated progress for the ring
  const ringProgress = 0.62 + Math.sin(time * 0.0008) * 0.08;

  // ── Header ──
  ctx.font = '500 8px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(99,102,241,0.4)';
  ctx.textAlign = 'left';
  ctx.fillText('STORAGE.SPACE', 14, 18);

  ctx.font = '700 22px "Syne"';
  ctx.fillStyle = text1;
  ctx.textAlign = 'center';
  ctx.fillText('Cloud', w/2 - 40, 50);
  // Gradient text
  const grad = ctx.createLinearGradient(w/2, 30, w/2 + 120, 50);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.5, indigo);
  grad.addColorStop(1, violet);
  ctx.fillStyle = grad;
  ctx.fillText('Storage', w/2 + 28, 50);

  // ── Storage Ring ──
  const cx = w / 2, cy = 130, r = 44;
  const circ = 2 * Math.PI;
  const startAngle = -Math.PI / 2;

  // BG ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, circ);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 7;
  ctx.stroke();

  // Progress ring with gradient
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, startAngle + circ * ringProgress);
  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, accent);
  ringGrad.addColorStop(0.5, indigo);
  ringGrad.addColorStop(1, violet);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Ring glow
  ctx.shadowColor = indigo;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle + circ * ringProgress - 0.1, startAngle + circ * ringProgress);
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center text
  ctx.textAlign = 'center';
  ctx.font = '800 20px "Space Grotesk"';
  ctx.fillStyle = text1;
  ctx.fillText(Math.round(ringProgress * 200) + ' GB', cx, cy - 4);
  ctx.font = '400 9px "Space Grotesk"';
  ctx.fillStyle = text3;
  ctx.fillText('of 200 GB', cx, cy + 12);

  // ── File Type Breakdown ──
  const fileTypes = [
    { cat: 'Images', pct: 0.35, color: '#a855f7', icon: '◻' },
    { cat: 'Docs', pct: 0.28, color: '#3b82f6', icon: '▬' },
    { cat: 'Video', pct: 0.22, color: '#ec4899', icon: '▷' },
    { cat: 'Audio', pct: 0.15, color: '#eab308', icon: '♪' },
  ];

  const barY = 200;
  const barW = 220, barH = 6, barX = (w - barW) / 2;

  // Stacked bar
  let offsetX = barX;
  fileTypes.forEach(ft => {
    const segW = barW * ft.pct * ringProgress;
    ctx.fillStyle = ft.color;
    ctx.beginPath();
    ctx.roundRect(offsetX, barY, Math.max(1, segW), barH, 3);
    ctx.fill();
    offsetX += segW;
  });

  // Category labels
  ctx.textAlign = 'center';
  const labelY = barY + 22;
  const labelSpacing = barW / fileTypes.length;
  fileTypes.forEach((ft, i) => {
    const lx = barX + labelSpacing * i + labelSpacing / 2;
    ctx.font = '700 7px "JetBrains Mono"';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.icon, lx, labelY);
    ctx.font = '400 7px "Space Grotesk"';
    ctx.fillStyle = text2;
    ctx.fillText(ft.cat, lx, labelY + 11);
  });

  // ── Upload Animation ──
  // Floating file cards going up
  const cardCount = 4;
  for (let i = 0; i < cardCount; i++) {
    const phase = (time * 0.0005 + i * 0.8) % 3.2;
    const fy = h - 10 - phase * 80;
    const fx = w / 2 - 30 + (i % 2 === 0 ? -1 : 1) * (15 + i * 5);
    const alpha = Math.max(0, 1 - phase / 2.5);

    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = surface;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(fx, fy, 24, 18, 3);
    ctx.fill();
    ctx.stroke();

    // File icon dots
    ctx.fillStyle = [accent, violet, emerald, '#ec4899'][i % 4];
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillRect(fx + 4, fy + 4, 3, 3);
    ctx.fillRect(fx + 4, fy + 10, 8, 2);

    ctx.globalAlpha = 1;
  }

  // ── Bottom badge ──
  ctx.globalAlpha = 1;
  const badgeW2 = 100, badgeH2 = 18;
  const badgeX = w / 2 - badgeW2 / 2, badgeY2 = h - 30;
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY2, badgeX + badgeW2, badgeY2);
  badgeGrad.addColorStop(0, accent);
  badgeGrad.addColorStop(1, indigo);
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY2, badgeW2, badgeH2, 9);
  ctx.fill();

  ctx.font = '700 8px "JetBrains Mono"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('PRO · 200 GB', w / 2, badgeY2 + 12);
}


function drawPulse(time) {
    var canvas = document.getElementById('pulseCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var t = time / 1000;

    // Background
    ctx.fillStyle = '#06080f';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(99,102,241,0.06)';
    ctx.lineWidth = 0.5;
    for (var gy = 0; gy < h; gy += 30) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
    }
    for (var gx = 0; gx < w; gx += 30) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
    }

    // Ambient glow
    var grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, w * 0.4);
    grad.addColorStop(0, 'rgba(99,102,241,0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // EKG line
    var baseline = h * 0.5;
    var ekGrad = ctx.createLinearGradient(0, 0, w, 0);
    ekGrad.addColorStop(0, '#6366f1');
    ekGrad.addColorStop(0.5, '#22d3ee');
    ekGrad.addColorStop(1, '#6366f1');

    // Multiple peaks
    var peaks = [
        { cx: w * 0.15, phase: 0 },
        { cx: w * 0.4, phase: 1 },
        { cx: w * 0.65, phase: 2 },
        { cx: w * 0.88, phase: 3 },
    ];
    ctx.strokeStyle = ekGrad;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    for (var x = 0; x < w; x += 2) {
        var y = baseline;
        for (var p = 0; p < peaks.length; p++) {
            var pk = peaks[p];
            var dist = Math.abs(x - pk.cx);
            if (dist < w * 0.04) {
                var anim = Math.sin(t * 2 + pk.phase) * 0.3 + 0.7;
                var amp = h * 0.35 * anim;
                y = baseline - amp * Math.exp(-(dist * dist) / (w * w * 0.0003));
            }
        }
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow on line
    ctx.strokeStyle = 'rgba(34,211,238,0.15)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Floating thought bubbles
    var thoughts = [
        { text: 'meditate', cx: w * 0.15, cy: baseline - h * 0.38, color: '#22c55e' },
        { text: 'standup', cx: w * 0.4, cy: baseline - h * 0.36, color: '#6366f1' },
        { text: 'taxes!', cx: w * 0.65, cy: baseline - h * 0.40, color: '#f43f5e' },
        { text: 'guitar', cx: w * 0.88, cy: baseline - h * 0.35, color: '#f59e0b' },
    ];

    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var b = 0; b < thoughts.length; b++) {
        var bub = thoughts[b];
        var floatY = Math.sin(t * 1.5 + b) * 4;

        // Thought bubble background
        var tw = ctx.measureText(bub.text).width + 14;
        ctx.fillStyle = 'rgba(12,15,26,0.85)';
        ctx.strokeStyle = bub.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bub.cx - tw/2, bub.cy + floatY - 10, tw, 20, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = bub.color;
        ctx.fillText(bub.text, bub.cx, bub.cy + floatY + 4);

        // Connector dot at peak
        ctx.beginPath();
        ctx.arc(bub.cx, baseline - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = bub.color;
        ctx.fill();
    }

    // "PULSE" label
    ctx.font = 'bold 13px Inter, sans-serif';
    var pulseAlpha = (Math.sin(t * 3) * 0.3 + 0.7).toFixed(2);
    ctx.fillStyle = 'rgba(99,102,241,' + pulseAlpha + ')';
    ctx.textAlign = 'left';
    ctx.fillText('PULSE', 12, 22);

    // Status dot
    ctx.beginPath();
    ctx.arc(8, 18, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    // PRO badge
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillStyle = 'rgba(34,211,238,0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('PRO · 12-day streak', w - 8, 20);
}

// ── Cortex — Brain Training ──
function drawCortex(time) {
  const result = getCtx('cortexCanvas', 400, 280);
  if (!result) return;
  const { ctx, w: W, h: H } = result;
  const cx = W / 2, cy = H / 2;
  const t = time / 1000;

  // Background — deep purple-black
  ctx.fillStyle = '#0d0b1a';
  ctx.fillRect(0, 0, W, H);

  // Neural network nodes — 7 category colors
  const CATEGORIES = [
    { color: '#8B5CF6', label: 'M', angle: 0 },
    { color: '#EF4444', label: 'F', angle: 51.4 },
    { color: '#3B82F6', label: 'L', angle: 102.8 },
    { color: '#F97316', label: 'M', angle: 154.3 },
    { color: '#10B981', label: 'W', angle: 205.7 },
    { color: '#EC4899', label: 'R', angle: 257.1 },
    { color: '#F59E0B', label: 'P', angle: 308.6 },
  ];

  const outerR = Math.min(W, H) * 0.35;

  // Draw connection lines between nodes (neural net)
  for (let i = 0; i < CATEGORIES.length; i++) {
    for (let j = i + 1; j < CATEGORIES.length; j++) {
      const a1 = (CATEGORIES[i].angle - 90) * Math.PI / 180;
      const a2 = (CATEGORIES[j].angle - 90) * Math.PI / 180;
      const pulse = 0.03 + 0.04 * Math.sin(t * 1.5 + i + j);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
      ctx.lineTo(cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR);
      ctx.strokeStyle = `rgba(139,92,246,${pulse})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Center brain icon glow
  const glowR = 22 + 3 * Math.sin(t * 2);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR + 15);
  grad.addColorStop(0, 'rgba(139,92,246,0.25)');
  grad.addColorStop(0.6, 'rgba(236,72,153,0.08)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR + 15, 0, Math.PI * 2);
  ctx.fill();

  // Center brain symbol
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('\u{1F9E0}', cx, cy);

  // Category nodes
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const angle = (cat.angle - 90) * Math.PI / 180;
    const pulse = Math.sin(t * 2 + i * 0.9);
    const r = outerR + (pulse > 0.7 ? 4 : 0);
    const nx = cx + Math.cos(angle) * r;
    const ny = cy + Math.sin(angle) * r;

    // Connecting line to center
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    const lineAlpha = 0.15 + 0.1 * Math.sin(t * 1.2 + i);
    ctx.strokeStyle = cat.color.replace(')', `,${lineAlpha})`).replace('rgb', 'rgba');
    // Simpler: just use hex with alpha
    ctx.strokeStyle = `rgba(${parseInt(cat.color.slice(1,3),16)},${parseInt(cat.color.slice(3,5),16)},${parseInt(cat.color.slice(5,7),16)},${lineAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Node glow
    const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 18);
    nodeGrad.addColorStop(0, cat.color + '30');
    nodeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nodeGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, 18, 0, Math.PI * 2);
    ctx.fill();

    // Node circle
    ctx.beginPath();
    ctx.arc(nx, ny, 12, 0, Math.PI * 2);
    ctx.fillStyle = cat.color + '20';
    ctx.fill();
    ctx.strokeStyle = cat.color + '60';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Node label
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = cat.color;
    ctx.fillText(cat.label, nx, ny);
  }

  // Floating particles (neural sparks)
  for (let i = 0; i < 20; i++) {
    const px = ((i * 197.3 + t * 15) % W);
    const py = ((i * 131.7 + t * 8 + 50) % H);
    const alpha = 0.1 + 0.15 * Math.sin(t * 0.8 + i * 2.1);
    const size = 1 + Math.sin(t + i) * 0.5;
    ctx.fillStyle = `rgba(139,92,246,${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Score popup animation
  const popY = cy - 50 - (t * 20 % 60);
  const popAlpha = Math.max(0, 1 - (t * 0.5 % 1));
  if (popAlpha > 0.1) {
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = `rgba(250,204,21,${popAlpha * 0.6})`;
    ctx.textAlign = 'center';
    ctx.fillText('+10', cx + 30, popY);
  }

  // Star rating display
  const starY = H - 25;
  for (let i = 0; i < 3; i++) {
    const sx = cx - 18 + i * 18;
    const lit = Math.sin(t * 1.5 + i * 0.4) > 0;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = lit ? '#FACC15' : 'rgba(250,204,21,0.15)';
    ctx.fillText('\u2605', sx, starY);
  }

  // Title
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = 'rgba(226,232,240,0.4)';
  ctx.textAlign = 'left';
  ctx.fillText('CORTEX', 10, 18);
}

;