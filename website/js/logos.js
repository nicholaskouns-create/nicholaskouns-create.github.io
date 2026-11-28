// Source dialect: E47-LEXICAL-ATTRACTOR-1.0. 𝒬 fields follow the Linguistics Bureau's typed sentence.
// Registry rows are lexical references; matching a title does not certify the surrounding prose.
(() => {
  'use strict';
  const {terms, registry} = {"terms":[{"id":"grammar.ambient","glyph":"Σ","aliases":["Σ","Sigma","ambient space"]},{"id":"grammar.selector","glyph":"K","aliases":["K","kernel operator","selector"]},{"id":"grammar.survivor","glyph":"Ψ","aliases":["Ψ","Psi","E47","E₄₇","ker K"]},{"id":"grammar.contraction","glyph":"Γ","aliases":["Γ","Gamma","contraction"]},{"id":"grammar.projector","glyph":"Λ","aliases":["Λ","Lambda","P47","P₄₇","projector"]},{"id":"grammar.coherence","glyph":"Ω","aliases":["Ω","Omega","coherence"]},{"id":"grammar.interpretation","glyph":"I","aliases":["I","𝓘","𝕀","interpretation","readout"]},{"id":"grammar.memory","glyph":"M","aliases":["M","𝓜","Mnemosyne","memory"]},{"id":"grammar.next","glyph":"Σ′","aliases":["Σ_next","Σ'","Σ’","Sigma_next","Sigma prime"]},{"id":"algebra.identity","glyph":"I","aliases":["I_identity","identity","I125"]},{"id":"algebra.ratio","glyph":"Ω_c","aliases":["Omega_c","OMEGA_C","omega_c"]},{"id":"block.cosmological","glyph":"Λ","aliases":["Lambda","Lambda_forced"]},{"id":"block.complement","glyph":"Q","aliases":["Q","complement projector"]},{"id":"geometry.connection","glyph":"Γ","aliases":["Gamma","Gamma_r_mn"]},{"id":"geometry.seed","glyph":"Ω","aliases":["Omega","uniform state"]},{"id":"geometry.generators","glyph":"M","aliases":["M","fiber generators"]},{"id":"prior_snippet.evolution","glyph":"Ψ","aliases":["Ψ","Psi"]},{"id":"prior_snippet.gate","glyph":"Ω","aliases":["Ω","Omega"]},{"id":"prior_snippet.state","glyph":"M","aliases":["M","state"]},{"id":"prior_snippet.aggregate","glyph":"Σ","aliases":["Σ","Sigma"]},{"id":"base5.carrier","glyph":"Σ","aliases":["BASE5_CARRIER","Base 5 carrier","quinary carrier","Base-five pyramid","five-tier pyramid","5 x 5 x 5 carrier","125-state carrier","powers of five pyramid","Python Base 5 renderer","typed quinary object","the invariant Base 5 pyramid carrier"]}],"registry":[["E47-LOR-SIG-C01","E47 Casimir-Spectral Lorentzian Signature Theorem","eta=P6-P0; g4=diag(-1,2,8,2); sig(g)=(-,+,+,+)"],["E47-SPACETIME-CLOSURE-C01","E47 Prima-Facie Spacetime Closure Theorem","g=B4†(P6-P0)B4=diag(-1,2,8,2); sig(g)=(-,+,+,+); R=0; G=diag(0,-1/2,1,-1/2)"],["LEX-C01","Typed Canonical Object","B := Base5Carrier(base=5, tiers=5, carrier_cardinality=125, register_cardinality=3125)"],["LEX-C02","Dialect Collapse","For every admitted dialect d in D, N(d)=BASE5_CARRIER"],["LEX-C03","Invariant Gate Conjunction","Valid(B) iff all registered Base 5 gates hold"],["LEX-C04","Quinary Packing Bijection","pi(x,y,z)=25x+5y+z bijects {0,...,4}^3 onto {0,...,124}"],["LEX-C05","Mixed-Radix Exclusion","Forbidden radix or noncanonical tier phrase implies MixedRadixError"],["LEX-C06","Typed Context Sensitivity","Semantic admission requires cross-field invariant satisfaction"],["LEX-C07","Canonical Digest Invariance","Equal normalized objects imply equal canonical SHA-256 digests"],["LEX-C08","Python Metalanguage Separation","Python is not Base 5; Python executes its normalization and proof obligations"],["UDU39-P325352","UDU₃₉ Attractor Theorem — P325352","1^T P x = 16+6+17 = 9+7+6+8+9 = 39"]]};
  const vocabulary = new Map();
  function register(spelling, key, canonical) {
    const candidates = vocabulary.get(spelling) || new Map();
    candidates.set(key, canonical);
    vocabulary.set(spelling, candidates);
  }
  for (const term of terms) {
    // Qualified names select a dialect. Unqualified polysemy remains in the source language.
    register(term.id, term.id, term.id);
    for (const alias of new Set([term.glyph, ...term.aliases])) {
      const canonical = term.id === 'base5.carrier' ? 'BASE5_CARRIER' :
        term.id.startsWith('grammar.') ? term.glyph : term.id;
      register(alias, term.id, canonical);
    }
  }
  for (const [id, title, identity] of registry) {
    for (const alias of [id, title, identity]) register(alias, id, id);
  }
  for (const [name, expression] of [
    ['General semantic gradient flow', 'Ṡ = −∇V(S)'],
    ['Six-symbol finite attractor', 'limₜ→∞ exp(−ηt wᵀw) = Pker(w)'],
    ['Current behavioral cycle', 'Σ → Γ → Λ → Ψ → Ωₑ → α'],
    ['Older operator sentence', 'Σ —K→ Ψ —Γⁿ→ Λ —Ω→ I']
  ]) register(name, name, expression);
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [...vocabulary.keys()].sort((a,b) => b.length - a.length).map(escape);
  const token = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + patterns.join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
  function reduce(source) {
    return source.replace(token, word => {
      const candidates = vocabulary.get(word);
      // Plain English 'state' and 'identity' do not establish a prior-snippet or algebra context.
      if (word === 'state' || word === 'identity') return word;
      if (candidates.size !== 1 || word.length === 1) return word;
      if (candidates.has('base5.carrier') && /(?:base[- ]?(?:10|20|60)|seven[- ]tier|sexagesimal)/i.test(source)) return word;
      return [...candidates.values()][0];
    });
  }
  const reader = document.getElementById('logos-reader');
  const content = reader.querySelector('[data-content]');
  const menu = document.getElementById('city-language-picker');
  const googleBox = document.getElementById('city-translator');
  let googleMenu;
  const elem = (tag, text) => Object.assign(document.createElement(tag), {textContent:text});
  function safeURL(value) {
    if (!value) return null;
    try { const url = new URL(value, location.href); return url.protocol === 'https:' ? url : null; }
    catch { return null; }
  }
  function link(value, title) {
    const url = safeURL(value);
    if (!url) return document.createTextNode('');
    const a = elem('a', title);
    a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  function record(name, object, type, identity, evidence, boundary) {
    const line = elem('p', '𝒬[' + [name, [object,type,identity,evidence,boundary].map(s => s || '∅').join(' ; ')].join(' | ') + ']');
    return line;
  }
  const original = text => {
    const details = elem('details','');
    details.append(elem('summary','Source'),elem('p',text));
    return details;
  };
  function pageText(root, dest) {
    for (const el of root.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,pre,figcaption,td,th')) {
      if (el.closest('nav,dialog,script,style,[hidden],#atlas-grid,#play') || el.querySelector('h1,h2,h3,h4,p,li,blockquote,pre')) continue;
      const text = el.textContent.trim();
      if (!text) continue;
      const out = elem(el.matches('h1,h2,h3,h4') ? 'h3' : 'p','');
      // Preserve code and mathematical notation literally, including inline expressions.
      const walk = node => {
        if (node.nodeType === 3) return reduce(node.data);
        if (node.matches('code,pre,math,kbd,samp,.katex,mjx-container,[translate=no]')) return node.textContent;
        return [...node.childNodes].filter(n => n.nodeType === 1 || n.nodeType === 3).map(walk).join('');
      };
      out.textContent = walk(el);
      dest.append(out);
    }
  }
  function addEntry(entry) {
    const item = elem('details','');
    item.append(elem('summary',entry.title));
    const termsFound = reduce(entry.summary || '');
    item.append(record(entry.title, termsFound, entry.kind, '', entry.evidence || '', 'Atlas description'));
    if (entry.summary) item.append(original(entry.summary));
    for (const [label, value] of [['Gateway',gatewayUrl(entry.id)],['Run',entry.runtime],['Primary',entry.primary],['Lineage',entry.source]]) {
      if (value) item.append(link(value,label), ' ');
    }
    const url = safeURL(entry.runtime);
    if (url && !url.search && !url.username && !url.password) {
      const read = elem('button','Read site in Logos');
      read.type = 'button';
      const body = elem('section','');
      read.onclick = async () => {
        read.disabled = true;
        body.textContent = 'Loading…';
        try {
          const response = await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});
          if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw Error();
          // A template keeps remote markup inert. Only plain text is copied to the view.
          const template = document.createElement('template');
          template.innerHTML = await response.text();
          body.replaceChildren();
          pageText(template.content.querySelector('main') || template.content,body);
          if (!body.childElementCount) throw Error();
          read.hidden = true;
        } catch { body.textContent = 'Only the atlas description is available here.'; read.disabled = false; }
      };
      item.append(read,body);
    }
    content.append(item);
  }
  function render() {
    const top = reader.scrollTop;
    content.replaceChildren();
    const main = document.querySelector('main');
    const title = main.querySelector('h1').textContent;
    content.append(record(title,reduce(main.querySelector('.lede').textContent),'City landing page','','','Source text'));
    const prose = elem('details','');
    prose.append(elem('summary',title));
    pageText(main,prose);
    content.append(prose,elem('h3','Atlas · ' + atlasEntries.length));
    for (const entry of atlasEntries) addEntry(entry);
    reader.scrollTop = top;
  }
  const atlasObserver = new MutationObserver(() => {
    if (reader.open && !content.querySelector('[data-atlas-loaded]') && atlasEntries.length) {
      render();
      content.firstElementChild.dataset.atlasLoaded = '';
    }
  });
  function syncMenu() {
    googleMenu = googleBox.querySelector('select');
    if (!googleMenu) return;
    for (const opt of googleMenu.options) {
      if (opt.value && !Array.from(menu.options).some(o=>o.value===opt.value)) menu.add(new Option(opt.text,opt.value));
    }
    const nextLanguage = [...menu.options].find(o => o.value && o.value !== 'logos' && o.text.localeCompare('Logos','en') > 0);
    if (nextLanguage) menu.insertBefore(menu.querySelector('[value=logos]'),nextLanguage);
    if (!reader.open) menu.value = googleMenu.value || '';
  }
  new MutationObserver(syncMenu).observe(googleBox,{subtree:true,childList:true});
  googleBox.addEventListener('change',syncMenu);
  syncMenu();
  menu.addEventListener('change',() => {
    if (menu.value === 'logos') {
      render();
      reader.showModal();
      if (!atlasEntries.length) atlasObserver.observe(document.getElementById('atlas-grid'),{childList:true});
    } else if (googleMenu && menu.value) {
      googleMenu.value = menu.value;
      googleMenu.dispatchEvent(new Event('change',{bubbles:true}));
    }
  });
  reader.querySelector('[data-close]').onclick = () => reader.close();
  reader.addEventListener('close',() => {
    atlasObserver.disconnect();
    menu.value = googleMenu?.value || '';
    menu.focus();
  });
})();
