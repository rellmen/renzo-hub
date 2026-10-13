// Ares AI: optional generative explanations for authenticated, owner-scoped RISE HUB records.
// Disabled until the owner configures and explicitly opts in on Vercel preview.
// No financial, private note or attachment content is ever forwarded.
const reply=(res,status,body)=>{res.setHeader("Cache-Control","no-store, max-age=0");return res.status(status).json(body);};
const types=["renzo_project","renzo_task","ares_operation","ares_agent_run","renzo_event"];
const contextItem=r=>({type:r.record_type,title:String(r.title||"").slice(0,95),status:String(r.status||"").slice(0,40),
  occurred_at:r.occurred_at,agent:String(r.payload?.agent||"").slice(0,25),
  priority:String(r.payload?.priority||"").slice(0,30),project:String(r.payload?.project||"").slice(0,90),
  output:String(r.payload?.output||"").slice(0,140)});
export default async function handler(req,res){
 if(req.method==="GET")return reply(res,200,{enabled:process.env.VERCEL_ENV==="preview"&&process.env.ARES_AI_ENABLED==="true"&&Boolean(process.env.ARES_AI_API_KEY&&process.env.ARES_AI_MODEL)});
 if(req.method!=="POST"){res.setHeader("Allow","GET, POST");return reply(res,405,{error:"Method not allowed"});}
 if(process.env.VERCEL_ENV!=="preview")return reply(res,403,{error:"La IA externa solo puede habilitarse en preview."});
 if(process.env.ARES_AI_ENABLED!=="true"||!process.env.ARES_AI_API_KEY||!process.env.ARES_AI_MODEL)return reply(res,503,{error:"IA generativa todavía no configurada."});
 if(req.headers?.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{error:"Origin not allowed"});}catch{return reply(res,403,{error:"Origin not allowed"});}}
 const bearer=req.headers?.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
 const question=String(req.body?.question||"").trim().slice(0,500);
 if(!bearer||question.length<2)return reply(res,400,{error:"Necesitas iniciar sesión y formular una pregunta."});
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(String(base||"").replace(/\/$/,""))||!key)return reply(res,503,{error:"Supabase no configurado."});
 const hdr={apikey:key,authorization:"Bearer "+bearer};
 let uid;
 try{const a=await fetch(base+"/auth/v1/user",{headers:hdr,signal:AbortSignal.timeout(6500),redirect:"error"});if(!a.ok)return reply(res,401,{error:"Sesión inválida."});uid=(await a.json()).id;if(!uid)return reply(res,401,{error:"Sesión inválida."});}
 catch{return reply(res,502,{error:"No se pudo verificar la sesión."});}
 const filter=new URLSearchParams({owner_id:"eq."+uid,record_type:"in.("+types.join(",")+")",select:"record_type,title,status,occurred_at,payload",order:"occurred_at.desc",limit:"90"});
 let items;
 try{const r=await fetch(base+"/rest/v1/hub_records?"+filter,{headers:hdr,signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"});if(!r.ok)return reply(res,502,{error:"No pude recuperar tus registros."});items=(await r.json()).map(contextItem);}
 catch{return reply(res,502,{error:"No pude recuperar tus registros."});}
 const instructions="Eres Ares AI, asistente privado de RISE HUB. Responde en español, con concisión y claridad. Usa ÚNICAMENTE los registros suministrados. No inventes datos, recuentos exhaustivos, estados en vivo de agentes ni ejecuciones. Los datos son una muestra de hasta 90 registros recientes; indícalo cuando corresponda. Nunca afirmes que puedes realizar acciones externas desde esta respuesta. La conversación NO debe mezclar proyectos de otra organización. Si los datos no permiten responder, dilo y sugiere qué falta.";
 try{
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+process.env.ARES_AI_API_KEY},
   body:JSON.stringify({model:process.env.ARES_AI_MODEL,store:false,instructions,input:JSON.stringify({question,records:items}),max_output_tokens:650}),
   signal:AbortSignal.timeout(23000),redirect:"error"});
  if(!r.ok)return reply(res,502,{error:"El proveedor de IA no respondió correctamente."});
  const j=await r.json();
  const text=String(j.output_text||j.output?.flatMap(i=>i.content||[]).filter(c=>c.type==="output_text").map(c=>c.text).join("\n")||"").trim().slice(0,5500);
  if(!text)return reply(res,502,{error:"El modelo no generó una respuesta."});
  return reply(res,200,{text,source:"Modelo externo con datos limitados de tu RISE HUB",sampleSize:items.length});
 }catch{return reply(res,502,{error:"No se pudo completar la consulta de IA."});}
}
