(()=>{'use strict';
const $=id=>document.getElementById(id),status=s=>{$('receipt-status').textContent=s;};
let measured=false, lastOutcome=null;
const oldRun=run;run=function(){measured=false;lastOutcome=null;oldRun();};
$('run').onclick=run;
const shot=$('shot'),oldShot=shot.onclick;shot.onclick=()=>{oldShot();measured=true;lastOutcome=psi.findIndex(z=>P(z)>.999999);};
const oldReset=$('reset').onclick;$('reset').onclick=()=>{oldReset();measured=false;lastOutcome=null;};
function canonical(x){if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';return JSON.stringify(x);}
async function hash(x){const bytes=new TextEncoder().encode(canonical(x));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function receipt(){if(!measured)run();const payload={schema:'city.quantum.state-receipt.v1',source:'matrix-quantum-simulator',exported_at:new Date().toISOString(),qubits:3,basis:'q0q1q2',initial_state:'000',circuit:ops.map(o=>({gate:o.g,targets:o.b==null?[o.a]:[o.a,o.b],column:o.col})),statevector:psi.map(z=>[z.r,z.i]),measurement:{collapsed:measured,outcome:lastOutcome},norm:psi.reduce((s,z)=>s+P(z),0)};return {...payload,integrity:{algorithm:'SHA-256',canonicalization:'sorted-json-v1',digest:await hash(payload)}};}
// Accept the canonical v1 field and legacy g, but never conflicting aliases.
function gateName(o){if(o.gate!=null&&o.g!=null&&o.gate!==o.g)throw Error('Conflicting gate fields');return o.gate??o.g;}
function valid(x){
 if(!x||x.schema!=='city.quantum.state-receipt.v1'||x.qubits!==3||x.basis!=='q0q1q2'||x.initial_state!=='000'||!Array.isArray(x.statevector)||x.statevector.length!==8||!Array.isArray(x.circuit))throw Error('Unsupported receipt');
 if(!x.statevector.every(z=>Array.isArray(z)&&z.length===2&&z.every(Number.isFinite)))throw Error('Invalid amplitudes');
 const norm=x.statevector.reduce((s,z)=>s+z[0]**2+z[1]**2,0);if(Math.abs(norm-1)>1e-8)throw Error('State is not normalized');
 if(x.circuit.length>24||!x.circuit.every(o=>o&&['H','X','Y','Z','S','T','CX','SW'].includes(gateName(o))&&Array.isArray(o.targets)&&o.targets.length===(['CX','SW'].includes(gateName(o))?2:1)&&o.targets.every(q=>Number.isInteger(q)&&q>=0&&q<3)&&new Set(o.targets).size===o.targets.length&&Number.isInteger(o.column)&&o.column>=0&&o.column<8))throw Error('Invalid circuit');
 const occupied=new Set();for(const o of x.circuit)for(const q of o.targets){const key=o.column+':'+q;if(occupied.has(key))throw Error('Overlapping gates');occupied.add(key);}
 if(!x.measurement||typeof x.measurement.collapsed!=='boolean'||(x.measurement.collapsed? !Number.isInteger(x.measurement.outcome)||x.measurement.outcome<0||x.measurement.outcome>7 : x.measurement.outcome!==null))throw Error('Invalid measurement');
}
async function read(x){
 // Snapshot before awaiting the digest, and commit only after every check succeeds.
 x=JSON.parse(JSON.stringify(x));valid(x);
 if(!x.integrity||x.integrity.algorithm!=='SHA-256'||x.integrity.canonicalization!=='sorted-json-v1')throw Error('Missing digest');
 const {integrity,...payload}=x;if(await hash(payload)!==integrity.digest)throw Error('Digest mismatch');
 const circuit=x.circuit.map(o=>({g:gateName(o),a:o.targets[0],...(o.targets.length===2?{b:o.targets[1]}:{}),col:o.column}));
 let expected=execute(circuit);
 if(x.measurement.collapsed){const k=x.measurement.outcome;if(P(expected[k])<=0)throw Error('Impossible measurement outcome');expected=expected.map((_,i)=>C(i===k?1:0));}
 // State equality up to global phase. A digest alone cannot establish this.
 let re=0,im=0,norm=0;for(let i=0;i<8;i++){const [r,j]=x.statevector[i],e=expected[i];re+=e.r*r+e.i*j;im+=e.r*j-e.i*r;norm+=r*r+j*j;}
 if(Math.abs((re*re+im*im)/norm-1)>1e-10)throw Error('Circuit/state replay mismatch');
 ops=circuit;psi=x.statevector.map(z=>C(z[0],z[1]));measured=x.measurement.collapsed;lastOutcome=x.measurement.outcome;
 draw();render();log('> RECEIPT IMPORTED · REPLAY VERIFIED');status('Imported; digest and circuit replay verified.');
}
$('receipt-export').onclick=async()=>{try{const r=await receipt(),a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(r,null,2)],{type:'application/json'}));a.href=u;a.download='matrix-quantum-receipt.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);status('JSON receipt exported.');}catch(e){status(e.message)}};
$('receipt-copy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(await receipt(),null,2));status('Receipt copied.');}catch(e){status(e.message)}};
$('receipt-import').onclick=()=>$('receipt-file').click();
$('receipt-file').onchange=async e=>{try{const f=e.target.files[0];if(f){if(f.size>100000)throw Error('Receipt too large');await read(JSON.parse(await f.text()));}}catch(err){status('Import rejected: '+err.message)}e.target.value='';};
window.MatrixReceipt={export:receipt,import:read};
})();
