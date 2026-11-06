const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
const source = html.slice(html.indexOf('const C=(r=0,i=0)'),
  html.indexOf("draw();render();log('> MATRIX QUANTUM ENGINE ONLINE')"));

function boot() {
  const elements = new Map();
  function el(id) {
    if (!elements.has(id)) elements.set(id, {textContent:'',innerHTML:'',
      classList:{add(){},remove(){}},append(){},onclick:null});
    return elements.get(id);
  }
  const context = vm.createContext({document:{getElementById:el,
    createElement:()=>el('temp'),querySelectorAll:()=>[]},
    Math:Object.create(Math),TextEncoder,crypto:webcrypto,window:{},setTimeout});
  vm.runInContext(source + `;globalThis.E={get ops(){return ops},set ops(v){ops=v},
    get psi(){return psi},set psi(v){psi=v},pick(g){pick=g},place,run,execute};`, context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'receipt.js'),'utf8'), context);
  return {context,E:context.E,receipt:context.window.MatrixReceipt,el};
}
const bell = [{g:'H',a:0,col:0},{g:'CX',a:0,b:1,col:1}];
const plain = x => JSON.parse(JSON.stringify(x));
async function resign(receipt) {
  const {integrity,...payload}=receipt;
  const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':
    x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
  receipt.integrity.digest=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(payload)))).toString('hex');
  return receipt;
}

test('export/import replays canonical and legacy receipts',async()=>{
  for(const circuit of [[],bell,[...bell,{g:'CX',a:1,b:2,col:2}]]) {
    const {E,receipt}=boot();E.ops=circuit;
    const r=plain(await receipt.export());await receipt.import(r);
    assert.deepEqual(plain(E.psi).map(z=>[z.r,z.i]),r.statevector);
    for(const o of r.circuit){o.g=o.gate;delete o.gate;}
    await receipt.import(await resign(r));
  }
});
test('execution follows diagram order and editing recomputes the state',async()=>{
  const {E,receipt}=boot();E.ops=bell;E.run();const initial=plain(E.psi);
  E.pick('H');E.place(0,0);assert.deepEqual(plain(E.psi),initial);
  E.ops=[];E.pick('S');E.place(0,1);E.pick('H');E.place(0,0);
  const r=await receipt.export();
  assert.ok(Math.abs(r.statevector[4][1]-Math.SQRT1_2)<1e-12);
  assert.ok(Math.abs(r.statevector[4][0])<1e-12);
});
test('two-qubit placement preserves unrelated gates in the column',()=>{
  const {E}=boot();E.pick('X');E.place(2,3);E.pick('CX');E.place(0,3);E.place(1,3);
  assert.ok(E.ops.some(o=>o.g==='X'&&o.a===2));
  assert.equal(E.ops.length,2);
});
test('recomputed digest cannot hide a circuit/state mismatch; rejection is atomic',async()=>{
  const {E,receipt}=boot();E.ops=bell;const r=plain(await receipt.export());
  const before=plain(E.psi);r.statevector=Array.from({length:8},(_,i)=>[i===1?1:0,0]);
  await assert.rejects(receipt.import(await resign(r)),/replay mismatch/);
  assert.deepEqual(plain(E.psi),before);
  const duplicate=plain(await receipt.export());duplicate.circuit.push(duplicate.circuit[0]);
  await assert.rejects(receipt.import(await resign(duplicate)),/Overlapping gates/);
  const conflicting=plain(await receipt.export());conflicting.circuit[0].g='X';
  await assert.rejects(receipt.import(await resign(conflicting)),/Conflicting gate/);
});
test('measurement receipts remain valid; RUN and CLEAR reset measurement metadata',async()=>{
  const {context,E,receipt,el}=boot();E.ops=bell;E.run();context.Math.random=()=>0.9;
  el('shot').onclick();const r=plain(await receipt.export());
  assert.equal(r.measurement.collapsed,true);assert.equal(r.measurement.outcome,6);
  await receipt.import(r);
  el('run').onclick();assert.equal((await receipt.export()).measurement.collapsed,false);
  el('shot').onclick();el('clear').onclick();const clear=await receipt.export();
  assert.equal(clear.measurement.collapsed,false);assert.equal(clear.statevector[0][0],1);
});
