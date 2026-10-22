// "Exportar mis datos" (System): copia de seguridad que el propio usuario descarga, sin credenciales ni servidor.
// Lee con su sesión (RLS: solo sus filas) todas las tablas de public y sus archivos de Storage, y genera un JSON
// compatible con tools/backup/snapshot_to_sql.py (restauración NO destructiva) y tools/backup/extract_files.py.
// Supabase Free no hace copias automáticas: por eso la app recuerda la fecha de la última copia.
import { createRecords } from "../records.js";
import { esc, noticeHTML } from "../ui.js";

import {buildExport} from "./export-data.js";
export {buildExport, EXPORT_TABLES, EXPORT_BUCKETS, MAX_FILE_BYTES} from "./export-data.js";
const STALE_DAYS = 7;

export const daysSince = (iso, now = new Date()) => iso ? Math.floor((now - new Date(iso)) / 86400000) : null;

export function createDataExport(db, getUser, { release = async () => "", project = "" } = {}) {
  const log = createRecords(db, getUser, { domain: "system", type: "backup_export" });
  let busy = false, status = "", error = "", last = null, loadedFor = null;

  async function refresh() {
    const uid = getUser()?.id; if (!uid) return;
    try { const rows = await log.list({ limit: 1 }); last = rows[0] || null; loadedFor = uid; } catch (e) { error = e.message; }
  }

  function html() {
    const days = daysSince(last?.occurred_at);
    const age = last ? (days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`) : null;
    const warn = !last || days >= STALE_DAYS;
    return `<div class="section"><h3>Copia de seguridad</h3><span class="small">Solo tus datos</span></div>
      <div class="card mx-stack" data-backup>
        <p class="${warn ? "worlddanger" : "worldok"}" data-backup-age>${last ? `Última copia: ${esc(age)} (${esc(String(last.payload?.rows ?? "?"))} filas, ${esc(String(last.payload?.files ?? 0))} archivos).` : "Todavía no has hecho ninguna copia."}${warn ? " Supabase Free no guarda copias automáticas: haz una al menos cada semana." : ""}</p>
        ${noticeHTML(error, "error")}${status ? `<p class="small" role="status" data-backup-status>${esc(status)}</p>` : ""}
        <div class="mx-actions"><button class="primary" data-backup-run ${busy ? "disabled" : ""}>${busy ? "Preparando copia…" : "Exportar mis datos"}</button></div>
        <p class="small">Descarga un archivo con todas tus tablas (movimientos, nóminas, ajustes…) y tus PDF. Guárdalo fuera del móvil (iCloud Drive o Google Drive). Contiene datos personales: no lo compartas.</p>
      </div>`;
  }

  async function run(root) {
    const uid = getUser()?.id; if (!uid || busy) return;
    busy = true; error = ""; status = "Empezando…"; paint(root);
    try {
      const data = await buildExport(db, uid, { release: await release(), project, onProgress: s => { status = s; paint(root); } });
      const rows = Object.values(data.counts).reduce((a, b) => a + b, 0) - data.counts.files;
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `rise-hub-copia-${data.taken_at.slice(0, 10)}.json`; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      await log.add({ title: `Copia ${data.taken_at.slice(0, 10)}`, payload: { rows, files: data.counts.files, bytes: blob.size, errors: data.errors.length } });
      await refresh();
      status = `Copia descargada: ${rows} filas y ${data.counts.files} archivos (${(blob.size / 1048576).toFixed(1)} MB).${data.errors.length ? ` Avisos: ${data.errors.slice(0, 3).join(" · ")}` : ""}`;
    } catch (e) { error = e.message || "No se pudo hacer la copia."; status = ""; }
    busy = false; paint(root);
  }

  let wired = new WeakSet();
  const paint = root => { if (root) root.innerHTML = html(); };
  async function renderPanel(root) {
    if (!root || !getUser()?.id) return;
    if (!wired.has(root)) { wired.add(root); root.addEventListener("click", e => { if (e.target.closest("[data-backup-run]")) run(root); }); }
    if (loadedFor !== getUser()?.id) { last = null; paint(root); await refresh(); }
    paint(root);
  }
  return { renderPanel, run, refresh, get last() { return last; } };
}
