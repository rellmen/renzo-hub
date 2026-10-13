// Ares Center · operaciones privadas de RISE HUB.
// Fuente: hub_records con sesión de Supabase, RLS por propietario. Sin tokens en el cliente.
// Work sigue siendo la fuente canónica de renzo_project, renzo_task y renzo_inbox.
export function summarizeRecords(records) {
  const rows = Array.isArray(records) ? records : [];
  return {
    total: rows.length,
    work: rows.filter(r => r.domain === "work").length,
    events: rows.filter(r => r.domain === "system").length,
    pending: rows.filter(r => r.requires_review === true).length,
    lastActivity: rows.length ? rows.map(r => r.occurred_at).filter(Boolean).sort().at(-1) || null : null
  };
}
export const ARES_TYPES = Object.freeze(["renzo_project","renzo_task","renzo_inbox","renzo_event","ares_decision","ares_agent_run"]);
export const isInboxPending = r => Boolean(r && r.record_type === "renzo_inbox" &&
  !["reviewed","archived","confirmed","rejected"].includes(String(r.payload?.status || r.status || "needs_review").toLowerCase()));
export const isTaskOpen = r => Boolean(r && r.record_type === "renzo_task" &&
  !["completed","done","cancelled","archived"].includes(String(r.payload?.status || r.status || "").toLowerCase()));
export const isDecisionPending = r => Boolean(r && r.record_type === "ares_decision" && r.status === "pending");
export const isAgentEvent = r => Boolean(r && (r.record_type === "ares_agent_run" ||
  (r.record_type === "renzo_event" && (r.source === "automation" || ["jarvis","hermes","claude","n8n"].includes(String(r.payload?.source || "").toLowerCase())))));
const $el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = String(text);
  return n;
};
const trim = (s,n=180) => String(s || "").trim().slice(0,n);
const shortDate = s => {
  if (!s) return "Sin fecha";
  const d = new Date(s);
  return Number.isNaN(d.valueOf()) ? "Sin fecha" : d.toLocaleString("es-ES",{dateStyle:"medium",timeStyle:"short"});
};
const day = () => new Date().toLocaleDateString("en-CA");
const sourceLabel = r => r.record_type === "ares_agent_run" ? "Registro manual" : "Evento guardado en RISE HUB";
const rowStatus = r => String(r.payload?.status || r.status || "Sin estado");
const kindOf = r => r.record_type === "renzo_project" ? "proyecto" : r.record_type === "renzo_task" ? "tarea" : "registro";

async function deploymentInfo() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),7000);
  try {
    const response = await fetch("/api/deployment-info",{cache:"no-store",signal:controller.signal});
    if (!response.ok) throw new Error("No accesible");
    const json = await response.json();
    return {project:json.project || "Sin identificar",environment:json.environment || "desconocido",branch:json.branch || "sin datos",commit:json.commit || null};
  } finally { clearTimeout(timeout); }
}
export function mountAresCenter(root, supabase, getUser) {
  if (!root) return {load:async()=>{},open:async()=>{},reset:()=>{}};
  let rows = [], activeTab = "overview", serial = 0, loading = false, lastOwner = null, loaded = false;
  root.innerHTML = [
    '<button class="microapp-back" type="button" data-open="home">← Home</button>',
    '<div class="cc-header"><div><p class="cc-overline">RISE HUB / OPERATIONS</p><h1>Ares Center</h1><p class="cc-lead">Proyectos, agentes, decisiones y actividad de tu Hub. Información comprobable.</p></div><button class="cc-refresh" type="button" data-ares-refresh>↻ Actualizar</button></div>',
    '<p class="cc-banner" data-ares-status role="status" aria-live="polite">Inicia sesión para consultar Ares.</p>',
    '<nav class="ares-tabs" aria-label="Apartados de Ares Center">',
    '<button type="button" data-ares-tab="overview" aria-selected="true">Resumen</button>',
    '<button type="button" data-ares-tab="projects" aria-selected="false">Project Tracker</button>',
    '<button type="button" data-ares-tab="agents" aria-selected="false">Agent Monitor</button>',
    '<button type="button" data-ares-tab="inbox" aria-selected="false">AI Inbox</button>',
    '</nav>',
    '<section data-ares-page="overview" class="ares-page"><div class="cc-grid" aria-label="Actividad real">',
      '<article class="cc-metric"><small>Proyectos</small><strong data-metric="projects">—</strong><span>Registrados en Work</span></article>',
      '<article class="cc-metric"><small>Tareas abiertas</small><strong data-metric="tasks">—</strong><span>Pendientes en Work</span></article>',
      '<article class="cc-metric"><small>Inbox pendiente</small><strong data-metric="inbox">—</strong><span>Revisión humana requerida</span></article>',
      '<article class="cc-metric"><small>Eventos de agentes</small><strong data-metric="agents">—</strong><span>Solo actividad registrada</span></article>',
    '</div><div class="cc-columns">',
      '<section class="cc-panel"><div class="cc-panel-head"><h2>Servicios del Hub</h2><span>Consultas reales</span></div><div class="cc-service"><b>Despliegue</b><span data-service="deploy">Sin comprobar</span></div><div class="cc-service"><b>Base de datos</b><span data-service="database">Sin comprobar</span></div><div class="cc-service"><b>Commit del despliegue</b><span data-service="commit">Sin comprobar</span></div><p class="cc-detail" data-service="branch">Rama sin comprobar</p></section>',
      '<section class="cc-panel"><div class="cc-panel-head"><h2>Acceso rápido</h2><span>Microapps existentes</span></div><div class="ares-links"><button type="button" data-open="work">Work · proyectos y revisiones ↗</button><button type="button" data-open="money">My Finance ↗</button><button type="button" data-open="study">Study ↗</button><button type="button" data-open="system">System ↗</button></div></section>',
    '</div><section class="cc-panel cc-activity"><div class="cc-panel-head"><h2>Actividad reciente</h2><span>Registros disponibles</span></div><ol data-ares-list="activity" class="cc-feed"></ol></section></section>',
    '<section data-ares-page="projects" class="ares-page" hidden>',
      '<div class="cc-panel"><div class="cc-panel-head"><h2>Project Tracker</h2><span>Sincronizado con Work</span></div>',
      '<p class="cc-detail">Los proyectos y tareas se guardan en los mismos registros que usa Work. Los slots principales se gestionan allí.</p>',
      '<form data-ares-form="project" class="ares-form"><label>Nuevo proyecto<input name="title" required minlength="2" maxlength="120" placeholder="Nombre del proyecto"></label><label>Entregable<input name="output" maxlength="180" placeholder="Resultado observable"></label><button type="submit" class="cc-refresh">Añadir al backlog</button></form>',
      '<div class="ares-list" data-ares-list="projects"></div></div>',
      '<div class="cc-panel"><div class="cc-panel-head"><h2>Tareas del Hub</h2><span>Work · tareas</span></div>',
      '<form data-ares-form="task" class="ares-form"><label>Nueva tarea<input name="title" required minlength="2" maxlength="180" placeholder="Qué hay que hacer"></label><label>Proyecto<input name="project" maxlength="120" placeholder="Proyecto relacionado"></label><label>Prioridad<select name="priority"><option>Normal</option><option>High</option><option>Strategic</option></select></label><button type="submit" class="cc-refresh">Guardar tarea</button></form>',
      '<div class="ares-list" data-ares-list="tasks"></div></div></section>',
    '<section data-ares-page="agents" class="ares-page" hidden>',
      '<div class="cc-panel"><div class="cc-panel-head"><h2>Agent Monitor</h2><span>Estados basados en evidencia</span></div>',
      '<div class="ares-agents"><div><b>Claude</b><small>Sin conexión directa de ejecución</small></div><div><b>Hermes</b><small>Sin conexión directa de ejecución</small></div><div><b>Jarvis / n8n</b><small>Solo eventos realmente recibidos por Hub</small></div></div>',
      '<p class="cc-detail">Ares no puede ejecutar ni vigilar en tiempo real a Claude o Hermes hasta configurar conectores autorizados. Nunca se muestran ejecuciones inventadas.</p>',
      '<form data-ares-form="agent" class="ares-form"><label>Registrar trabajo de un agente<select name="agent"><option>Claude</option><option>Hermes</option><option>Jarvis</option><option>Otro agente</option></select></label><label>Resultado<select name="status"><option value="completed">Completado</option><option value="failed">Error</option><option value="blocked">Bloqueado</option><option value="running">En curso (declarado)</option></select></label><label>Trabajo realizado<input name="title" required minlength="2" maxlength="180" placeholder="Qué sucedió"></label><button type="submit" class="cc-refresh">Registrar evento manual</button></form>',
      '<div class="ares-list" data-ares-list="agents"></div></div></section>',
    '<section data-ares-page="inbox" class="ares-page" hidden>',
      '<div class="cc-panel"><div class="cc-panel-head"><h2>AI Inbox</h2><span>Decisiones y revisiones</span></div>',
      '<p class="cc-detail">Las capturas y documentos de Jarvis siguen revisándose en Work. Ares no aprueba gastos ni nóminas automáticamente.</p>',
      '<form data-ares-form="decision" class="ares-form"><label>Nueva decisión<input name="title" required minlength="2" maxlength="180" placeholder="Qué necesitas decidir"></label><label>Contexto<input name="details" maxlength="600" placeholder="Por qué requiere aprobación"></label><button type="submit" class="cc-refresh">Añadir a revisiones</button></form>',
      '<div class="ares-list" data-ares-list="inbox"></div></div></section>',
    '<p class="cc-footer">Privado · Datos de tu sesión · RLS por usuario · Las aprobaciones en Ares registran decisiones, no ejecutan acciones externas.</p>'
  ].join("");
  const one = s => root.querySelector(s);
  const all = s => [...root.querySelectorAll(s)];
  const status = s => {one("[data-ares-status]").textContent=s;};
  function showTab(name) {
    if (!["overview","projects","agents","inbox"].includes(name)) return;
    activeTab=name;
    all("[data-ares-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.aresTab===name)));
    all("[data-ares-page]").forEach(p=>p.hidden=p.dataset.aresPage!==name);
  }
  const type = name => rows.filter(r=>r.record_type===name);
  const appendEmpty = (node,message) => node.append($el("p","ares-empty",message));
  function record(title,subtext,detail) {
    const node=$el("article","ares-item");
    node.append($el("b","",title || "Sin título"),$el("small","",subtext));
    if (detail) node.append($el("p","",detail));
    return node;
  }
  const newButton=(text,action,id) => {
    const b=$el("button","ares-action",text);b.type="button";b.dataset.aresAction=action;if(id)b.dataset.aresId=id;return b;
  };
  const addButtons=(item,...buttons)=>{const box=$el("div","ares-buttons");box.append(...buttons);item.append(box);};
  const setMetric=(key,value)=>{one('[data-metric="'+key+'"]').textContent=String(value);};
  function render() {
    if (!loaded)return;
    const projects=type("renzo_project"),tasks=type("renzo_task"),inbox=type("renzo_inbox").filter(isInboxPending),
      decisions=type("ares_decision").filter(isDecisionPending),agents=rows.filter(isAgentEvent);
    setMetric("projects",projects.filter(r=>rowStatus(r).toLowerCase()!=="completed").length);
    setMetric("tasks",tasks.filter(isTaskOpen).length);
    setMetric("inbox",inbox.length+decisions.length);
    setMetric("agents",agents.length);
    const activity=one('[data-ares-list="activity"]');activity.replaceChildren();
    const recent=rows.slice(0,12);
    if (!recent.length)appendEmpty(activity,"Sin actividad registrada en este conjunto.");
    for (const r of recent) {
      const li=$el("li","cc-feed-item");li.append($el("strong","",r.title||r.record_type),$el("span","",r.domain+" · "+shortDate(r.occurred_at)));activity.append(li);
    }
    const projectList=one('[data-ares-list="projects"]');projectList.replaceChildren();
    if (!projects.length)appendEmpty(projectList,"Sin proyectos registrados. Crea uno o abre Work.");
    for (const r of projects) {
      const p=r.payload||{},related=tasks.filter(t=>String(t.payload?.project||"").toLowerCase()===String(r.title||p.title||"").toLowerCase()),openTasks=related.filter(isTaskOpen).length;
      const item=record(r.title||p.title,"Estado: "+rowStatus(r)+" · "+(p.slot||"Backlog")+(related.length?" · "+(related.length-openTasks)+"/"+related.length+" tareas completas":""),p.output||"Sin entregable definido");
      addButtons(item,newButton("Abrir en Work","go-work"));projectList.append(item);
    }
    const taskList=one('[data-ares-list="tasks"]');taskList.replaceChildren();
    if (!tasks.length)appendEmpty(taskList,"Sin tareas. Puedes añadir una desde Ares o Work.");
    for (const r of tasks) {
      const p=r.payload||{},item=record(r.title||p.title,rowStatus(r)+" · "+(p.priority||"Normal")+(p.project?" · "+p.project:""),p.nextAction||p.blocker||"");
      if (isTaskOpen(r)) addButtons(item,newButton("Completada","complete-task",r.id),newButton("Abrir en Work","go-work"));
      taskList.append(item);
    }
    const agentList=one('[data-ares-list="agents"]');agentList.replaceChildren();
    if (!agents.length)appendEmpty(agentList,"No hay ejecuciones registradas. El estado en vivo no está conectado.");
    for (const r of agents) {
      const p=r.payload||{},item=record(r.title||"Evento",shortDate(r.occurred_at)+" · "+sourceLabel(r)+(p.agent?" · "+p.agent:""),r.status||"");
      agentList.append(item);
    }
    const inboxList=one('[data-ares-list="inbox"]');inboxList.replaceChildren();
    if (!inbox.length&&!decisions.length)appendEmpty(inboxList,"Sin revisiones pendientes en el conjunto consultado.");
    for (const r of inbox) {
      const p=r.payload||{},item=record(r.title||p.title,"Work · "+rowStatus(r)+" · "+shortDate(r.occurred_at),p.note||p.category||"");
      addButtons(item,newButton("Revisar en Work","go-work"));
      inboxList.append(item);
    }
    for (const r of decisions) {
      const item=record(r.title,"Decisión de Ares · "+shortDate(r.occurred_at),r.payload?.details||"");
      addButtons(item,newButton("Aprobar decisión","approve-decision",r.id),newButton("Rechazar","reject-decision",r.id));
      inboxList.append(item);
    }
  }
  function reset() {
    serial++;lastOwner=null;loaded=false;loading=false;rows=[];showTab("overview");
    all("[data-metric]").forEach(x=>x.textContent="—");
    all("[data-ares-list]").forEach(x=>x.replaceChildren());
    one('[data-service="deploy"]').textContent="Sin comprobar";
    one('[data-service="database"]').textContent="Sin comprobar";
    one('[data-service="branch"]').textContent="Rama sin comprobar";
    one('[data-service="commit"]').textContent="Sin comprobar";
    one("[data-ares-refresh]").disabled=false;
    status("Inicia sesión para consultar Ares.");
  }
  async function load() {
    const user=getUser();if (!user?.id){reset();return;}
    const mySerial=++serial;lastOwner=user.id;loading=true;one("[data-ares-refresh]").disabled=true;
    status("Consultando registros privados y despliegue…");
    const [recordsResult,infoResult]=await Promise.allSettled([
      supabase.from("hub_records").select("id,domain,record_type,title,status,occurred_at,payload,source,requires_review,updated_at")
        .eq("owner_id",user.id).in("record_type",ARES_TYPES).order("occurred_at",{ascending:false}).limit(450),
      deploymentInfo()
    ]);
    if (serial!==mySerial||getUser()?.id!==user.id)return;
    loading=false;one("[data-ares-refresh]").disabled=false;
    if(infoResult.status==="fulfilled") {
      const info=infoResult.value;
      one('[data-service="deploy"]').textContent=info.project+" · "+info.environment;
      one('[data-service="branch"]').textContent="Rama: "+info.branch;
      one('[data-service="commit"]').textContent=info.commit?info.commit.slice(0,10):"No facilitado por Vercel";
    } else {one('[data-service="deploy"]').textContent="No verificable";one('[data-service="branch"]').textContent="Rama sin verificar";one('[data-service="commit"]').textContent="Sin verificar";}
    if(recordsResult.status==="fulfilled"&&!recordsResult.value.error) {
      rows=recordsResult.value.data||[];loaded=true;render();
      one('[data-service="database"]').textContent="Consulta autenticada correcta";
      status(rows.length===450?"Vista parcial: 450 registros recientes.":"Datos de tu sesión actualizados · "+shortDate(new Date()));
    } else {
      rows=[];loaded=false;all("[data-metric]").forEach(x=>x.textContent="—");
      one('[data-service="database"]').textContent="Sin acceso o error de consulta";
      status("No se han podido consultar los datos. Revisa permisos y conexión.");
    }
  }
  async function write(data) {
    const user=getUser();
    if(!user?.id||user.id!==lastOwner)throw new Error("Inicia sesión para guardar.");
    const payload={...data,owner_id:user.id,source:"manual"};
    const {data:result,error}=await supabase.from("hub_records").insert(payload).select("id").single();
    if(error)throw new Error(error.message||"No se pudo guardar.");
    return result;
  }
  async function change(id,action) {
    if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("Registro inválido");
    const user=getUser(),row=rows.find(r=>r.id===id);
    if(!user?.id||user.id!==lastOwner||!row)throw new Error("Registro no disponible.");
    let fields;
    if(action==="complete-task"&&row.record_type==="renzo_task"&&isTaskOpen(row)) {
      fields={status:"Completed",payload:{...(row.payload||{}),status:"Completed",updatedAt:new Date().toISOString()}};
    } else if(["approve-decision","reject-decision"].includes(action)&&isDecisionPending(row)) {
      fields={status:action==="approve-decision"?"approved":"rejected",requires_review:false,payload:{...(row.payload||{}),decidedAt:new Date().toISOString(),decisionBy:"owner"}};
    } else throw new Error("Esta acción no está permitida.");
    const {data,error}=await supabase.from("hub_records").update(fields).eq("owner_id",user.id).eq("id",id)
      .eq("record_type",row.record_type).select("id");
    if(error)throw new Error(error.message||"No se pudo actualizar.");
    if(!data?.length)throw new Error("No se pudo confirmar la actualización.");
    if(row.record_type==="renzo_task")document.dispatchEvent(new CustomEvent("ares:records-changed"));
  }
  root.addEventListener("click",event=>{
    const tab=event.target.closest("[data-ares-tab]");
    if(tab&&root.contains(tab)){showTab(tab.dataset.aresTab);return;}
    if(event.target.closest("[data-ares-refresh]")){void load();return;}
    const btn=event.target.closest("[data-ares-action]");
    if(!btn||!root.contains(btn))return;
    if(btn.dataset.aresAction==="go-work"){document.querySelector('[data-open="work"]')?.click();return;}
    btn.disabled=true;status("Guardando cambio…");
    void change(btn.dataset.aresId,btn.dataset.aresAction).then(load).catch(e=>status("Error: "+e.message)).finally(()=>{btn.disabled=false;});
  });
  for(const form of all("[data-ares-form]")) {
    form.addEventListener("submit",event=>{
      event.preventDefault();
      if(loading)return;
      const u=getUser();if(!u?.id||u.id!==lastOwner){status("Debes iniciar sesión.");return;}
      const values=Object.fromEntries(new FormData(form)),title=trim(values.title);
      if(title.length<2){status("Escribe un título de al menos dos caracteres.");return;}
      const date=day(),now=new Date().toISOString();
      let data;
      if(form.dataset.aresForm==="project")data={domain:"work",record_type:"renzo_project",title,status:"backlog",occurred_at:now,payload:{id:crypto.randomUUID(),title,area:"RISE HUB",output:trim(values.output),status:"backlog",slot:"",date}};
      if(form.dataset.aresForm==="task")data={domain:"work",record_type:"renzo_task",title,status:"Backlog",occurred_at:now,payload:{id:crypto.randomUUID(),title,status:"Backlog",priority:["High","Strategic"].includes(values.priority)?values.priority:"Normal",dueDate:"",project:trim(values.project,120),nextAction:"",blocker:"",aiCanDo:false,renzoMustDo:false,date}};
      if(form.dataset.aresForm==="decision")data={domain:"system",record_type:"ares_decision",title,status:"pending",occurred_at:now,requires_review:true,payload:{details:trim(values.details,600),requestedAt:now}};
      if(form.dataset.aresForm==="agent")data={domain:"system",record_type:"ares_agent_run",title,status:["completed","failed","blocked","running"].includes(values.status)?values.status:"blocked",occurred_at:now,payload:{agent:trim(values.agent,40),recordedManually:true}};
      if(!data)return;
      const button=form.querySelector('[type="submit"]');button.disabled=true;
      status("Guardando en Supabase…");
      void write(data).then(async()=>{form.reset();if(["project","task"].includes(form.dataset.aresForm))document.dispatchEvent(new CustomEvent("ares:records-changed"));await load();})
        .catch(e=>status("No se pudo guardar: "+e.message)).finally(()=>{button.disabled=false;});
    });
  }
  showTab(activeTab);
  return {load,open:load,close:()=>{},reset};
}
