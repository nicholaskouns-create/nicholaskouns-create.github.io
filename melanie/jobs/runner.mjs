// Run in a trusted Node environment with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.
import {processOnce} from './worker.mjs';
const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const rpc=async(name,args={})=>{
 const r=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args)});
 if(!r.ok)throw Error('RPC '+name+' returned HTTP '+r.status);
 return r.json();
};
const api={
 claim:async()=>{const jobs=await rpc('melanie_worker_claim');return jobs[0]||null;},
 finish:async(id,token,result)=>{if(!await rpc('melanie_worker_finish',{p_id:id,p_token:token,p_result:result}))throw Error('Lease lost before completion');},
 fail:async(id,token,error)=>{if(!await rpc('melanie_worker_finish',{p_id:id,p_token:token,p_result:null,p_error:error}))throw Error('Lease lost before failure record');}
};
const out=await processOnce(api);console.log(JSON.stringify(out));
