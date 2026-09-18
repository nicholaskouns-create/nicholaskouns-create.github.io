const params = new URLSearchParams(location.search);
const requested = params.get('id');

const titleEl = document.getElementById('gateway-title');
const kindEl = document.getElementById('gateway-kind');
const summaryEl = document.getElementById('gateway-summary');
const statusEl = document.getElementById('gateway-status');
const primaryLink = document.getElementById('primary-link');
const runtimeLink = document.getElementById('runtime-link');
const sourceLink = document.getElementById('source-link');
const runtimeShell = document.getElementById('runtime-shell');
const runtimeFrame = document.getElementById('runtime-frame');
const runtimePopout = document.getElementById('runtime-popout');

function hideLink(anchor) {
  anchor.hidden = true;
  anchor.removeAttribute('href');
}

function normalizeRuntime(url) {
  if (!url) return null;
  try { return new URL(url, location.href).href; }
  catch { return url; }
}

function renderAlternates(entry) {
  if (!entry.alternates?.length) return;
  const links = document.querySelector('.gateway-links');
  if (!links) return;
  const style = document.createElement('style');
  style.textContent = `.gateway-alts{margin:0 0 24px;padding:14px 16px;border:1px solid var(--line);background:var(--surface);border-radius:9px}.gateway-alts p{margin:0 0 9px;font:500 9px var(--mono);letter-spacing:.14em;color:var(--muted);text-transform:uppercase}.gateway-alt-links{display:flex;gap:8px;flex-wrap:wrap}.gateway-alt-links a{font:500 10px var(--mono);color:var(--live);text-decoration:none;border:1px solid #355153;border-radius:999px;padding:7px 9px}.gateway-alt-links a:hover{background:#122022}`;
  document.head.appendChild(style);
  const box = document.createElement('div');
  box.className = 'gateway-alts';
  box.innerHTML = `<p>Additional interface lineage</p><div class="gateway-alt-links">${entry.alternates.map(item => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label} ↗</a>`).join('')}</div>`;
  links.after(box);
}

async function init() {
  try {
    const [baseResponse, extraResponse] = await Promise.all([
      fetch('data/interface_atlas.json', {cache: 'no-store'}),
      fetch('data/featured_interfaces.json', {cache: 'no-store'})
    ]);
    if (!baseResponse.ok) throw new Error(`Atlas HTTP ${baseResponse.status}`);
    const atlas = await baseResponse.json();
    const extras = extraResponse.ok ? await extraResponse.json() : {entries: []};
    const byId = new Map((atlas.entries || []).map(item => [item.id, item]));
    (extras.entries || []).forEach(item => byId.set(item.id, {...(byId.get(item.id) || {}), ...item}));
    const entries = [...byId.values()];
    const entry = entries.find(item => item.id === requested) || entries[0];

    titleEl.textContent = entry.title;
    document.title = `${entry.title} · The Mathematical City`;
    kindEl.textContent = `${entry.kind || 'interface'} · ${entry.role || 'City surface'}`;
    summaryEl.textContent = entry.summary || 'Mathematical City interface surface.';
    statusEl.innerHTML = '<span class="dot"></span> SOURCE LOCKED';

    if (entry.primary) primaryLink.href = entry.primary; else hideLink(primaryLink);

    const runtime = normalizeRuntime(entry.runtime);
    if (runtime) {
      runtimeLink.href = runtime;
      runtimePopout.href = runtime;
      runtimeFrame.src = runtime;
      runtimeShell.hidden = false;
    } else {
      hideLink(runtimeLink);
      runtimeShell.hidden = true;
    }

    if (entry.source) sourceLink.href = entry.source; else hideLink(sourceLink);
    renderAlternates(entry);
  } catch (error) {
    titleEl.textContent = 'Interface unavailable';
    summaryEl.textContent = 'The interface atlas could not be resolved. Return to the Atlas and use the primary-source links there.';
    statusEl.innerHTML = 'ATLAS ERROR';
    hideLink(primaryLink);
    hideLink(runtimeLink);
    hideLink(sourceLink);
    runtimeShell.hidden = true;
    console.error(error);
  }
}

init();
