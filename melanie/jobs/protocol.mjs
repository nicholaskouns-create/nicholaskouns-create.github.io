// Portable state-machine contract for Melanie durable research jobs.
export const STATES=Object.freeze(['queued','running','completed','failed','cancelled']);
export const KINDS=Object.freeze(['e47_certificate','lean4','coq','python','quantum']);
export function validateSubmission(x){
 if(!x||typeof x!=='object'||!KINDS.includes(x.kind))throw Error('Unsupported job kind');
 if(!x.payload||typeof x.payload!=='object'||Array.isArray(x.payload))throw Error('Payload must be an object');
 const size=JSON.stringify(x.payload).length;
 if(size>65536)throw Error('Payload exceeds 64 KiB');
 return {kind:x.kind,payload:x.payload};
}
export function nextState(state,event){
 const transitions={queued:{claim:'running',cancel:'cancelled'},running:{complete:'completed',fail:'failed',retry:'queued',cancel:'cancelled'},completed:{},failed:{retry:'queued'},cancelled:{}};
 const result=transitions[state]?.[event];if(!result)throw Error('Invalid transition: '+state+' / '+event);return result;
}
export function leaseExpired(job,now=new Date()){
 return job.state==='running'&&job.leased_until!=null&&new Date(job.leased_until).getTime()<=now.getTime();
}
export function retryable(job){return job.attempts<job.max_attempts&&(['failed','running'].includes(job.state));}
