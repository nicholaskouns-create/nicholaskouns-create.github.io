import {certificate} from '../tools/e47-core.mjs';
export function executeJob(job){
 if(job.kind==='e47_certificate'){const c=certificate();return {kind:job.kind,certificate:c,runtime:'node',verified:c.pass};}
 throw Error('No executable runner configured for '+job.kind);
}
export async function processOnce(api,now=()=>new Date().toISOString()){
 const job=await api.claim();if(!job)return {processed:false};
 try{const result=executeJob(job);await api.finish(job.id,job.lease_token,result,now());return {processed:true,id:job.id,status:'completed'};}
 catch(e){await api.fail(job.id,job.lease_token,String(e.message||e),now());return {processed:true,id:job.id,status:'failed'};}
}
