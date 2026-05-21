// ═════════════════════════════════════════
// Lucas Studios Admin — Dashboard Logic
// ═════════════════════════════════════════

let siteData = null;
let currentSection = 'site';

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  const status = await api('/api/auth/status');
  if (status.authenticated) {
    showDashboard();
  } else if (status.needsSetup || !status.hasPassword) {
    showSetup();
  } else {
    showLogin();
  }
  bindEvents();
});

// ── API helper ──
async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'same-origin',
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ── Auth ──
function showLogin() {
  document.getElementById('loginScreen').style.display = '';
  document.getElementById('loginForm').style.display = '';
  document.getElementById('setupForm').style.display = 'none';
}

function showSetup() {
  document.getElementById('loginScreen').style.display = '';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('setupForm').style.display = '';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  loadContent();
}

function bindEvents() {
  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('setupBtn').addEventListener('click', doSetup);
  document.getElementById('logoutBtn').addEventListener('click', doLogout);
  document.getElementById('changePassBtn').addEventListener('click', doChangePass);

  // Enter key on login
  document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('setupPass').addEventListener('keydown', e => { if (e.key === 'Enter') doSetup(); });

  // Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Save buttons
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => saveSection(btn));
  });

  // Project CRUD
  document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal());
  document.getElementById('modalClose').addEventListener('click', closeProjectModal);
  document.getElementById('modalCancel').addEventListener('click', closeProjectModal);
  document.getElementById('modalSave').addEventListener('click', saveProject);

  // Sub-editors
  document.getElementById('addCardBtn').addEventListener('click', () => addSubItem('aboutCards', { num: '05', title: '', desc: '' }));
  document.getElementById('addStatBtn').addEventListener('click', () => addSubItem('aboutStats', { count: 0, label: '' }));
  document.getElementById('addContactLinkBtn').addEventListener('click', () => addSubItem('contactLinks', { icon: '⌘', label: '', url: '' }));
  document.getElementById('addFeatureBtn').addEventListener('click', () => addSubItem('projFeatures', { icon: '✦', text: '' }));
  document.getElementById('addLinkBtn').addEventListener('click', () => addSubItem('projLinks', { type: 'tag', label: '', url: '' }));
}

async function doLogin() {
  const pass = document.getElementById('loginPass').value;
  const hint = document.getElementById('loginHint');
  hint.textContent = '';
  try {
    await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ password: pass }) });
    showDashboard();
  } catch (e) {
    if (e.needsSetup) { showSetup(); return; }
    hint.textContent = e.error || 'Login failed';
  }
}

async function doSetup() {
  const pass = document.getElementById('setupPass').value;
  const confirm = document.getElementById('setupPassConfirm').value;
  const hint = document.getElementById('setupHint');
  hint.textContent = '';
  if (pass !== confirm) { hint.textContent = 'Passwords do not match'; return; }
  if (pass.length < 6) { hint.textContent = 'Min 6 characters'; return; }
  try {
    await api('/api/auth/setup', { method: 'POST', body: JSON.stringify({ password: pass }) });
    showDashboard();
  } catch (e) {
    hint.textContent = e.error || 'Setup failed';
  }
}

async function doLogout() {
  await api('/api/auth/logout', { method: 'POST' });
  location.reload();
}

async function doChangePass() {
  const pass = document.getElementById('newPassword').value;
  if (pass.length < 6) { toast('Min 6 characters', true); return; }
  try {
    await api('/api/auth/setup', { method: 'POST', body: JSON.stringify({ password: pass }) });
    document.getElementById('newPassword').value = '';
    toast('Password updated');
  } catch (e) {
    toast(e.error || 'Failed', true);
  }
}

// ── Load content ──
async function loadContent() {
  siteData = await api('/api/content');
  populateFields();
  renderProjects();
  renderAboutCards();
  renderAboutStats();
  renderContactLinks();
}

function populateFields() {
  document.querySelectorAll('[data-path]').forEach(el => {
    const path = el.dataset.path;
    const val = getNested(siteData, path);
    if (val === undefined) return;
    if (el.tagName === 'TEXTAREA') {
      el.value = Array.isArray(val) ? val.join('\n') : val;
    } else {
      el.value = val;
    }
  });
}

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

// ── Navigation ──
function switchSection(section) {
  currentSection = section;
  document.querySelectorAll('.editor').forEach(el => el.style.display = 'none');
  document.getElementById('editor-' + section).style.display = '';
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.section === section));
}

// ── Save section ──
async function saveSection(btn) {
  const endpoint = btn.dataset.endpoint;
  const basePath = btn.dataset.path;
  const payload = {};

  // Gather all fields for this section
  const container = btn.closest('.editor');
  container.querySelectorAll('[data-path]').forEach(el => {
    const relPath = el.dataset.path.replace(basePath + '.', '');
    let val = el.value;
    // Handle arrays stored as newlines
    if (relPath === 'titleLines') val = val.split('\n').filter(Boolean);
    // Handle numbers
    if (relPath === 'stats' || relPath === 'count') {} // handled separately
    setNested(payload, relPath, val);
  });

  // Handle sub-editors (cards, stats, links) from their DOM
  if (basePath === 'about') {
    payload.cards = collectSubItems('aboutCards', ['num', 'title', 'desc']);
    payload.stats = collectSubItems('aboutStats', ['count', 'label']).map(s => ({ ...s, count: parseInt(s.count) || 0 }));
  }
  if (basePath === 'contact') {
    payload.links = collectSubItems('contactLinks', ['icon', 'label', 'url']);
  }

  try {
    await api(endpoint, { method: 'PUT', body: JSON.stringify(payload) });
    siteData = await api('/api/content');
    toast('Saved!');
  } catch (e) {
    toast(e.error || 'Save failed', true);
  }
}

function setNested(obj, path, val) {
  const keys = path.split('.');
  let cur = obj;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = val;
    else { if (!cur[k]) cur[k] = {}; cur = cur[k]; }
  });
}

// ── Sub-item editors ──
function renderAboutCards() {
  const container = document.getElementById('aboutCards');
  container.innerHTML = '';
  siteData.about.cards.forEach((card, i) => {
    addSubItemToDom(container, i, [
      { key: 'num', label: 'Num', value: card.num, small: true },
      { key: 'title', label: 'Title', value: card.title },
      { key: 'desc', label: 'Description', value: card.desc, textarea: true },
    ]);
  });
}

function renderAboutStats() {
  const container = document.getElementById('aboutStats');
  container.innerHTML = '';
  siteData.about.stats.forEach((stat, i) => {
    addSubItemToDom(container, i, [
      { key: 'count', label: 'Count', value: stat.count, small: true, type: 'number' },
      { key: 'label', label: 'Label', value: stat.label },
    ]);
  });
}

function renderContactLinks() {
  const container = document.getElementById('contactLinks');
  container.innerHTML = '';
  siteData.contact.links.forEach((link, i) => {
    addSubItemToDom(container, i, [
      { key: 'icon', label: 'Icon', value: link.icon, small: true },
      { key: 'label', label: 'Label', value: link.label },
      { key: 'url', label: 'URL', value: link.url },
    ]);
  });
}

function addSubItem(containerId, template) {
  const container = document.getElementById(containerId);
  const idx = container.children.length;
  const fields = Object.entries(template).map(([k, v]) => {
    const isSmall = (k === 'num' || k === 'icon' || k === 'count' || k === 'type');
    const isTextarea = (k === 'desc' || k === 'text');
    return { key: k, label: k.charAt(0).toUpperCase() + k.slice(1), value: v, small: isSmall, textarea: isTextarea };
  });
  addSubItemToDom(container, idx, fields);
}

function addSubItemToDom(container, idx, fields) {
  const div = document.createElement('div');
  div.className = 'sub-item';
  div.dataset.index = idx;

  const inputsHtml = fields.map(f => {
    const width = f.small ? 'width:80px;' : 'flex:1;';
    if (f.textarea) {
      return `<div style="${width}"><div class="field" style="margin:0"><label>${f.label}</label><textarea data-field="${f.key}" rows="2" style="min-height:50px">${f.value || ''}</textarea></div></div>`;
    }
    return `<div style="${width}"><div class="field" style="margin:0"><label>${f.label}</label><input type="${f.type || 'text'}" data-field="${f.key}" value="${escapeAttr(f.value)}"></div></div>`;
  }).join('');

  div.innerHTML = `
    <div style="display:flex;gap:0.6rem;flex-wrap:wrap">${inputsHtml}</div>
    <div class="sub-item-actions">
      <button class="btn-icon sub-del" title="Remove">✕</button>
    </div>`;

  div.querySelector('.sub-del').addEventListener('click', () => {
    div.remove();
    reindexSubItems(container);
  });

  container.appendChild(div);
}

function reindexSubItems(container) {
  Array.from(container.children).forEach((el, i) => el.dataset.index = i);
}

function collectSubItems(containerId, keys) {
  const container = document.getElementById(containerId);
  return Array.from(container.querySelectorAll('.sub-item')).map(item => {
    const obj = {};
    keys.forEach(k => {
      const el = item.querySelector(`[data-field="${k}"]`);
      obj[k] = el ? el.value : '';
    });
    return obj;
  });
}

// ── Projects ──
function renderProjects() {
  const list = document.getElementById('projectsList');
  list.innerHTML = '';
  const sorted = [...siteData.projects].sort((a, b) => a.order - b.order);
  sorted.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="project-card-order">#${p.order}</div>
      <div class="project-card-info">
        <div class="project-card-name">${escapeHtml(p.name)}</div>
        <div class="project-card-role">${escapeHtml(p.role)}</div>
        <div class="project-card-tags">${p.tags.map(t => `<span class="project-card-tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
      <div class="project-card-actions">
        <button class="btn-icon proj-edit" title="Edit">✎</button>
        <button class="btn-icon proj-del" title="Delete" style="color:var(--red)">✕</button>
      </div>`;
    card.querySelector('.proj-edit').addEventListener('click', e => { e.stopPropagation(); openProjectModal(p.id); });
    card.querySelector('.proj-del').addEventListener('click', e => { e.stopPropagation(); deleteProject(p.id); });
    list.appendChild(card);
  });
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  try {
    await api(`/api/projects/${id}`, { method: 'DELETE' });
    siteData = await api('/api/content');
    renderProjects();
    toast('Project deleted');
  } catch (e) {
    toast(e.error || 'Delete failed', true);
  }
}

// ── Project Modal ──
function openProjectModal(id) {
  const modal = document.getElementById('projectModal');
  document.getElementById('modalTitle').textContent = id ? 'Edit Project' : 'Add Project';
  document.getElementById('projId').value = id || '';

  if (id) {
    const p = siteData.projects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('projIdInput').value = p.id;
    document.getElementById('projOrder').value = p.order;
    document.getElementById('projName').value = p.name;
    document.getElementById('projRole').value = p.role;
    document.getElementById('projDesc').value = p.description;
    document.getElementById('projTags').value = p.tags.join(', ');
    document.getElementById('projStack').value = p.stack.join(', ');
    document.getElementById('projCanvasType').value = p.canvasType || 'custom';
    document.getElementById('projPreviewBg').value = p.previewBg || '';
    renderModalFeatures(p.features || []);
    renderModalLinks(p.links || []);
  } else {
    document.getElementById('projIdInput').value = '';
    document.getElementById('projOrder').value = siteData.projects.length + 1;
    document.getElementById('projName').value = '';
    document.getElementById('projRole').value = '';
    document.getElementById('projDesc').value = '';
    document.getElementById('projTags').value = '';
    document.getElementById('projStack').value = '';
    document.getElementById('projCanvasType').value = 'custom';
    document.getElementById('projPreviewBg').value = '';
    renderModalFeatures([]);
    renderModalLinks([]);
  }

  modal.style.display = '';
}

function closeProjectModal() {
  document.getElementById('projectModal').style.display = 'none';
}

function renderModalFeatures(features) {
  const container = document.getElementById('projFeatures');
  container.innerHTML = '';
  features.forEach(f => addModalSubItem(container, 'projFeatures', [
    { key: 'icon', label: 'Icon', value: f.icon, small: true },
    { key: 'text', label: 'Text', value: f.text },
  ]));
}

function renderModalLinks(links) {
  const container = document.getElementById('projLinks');
  container.innerHTML = '';
  links.forEach(l => addModalSubItem(container, 'projLinks', [
    { key: 'type', label: 'Type', value: l.type, small: true },
    { key: 'label', label: 'Label', value: l.label },
    { key: 'url', label: 'URL', value: l.url || '' },
  ]));
}

function addModalSubItem(container, containerId, fields) {
  addSubItemToDom(container, container.children.length, fields);
}

async function saveProject() {
  const id = document.getElementById('projId').value;
  const payload = {
    id: document.getElementById('projIdInput').value.trim(),
    order: parseInt(document.getElementById('projOrder').value) || 1,
    name: document.getElementById('projName').value.trim(),
    role: document.getElementById('projRole').value.trim(),
    description: document.getElementById('projDesc').value.trim(),
    tags: document.getElementById('projTags').value.split(',').map(s => s.trim()).filter(Boolean),
    stack: document.getElementById('projStack').value.split(',').map(s => s.trim()).filter(Boolean),
    canvasType: document.getElementById('projCanvasType').value,
    previewBg: document.getElementById('projPreviewBg').value.trim(),
    features: collectSubItems('projFeatures', ['icon', 'text']),
    links: collectSubItems('projLinks', ['type', 'label', 'url']),
  };

  if (!payload.id) { toast('Project ID is required', true); return; }
  if (!payload.name) { toast('Project name is required', true); return; }

  try {
    if (id) {
      await api(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
    }
    siteData = await api('/api/content');
    renderProjects();
    closeProjectModal();
    toast(id ? 'Project updated' : 'Project created');
  } catch (e) {
    toast(e.error || 'Save failed', true);
  }
}

// ── Toast ──
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (isError ? ' error' : '');
  el.style.display = '';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.style.display = 'none', 3000);
}

// ── Util ──
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}