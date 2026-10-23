// Public research graph: links are declarative and only verifiable when receipts exist.
const mount=document.getElementById('proof-observatory');
if(mount){
  const safeLink=(url,label)=>{const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';return a};
  const status=document.createElement('p');status.textContent='Loading versioned theorem graph…';mount.append(status);
  Promise.all([fetch('./proof-graph.json').then(r=>{if(!r.ok)throw Error('Graph HTTP '+r.status);return r.json()}),fetch('./certificates/e47.json').then(r=>r.ok?r.json():null).catch(()=>null)])
  .then(async ([graph,cert])=>{
    if(graph.schema!=='mnemosyne-proof-graph-v1'||!Array.isArray(graph.nodes))throw Error('Invalid graph schema');
    const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
    status.textContent=graph.nodes.length+' research nodes · '+graph.nodes.filter(n=>n.type==='theorem').length+' theorem nodes';
    const search=document.createElement('input');search.placeholder='Find theorem, implementation, test, certificate';search.setAttribute('aria-label','Search research graph');mount.append(search);
    const container=document.createElement('div');mount.append(container);
    const draw=()=>{
      container.replaceChildren();
      for(const n of graph.nodes.filter(n=>(n.title+' '+n.statement+' '+n.type).toLowerCase().includes(search.value.toLowerCase()))){
        const article=document.createElement('article');article.className='record';
        const h=document.createElement('h3');h.textContent=n.title;article.append(h);
        const tag=document.createElement('div');tag.className='kicker';tag.textContent=n.type;article.append(tag);
        const p=document.createElement('p');p.textContent=n.statement;article.append(p);
        if(n.source)article.append(safeLink(n.source,'Source repository'));
        const edges=document.createElement('p');edges.className='note';edges.textContent='Links: '+(n.links.map(id=>nodes.get(id)?.title||id).join(' → ')||'none');article.append(edges);
        if(n.id==='e47-certificate'){
          const s=document.createElement('p');s.className='receipt';
          s.textContent=cert?.status==='pass'&&/^[0-9a-f]{40}$/.test(cert.commit||'')?'Certificate available · '+cert.commit.slice(0,12):'Certificate not yet verified or deployed';article.append(s);
          if(cert?.status==='pass'&&/^[0-9a-f]{40}$/.test(cert.commit||''))article.append(safeLink('https://github.com/nicholaskouns-create/nicholaskouns-create.github.io/commit/'+cert.commit,'Inspect pinned commit'));
        }
        container.append(article);
      }
    };
    search.addEventListener('input',draw);draw();
  }).catch(e=>{status.textContent='Research graph unavailable: '+e.message});
}
