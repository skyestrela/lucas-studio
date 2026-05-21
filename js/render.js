// ═════════════════════════════════════════
// Lucas Studios — Client-side render from API
// ═════════════════════════════════════════

(async function() {
  let data;
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    // Fallback: load static data.json (for GitHub Pages / static hosting)
    try {
      const res = await fetch('/lucas-studio/data.json');
      data = await res.json();
    } catch (e2) {
      console.error('Failed to load content:', e2);
      return;
    }
  }

  // ── Site meta ──
  document.title = data.site.title || 'Lucas Studios';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = data.site.description || '';

  // ── Hero ──
  const heroTag = document.getElementById('heroTag');
  if (heroTag) heroTag.textContent = data.hero.tag || '';

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle && data.hero.titleLines) {
    heroTitle.innerHTML = data.hero.titleLines.map((line, i) => {
      const cls = i === data.hero.titleLines.length - 1 ? 'line accent' : 'line';
      const delay = `data-delay="${i}"`;
      return `<span class="${cls}" ${delay}>${escHtml(line)}</span>`;
    }).join('\n');
  }

  const heroSub = document.getElementById('heroSub');
  if (heroSub) heroSub.textContent = data.hero.subtitle || '';

  const heroCtaPrimary = document.getElementById('heroCtaPrimary');
  if (heroCtaPrimary) heroCtaPrimary.textContent = data.hero.ctaPrimary || 'View Projects';

  const heroCtaSecondary = document.getElementById('heroCtaSecondary');
  if (heroCtaSecondary) heroCtaSecondary.textContent = data.hero.ctaSecondary || 'About Studio';

  // ── Projects ──
  const container = document.getElementById('projectsContainer');
  if (container && data.projects) {
    const sorted = [...data.projects].sort((a, b) => a.order - b.order);
    container.innerHTML = sorted.map((p, i) => renderProject(p, i)).join('');
  }

  // ── About ──
  const aboutTitle = document.getElementById('aboutTitle');
  if (aboutTitle) aboutTitle.textContent = data.about.title || '';

  const aboutSub = document.getElementById('aboutSub');
  if (aboutSub) aboutSub.textContent = data.about.subtitle || '';

  const aboutCards = document.getElementById('aboutCards');
  if (aboutCards && data.about.cards) {
    aboutCards.innerHTML = data.about.cards.map(c => `
      <div class="about-card">
        <div class="about-card-icon">${escHtml(c.num)}</div>
        <h3>${escHtml(c.title)}</h3>
        <p>${escHtml(c.desc)}</p>
      </div>
    `).join('');
  }

  const aboutStats = document.getElementById('aboutStats');
  if (aboutStats && data.about.stats) {
    aboutStats.innerHTML = data.about.stats.map(s => `
      <div class="stat">
        <span class="stat-num" data-count="${s.count}">0</span>
        <span class="stat-label">${escHtml(s.label)}</span>
      </div>
    `).join('');
  }

  // ── Contact ──
  const contactTitle = document.getElementById('contactTitle');
  if (contactTitle) contactTitle.textContent = data.contact.title || '';

  const contactSub = document.getElementById('contactSub');
  if (contactSub) contactSub.textContent = data.contact.subtitle || '';

  const contactLinks = document.getElementById('contactLinks');
  if (contactLinks && data.contact.links) {
    contactLinks.innerHTML = data.contact.links.map(l => {
      if (l.url) {
        return `<a href="${escAttr(l.url)}" target="_blank" class="contact-link">
          <span class="contact-icon">${escHtml(l.icon)}</span>
          <span>${escHtml(l.label)}</span>
          <span class="contact-arrow">→</span>
        </a>`;
      }
      return `<div class="contact-link">
        <span class="contact-icon">${escHtml(l.icon)}</span>
        <span>${escHtml(l.label)}</span>
      </div>`;
    }).join('');
  }

  // ── Footer ──
  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy) footerCopy.innerHTML = `&copy; ${new Date().getFullYear()} — ${escHtml(data.site.footerTagline || '')}`;

  // ── Post-render: re-observe dynamically inserted elements ──
  // main.js sets up IntersectionObservers before render.js inserts DOM,
  // so we must re-observe all new elements here after the fetch completes.

  // Projects: scroll reveal
  document.querySelectorAll('.project').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
  });
  // About cards: scroll reveal
  document.querySelectorAll('.about-card').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
  });
  // Stats: count-up animation
  document.querySelectorAll('.stat-num').forEach(el => {
    if (typeof statObserver !== 'undefined') statObserver.observe(el);
  });

  // Auto-reveal projects/cards already in viewport (no scroll needed)
  requestAnimationFrame(() => {
    document.querySelectorAll('.project').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
    document.querySelectorAll('.about-card').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
    // Auto-trigger count-up for stats already in viewport
    // (fallback for IntersectionObserver not firing in some environments)
    document.querySelectorAll('.stat-num').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && el.textContent.trim() === '0') {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = current + (target > 10 ? '+' : '');
        }, 30);
        if (typeof statObserver !== 'undefined') statObserver.unobserve(el);
      }
    });
  });
})();

function renderProject(p, index) {
  const reverse = index % 2 === 1 ? ' project-reverse' : '';
  const canvasId = p.canvasType + 'Canvas';
  // Capitalize first letter for preview class
  const previewClass = p.canvasType + '-preview';

  const featuresHtml = (p.features || []).map(f =>
    `<div class="feature"><span class="feature-icon">${escHtml(f.icon)}</span><span>${escHtml(f.text)}</span></div>`
  ).join('');

  const stackHtml = (p.stack || []).map(s => `<span>${escHtml(s)}</span>`).join('');

  const linksHtml = (p.links || []).map(l => {
    if (l.type === 'tag') {
      return `<span class="project-link-tag">${escHtml(l.label)}</span>`;
    }
    if (l.type === 'pwa') {
      return `<a href="${escAttr(l.url)}" class="project-link-pwa"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L12 12M12 12L8 8M12 12L16 8M5 14V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V14"/></svg>${escHtml(l.label)}</a>`;
    }
    if (l.url) {
      return `<a href="${escAttr(l.url)}" target="_blank" class="project-link">${escHtml(l.label)}</a>`;
    }
    return `<span class="project-link-tag">${escHtml(l.label)}</span>`;
  }).join('<span class="project-link-divider">·</span>');

  const tagsHtml = (p.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('');

  return `
    <div class="project${reverse}" data-project="${p.id}" id="proj-${p.id}">
      <div class="project-visual">
        <div class="project-preview ${previewClass}">
          <canvas id="${canvasId}" width="400" height="280"></canvas>
        </div>
      </div>
      <div class="project-info">
        <div class="project-tags">${tagsHtml}</div>
        <h3 class="project-name">${escHtml(p.name)}</h3>
        <p class="project-role">${escHtml(p.role)}</p>
        <p class="project-desc">${escHtml(p.description)}</p>
        <div class="project-features">${featuresHtml}</div>
        <div class="project-stack">${stackHtml}</div>
        <div class="project-links">${linksHtml}</div>
      </div>
    </div>`;
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
function escAttr(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}