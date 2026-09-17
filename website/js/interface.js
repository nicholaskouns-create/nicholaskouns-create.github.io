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

async function init() {
  try {
    const response = await fetch('data/interface_atlas.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`Atlas HTTP ${response.status}`);
    const atlas = await response.json();
    const entry = atlas.entries.find(item => item.id === requested) || atlas.entries[0];

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
