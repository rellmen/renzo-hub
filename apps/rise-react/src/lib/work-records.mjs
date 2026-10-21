// RISE HUB React / Work bridge — preserves the legacy world.js hub_records contract.
// Never use mock values or localStorage for authenticated task/project data.
export const WORK_STATUSES=Object.freeze(["Today","This Week","Blocked","Waiting","Backlog","Completed"]);
export const WORK_PRIORITIES=Object.freeze(["Normal","High","Strategic"]);
const domain="work";
const types=Object.freeze({tasks:"renzo_task",projects:"renzo_project"});
const columns="id,title,status,payload,updated_at,occurred_at,owner_id,record_type,domain";

function owner(uid){
  if(typeof uid!=="string"||!uid.trim())throw new Error("Inicia sesión para consultar tu espacio.");
  return uid;
}
function requireData(result){
  if(result?.error)throw new Error(result.error.message||"Error de sincronización con Supabase.");
  if(!result)throw new Error("La consulta a Supabase no respondió.");
  return result.data;
}
export function mapTaskRow(row){
  const payload=row?.payload&&typeof row.payload==="object"&&!Array.isArray(row.payload)?row.payload:{};
  return {
    ...payload,
    id:String(row.id),
    title:String(row.title||payload.title||"Sin título"),
    status:WORK_STATUSES.includes(payload.status)?payload.status:(WORK_STATUSES.includes(row.status)?row.status:"Backlog"),
    priority:WORK_PRIORITIES.includes(payload.priority)?payload.priority:"Normal",
    project:String(payload.project||""),
    updatedAt:String(payload.updatedAt||row.updated_at||""),
    _cloudUpdatedAt:String(row.updated_at||""),
  };
}
export function mapProjectRow(row){
  const payload=row?.payload&&typeof row.payload==="object"&&!Array.isArray(row.payload)?row.payload:{};
  return {...payload,id:String(row.id),title:String(row.title||payload.title||"Proyecto sin título"),_cloudUpdatedAt:String(row.updated_at||"")};
}
export function statusColumn(status){
  if(status==="Completed")return "done";
  if(status==="Today"||status==="Blocked")return "doing";
  return "todo";
}
export function columnTargetStatus(column){
  if(column==="done")return "Completed";
  if(column==="doing")return "Today";
  if(column==="todo")return "Backlog";
  throw new Error("Columna desconocida.");
}
export async function loadWorkRecords(client,uid,{limit=300}={}){
  const id=owner(uid);
  if(!client?.from)throw new Error("Supabase no está disponible.");
  const max=Math.min(Math.max(Math.trunc(limit)||300,1),500);
  // Explicit owner/domain/type filters on top of existing server-side RLS.
  const [t,p]=await Promise.all([
    client.from("hub_records").select(columns).eq("owner_id",id).eq("domain",domain).eq("record_type",types.tasks).order("updated_at",{ascending:false}).limit(max),
    client.from("hub_records").select(columns).eq("owner_id",id).eq("domain",domain).eq("record_type",types.projects).order("updated_at",{ascending:false}).limit(max),
  ]);
  const tasks=requireData(t),projects=requireData(p);
  return {tasks:(tasks||[]).map(mapTaskRow),projects:(projects||[]).map(mapProjectRow)};
}
export async function createWorkTask(client,uid,{title,status="Backlog",priority="Normal",project=""}={}){
  const id=owner(uid);
  const label=String(title||"").trim().slice(0,180);
  if(!label)throw new Error("El título es obligatorio.");
  if(!WORK_STATUSES.includes(status)||!WORK_PRIORITIES.includes(priority))throw new Error("Estado o prioridad no permitidos.");
  const date=new Date().toLocaleDateString("en-CA");
  const now=new Date().toISOString();
  const recordId=crypto.randomUUID();
  const payload={id:recordId,title:label,status,priority,project:String(project).trim().slice(0,120),
    dueDate:"",nextAction:"",blocker:"",aiCanDo:false,renzoMustDo:false,date,updatedAt:now};
  const row={id:recordId,owner_id:id,domain,record_type:types.tasks,title:label,status,
    occurred_at:date+"T12:00:00.000Z",payload,source:"manual",requires_review:false};
  const inserted=requireData(await client.from("hub_records").insert(row).select(columns).single());
  if(!inserted)throw new Error("No se pudo confirmar el guardado.");
  return mapTaskRow(inserted);
}
export async function updateWorkTaskStatus(client,uid,task,status){
  const id=owner(uid);
  if(!task?.id||!task._cloudUpdatedAt)throw new Error("Actualiza las tareas antes de guardar un cambio.");
  if(!WORK_STATUSES.includes(status))throw new Error("Estado desconocido.");
  const now=new Date().toISOString();
  // Preserve all legacy payload fields; change only explicit user-selected status.
  const {id:taskId,_cloudUpdatedAt,updatedAt,_local,...payload}=task;
  payload.id=taskId;
  payload.updatedAt=now;
  payload.status=status;
  const updated=requireData(await client.from("hub_records").update({status,payload})
    .eq("id",taskId).eq("owner_id",id).eq("domain",domain).eq("record_type",types.tasks)
    .eq("updated_at",_cloudUpdatedAt).select(columns).maybeSingle());
  if(!updated)throw new Error("Esta tarea cambió en otro dispositivo. Actualiza antes de guardarla.");
  return mapTaskRow(updated);
}
