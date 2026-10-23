const root=document.getElementById('city-instruments');
if(root){
const apps=[
{name:'Quantum Clock',url:'https://nicholaskouns-create.github.io/Time/',repo:'https://github.com/nicholaskouns-create/Time',cert:'quantum-clock'},
{name:'Fibonacci–Lucas Tower',url:'https://nicholaskouns-create.github.io/tower/#/explore',repo:'https://github.com/nicholaskouns-create/tower',cert:'fibonacci-lucas-tower'},
{name:'Quantum Matrix / E47',url:'https://nicholaskouns-create.github.io/E47-Kartekeya/',repo:'https://github.com/nicholaskouns-create/E47-Kartekeya',cert:'quantum-matrix'},
{name:'Research Engine',url:'https://nicholaskouns-create.github.io/research-engine.html',repo:'https://github.com/nicholaskouns-create/nicholaskouns-create.github.io'},
{name:'FlowShield',url:'https://nicholaskouns-create.github.io/flowshield.html',repo:'https://github.com/nicholaskouns-create/nicholaskouns-create.github.io'},
{name:'NEXUS',url:'https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/nexus/',repo:'https://github.com/nicholaskouns-create/E47-Kartekeya'}
];
const heading=document.createElement('p');heading.textContent='Choose an instrument to load its website inside Mnemosyne. If the remote app forbids framing, open it directly.';root.append(heading);
const nav=document.createElement('div');nav.style.cssText='display:flex;flex-wrap:wrap;gap:8px';root.append(nav);
const detail=document.createElement('div');root.append(detail);
for(const app of apps){
 const button=document.createElement('button');button.type='button';button.textContent=app.name;nav.append(button);
 button.addEventListener('click',async()=>{
 detail.replaceChildren();
 const h=document.createElement('h3');h.textContent=app.name;detail.append(h);
 const links=document.createElement('p');
 for(const [url,label] of [[app.url,'Open app in new tab'],[app.repo,'Source repository']]){
 const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;a.style.marginRight='16px';links.append(a)}
 detail.append(links);
 if(app.cert){
 const p=document.createElement('p');p.className='receipt';p.textContent='Checking independent certificate…';detail.append(p);
 try{const res=await fetch('./certificates/'+app.cert+'.json');if(!res.ok)throw Error('HTTP '+res.status);const c=await res.json();
 const clone={...c};delete clone.sha256;
 const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
 const bytes=new TextEncoder().encode(stable(clone));const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 p.textContent=c.status==='pass'&&hash===c.sha256?'Certificate SHA-256 verified · '+hash:'Certificate integrity verification FAILED';
 const a=document.createElement('a');a.href='./certificates/'+app.cert+'.json';a.textContent='Inspect certificate';a.target='_blank';p.append(' · ',a);
 }catch(e){p.textContent='Certificate unavailable: '+e.message}
 }
 const iframe=document.createElement('iframe');iframe.title=app.name+' embedded instrument';iframe.src=app.url;iframe.loading='lazy';iframe.referrerPolicy='no-referrer';iframe.style.cssText='width:100%;height:min(72vh,750px);min-height:460px;border:1px solid #536a7a;border-radius:8px;background:#fff';detail.append(iframe);
 });
}
nav.querySelector('button').click();
}
