// Private, deterministic Ares read-only service. No external model and no write capabilities.
const TYPES=Object.freeze(["renzo_project","renzo_task","renzo_inbox","ares_decision","ares_operation","ares_agent_run","renzo_event"]);
const DONE=new Set(["completed","done","cancelled","archived"]);
const REVIEWED=new Set(["reviewed","archived","confirmed","rejected"]);
function owner(uid){if(typeof uid!=="string"||!uid.trim())throw new Error("Sesión necesaria.");return uid;}
function asStatus(r){return String(r.payload?.status||r.status||"").trim().toLowerCase();}
function short(s,n=110){return String(s||"Sin título").slice(0,n);}
export function summarizeAresRecords(rows=[]){
  const safe=Array.isArray(rows)?rows:[];
  const projects=safe.filter(r=>r.record_type==="renzo_project"&&!DONE.has(asStatus(r)));
  const tasks=safe.filter(r=>r.record_type==="renzo_task"&&!DONE.has(asStatus(r)));
  const approvals=safe.filter(r=>(r.record_type==="ares_operation"&&r.status==="pending_approval")||
    (r.record_type==="ares_decision"&&r.status==="pending")||
    (r.record_type==="renzo_inbox"&&!REVIEWED.has(asStatus(r))));
  const agents=safe.filter(r=>r.record_type==="ares_agent_run"||(r.record_type==="renzo_event"&&r.source==="automation"));
  return {projects,tasks,approvals,agents,records:safe.length,partial:safe.length>=300};
}
export async function loadAresRecords(client,uid){
  const id=owner(uid);
  const {data,error}=await client.from("hub_records")
    .select("id,owner_id,record_type,title,status,occurred_at,payload,source,requires_review")
    .eq("owner_id",id).in("record_type",TYPES).order("occurred_at",{ascending:false}).limit(300);
  if(error)throw new Error(error.message||"No se pudieron cargar tus registros.");
  if(!Array.isArray(data))throw new Error("Datos de Ares no disponibles.");
  return summarizeAresRecords(data);
}
export function answerAresFromRecords(question,summary){
  const q=String(question||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(q.length<2)return "Escribe una pregunta sobre tus proyectos, tareas o revisiones.";
  if(/finance|finanz|nomin|salario|banco|gasto|dinero|contrase|token|clave/.test(q))
    return "Por seguridad esta vista de Ares no consulta finanzas, nóminas ni credenciales. Abre My Finance para consultar esos datos privados.";
  const extra=summary.partial?"\nSe han leído hasta 300 registros recientes; puede haber más.":"";
  if(/proyecto|project|avance|fase/.test(q))
    return "Proyectos registrados abiertos: "+summary.projects.length+"."+(
      summary.projects.length?"\n"+summary.projects.slice(0,8).map((x,i)=>String(i+1)+". "+short(x.title)+" — "+short(x.status,36)).join("\n"):
      "\nNo hay proyectos abiertos en los registros consultados."
    )+extra;
  if(/tarea|trabajo|planific|semana|agenda/.test(q))
    return "Tareas abiertas registradas: "+summary.tasks.length+"."+(
      summary.tasks.length?"\n"+summary.tasks.slice(0,8).map((x,i)=>String(i+1)+". "+short(x.title)+" — "+short(x.payload?.status||x.status,36)).join("\n"):
      "\nNo hay tareas abiertas en los registros consultados."
    )+extra;
  if(/aprob|revision|decision|solicitud|inbox/.test(q))
    return "Revisiones pendientes en los registros consultados: "+summary.approvals.length+". No se ha ejecutado ni aprobado ninguna acción desde esta conversación."+
      (summary.approvals.length?"\n"+summary.approvals.slice(0,6).map((x,i)=>String(i+1)+". "+short(x.title)+" — "+short(x.status,36)).join("\n"):"")+extra;
  if(/agente|automatiz|n8n|claude|jarvis|hermes/.test(q))
    return "Eventos de agentes almacenados: "+summary.agents.length+". Son registros históricos, no prueba de que los agentes estén conectados ahora."+extra;
  return "Según los registros privados consultados:\n"+
    "• "+summary.projects.length+" proyectos abiertos\n• "+summary.tasks.length+" tareas abiertas\n• "+
    summary.approvals.length+" revisiones pendientes\n• "+summary.agents.length+" eventos históricos de agentes."+
    extra+"\nNo he ejecutado acciones ni consultado servicios externos.";
}
