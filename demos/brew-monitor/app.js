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

let started;
function animate(timestamp) {
  if (started === undefined) started = timestamp;
  drawBrewMonitor(timestamp - started);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
