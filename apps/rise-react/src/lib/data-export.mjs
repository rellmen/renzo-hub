// Mirror of microapps/backup/export-data.js; verified by tests.
// Tabla → columna del dueño. Si se crea una tabla nueva con datos del usuario, añádela aquí (hay un test que lo exige).
export const EXPORT_TABLES = Object.freeze({
  profiles: "user_id", user_settings: "user_id", system_preferences: "user_id", system_records: "user_id",
  hub_user_state: "owner_id", hub_records: "owner_id", payroll_balance_imports: "owner_id",
  skin_notes: "user_id", skin_routine_logs: "user_id", gym_plans: "user_id", gym_sessions: "user_id", news_briefs: "user_id",
  payroll_employers: "user_id", payroll_documents: "user_id", payroll_payslips: "user_id", payroll_payslip_versions: "user_id",
  payroll_line_items: "user_id", payroll_validations: "user_id", payroll_anomalies: "user_id", payroll_corrections: "user_id", payroll_events: "user_id"
});
export const EXPORT_BUCKETS = Object.freeze(["payroll", "hub-private", "portfolio-files", "progress-photos"]);
export const MAX_FILE_BYTES = 60 * 1024 * 1024; // límite total de archivos dentro del JSON
const PAGE = 1000;

const toBase64 = async blob => {
  const bytes = new Uint8Array(await blob.arrayBuffer()); let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

export async function buildExport(db, uid, { release = "", project = "", onProgress = () => {}, now = () => new Date() } = {}) {
  if (typeof uid !== "string" || !uid.trim()) throw new Error("Inicia sesión antes de exportar.");
  const out = { format: "renzo-hub-export", version: 1, taken_at: now().toISOString(), project: project || String(db.supabaseUrl || ""), release, user_id: uid, tables: {}, files: [], counts: {}, errors: [] };
  for (const [table, ownerCol] of Object.entries(EXPORT_TABLES)) {
    onProgress(`Leyendo ${table}…`);
    const rows = [];
    try {
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await db.from(table).select("*").eq(ownerCol, uid).order(["profiles","user_settings","system_preferences","gym_plans","hub_user_state"].includes(table) ? ownerCol : "id").range(from, from + PAGE - 1);
        if (error) throw new Error(error.message);
        rows.push(...(data || []));
        if ((data || []).length < PAGE) break;
      }
      out.tables[table] = rows; out.counts[table] = rows.length;
    } catch (e) { out.errors.push(`${table}: ${e.message}`); }
  }
  let total = 0;
  for (const bucket of EXPORT_BUCKETS) {
    onProgress(`Leyendo archivos de ${bucket}…`);
    const stack = [{ prefix: uid, depth: 0 }];
    try {
      while (stack.length) {
        const { prefix, depth } = stack.pop();
        let offset = 0;
        for (;;) {
          const { data, error } = await db.storage.from(bucket).list(prefix, {
            limit: PAGE, offset, sortBy: { column: "name", order: "asc" }
          });
          if (error) throw new Error(error.message);
          for (const item of data || []) {
            if (!item.name || item.name.includes("/") || item.name === "..") {
              out.errors.push(`${bucket}: nombre de archivo no válido`); continue;
            }
            const path = `${prefix}/${item.name}`;
            if (!item.id) {
              if (depth < 6) stack.push({ prefix: path, depth: depth + 1 });
              else out.errors.push(`${bucket}/${path}: profundidad máxima alcanzada`);
              continue;
            }
            const size = Number(item.metadata?.size || 0);
            if (total + size > MAX_FILE_BYTES) {
              out.errors.push(`${bucket}/${path}: supera el límite de archivos`); continue;
            }
            const dl = await db.storage.from(bucket).download(path);
            if (dl.error) { out.errors.push(`${bucket}/${path}: ${dl.error.message}`); continue; }
            if (!dl.data || total + dl.data.size > MAX_FILE_BYTES) {
              out.errors.push(`${bucket}/${path}: supera el límite de archivos`); continue;
            }
            total += dl.data.size;
            out.files.push({ bucket, path, size: dl.data.size,
              content_type: dl.data.type || item.metadata?.mimetype || "application/octet-stream",
              base64: await toBase64(dl.data) });
          }
          if ((data || []).length < PAGE) break;
          offset += PAGE;
        }
      }
    } catch (e) { out.errors.push(`${bucket}: ${e.message}`); }
  }
  out.counts.files = out.files.length;
  return out;
}
