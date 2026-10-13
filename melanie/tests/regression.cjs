// Node.js 22.13+; no packages, credentials, network calls, or production writes.
// Runs the shipped frontend and Edge Function against controlled I/O fixtures.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const html = readFileSync(process.env.MELANIE_HTML || resolve(__dirname, '../index.html'), 'utf8');
const edge = readFileSync(process.env.MELANIE_EDGE_SOURCE || resolve(__dirname, '../edge/index.ts'), 'utf8');
const user = { id: '11111111-1111-4111-8111-111111111111' };
const threadA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const threadB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const stamp = '2026-10-13T00:00:00.000Z';
const flush = () => new Promise(resolve => setImmediate(resolve));
const pair = () => [
  { id:'1', owner_id:user.id, thread_id:threadA, role:'user', content:'fixture question', created_at:stamp },
  { id:'2', owner_id:user.id, thread_id:threadA, role:'assistant', content:'fixture answer', created_at:stamp }
];
function fixture(options={}) {
  const state = {
    threads: [{id:threadA,owner_id:user.id,title:'New conversation',updated_at:stamp}, {id:threadB,owner_id:user.id,title:'Other conversation',updated_at:'2026-10-12'}],
    messages: options.messages || [], writes:[], calls:[], user:options.user===null?null:user,
    failInsert: false, failRead:false, ...options
  };
  function from(table) {
    const q={table,filters:[],orders:[],op:'select',start:0,end:Infinity,
      select(){return this}, eq(k,v){this.filters.push([k,v]);return this},
      order(k,o){this.orders.push([k,o.ascending]);return this},
      limit(n){this.end=n-1;return this},range(a,b){this.start=a;this.end=b;return this},
      single(){this.one=true;return this}, or(){return this},ilike(){return this},
      insert(data){this.op='insert';this.data=data;return this},
      update(data){this.op='update';this.data=data;return this},
      then(ok,fail){return Promise.resolve().then(()=>{
        state.calls.push(this);
        let rows=table==='melanie_threads'?state.threads:table==='melanie_messages'?state.messages:[];
        if(this.op==='insert'){
          if(state.failInsert||(state.failAssistant&&(Array.isArray(this.data)?this.data:[this.data]).some(m=>m.role==='assistant')))return {data:null,error:{message:'fixture write failure'}};
          const added=(Array.isArray(this.data)?this.data:[this.data]).map((m,i)=>({id:'inserted-'+i,created_at:stamp,...m}));
          rows.push(...added);state.writes.push({table,data:added});return {data:this.one?added[0]:added,error:null};
        }
        rows=rows.filter(row=>this.filters.every(([k,v])=>row[k]===v));
        if(this.op==='update'){rows.forEach(r=>Object.assign(r,this.data));return {data:rows,error:null};}
        if(state.failRead && table==='melanie_messages')return {data:null,error:{message:'fixture read failure'}};
        rows=rows.slice().sort((a,b)=>{for(const[k,asc]of this.orders){if(a[k]!==b[k])return(a[k]<b[k]?-1:1)*(asc?1:-1)}return 0});
        rows=rows.slice(this.start,this.end+1);
        return {data:this.one?rows[0]||null:rows,error:null};
      }).then(ok,fail)}
    };return q;
  }
  const db={from,auth:{getUser:async()=>({data:{user:state.user},error:null}),onAuthStateChange(){},signInAnonymously:async()=>({error:{message:'fixture disabled'}}),signOut:async()=>{state.user=null}},functions:{invoke:async()=>state.invoke?state.invoke():{data:{reply:'fixture reply'},error:null}}};
  return {state,db};
}
class Element {
  constructor(){this.children=[];this.textContent='';this.value='';this.disabled=false;this.dataset={};this.classList={toggle(){},add(){},remove(){}};}
  append(...children){this.children.push(...children)}
  replaceChildren(...children){this.children=children}
  click(){this.clicked=true;return this.onclick?.()}
  get text(){return this.textContent+this.children.map(c=>c.text||'').join('')}
}
async function frontend(options={}) {
  const {state,db}=fixture(options), els=new Map(),downloads=[];
  const get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id)};
  const document={getElementById:get,createElement:()=>new Element(),querySelectorAll:()=>[],querySelector:()=>new Element()};
  const NativeURL=class extends URL {};
  NativeURL.createObjectURL=b=>{downloads.push(b);return 'blob:fixture'};
  NativeURL.revokeObjectURL=()=>{};
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^\s*import.*?;\s*/,'');
  const api=await runInNewContext('(async()=>{'+script+'; return {openThread,newThread,syncAuth};})()',{
    createClient:()=>db,document,URL:NativeURL,Blob,console,setTimeout:()=>{},alert:()=>{}
  });
  return {state,db,get,api,downloads};
}
async function edgeRuntime(options={}) {
  const {state,db}=fixture(options);let handler,payload;
  const script=stripTypeScriptTypes(edge.replace(/^import.*?;\s*/,''),{mode:'strip'});
  runInNewContext(script,{createClient:()=>db,Request,Response,console,
    Deno:{serve:h=>handler=h,env:{get:k=>k==='OPENAI_API_KEY'?(options.noKey?undefined:'fixture-key-never-sent'):k==='SUPABASE_URL'?'https://fixture.invalid':k==='SUPABASE_ANON_KEY'?'fixture':undefined}},
    fetch:async(_url,init)=>{payload=JSON.parse(init.body);return Response.json({choices:[{message:{content:'fixture provider reply'}}]})}
  });
  const send=()=>handler(new Request('https://fixture.invalid/functions/v1/melanie-chat',{method:'POST',headers:{origin:'https://nicholaskouns-create.github.io',authorization:'Bearer fixture-token','content-type':'application/json'},body:JSON.stringify({thread_id:threadA,message:'hello'})}));
  return {state,send,payload:()=>payload};
}
test('export executes and serializes the complete transcript',async()=>{
  const f=await frontend({messages:pair()});await f.get('export').onclick();
  assert.equal(f.downloads.length,1);assert.equal(JSON.parse(await f.downloads[0].text()).messages.length,2);
});
test('reload orders equal-timestamp messages as user then assistant',async()=>{
  const f=await frontend({messages:pair().reverse()});
  assert.deepEqual(f.get('messages').children.map(x=>x.children[1].textContent),['fixture question','fixture answer']);
});
test('reload reads conversations longer than one API page',async()=>{
  const messages=Array.from({length:1002},(_,i)=>({id:String(i).padStart(5,'0'),owner_id:user.id,thread_id:threadA,role:i%2?'assistant':'user',content:'message-'+i,created_at:new Date(i*1000).toISOString()}));
  const f=await frontend({messages});assert.equal(f.get('messages').children.length,1002);
});
test('a failed send restores the draft for retry',async()=>{
  const f=await frontend({invoke:async()=>({data:null,error:{message:'fixture provider unavailable'}})});
  f.get('prompt').value='retain this draft';await f.get('sendForm').onsubmit({preventDefault(){}});
  assert.equal(f.get('prompt').value,'retain this draft');assert.equal(f.get('send').disabled,false);
});
test('a saved-user error reloads the archive without offering a duplicate draft',async()=>{
  const messages=[];
  const f=await frontend({messages,invoke:async()=>{
    messages.push(pair()[0]);return {data:null,error:{context:{json:async()=>({error:'provider missing',saved_user:true})}}};
  }});
  f.get('prompt').value='fixture question';await f.get('sendForm').onsubmit({preventDefault(){}});
  assert.equal(f.get('prompt').value,'');assert.match(f.get('messages').text,/no completed reply was saved/);
  assert.equal(messages.length,1);
});
test('an in-flight reply cannot appear in another thread or rename it',async()=>{
  let finish;
  const f=await frontend({invoke:()=>new Promise(r=>finish=r)});
  f.get('prompt').value='question for A';const sending=f.get('sendForm').onsubmit({preventDefault(){}});await flush();
  await f.api.openThread(threadB);finish({data:{reply:'reply for A'},error:null});await sending;
  assert.ok(!f.get('messages').text.includes('reply for A'));
  assert.equal(f.state.threads[0].title,'question for A');assert.equal(f.state.threads[1].title,'Other conversation');
});
test('failed thread creation cannot invoke chat with a missing thread',async()=>{
  const f=await frontend();f.state.user=null;await f.api.syncAuth();f.state.user=user;f.state.threads=[];f.state.failInsert=true;await f.api.syncAuth();
  let invoked=false;f.state.invoke=async()=>{invoked=true;return{data:{reply:'bad'},error:null}};
  f.get('prompt').value='keep me';await f.get('sendForm').onsubmit({preventDefault(){}});
  assert.equal(invoked,false);assert.equal(f.get('prompt').value,'keep me');
});
test('frontend reload reconstructs both saved sides after a successful fixture reply',async()=>{
  const messages=[];
  const f=await frontend({messages,invoke:async()=>{
    messages.push(...pair());return {data:{reply:'fixture answer'},error:null};
  }});
  f.get('prompt').value='fixture question';await f.get('sendForm').onsubmit({preventDefault(){}});
  const reloaded=await frontend({messages:messages.slice().reverse()});
  assert.deepEqual(reloaded.get('messages').children.map(x=>x.children[1].textContent),['fixture question','fixture answer']);
});
test('provider history preserves same-timestamp conversation order',async()=>{
  const e=await edgeRuntime({messages:pair()});assert.equal((await e.send()).status,200);
  assert.deepEqual(e.payload().messages.filter(m=>m.role!=='system').map(m=>m.role),['user','assistant','user']);
});
test('successful provider reply persists both sides before returning success',async()=>{
  const e=await edgeRuntime();assert.equal((await e.send()).status,200);
  assert.deepEqual(e.state.writes.flatMap(w=>Array.from(w.data,m=>m.role)),['user','assistant']);
});
test('missing keys preserve the user message and never fabricate an assistant answer',async()=>{
  const e=await edgeRuntime({noKey:true});assert.equal((await e.send()).status,503);
  assert.equal(e.payload(),undefined);assert.deepEqual(e.state.writes.flatMap(w=>Array.from(w.data,m=>m.role)),['user']);
});
test('failed transcript persistence cannot return success',async()=>{
  const e=await edgeRuntime({failInsert:true});assert.equal((await e.send()).status,500);
});
test('failed assistant persistence returns 500 and acknowledges only the saved user',async()=>{
  const e=await edgeRuntime({failAssistant:true});const response=await e.send();assert.equal(response.status,500);
  assert.equal((await response.json()).saved_user,true);
  assert.deepEqual(e.state.writes.flatMap(w=>Array.from(w.data,m=>m.role)),['user']);
});
test('an invalid session cannot reach the provider',async()=>{
  const e=await edgeRuntime({user:null});assert.equal((await e.send()).status,401);assert.equal(e.payload(),undefined);
});
