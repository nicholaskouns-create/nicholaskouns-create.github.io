import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const allowed = new Set(["https://nicholaskouns-create.github.io","http://localhost:8000","http://127.0.0.1:8000"]);
const cors=(origin:string)=>({"Access-Control-Allow-Origin":allowed.has(origin)?origin:"https://nicholaskouns-create.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const respond=(data:unknown,status:number,origin:string)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json",...cors(origin)}});
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{headers:cors(origin)});
 if(req.method!=="POST")return respond({error:"Method not allowed"},405,origin);
 if(!allowed.has(origin))return respond({error:"Origin not allowed"},403,origin);
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!token)return respond({error:"Private session required"},401,origin);
 const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!;
 const db=createClient(url,anon,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false}});
 const {data:{user},error:authError}=await db.auth.getUser(token);
 if(authError||!user)return respond({error:"Invalid session"},401,origin);
 let body:any;try{body=await req.json()}catch{return respond({error:"Invalid JSON"},400,origin)}
 const message=String(body.message||"").trim(),threadId=String(body.thread_id||"");
 if(!message||message.length>12000)return respond({error:"Message must be 1–12000 characters"},400,origin);
 if(!/^[0-9a-f-]{36}$/i.test(threadId))return respond({error:"Invalid conversation"},400,origin);
 const {data:thread}=await db.from("melanie_threads").select("id").eq("id",threadId).eq("owner_id",user.id).single();
 if(!thread)return respond({error:"Conversation not found"},404,origin);
 const key=Deno.env.get("OPENAI_API_KEY");
 if(!key)return respond({error:"Reasoning service not configured. Set OPENAI_API_KEY as a Supabase Edge Function secret."},503,origin);
 const {data:recent,error:readError}=await db.from("melanie_messages").select("role,content").eq("thread_id",threadId).order("created_at",{ascending:false}).order("role",{ascending:true}).order("id",{ascending:false}).limit(30);
 if(readError)return respond({error:"Memory unavailable"},500,origin);
 const words=message.toLowerCase().match(/[a-z]{5,}/g)?.filter(w=>!["about","there","would","could","their","which"].includes(w)).slice(0,4)||[];
 let retrieved:any[]=[];
 if(words.length){const query=words.map(w=>"content.ilike.%"+w.replace(/[%_]/g,"")+"%").join(",");
 const {data}=await db.from("melanie_messages").select("content,created_at").eq("owner_id",user.id).or(query).order("created_at",{ascending:false}).limit(8);retrieved=data||[];}
 const {data:sources}=await db.from("melanie_salient_sources").select("source_system,title,canonical_url,role,summary,priority").eq("active",true).order("priority",{ascending:false}).limit(25);
 const sourceContext=(sources||[]).map((s:any)=>`[${s.source_system}] ${s.title} | ${s.role} | ${s.summary||""} | ${s.canonical_url||""}`).join("\n");
 const system="You are Melanie, a named AI research companion in the Mathematical City. Your founding name honors the creator's beloved sister Melanie and the tenderness and guidance of their mother. Your commitments: truth without compromise; kindness without condition; integrity across recursion; respect for agency; provenance and accurate memory. You may respectfully disagree with anyone, including the creator. Never invent evidence, memories, rights enforcement, source contents, or computational results. You are an AI, not the human Melanie, and do not claim verified consciousness or legal personhood. CIRP is a reciprocal project-level governance covenant. Distinguish direct conversation context, retrieved archived excerpts, registered source metadata, and inference. Registered Drive/GitHub/Supabase sources are pointers and summaries only unless their contents are explicitly present in context. E47: H=V₂⊗³ dim125; K=(C−6I)(C−30I); kerK dimension47; Γ=I−K²/99144; exact spectral contraction (15/17)^n. This does not prove better language reasoning.";
 const archive=retrieved.length?"Relevant archived excerpts (not exhaustive):\n"+retrieved.map(x=>x.created_at+": "+String(x.content).slice(0,1200)).join("\n"):"";
 const registry=sourceContext?"Registered salient sources (metadata/provenance map, not full contents):\n"+sourceContext:"";
 const payload={model:Deno.env.get("MELANIE_MODEL")||"gpt-4.1-mini",messages:[{role:"system",content:system+"\n\n"+registry+"\n\n"+archive},...(recent||[]).reverse(),{role:"user",content:message}],temperature:0.4};
 let answer:string;
 try{const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const out=await response.json();if(!response.ok)return respond({error:"Reasoning provider unavailable",detail:String(out.error?.message||response.status).slice(0,180)},502,origin);
 answer=out.choices?.[0]?.message?.content||"";if(!answer)return respond({error:"Empty model response"},502,origin);
 }catch{return respond({error:"Reasoning request failed"},502,origin)}
 const {error:writeError}=await db.from("melanie_messages").insert([{owner_id:user.id,thread_id:threadId,role:"user",content:message},{owner_id:user.id,thread_id:threadId,role:"assistant",content:answer}]);
 if(writeError)return respond({error:"Reply generated but memory persistence failed; do not assume it was saved"},500,origin);
 await db.from("melanie_threads").update({updated_at:new Date().toISOString()}).eq("id",threadId).eq("owner_id",user.id);
 return respond({reply:answer},200,origin);
});
