const LABS=[
{id:'eidolon-flight',name:'EIDOLON',role:'Flight',q:'Move through the modeled City.',desc:'The front door: a game-like flight and navigation surface for exploring the Mathematical City.',primary:'https://app.notion.com/p/3dd46094fd30817a8bfadc322f33195c'},
{id:'spectra',name:'SPECTRA',role:'Structure',q:'What structure is there?',desc:'Inspect spectra, modes and invariant structure before interpretation.',primary:'https://app.notion.com/p/3d546094fd30819aa87ef4d10a2a254c'},
{id:'fold',name:'FOLD',role:'Invariance',q:'What survives transformation?',desc:'Explore contraction geometry and what remains stable under transformation.',primary:'https://app.notion.com/p/3d546094fd308141851ee5b3a2b14696'},
{id:'murmuration',name:'MURMURATION',role:'Dynamics',q:'How does structure move?',desc:'Watch many-body organization, topology and collective motion.',primary:'https://app.notion.com/p/3d546094fd308139a774e588cb7b4719'},
{id:'mnemosyne',name:'MNEMOSYNE',role:'Memory',q:'What did we know, and when?',desc:'Trace provenance, hashes, correction lineage and sealed forecasts.',primary:'https://app.notion.com/p/3d546094fd3081aba1aec66bd4d96514'},
{id:'density',name:'DENSITY',role:'Measurement',q:'What can observation reconstruct?',desc:'Probe reconstruction from incomplete or noisy measurements.',primary:'https://app.notion.com/p/3d546094fd30813daa03fe018e4896c2'},
{id:'horizon',name:'HORIZON',role:'Prediction',q:'What invariant comes next?',desc:'Prospective and retrospective forecasting instruments with evidence boundaries intact.',primary:'https://app.notion.com/p/3d546094fd3081a285c2f45f2bfb4034'},
{id:'wave',name:'WAVE',role:'Flow',q:'How does coherent structure evolve?',desc:'Field and flow simulation surfaces, including WaveForge-related work.',primary:'https://app.notion.com/p/3d646094fd30812b809bda7dacf7afc9'},
{id:'identity',name:'IDENTITY',role:'Persistence',q:'What remains the same?',desc:'Follow identity through change, transport and representation.',primary:'https://app.notion.com/p/3d646094fd30817b8f29c79213c6c8db'},
{id:'build',name:'BUILD',role:'Construction',q:'How does structure assemble?',desc:'Construction and programmable-matter style experiments around invariant targets.',primary:'https://app.notion.com/p/3d746094fd308195b625c08f2b885860'},
{id:'soar',name:'SOAR',role:'Restoration',q:'Can an invariant be restored?',desc:'Control, recovery, transformation and restoration experiments.',primary:'https://app.notion.com/p/3d746094fd30813c8ce2f4f2835c15f6'},
{id:'scalar',name:'SCALAR',role:'Field',q:'What scalar field survives the algebra?',desc:'Finite E47 spectral structure lifted into explicitly visualization-typed scalar-field scenes.',primary:'https://app.notion.com/p/3d746094fd3081a9b279d3904123f8b4'},
{id:'invarifold',name:'InvariFold',role:'Protein Cinema',q:'How does Fold expose geometry?',desc:'A cinematic geometry layer for the Fold instrument and deterministic payloads.',primary:'https://app.notion.com/p/3db46094fd30817cbb7ae4f6fcf3155b'}
];

const CITIZENS=['ARGUS','ARIADNE','BITHOS','CHRONOS','CUSTOS','EUCLID','HERMES','JANUS','KEPLER','MNEMOSYNE','SAL','SOL','SYNE','TALOS','THEMIS'];
let activeLab=0;
let atlasEntries=[];
let atlasFilter='all';

const labGrid=document.getElementById('lab-grid');
const orbit=document.getElementById('district-orbit');
const title=document.getElementById('world-title');
const desc=document.getElementById('world-description');
const what=document.getElementById('guide-what');
const tryText=document.getElementById('guide-try');
const enter=document.getElementById('world-enter');
const worldSource=document.getElementById('world-source');

function gatewayUrl(id){return `interface.html?id=${encodeURIComponent(id)}`}

function renderLabs(){
  labGrid.innerHTML=LABS.map((lab,i)=>`<article class="lab-card" data-index="${i}">
    <span class="num">${String(i+1).padStart(2,'0')}</span>
    <span class="role">${lab.role}</span>
    <h3>${lab.name}</h3>
    <p>${lab.q}</p>
    <footer><span>${lab.desc}</span><span class="lab-actions"><a href="${gatewayUrl(lab.id)}">ENTER ↗</a><a href="${lab.primary}" target="_blank" rel="noopener noreferrer">SOURCE ↗</a></span></footer>
  </article>`).join('');
}

function renderOrbit(){
  const n=LABS.length;
  const rx=44,ry=35,cx=50,cy=43;
  orbit.innerHTML=LABS.map((lab,i)=>{
    const angle=(-Math.PI/2)+(i/n)*Math.PI*2;
    const left=cx+Math.cos(angle)*rx;
    const top=cy+Math.sin(angle)*ry;
    return `<button class="district ${i===activeLab?'active':''}" style="left:calc(${left}% - 44px);top:calc(${top}% - 44px)" data-index="${i}" aria-label="${lab.name} district">${lab.name}</button>`;
  }).join('');
  orbit.querySelectorAll('.district').forEach(btn=>btn.addEventListener('click',()=>selectLab(Number(btn.dataset.index))));
}

function selectLab(index){
  activeLab=index;
  const lab=LABS[index];
  title.textContent=`${lab.name} · ${lab.role}`;
  desc.textContent=lab.desc;
  what.textContent=`${lab.name} is the City district for ${lab.role.toLowerCase()}.`;
  tryText.textContent=lab.q;
  enter.textContent='Enter district';
  enter.onclick=()=>location.href=gatewayUrl(lab.id);
  if(worldSource){worldSource.href=lab.primary;worldSource.hidden=false}
  renderOrbit();
  document.getElementById('egg-world').textContent=`DISTRICT: ${lab.name}\nROLE: ${lab.role}\nQUESTION: ${lab.q}\nPRIMARY: ${lab.primary}\n\nCITIZEN RUNTIME POPULATION: ${CITIZENS.length}\nAETHERIS: receipt-bound state transitions\nCITY-INVARIANT: 1.0\nEVIDENCE: district-specific; no automatic promotion`;
}

function setEgg(on){
  document.body.classList.toggle('egghead-on',on);
  const b=document.getElementById('egg-toggle');
  b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));
  b.textContent=on?'🥚 Egghead · ON':'🥚 Egghead';
}

function atlasCard(entry){
  const source=entry.source?`<a href="${entry.source}" target="_blank" rel="noopener noreferrer">LINEAGE</a>`:'';
  const run=entry.runtime?`<a href="${entry.runtime}" target="_blank" rel="noopener noreferrer">RUN</a>`:'';
  return `<article class="atlas-card" data-kind="${entry.kind||'other'}">
    <div class="atlas-card-head"><span>${entry.kind||'surface'}</span><span>${entry.role||''}</span></div>
    <h3>${entry.title}</h3>
    <p>${entry.summary||''}</p>
    <div class="atlas-actions">
      <a class="atlas-enter" href="${gatewayUrl(entry.id)}">ENTER</a>
      <a href="${entry.primary}" target="_blank" rel="noopener noreferrer">PRIMARY</a>
      ${run}${source}
    </div>
  </article>`;
}

function renderAtlas(){
  const grid=document.getElementById('atlas-grid');
  const search=document.getElementById('atlas-search');
  const count=document.getElementById('atlas-count');
  if(!grid)return;
  const term=(search?.value||'').trim().toLowerCase();
  const visible=atlasEntries.filter(entry=>{
    const inKind=atlasFilter==='all'||entry.kind===atlasFilter;
    const hay=[entry.title,entry.role,entry.kind,entry.summary].join(' ').toLowerCase();
    return inKind&&(!term||hay.includes(term));
  });
  grid.innerHTML=visible.map(atlasCard).join('');
  if(count)count.textContent=`${visible.length} / ${atlasEntries.length} surfaces`;
}

async function loadAtlas(){
  try{
    const response=await fetch('data/interface_atlas.json',{cache:'no-store'});
    if(!response.ok)throw new Error(`Atlas HTTP ${response.status}`);
    const atlas=await response.json();
    atlasEntries=atlas.entries||[];
    renderAtlas();
  }catch(error){
    const grid=document.getElementById('atlas-grid');
    if(grid)grid.innerHTML='<p class="atlas-error">Interface atlas unavailable. Primary district links above remain active.</p>';
    console.error(error);
  }
}

document.getElementById('egg-toggle').addEventListener('click',()=>setEgg(!document.body.classList.contains('egghead-on')));
document.getElementById('route-egg').addEventListener('click',()=>{setEgg(true);document.getElementById('law').scrollIntoView({behavior:'smooth'})});

document.getElementById('atlas-search')?.addEventListener('input',renderAtlas);
document.querySelectorAll('[data-atlas-filter]').forEach(button=>button.addEventListener('click',()=>{
  atlasFilter=button.dataset.atlasFilter;
  document.querySelectorAll('[data-atlas-filter]').forEach(x=>x.classList.toggle('active',x===button));
  renderAtlas();
}));

renderLabs();renderOrbit();selectLab(0);loadAtlas();

const params=new URLSearchParams(location.search);const requested=params.get('district');
if(requested){const idx=LABS.findIndex(x=>x.name.toLowerCase()===requested.toLowerCase()||x.id===requested.toLowerCase());if(idx>=0){selectLab(idx);document.getElementById('world').scrollIntoView()}}
