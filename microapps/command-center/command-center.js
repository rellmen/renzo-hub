// RISE HUB Command Center · read-only staging preview.
// All user records are requested with the signed-in Supabase session and protected by RLS.
const dateLabel = value => {
  if (!value) return "Sin fecha";
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? "Sin fecha" : time.toLocaleString("es-ES", {dateStyle:"medium",timeStyle:"short"});
};

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

const create = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = String(value);
  return node;
};

async function deploymentInfo() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7500);
  try {
    const response = await fetch("/api/deployment-info", {cache:"no-store",signal:controller.signal});
    if (!response.ok) throw new Error("Servicio no disponible");
    const data = await response.json();
    return {ok:true,project:data.project || "Sin identificar",environment:data.environment || "unknown",branch:data.branch || null};
  } finally {
    clearTimeout(timer);
  }
}

export function mountCommandCenter(root, supabase, currentUser) {
  if (!root) return {load:async()=>{},reset:()=>{}};
  let revision = 0;
  root.innerHTML = [
    '<button class="microapp-back" type="button" data-open="home">← Home</button>',
    '<div class="cc-header"><div><p class="cc-overline">RISE HUB / CONTROL TOWER</p><h1>Command Center</h1><p class="cc-lead">Tu actividad, tus servicios y tus próximos pasos. Sin automatizaciones no autorizadas.</p></div><button class="cc-refresh" id="ccRefresh" type="button">↻ Actualizar</button></div>',
    '<div class="cc-banner" role="status" id="ccMessage" aria-live="polite">Sin cargar</div>',
    '<div class="cc-grid" aria-label="Resumen">',
      '<article class="cc-metric"><small>Registros consultados</small><strong id="ccTotal">—</strong><span>Actividad de Work y System</span></article>',
      '<article class="cc-metric"><small>Work</small><strong id="ccWork">—</strong><span>Registros del área de trabajo</span></article>',
      '<article class="cc-metric"><small>System</small><strong id="ccEvents">—</strong><span>Registros del sistema</span></article>',
      '<article class="cc-metric"><small>Requieren revisión</small><strong id="ccPending">—</strong><span>En el conjunto consultado</span></article>',
    '</div>',
    '<div class="cc-columns">',
      '<section class="cc-panel"><div class="cc-panel-head"><h2>Servicios</h2><span>Comprobación de lectura</span></div><div class="cc-service"><b>Despliegue actual</b><span id="ccDeploy">Sin comprobar</span></div><div class="cc-service"><b>Supabase · datos privados</b><span id="ccDatabase">Sin comprobar</span></div><p id="ccBranch" class="cc-detail">Rama: sin comprobar</p></section>',
      '<section class="cc-panel"><div class="cc-panel-head"><h2>Agentes</h2><span>Acciones deshabilitadas</span></div><div class="cc-service"><b>Claude</b><span>Sin integración de estado</span></div><div class="cc-service"><b>Hermes</b><span>Sin integración de estado</span></div><div class="cc-service"><b>GitHub</b><span>Sin conector de lectura</span></div><p class="cc-detail">Los agentes no se ejecutan desde este panel. Sus estados no se simulan.</p></section>',
    '</div>',
    '<section class="cc-panel cc-activity"><div class="cc-panel-head"><h2>Actividad reciente</h2><span id="ccUpdated">Sin actualizar</span></div><ol id="ccActivity" class="cc-feed"><li>Abre el panel para consultar datos.</li></ol></section>',
    '<p class="cc-footer">Privado · Solo lectura · Datos del usuario autenticado · Sin claves en el navegador</p>'
  ].join("");

  const el = id => root.querySelector("#" + id);
  const message = text => {el("ccMessage").textContent = text;};
  function reset() {
    revision++;
    ["ccTotal","ccWork","ccEvents","ccPending"].forEach(id => {el(id).textContent = "—";});
    el("ccRefresh").disabled = false;
    el("ccDeploy").textContent = "Sin comprobar";
    el("ccDatabase").textContent = "Sin comprobar";
    el("ccBranch").textContent = "Rama: sin comprobar";
    el("ccUpdated").textContent = "Sin actualizar";
    el("ccActivity").replaceChildren(create("li","", "Inicia sesión para consultar los datos."));
    message("Sin sesión activa.");
  }

  async function load() {
    const user = currentUser();
    const thisRevision = ++revision;
    if (!user?.id) { reset(); return; }
    el("ccRefresh").disabled = true;
    message("Consultando servicios y registros…");
    const tasks = await Promise.allSettled([
      deploymentInfo(),
      supabase.from("hub_records")
        .select("id,domain,record_type,title,status,occurred_at,source,requires_review")
        .eq("owner_id",user.id)
        .in("domain",["work","system"])
        .order("occurred_at",{ascending:false})
        .limit(75)
    ]);
    if (thisRevision !== revision || currentUser()?.id !== user.id) return;
    el("ccRefresh").disabled = false;

    const [deploy, activity] = tasks;
    if (deploy.status === "fulfilled" && deploy.value.ok) {
      const info = deploy.value;
      el("ccDeploy").textContent = info.project + " · " + info.environment + " · API disponible";
      el("ccBranch").textContent = "Rama: " + (info.branch || "sin datos");
    } else {
      el("ccDeploy").textContent = "No se pudo verificar";
      el("ccBranch").textContent = "Rama: sin datos";
    }

    if (activity.status === "fulfilled" && !activity.value.error) {
      const rows = activity.value.data || [];
      const summary = summarizeRecords(rows);
      el("ccTotal").textContent = summary.total;
      el("ccWork").textContent = summary.work;
      el("ccEvents").textContent = summary.events;
      el("ccPending").textContent = summary.pending;
      el("ccDatabase").textContent = "Consulta autenticada correcta";
      el("ccUpdated").textContent = "Consultado: " + dateLabel(new Date().toISOString());
      const list = el("ccActivity");
      list.replaceChildren();
      if (!rows.length) list.append(create("li","","Sin actividad registrada."));
      for (const record of rows.slice(0,12)) {
        const item = create("li","cc-feed-item");
        const label = create("strong","",record.title || record.record_type || "Registro");
        const detail = create("span","",record.domain + " · " + dateLabel(record.occurred_at) + (record.requires_review ? " · Revisión pendiente" : ""));
        item.append(label,detail);
        list.append(item);
      }
      message(summary.total === 75 ? "Datos obtenidos. Vista limitada a los 75 registros más recientes." : "Lectura completada. Los estados reflejan solamente los datos accesibles.");
    } else {
      el("ccDatabase").textContent = "Error de consulta o permisos";
      ["ccTotal","ccWork","ccEvents","ccPending"].forEach(id => {el(id).textContent = "—";});
      el("ccActivity").replaceChildren(create("li","", "No se pudo recuperar la actividad."));
      message("Consulta parcial: comprueba conexión y permisos.");
    }
  }
  el("ccRefresh").addEventListener("click",load);
  return {load,open:load,close:()=>{},reset};
}
