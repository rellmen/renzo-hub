// RISE HUB Nocturne · Idea Vault + Weekly Sprint (port de world.js Classic).
// Mismos registros que Classic: hub_records renzo_idea / renzo_project / renzo_event (domain work/system)
// y hub_user_state.state.sprint. Mejoras: CAS updated_at en cada cambio y promoción idempotente
// (los IDs de proyecto y evento se reservan en la idea antes de crearlos; un reintento no duplica).
import {loadShiftState,saveShiftState} from "./shift-state.mjs";
const COLS="id,owner_id,domain,record_type,title,status,occurred_at,payload,updated_at";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const own=uid=>{if(typeof uid!=="string"||!UUID.test(uid))throw Error("Inicia sesión.");return uid;};
const unwrap=({data,error},m)=>{if(error)throw Error(error.message||m);return data;};
const day=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
export function weekStart(d=new Date()){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return day(x);}

export function ideaState(idea,now=Date.now()){
 const status=idea.status||"cooling";
 if(status==="promoted"||status==="archived")return status;
 return now>=(Number(idea.coolingUntil)||0)?"review":"cooling";
}
export const mapIdea=row=>({...(row.payload||{}),id:String(row.id),title:String(row.title||row.payload?.title||"Idea"),status:row.payload?.status||row.status||"cooling",_cloudUpdatedAt:String(row.updated_at||"")});
export async function loadIdeas(client,uid){
 const id=own(uid);
 const data=unwrap(await client.from("hub_records").select(COLS).eq("owner_id",id).eq("domain","work").eq("record_type","renzo_idea").order("occurred_at",{ascending:false}).limit(500),"No se pudo cargar Idea Vault.");
 if(!Array.isArray(data)||data.some(r=>r.owner_id!==id))throw Error("Respuesta de Idea Vault no válida.");
 return data.map(mapIdea);
}
export async function captureIdea(client,uid,{title,note="",coolingHours=48},{now=Date.now(),id=globalThis.crypto.randomUUID()}={}){
 const t=String(title||"").trim().slice(0,140);if(!t)throw Error("La idea necesita un título.");
 const hours=[48,72].includes(Number(coolingHours))?Number(coolingHours):48;
 const date=day(new Date(now));
 const payload={id,title:t,note:String(note||"").trim().slice(0,1500),date,status:"cooling",coolingHours:hours,coolingUntil:now+hours*3600000};
 return mapIdea(unwrap(await client.from("hub_records").insert({id,owner_id:own(uid),domain:"work",record_type:"renzo_idea",title:t,status:"cooling",
  occurred_at:date+"T12:00:00.000Z",payload,source:"manual",requires_review:false}).select(COLS).single(),"No se pudo guardar la idea."));
}
async function patchIdea(client,uid,idea,changes){
 if(!idea?.id||!idea._cloudUpdatedAt)throw Error("Actualiza Idea Vault antes de cambiarla.");
 const {_cloudUpdatedAt,...payload}=idea;Object.assign(payload,changes);
 const row=unwrap(await client.from("hub_records").update({status:payload.status,payload}).eq("id",idea.id).eq("owner_id",own(uid))
  .eq("domain","work").eq("record_type","renzo_idea").eq("updated_at",_cloudUpdatedAt).select(COLS).maybeSingle(),"No se pudo guardar.");
 if(!row)throw Error("La idea cambió en otro dispositivo. Actualiza.");
 return mapIdea(row);
}
export async function archiveIdea(client,uid,idea){
 if(["promoted","archived"].includes(idea.status))throw Error("La idea ya está cerrada.");
 return patchIdea(client,uid,idea,{status:"archived"});
}
export const activeProjects=projects=>projects.filter(p=>["primary","secondary"].includes(p.slot)&&p.status!=="completed");
export function freeSlot(projects,limit=2){
 const active=activeProjects(projects);
 if(active.length>=Math.max(1,Math.min(2,Number(limit)||2)))return null;
 return active.some(p=>p.slot==="primary")?"secondary":"primary";
}
async function materialize(client,uid,idea){
 const {promotedProjectId:pid,promotedEventId:eid,promotedSlot:slot,promotedOn:date}=idea;
 if(!UUID.test(pid||"")||!UUID.test(eid||""))throw Error("Promoción incompleta sin identificadores.");
 const project={id:pid,title:idea.title,area:"",output:"",slot,status:"active",date};
 unwrap(await client.from("hub_records").upsert({id:pid,owner_id:own(uid),domain:"work",record_type:"renzo_project",title:idea.title,status:"active",
  occurred_at:date+"T12:00:00.000Z",payload:project,source:"manual",requires_review:false},{onConflict:"id",ignoreDuplicates:true}),"No se pudo crear el proyecto.");
 unwrap(await client.from("hub_records").upsert({id:eid,owner_id:uid,domain:"system",record_type:"renzo_event",title:idea.title,status:"active",
  occurred_at:date+"T12:00:00.000Z",payload:{id:eid,kind:"project",title:idea.title,stage:"Construction",date,projectId:pid},source:"manual",requires_review:false},
  {onConflict:"id",ignoreDuplicates:true}),"No se pudo registrar el evento.");
 return pid;
}
// override=true es la confirmación explícita de promover durante el enfriamiento (como Classic).
export async function promoteIdea(client,uid,idea,projects,{override=false,limit=2,now=Date.now()}={}){
 if(idea.status==="archived")throw Error("La idea está archivada.");
 if(idea.status==="promoted")return materialize(client,uid,idea); // reintento idempotente
 const slot=freeSlot(projects,limit);if(!slot)throw Error("No hay slot libre. Libera uno o deja la idea en Vault.");
 if(now<(Number(idea.coolingUntil)||0)&&!override)throw Error("La idea sigue en enfriamiento: confirma el override para promoverla.");
 const reserved=await patchIdea(client,uid,idea,{status:"promoted",promotedProjectId:globalThis.crypto.randomUUID(),
  promotedEventId:globalThis.crypto.randomUUID(),promotedSlot:slot,promotedOn:day(new Date(now))});
 return materialize(client,uid,reserved);
}
export function promotionPending(idea,projects){
 return idea.status==="promoted"&&!!idea.promotedProjectId&&!projects.some(p=>p.id===idea.promotedProjectId);
}

// --- Weekly Sprint (hub_user_state.state.sprint), con las alertas de Classic ---
export async function loadSprint(client,uid){const snap=await loadShiftState(client,own(uid));return {snap,sprint:snap.state?.sprint||{}};}
export function sprintFrom(v){
 const objective=String(v.objective||"").trim().slice(0,220);
 if(!objective)throw Error("Indica el objetivo del sprint.");
 const deadline=String(v.deadline||"");if(deadline&&!/^\d{4}-\d{2}-\d{2}$/.test(deadline))throw Error("Fecha límite no válida.");
 return {objective,deliverable:String(v.deliverable||"").trim().slice(0,220),deadline,nextAction:String(v.nextAction||"").trim().slice(0,180),blocker:String(v.blocker||"").trim().slice(0,180),week:weekStart()};
}
export async function saveSprint(client,uid,snap,v){
 const sprint=sprintFrom(v);
 return saveShiftState(client,own(uid),snap,{...(snap.state||{}),sprint});
}
export function sprintAlerts(s,today=day(),now=Date.now()){
 const out=[];if(!s?.objective)return out;
 if(!s.deliverable)out.push({signal:"Sin entregable",text:`El sprint tiene objetivo «${s.objective}» pero no un entregable observable.`});
 if(s.blocker)out.push({signal:"Bloqueo sin resolver",text:`Bloqueo registrado: ${s.blocker}`});
 const soon=day(new Date(now+2*86400000));
 if(s.deadline&&s.deadline>=today&&s.deadline<=soon)out.push({signal:"Sprint en riesgo",text:`La fecha límite ${s.deadline} es en menos de 48 h.`});
 if(s.deadline&&s.deadline<today)out.push({signal:"Fecha vencida",text:`La fecha límite ${s.deadline} ya pasó: cierra o replanifica.`});
 return out;
}
