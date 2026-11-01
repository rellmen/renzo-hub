// Rise · notificaciones push (02-11-2026). Desplegada con verify_jwt=false: autentica ella misma.
// - GET  (sesión del usuario): devuelve la clave pública VAPID (la genera la primera vez; la privada nunca sale de la BD).
// - POST {action:"test"} (sesión): manda una notificación de prueba a los dispositivos del usuario.
// - POST {mode:"new"|"digest"} (cabecera x-push-cron = secreto de Vault): lo llama pg_cron.
import webpush from "npm:web-push@3.6.7";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import {newItemNotices,digestNotice,amsterdamDate} from "./logic.mjs";

const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGINS=new Set(["https://renzo-hub.vercel.app","https://renzo-hub-2-1-staging.vercel.app"]);
const cors=(o:string|null)=>({"access-control-allow-origin":o&&(ORIGINS.has(o)||/^https:\/\/(renzo-hub-2-1-staging|rise-hub-nocturne)-[a-z0-9]+-renzojesus99-1996\.vercel\.app$/.test(o))?o:"https://renzo-hub.vercel.app",
 "access-control-allow-headers":"authorization, apikey, content-type, x-client-info","access-control-allow-methods":"GET, POST, OPTIONS","vary":"Origin"});
const json=(o:string|null,code:number,body:unknown)=>new Response(JSON.stringify(body),{status:code,headers:{...cors(o),"content-type":"application/json","cache-control":"no-store"}});
const b64u=(buf:ArrayBuffer)=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");

async function vapid(){
 let {data,error}=await admin.rpc("push_srv_vapid");
 if(error)throw error;
 if(!data?.length){
  const kp=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
  const pub=b64u(await crypto.subtle.exportKey("raw",kp.publicKey));
  const d=(await crypto.subtle.exportKey("jwk",kp.privateKey)).d!;
  ({data,error}=await admin.rpc("push_srv_vapid",{p_public:pub,p_private:d}));
  if(error)throw error;
 }
 return {publicKey:data[0].public_key as string,privateKey:data[0].private_key as string};
}

type Sub={id:string;owner_id:string;endpoint:string;p256dh:string;auth:string};
type Notice={title:string;body:string;url:string;tag:string};
async function sendTo(subs:Sub[],n:Notice){
 const keys=await vapid();
 webpush.setVapidDetails("https://renzo-hub.vercel.app",keys.publicKey,keys.privateKey);
 let ok=0;
 for(const s of subs){
  try{
   await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(n),{TTL:86400,urgency:"high"});
   ok++;await admin.from("push_subscriptions").update({last_ok_at:new Date().toISOString(),failures:0}).eq("id",s.id);
  }catch(e){
   const code=(e as {statusCode?:number}).statusCode;
   // 404/410: el dispositivo ya no acepta avisos (app borrada o permiso retirado).
   if(code===404||code===410)await admin.from("push_subscriptions").delete().eq("id",s.id);
   else await admin.from("push_subscriptions").update({failures:1}).eq("id",s.id);
   console.error("push failed",code??"",String((e as Error).message||e).slice(0,120));
  }
 }
 return ok;
}

async function user(req:Request){
 const token=req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)return null;
 const {data,error}=await admin.auth.getUser(token);
 return error?null:data.user;
}

async function sweep(mode:"new"|"digest"){
 const {data:subs,error}=await admin.from("push_subscriptions").select("id,owner_id,endpoint,p256dh,auth");
 if(error)throw error;
 const owners=[...new Set((subs||[]).map(s=>s.owner_id))];
 let sent=0;
 for(const owner of owners){
  const mine=(subs||[]).filter(s=>s.owner_id===owner) as Sub[];
  const since=new Date(Date.now()-(mode==="new"?60:60*24*60)*60000).toISOString();
  let inboxQ=admin.from("hub_records").select("id,title,status,payload,created_at").eq("owner_id",owner).eq("record_type","renzo_inbox").limit(200);
  let payQ=admin.from("payroll_payslips").select("id,review_status,period_label,net_payment,net_salary,created_at").eq("user_id",owner).eq("review_status","pending").limit(100);
  if(mode==="new"){inboxQ=inboxQ.gte("created_at",since);payQ=payQ.gte("created_at",since);}
  else inboxQ=inboxQ.eq("requires_review",true);
  const [inbox,pay]=await Promise.all([inboxQ,payQ]);
  if(inbox.error||pay.error){console.error("query",inbox.error?.message,pay.error?.message);continue;}
  const data={inbox:inbox.data||[],payslips:pay.data||[],bankLast:{} as Record<string,string|null>};
  let notices;
  if(mode==="new"){
   const candidate=[...data.inbox.map(r=>"inbox:"+r.id),...data.payslips.map(p=>"payslip:"+p.id)];
   const {data:done}=await admin.rpc("push_srv_sent",{p_owner:owner,p_keys:candidate});
   notices=newItemNotices(data,new Set(done||[]));
  }else{
   const today=amsterdamDate();
   for(const bank of ["ING","Revolut"]){
    const {data:last}=await admin.from("hub_records").select("payload").eq("owner_id",owner).eq("record_type","bank_tx").eq("payload->>bank",bank).order("occurred_at",{ascending:false}).limit(1);
    data.bankLast[bank]=last?.[0]?.payload?.date??null;
   }
   const {data:done}=await admin.rpc("push_srv_sent",{p_owner:owner,p_keys:["digest:"+today]});
   const d=digestNotice(data,today,new Set(done||[]));
   notices=d?[d]:[];
  }
  for(const n of notices){
   // Se marca antes de enviar: si el envío falla a medias no se repite en bucle cada 10 minutos.
   await admin.rpc("push_srv_mark",{p_owner:owner,p_keys:n.keys});
   if(await sendTo(mine,{title:n.title,body:n.body,url:n.url,tag:n.tag}))sent++;
  }
 }
 return sent;
}

Deno.serve(async req=>{
 const o=req.headers.get("origin");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(o)});
 try{
  const cron=req.headers.get("x-push-cron");
  if(cron){
   const {data:ok}=await admin.rpc("push_srv_cron_ok",{p:cron});
   if(ok!==true)return json(o,401,{error:"unauthorized"});
   const body=await req.json().catch(()=>({}));
   const mode=body?.mode==="digest"?"digest":"new";
   return json(o,200,{ok:true,mode,sent:await sweep(mode)});
  }
  const u=await user(req);
  if(!u)return json(o,401,{error:"Sesión necesaria."});
  if(req.method==="GET")return json(o,200,{publicKey:(await vapid()).publicKey});
  if(req.method==="POST"){
   const body=await req.json().catch(()=>({}));
   if(body?.action!=="test")return json(o,400,{error:"Acción no válida."});
   const {data:subs}=await admin.from("push_subscriptions").select("id,owner_id,endpoint,p256dh,auth").eq("owner_id",u.id);
   if(!subs?.length)return json(o,404,{error:"Este usuario no tiene dispositivos activados."});
   const ok=await sendTo(subs as Sub[],{title:"Rise",body:"Notificaciones activadas. Así te llegarán los avisos.",url:"/ajustes",tag:"rise-test"});
   return json(o,200,{ok:ok>0,devices:subs.length,delivered:ok});
  }
  return json(o,405,{error:"Method not allowed"});
 }catch(e){console.error(String((e as Error)?.message||e).slice(0,200));return json(o,500,{error:"Error interno."});}
});
