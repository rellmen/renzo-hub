const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function mountJarvis(supabase, getUser, carRoot = document.getElementById("worldCar")) {
  const root = document.getElementById("worldSystem");
  if (!root) return;
  let observer;

  async function show() {
    if (!getUser() || !root.children.length || root.querySelector("[data-jarvis-mounted]")) return;
    root.insertAdjacentHTML("beforeend", `<div data-jarvis-mounted class="card" style="margin-top:16px"><div class="section"><h3>Jarvis · n8n</h3><span class="worldbadge">Conexión bidireccional</span></div><p class="small" data-jarvis-status>Comprobando configuración…</p><p class="small">Hub → Jarvis solo envía la entrada que elijas aquí. Jarvis → Hub nunca escribe directo en My Finance: cada gasto o nómina importada queda en AI Inbox hasta que la revises y la apruebes. Un evento financiero debe incluir importes en EUR, fecha, confianza y el identificador estable del mensaje de Telegram. No se adjuntan archivos a My Finance.</p><form data-jarvis-form class="worldform"><label>Tipo<select name="type"><option value="task">Task</option><option value="note">Note</option><option value="idea">Idea</option><option value="project">Project</option><option value="study">Study</option></select></label><label>Título<input name="title" required maxlength="180"></label><label>Nota opcional<textarea name="note" rows="2" maxlength="1200"></textarea></label><button class="secondary">Enviar esta entrada a Jarvis</button><p class="small" role="status"></p></form><details><summary>Configuración técnica</summary><p class="small">Hub → Jarvis usa el webhook de n8n configurado en Vercel. Jarvis → Hub envía un POST a <code>/api/jarvis</code>; las entradas quedan en AI Inbox como needs_review.</p><p class="small">Vercel necesita <code>JARVIS_WEBHOOK_URL</code>, <code>JARVIS_OUTBOUND_TOKEN</code>, <code>JARVIS_INBOUND_TOKEN</code>, <code>SUPABASE_SECRET_KEY</code> (o la legacy <code>SUPABASE_SERVICE_ROLE_KEY</code>) y <code>JARVIS_OWNER_ID</code>. UUID de esta cuenta:</p><code>${esc(getUser().id)}</code><p class="small">Guarda tokens solo en Vercel y n8n; no los pegues en esta página.</p></details></div>`);
    const panel = root.querySelector("[data-jarvis-mounted]");
    const label = panel.querySelector("[data-jarvis-status]");
    try {
      const response = await fetch("/api/jarvis", { cache: "no-store" });
      const config = response.ok ? await response.json() : {};
      label.textContent = config.outboundConfigured && config.inboundConfigured
        ? "Ambos webhooks configurados. Prueba un envío manual; las entradas de n8n requieren revisión."
        : config.outboundConfigured ? "Hub → Jarvis configurado; falta Jarvis → Hub."
        : config.inboundConfigured ? "Jarvis → Hub configurado; falta Hub → Jarvis."
        : "Faltan los secretos de conexión en Vercel.";
    } catch {
      label.textContent = "No se pudo comprobar el estado de los webhooks.";
    }
    const form = panel.querySelector("form");
    form.onsubmit = async event => {
      event.preventDefault();
      const button = form.querySelector("button");
      const result = form.querySelector('[role="status"]');
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      if (!token) { result.textContent = "Inicia sesión otra vez para continuar."; return; }
      const values = Object.fromEntries(new FormData(form));
      button.disabled = true;
      result.textContent = "Enviando a Jarvis…";
      try {
        const response = await fetch("/api/jarvis", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: values.type, title: values.title, note: values.note, date: new Date().toISOString().slice(0, 10) })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(response.status === 503 ? "Webhook de salida aún no configurado en Vercel." : data.error || "No se pudo enviar.");
        result.textContent = "Jarvis recibió la entrada.";
        form.reset();
      } catch (error) {
        result.textContent = error.message || "No se pudo contactar Jarvis.";
      } finally {
        button.disabled = false;
      }
    };
  }

  async function showCar() {
    if (!getUser() || !carRoot?.children.length || carRoot.querySelector("[data-car-jarvis]")) return;
    carRoot.insertAdjacentHTML("beforeend", `<div data-car-jarvis class="card" style="margin-top:12px"><div class="section"><h3>⛽ Nuevo gasto del coche</h3><span class="worldbadge">Enviado a Jarvis</span></div><p class="small" data-car-jarvis-status>Comprobando conexión…</p><form data-car-jarvis-form class="car-form"><label>Concepto<input name="title" required maxlength="180" placeholder="Combustible, parking, mantenimiento…"></label><label>Importe (€)<input name="amount" type="number" inputmode="decimal" min="0.01" max="100000" step="0.01" required placeholder="0,00"></label><label>Fecha<input name="date" type="date" required></label><label>Detalle opcional<textarea name="note" rows="2" maxlength="1000" placeholder="Proveedor o nota para Jarvis"></textarea></label><button class="primary" data-car-send disabled>Enviar a Jarvis →</button><p class="small" role="status"></p></form><p class="small">Jarvis clasifica el gasto; si la conexión está activa y los datos son claros aparecerá automáticamente en Car y My Finance. Si no, quedará pendiente en AI Inbox.</p></div>`);
    const panel = carRoot.querySelector("[data-car-jarvis]");
    const label = panel.querySelector("[data-car-jarvis-status]");
    const form = panel.querySelector("form");
    const button = form.querySelector("[data-car-send]");
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    let configured = false;
    try {
      const response = await fetch("/api/jarvis", { cache: "no-store" });
      const config = response.ok ? await response.json() : {};
      configured = Boolean(config.outboundConfigured);
      label.textContent = configured ? "Hub → Jarvis está configurado. Cada envío requerirá revisión en AI Inbox." : "La conexión de salida de Jarvis aún no está configurada en Vercel.";
    } catch {
      label.textContent = "No se pudo comprobar la conexión de Jarvis.";
    }
    button.disabled = !configured;
    form.onsubmit = async event => {
      event.preventDefault();
      const result = form.querySelector('[role="status"]');
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      if (!token) { result.textContent = "Inicia sesión otra vez para continuar."; return; }
      const values = Object.fromEntries(new FormData(form));
      button.disabled = true;
      result.textContent = "Enviando a Jarvis…";
      try {
        const response = await fetch("/api/jarvis", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ type: "expense", expenseCategory: "car", title: values.title, amount: Number(values.amount), currency: "EUR", date: values.date, note: values.note }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(response.status === 503 ? "La conexión de salida de Jarvis aún no está configurada." : data.error || "No se pudo enviar el gasto.");
        result.textContent = "Jarvis recibió el gasto. Revisa la entrada cuando aparezca en AI Inbox.";
        form.reset();
        form.elements.date.value = new Date().toISOString().slice(0, 10);
      } catch (error) {
        result.textContent = error.message || "No se pudo contactar Jarvis.";
      } finally {
        button.disabled = !configured;
      }
    };
  }

  observer = new MutationObserver(() => { void show(); void showCar(); });
  observer.observe(root, { childList: true });
  if (carRoot) new MutationObserver(() => { void showCar(); }).observe(carRoot, { childList: true });
  void show();
  void showCar();
  return () => observer.disconnect();
}
