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

let started;
function animate(timestamp) {
  if (started === undefined) started = timestamp;
  drawB2BIntel(timestamp - started);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
