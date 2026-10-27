// RISE PRIORITY: read/write the same private renzo_task records used by Work.
// No cross-assistant ingestion occurs without an authenticated user preview and confirmation.
// Validation is strict on purpose: invalid values are rejected, never silently converted to defaults.
import {mapTaskRow} from "./work-records.mjs";

const DOMAIN="work",TYPE="renzo_task";
const COLS="id,title,status,payload,updated_at,owner_id,record_type,domain,occurred_at";
export const URGENCIES=Object.freeze(["P0","P1","P2","P3"]);
export const DEADLINE_TYPES=Object.freeze(["interna","real"]);
export const ORIGINS=Object.freeze(["manual","chatgpt","claude"]);
export const RISE_TIME_ZONE="Europe/Amsterdam";
// Must match loadWorkRecords' default limit: Home shares the ['work-records', uid] cache with /proyectos.
export const WORK_LOAD_LIMIT=300;
const STATUS=new Set(["Today","This Week","Blocked","Waiting","Backlog","Completed"]);
const PROPOSAL_KEYS=new Set(["title","urgency","dueDate","deadlineType","why","origin","proposalId","sourceRef","evidenceSummary","evidenceCheckedAt"]);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIMITS={title:180,why:400,sourceRef:300,evidenceSummary:500};

export class PriorityConflictError extends Error{
 constructor(remote){super("Esta tarea cambió en otro dispositivo. Revisa la versión guardada antes de reaplicar tu cambio.");
  this.name="PriorityConflictError";this.code="CONFLICT";this.remote=remote;}
}
const requireOwner=uid=>{if(typeof uid!=="string"||!uid.trim())throw Error("Inicia sesión para continuar.");return uid;};
function unwrap(response){
 if(!response)throw Error("Supabase no respondió.");
 if(response.error){const e=Error(response.error.message||"Error al sincronizar con Supabase.");e.code=response.error.code;throw e;}
 return response.data;
}
const isPlainObject=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);

/** Civil date (YYYY-MM-DD) of `now` in Europe/Amsterdam: one rule for ordering, badges and new records. */
export function riseToday(now=new Date()){
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:RISE_TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t)?.value;
 return `${get("year")}-${get("month")}-${get("day")}`;
}
export function isCivilDate(s){
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T12:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;
}
// Optional text: undefined/null → "". Wrong type or too long → error (no silent truncation).
function text(value,name,max,{required=false,label=name}={}){
 if(value===undefined||value===null)value="";
 if(typeof value!=="string")throw Error(`«${label}» debe ser texto.`);
 const v=value.trim();
 if(required&&!v)throw Error(name==="why"?"Explica por qué importa esta tarea (motivo obligatorio).":`«${label}» es obligatorio.`);
 if(v.length>max)throw Error(`«${label}» admite como máximo ${max} caracteres.`);
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw Error(`«${label}» contiene caracteres no admitidos.`);
 return v;
}
function oneOf(value,allowed,fallback,label){
 if(value===undefined||value===null||value==="")return fallback;
 if(!allowed.includes(value))throw Error(`${label} no válido: ${String(value).slice(0,20)}.`);
 return value;
}
function civilDate(value){
 if(value===undefined||value===null||value==="")return "";
 if(!isCivilDate(value))throw Error("La fecha debe ser un día real con formato AAAA-MM-DD.");
 return value;
}
function sourceRef(value){
 const v=text(value,"sourceRef",LIMITS.sourceRef,{label:"Referencia de la fuente"});
 // Shown as plain text only. A URL must be https; any other scheme (javascript:, data:, http:) is rejected.
 if(/^[a-z][a-z0-9+.-]*:/i.test(v)&&!/^https:\/\/[^\s]+$/i.test(v))throw Error("La referencia solo admite texto o un enlace https.");
 return v;
}
function checkedAt(value){
 if(value===undefined||value===null||value==="")return "";
 if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}T/.test(value)||!Number.isFinite(Date.parse(value)))throw Error("Fecha de comprobación no válida.");
 if(Date.parse(value)>Date.now()+5*60_000)throw Error("La fecha de comprobación no puede estar en el futuro.");
 return value;
}

/**
 * Strict validation at the trust boundary.
 * requireWhy: new tasks and explicit priority assignments need a reason (legacy rows may be read without one).
 * allowUnverifiedReal: only for proposals under review; saving a real deadline always needs date + checked evidence.
 */
export function validatePriorityInput(input,{requireWhy=true,allowUnverifiedReal=false}={}){
 if(!isPlainObject(input))throw Error("Datos de tarea no válidos.");
 const title=text(input.title,"title",LIMITS.title,{required:true,label:"Título"});
 if(typeof input.title!=="string")throw Error("«Título» debe ser texto.");
 const urgency=oneOf(input.urgency,URGENCIES,"P2","Nivel de prioridad");
 const dueDate=civilDate(input.dueDate);
 const deadlineType=oneOf(input.deadlineType,DEADLINE_TYPES,"interna","Tipo de plazo");
 const why=text(input.why,"why",LIMITS.why,{required:requireWhy,label:"Motivo"});
 const origin=oneOf(input.origin,ORIGINS,"manual","Origen");
 const proposalId=text(input.proposalId,"proposalId",80,{label:"ID de propuesta"});
 if(proposalId&&!/^[A-Za-z0-9._:-]+$/.test(proposalId))throw Error("El ID de propuesta solo admite letras, números y . _ : -");
 const evidenceSummary=text(input.evidenceSummary,"evidenceSummary",LIMITS.evidenceSummary,{label:"Evidencia"});
 const evidenceCheckedAt=checkedAt(input.evidenceCheckedAt);
 const v={title,urgency,dueDate,deadlineType,why,origin,proposalId,sourceRef:sourceRef(input.sourceRef),evidenceSummary,evidenceCheckedAt};
 if(deadlineType==="real"&&!allowUnverifiedReal&&(!dueDate||!evidenceSummary||!evidenceCheckedAt))
  throw Error("Un plazo externo necesita fecha, evidencia y tu comprobación. Compruébalo o guárdalo como objetivo interno.");
 return v;
}

function evidenceOf(task){
 const e=isPlainObject(task?.proposalEvidence)?task.proposalEvidence:{};
 const s=v=>typeof v==="string"?v:"";
 return {proposalId:s(e.proposalId),sourceRef:s(e.sourceRef),evidenceSummary:s(e.evidenceSummary),evidenceCheckedAt:s(e.evidenceCheckedAt)};
}
/** Read-only view of a Work task. Never persisted by itself: reading a legacy row writes nothing. */
export function normalizePriority(task={}){
 const urgency=URGENCIES.includes(task.urgency)?task.urgency:task.priority==="High"||task.priority==="Strategic"?"P1":"P2";
 return {urgency,why:typeof task.why==="string"?task.why.trim():"",dueDate:isCivilDate(task.dueDate)?task.dueDate:"",
  deadlineType:task.deadlineType==="real"?"real":"interna",origin:ORIGINS.includes(task.origin)?task.origin:"manual",...evidenceOf(task)};
}
export function sortPriorityTasks(tasks,now=riseToday()){
 const score=t=>{const p=normalizePriority(t),completed=t.status==="Completed";
  return [completed?1:0,URGENCIES.indexOf(p.urgency),p.dueDate&&p.dueDate<now?0:1,p.dueDate||"9999-12-31",String(t.title||"").toLowerCase()];};
 return [...tasks].sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++){if(x[i]!==y[i])return x[i]<y[i]?-1:1;}return 0;});
}
/** Status a completed task returns to when reopened: the one it had before completion, else Today. */
export function reopenStatusFor(task={}){
 return STATUS.has(task.reopenStatus)&&task.reopenStatus!=="Completed"?task.reopenStatus:"Today";
}
function evidencePayload(v){
 const e={proposalId:v.proposalId,sourceRef:v.sourceRef,evidenceSummary:v.evidenceSummary,evidenceCheckedAt:v.evidenceCheckedAt};
 return Object.values(e).some(Boolean)?e:null;
}

export async function findPriorityTask(client,uid,id){
 const userId=requireOwner(uid);
 const data=unwrap(await client.from("hub_records").select(COLS).eq("id",id).eq("owner_id",userId)
  .eq("domain",DOMAIN).eq("record_type",TYPE).maybeSingle());
 return data?mapTaskRow(data):null;
}
export async function createPriorityTask(client,uid,input,{id}={}){
 const userId=requireOwner(uid),v=validatePriorityInput(input);
 if(id!==undefined&&(typeof id!=="string"||!UUID.test(id)))throw Error("Identificador de tarea no válido.");
 const recordId=id||globalThis.crypto.randomUUID(),now=new Date().toISOString(),date=riseToday();
 const status="Backlog";
 const payload={id:recordId,title:v.title,status,priority:v.urgency==="P0"||v.urgency==="P1"?"High":"Normal",
  project:"",date,updatedAt:now,dueDate:v.dueDate,deadlineType:v.deadlineType,urgency:v.urgency,why:v.why,origin:v.origin,
  nextAction:"",blocker:"",aiCanDo:false,renzoMustDo:false};
 const evidence=evidencePayload(v);if(evidence)payload.proposalEvidence=evidence;
 const row={id:recordId,owner_id:userId,domain:DOMAIN,record_type:TYPE,title:v.title,status,
  occurred_at:date+"T12:00:00.000Z",payload,source:"manual",requires_review:false};
 const data=unwrap(await client.from("hub_records").insert(row).select(COLS).single());
 if(!data)throw Error("Supabase no confirmó el alta. Actualiza antes de reintentar.");
 return mapTaskRow(data);
}
/**
 * Saves one reviewed proposal idempotently by its stable UUID.
 * attempted=true means an earlier try may have reached the server: look it up before inserting again.
 */
export async function persistProposal(client,uid,{id,input,attempted}){
 if(attempted){const existing=await findPriorityTask(client,uid,id);if(existing)return {task:existing,recovered:true};}
 try{return {task:await createPriorityTask(client,uid,input,{id}),recovered:false};}
 catch(e){
  if(e?.code==="23505"){const existing=await findPriorityTask(client,uid,id);if(existing)return {task:existing,recovered:true};}
  throw e;
 }
}
export async function patchPriorityTask(client,uid,task,changes={}){
 const userId=requireOwner(uid);
 if(!task?.id||!task?._cloudUpdatedAt)throw Error("Actualiza el panel antes de editar.");
 const {_cloudUpdatedAt,_local,...payload}=task;
 const hasStatus=Object.prototype.hasOwnProperty.call(changes,"status");
 if(hasStatus){
  if(!STATUS.has(changes.status))throw Error("Estado inválido.");
  if(changes.status==="Completed"&&payload.status!=="Completed")payload.reopenStatus=payload.status;
  payload.status=changes.status;
 }
 if(["title","urgency","dueDate","deadlineType","why","origin","sourceRef","evidenceSummary","evidenceCheckedAt"]
   .some(k=>Object.prototype.hasOwnProperty.call(changes,k))){
  const current={title:payload.title,...normalizePriority(payload)};
  const v=validatePriorityInput({...current,...changes});
  // RISE urgency is independent from Work's priority (Normal/High/Strategic), which is kept untouched.
  Object.assign(payload,{title:v.title,urgency:v.urgency,dueDate:v.dueDate,deadlineType:v.deadlineType,why:v.why,origin:v.origin});
  const evidence=evidencePayload(v);
  if(evidence)payload.proposalEvidence=evidence;else delete payload.proposalEvidence;
 }
 payload.updatedAt=new Date().toISOString();
 const update={title:String(payload.title||"").trim(),status:payload.status,payload};
 const data=unwrap(await client.from("hub_records").update(update).eq("id",task.id).eq("owner_id",userId)
  .eq("domain",DOMAIN).eq("record_type",TYPE).eq("updated_at",_cloudUpdatedAt).select(COLS).maybeSingle());
 if(data)return mapTaskRow(data);
 // Zero rows: either someone saved first (conflict) or the task is gone. Never report success.
 const remote=await findPriorityTask(client,userId,task.id);
 if(remote)throw new PriorityConflictError(remote);
 throw Error("La tarea ya no existe o no tienes acceso a ella.");
}

// External assistants may propose ONLY structured data. Never silently execute or persist proposals.
function parseRaw(raw){
 if(typeof raw!=="string"||raw.length>15000)throw Error("La propuesta es demasiado larga (máximo 15.000 caracteres).");
 let data;try{data=JSON.parse(raw);}catch{throw Error("Pega un JSON válido con la propiedad tasks.");}
 if(!isPlainObject(data))throw Error("La propuesta debe ser un objeto JSON con la propiedad tasks.");
 const extra=Object.keys(data).filter(k=>k!=="tasks");
 if(extra.length)throw Error(`Campo no admitido en la propuesta: «${extra[0].slice(0,40)}».`);
 if(!Array.isArray(data.tasks)||data.tasks.length<1||data.tasks.length>10)throw Error("La propuesta debe contener entre 1 y 10 tareas.");
 return data.tasks.map((t,i)=>{
  if(!isPlainObject(t))throw Error(`La tarea ${i+1} no es un objeto.`);
  const bad=Object.keys(t).find(k=>!PROPOSAL_KEYS.has(k));
  if(bad)throw Error(`Campo no admitido «${bad.slice(0,40)}» en la tarea ${i+1}.`);
  try{
   // The assistant's own "checked at" is not proof of a human check: it is dropped and only reported.
   const input=validatePriorityInput({...t,evidenceCheckedAt:""},{requireWhy:false,allowUnverifiedReal:true});
   return {input,raw:t};
  }catch(e){throw Error(`Tarea ${i+1}: ${e.message}`);}
 });
}
export function parsePriorityProposal(raw){return parseRaw(raw).map(x=>x.input);}
const dedupeKey=(title,date)=>String(title||"").trim().toLocaleLowerCase("es")+"|"+(date||"");
export function uniquePriorityProposals(proposals,current=[]){
 const seen=new Set(current.map(t=>dedupeKey(t.title,t.dueDate)));
 return proposals.filter(p=>{const key=dedupeKey(p.title,p.dueDate);if(seen.has(key))return false;seen.add(key);return true;});
}
/** Builds the review list. Pure: produces drafts with stable UUIDs and writes nothing. */
export function reviewPriorityProposals(raw,current=[]){
 const existing=new Map(current.map(t=>[dedupeKey(t.title,normalizePriority(t).dueDate),t]));
 const seen=new Set();
 return parseRaw(raw).map(({input,raw:t},index)=>{
  const key=dedupeKey(input.title,input.dueDate);
  const duplicateOf=existing.get(key)||(seen.has(key)?"batch":null);
  seen.add(key);
  const warnings=[];
  if(t.urgency===undefined)warnings.push("Prioridad no indicada: se propone P2.");
  if(t.origin===undefined)warnings.push("Origen no declarado: figura como manual.");
  if(typeof t.evidenceCheckedAt==="string"&&t.evidenceCheckedAt)warnings.push("La fecha de comprobación enviada por el asistente no cuenta como revisión.");
  if(!input.evidenceSummary&&!input.sourceRef)warnings.push("Sin evidencia ni referencia: no aparece como verificada.");
  return {index,id:globalThis.crypto.randomUUID(),input,selected:!duplicateOf,duplicateOf,noDateConfirmed:false,
   claimedCheckedAt:typeof t.evidenceCheckedAt==="string"?t.evidenceCheckedAt:"",warnings,attempted:false,state:"draft",error:""};
 });
}
/** Reasons a reviewed proposal cannot be saved yet. Empty array = ready. */
export function proposalBlockers(item){
 const v=item.input,out=[];
 if(!String(v.why||"").trim())out.push("Falta el motivo.");
 if(!v.dueDate&&!item.noDateConfirmed)out.push("Elige una fecha o confirma que la dejas sin fecha.");
 if(v.deadlineType==="real"&&(!v.dueDate||!v.evidenceSummary||!v.evidenceCheckedAt))
  out.push("Plazo externo sin comprobar: añade evidencia y márcalo como comprobado, o cámbialo a interno.");
 return out;
}
