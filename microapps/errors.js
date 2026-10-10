// Registro de errores de la app (observabilidad sin n8n).
// Captura errores de JavaScript y promesas rechazadas, y los fallos que el shell le pase (p. ej. una microapp
// que no carga). Los guarda en hub_records (domain "system", record_type "app_error") en la fila del propio
// usuario, con RLS. Límite por sesión, deduplicado y sin datos sensibles: solo mensaje, origen y versión.
import { createRecords } from "./records.js";
import { esc, shortDate, emptyHTML, noticeHTML } from "./ui.js";

const MAX_PER_SESSION = 20;
// Ruido que no es un fallo de la app: extensiones del navegador, avisos del motor y Realtime sin red.
const IGNORE = [/ResizeObserver loop/i, /^Script error\.?$/i, /chrome-extension:|moz-extension:|safari-extension:/i, /realtime\/v1\/websocket/i];

export function shouldIgnore(message = "", source = "") {
  return IGNORE.some(rx => rx.test(message) || rx.test(source));
}

export function normalizeError(input, extra = {}) {
  const err = input instanceof Error ? input : null;
  const message = String(err?.message || input?.message || input || "Error desconocido").slice(0, 300);
  const stack = err?.stack ? String(err.stack).split("\n").slice(0, 6).join("\n").slice(0, 1000) : "";
  return { message, stack, ...extra };
}

export function installErrorLog(db, getUser, { win = globalThis.window, release = async () => "?" } = {}) {
  const store = createRecords(db, getUser, { domain: "system", type: "app_error" });
  const seen = new Set();
  let sent = 0, queue = [];

  async function write(item) {
    if (!getUser()?.id) { queue.push(item); queue = queue.slice(-MAX_PER_SESSION); return; }
    const version = await release().catch(() => "?");
    try {
      await store.add({
        title: item.message,
        status: "open",
        payload: { kind: item.kind || "error", source: item.source || "", line: item.line || null, stack: item.stack || "",
          section: win?.document?.body?.dataset?.activeSection || "", release: version, path: win?.location?.pathname || "" }
      });
    } catch { /* El registro de errores nunca debe provocar otro error visible. */ }
  }

  function report(input, extra = {}) {
    const item = normalizeError(input, extra);
    if (shouldIgnore(item.message, item.source)) return false;
    const key = `${item.kind || "error"}|${item.message}|${item.source || ""}`;
    if (seen.has(key) || sent >= MAX_PER_SESSION) return false;
    seen.add(key); sent++;
    write(item);
    return true;
  }

  if (win?.addEventListener) {
    win.addEventListener("error", e => report(e.error || e.message, { kind: "error", source: e.filename || "", line: e.lineno || null }));
    win.addEventListener("unhandledrejection", e => report(e.reason, { kind: "promesa" }));
  }

  async function flush() { const pending = queue; queue = []; for (const item of pending) await write(item); }

  async function renderPanel(root) {
    if (!root || !getUser()?.id) return;
    root.innerHTML = `<div class="section"><h3>Errores de la app</h3><span class="small">Solo tu cuenta · últimos 20</span></div><p class="small">Cargando…</p>`;
    let rows = [], error = "";
    try { rows = await store.list({ limit: 20, status: "open" }); } catch (e) { error = e.message; }
    root.innerHTML = `<div class="section"><h3>Errores de la app</h3><span class="small">Solo tu cuenta · últimos 20</span></div>`
      + noticeHTML(error, "error")
      + (rows.length ? `<ul class="mx-list">${rows.map(r => `<li class="card mx-item"><span class="small">${esc(shortDate(r.occurred_at))} · ${esc(r.payload?.release || "?")} · ${esc(r.payload?.section || "sin sección")}</span><h3>${esc(r.title)}</h3>${r.payload?.source ? `<p class="small">${esc(r.payload.source)}${r.payload.line ? `:${esc(r.payload.line)}` : ""}</p>` : ""}</li>`).join("")}</ul>
        <div class="mx-actions"><button class="secondary" data-errors-reviewed>Marcar como revisados</button></div>`
        : (error ? "" : emptyHTML("Sin errores registrados.")));
    root.querySelector("[data-errors-reviewed]")?.addEventListener("click", async ev => {
      ev.currentTarget.disabled = true;
      for (const r of rows) { try { await store.update(r.id, { status: "reviewed" }); } catch { /* sigue con el resto */ } }
      renderPanel(root);
    });
  }

  return { report, flush, renderPanel, get sent() { return sent; } };
}
