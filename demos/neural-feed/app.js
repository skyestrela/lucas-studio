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

let started;
function animate(timestamp) {
  if (started === undefined) started = timestamp;
  drawNeuralFeed(timestamp - started);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
