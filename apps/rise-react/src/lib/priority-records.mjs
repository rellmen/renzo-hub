// RISE PRIORITY: read/write the same private renzo_task records used by Work.
// No cross-assistant ingestion occurs without an authenticated user preview and confirmation.
const DOMAIN="work",TYPE="renzo_task";
const COLS="id,title,status,payload,updated_at,owner_id,record_type,domain,occurred_at";
export const URGENCIES=Object.freeze(["P0","P1","P2","P3"]);
const STATUS=new Set(["Today","This Week","Blocked","Waiting","Backlog","Completed"]);
const ORIGINS=new Set(["manual","chatgpt","claude"]);
const requireOwner=uid=>{if(typeof uid!=="string"||!uid.trim())throw Error("Inicia sesión para continuar.");return uid;};
const unwrap=response=>{if(!response||response.error)throw Error(response?.error?.message||"Error al sincronizar con Supabase.");return response.data;};
const field=(text,max)=>String(text??"").trim().slice(0,max);
const localDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
function safeDate(value){
 const s=field(value,10);if(!s)return "";
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error("La fecha debe ser AAAA-MM-DD.");
 const d=new Date(s+"T12:00:00Z");if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error("Fecha no válida.");
 return s;
}
export function normalizePriority(task={}){
 const urgency=URGENCIES.includes(task.urgency)?task.urgency:task.priority==="High"||task.priority==="Strategic"?"P1":"P2";
 return {urgency,why:field(task.why,400),dueDate:task.dueDate&&/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)?task.dueDate:"",
  deadlineType:task.deadlineType==="real"?"real":"interna",origin:ORIGINS.has(task.origin)?task.origin:"manual"};
}
export function sortPriorityTasks(tasks,now=localDay()){
 const score=t=>{const p=normalizePriority(t),completed=t.status==="Completed";return [completed?1:0,URGENCIES.indexOf(p.urgency),p.dueDate&&p.dueDate<now?0:1,p.dueDate||"9999-12-31",String(t.title||"").toLowerCase()];};
 return [...tasks].sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++){if(x[i]!==y[i])return x[i]<y[i]?-1:1;}return 0;});
}
export function validatePriorityInput(input={}){
 const title=field(input.title,180);if(!title)throw Error("El título es obligatorio.");
 const urgency=URGENCIES.includes(input.urgency)?input.urgency:"P2";
 const dueDate=safeDate(input.dueDate);
 const deadlineType=input.deadlineType==="real"?"real":"interna";
 const why=field(input.why,400);
 const origin=ORIGINS.has(input.origin)?input.origin:"manual";
 return {title,urgency,dueDate,deadlineType,why,origin};
}
export async function createPriorityTask(client,uid,input){
 const userId=requireOwner(uid),v=validatePriorityInput(input),now=new Date().toISOString(),id=globalThis.crypto.randomUUID(),date=localDay();
 const status="Backlog";
 const payload={id,title:v.title,status,priority:v.urgency==="P0"||v.urgency==="P1"?"High":"Normal",
  project:"",date,updatedAt:now,dueDate:v.dueDate,deadlineType:v.deadlineType,urgency:v.urgency,why:v.why,origin:v.origin,
  nextAction:"",blocker:"",aiCanDo:false,renzoMustDo:false};
 const row={id,owner_id:userId,domain:DOMAIN,record_type:TYPE,title:v.title,status,
  occurred_at:date+"T12:00:00.000Z",payload,source:"manual",requires_review:false};
 return unwrap(await client.from("hub_records").insert(row).select(COLS).single());
}
export async function patchPriorityTask(client,uid,task,changes={}){
 const userId=requireOwner(uid);
 if(!task?.id||!task?._cloudUpdatedAt)throw Error("Actualiza el panel antes de editar.");
 const payload={...task};
 delete payload._cloudUpdatedAt;delete payload._local;
 const hasStatus=Object.prototype.hasOwnProperty.call(changes,"status");
 if(hasStatus){if(!STATUS.has(changes.status))throw Error("Estado inválido.");payload.status=changes.status;}
 if(["title","urgency","dueDate","deadlineType","why","origin"].some(k=>Object.prototype.hasOwnProperty.call(changes,k))){
  const validated=validatePriorityInput({...payload,...changes});
  Object.assign(payload,validated);
  payload.priority=validated.urgency==="P0"||validated.urgency==="P1"?"High":"Normal";
 }
 payload.updatedAt=new Date().toISOString();
 const update={title:field(payload.title,180),status:payload.status,payload};
 const result=unwrap(await client.from("hub_records").update(update).eq("id",task.id).eq("owner_id",userId)
  .eq("domain",DOMAIN).eq("record_type",TYPE).eq("updated_at",task._cloudUpdatedAt).select(COLS).maybeSingle());
 if(!result)throw Error("Esta tarea se modificó en otro dispositivo. Actualiza antes de guardar.");
 return result;
}
// External assistants may propose ONLY structured data. Never silently execute or persist proposals.
export function parsePriorityProposal(raw){
 if(typeof raw!=="string"||raw.length>15000)throw Error("La propuesta es demasiado larga.");
 let data;try{data=JSON.parse(raw);}catch{throw Error("Pega un JSON válido con la propiedad tasks.");}
 if(!data||typeof data!=="object"||!Array.isArray(data.tasks)||data.tasks.length<1||data.tasks.length>10)throw Error("La propuesta debe contener entre 1 y 10 tareas.");
 return data.tasks.map(v=>validatePriorityInput(v));
}
export function uniquePriorityProposals(proposals,current=[]){
 const seen=new Set(current.map(t=>field(t.title,180).toLocaleLowerCase("es")+"|"+(t.dueDate||"")));
 return proposals.filter(p=>{const key=p.title.toLocaleLowerCase("es")+"|"+p.dueDate;if(seen.has(key))return false;seen.add(key);return true;});
}
