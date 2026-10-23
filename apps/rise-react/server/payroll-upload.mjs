// Local server-only copy of Classic payroll handler for isolated Vercel packaging.
// Same audited validation, Auth and Storage logic; equality guarded by tests.
// Subida de nóminas desde la app (My Finance → Nóminas → "Subir nómina"), sin n8n.
// El navegador lee el PDF (payroll-pdf.js) y envía el fichero + los datos leídos. Aquí:
//   1. se comprueba la sesión del usuario (token de Supabase) y el origen;
//   2. se valida el PDF (tipo, tamaño, huella SHA-256) y los importes;
//   3. se reutilizan la empresa y la etiqueta de semana que ya existen en sus nóminas;
//   4. payroll_register_document → subida al bucket privado "payroll" → payroll_ingest;
//   5. la nómina queda SIEMPRE pendiente de revisión humana (validation_status "review_required").
// La clave secreta de Supabase solo vive en variables de entorno de Vercel; nunca llega al navegador.
import { createHash } from "node:crypto";

export const MAX_PDF_BYTES = 3 * 1024 * 1024;
const json = (res, status, body) => { res.setHeader("Cache-Control", "no-store, max-age=0"); return res.status(status).json(body); };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const finite = v => v === null || v === undefined || (typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1e7);
const near = (a, b) => Math.abs(Number(a) - Number(b)) <= 0.02;

export function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && key && publishable ? { url, key, publishable } : null;
}

function serviceHeaders(key, extra = {}) {
  const h = { apikey: key, ...extra };
  if (!key.startsWith("sb_secret_")) h.authorization = `Bearer ${key}`;
  return h;
}

async function userFromToken(cfg, token, fetchImpl) {
  if (!token) return null;
  try {
    const r = await fetchImpl(`${cfg.url}/auth/v1/user`, { headers: { apikey: cfg.publishable, authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id && uuid.test(u.id) ? u : null;
  } catch { return null; }
}

// Comprueba la forma y la coherencia de lo que ha leído el navegador. Devuelve un mensaje de error o null.
export function validatePayload(payload) {
  const p = payload?.payslip;
  if (!p || typeof p !== "object") return "Faltan los datos de la nómina.";
  if (p.period_type !== "weekly") return "Solo se aceptan nóminas semanales.";
  if (!Number.isInteger(p.period_year) || p.period_year < 2020 || p.period_year > 2100) return "Año no válido.";
  if (!Number.isInteger(p.period_number) || p.period_number < 1 || p.period_number > 53) return "Semana no válida.";
  if (!/^\d{1,4}$/.test(String(p.payslip_number || ""))) return "Número de nómina no válido.";
  for (const k of ["gross_salary", "net_salary", "net_payment", "loon_voor_loonheffing"]) if (typeof p[k] !== "number" || !Number.isFinite(p[k])) return `Falta el importe ${k}.`;
  for (const [k, v] of Object.entries(p)) if (typeof v === "number" && !finite(v)) return `Importe no válido: ${k}.`;
  for (const k of ["period_start", "period_end", "payment_date", "document_date"]) if (p[k] != null && !/^\d{4}-\d{2}-\d{2}$/.test(p[k])) return `Fecha no válida: ${k}.`;
  if (p.net_payment < 0 || p.gross_salary < 0) return "Importes negativos no admitidos.";
  if (!near(p.net_salary + (p.travel_allowance || 0), p.net_payment)) return "El neto y el importe pagado no cuadran.";
  if (!Array.isArray(payload.line_items) || payload.line_items.length > 60) return "Conceptos no válidos.";
  if (JSON.stringify(payload).length > 60000) return "Datos demasiado grandes.";
  return null;
}

export function makeHandler({ fetchImpl = fetch } = {}) {
  return async function handler(req, res) {
    const cfg = config();
    if (req.method === "GET") return json(res, 200, { configured: Boolean(cfg), maxBytes: MAX_PDF_BYTES });
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return json(res, 405, { error: "Método no permitido" }); }
    const origin = req.headers.origin;
    if (origin) { try { if (new URL(origin).host !== req.headers.host) return json(res, 403, { error: "Origen no permitido" }); } catch { return json(res, 403, { error: "Origen no permitido" }); } }
    if (!cfg) return json(res, 503, { error: "La subida de nóminas no está configurada en este entorno." });
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const user = await userFromToken(cfg, token, fetchImpl);
    if (!user) return json(res, 401, { error: "Inicia sesión para subir nóminas." });

    const body = req.body && typeof req.body === "object" ? req.body : {};
    let pdf;
    try { pdf = Buffer.from(String(body.pdfBase64 || ""), "base64"); } catch { pdf = Buffer.alloc(0); }
    if (pdf.length < 100) return json(res, 400, { error: "Falta el PDF." });
    if (pdf.length > MAX_PDF_BYTES) return json(res, 413, { error: "El PDF supera 3 MB." });
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return json(res, 400, { error: "El fichero no es un PDF." });
    const payload = body.payload && typeof body.payload === "object" ? structuredClone(body.payload) : null;
    const invalid = validatePayload(payload);
    if (invalid) return json(res, 422, { error: invalid });

    const sha = createHash("sha256").update(pdf).digest("hex");
    const fileName = String(body.fileName || "nomina.pdf").replace(/[^\w.\- ()]/g, "_").slice(0, 120) || "nomina.pdf";
    const rest = (path, init = {}) => fetchImpl(`${cfg.url}/rest/v1/${path}`, { ...init, headers: serviceHeaders(cfg.key, { "content-type": "application/json", ...(init.headers || {}) }), signal: AbortSignal.timeout(15000), redirect: "error" });
    const rpc = async (fn, args) => { const r = await rest(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) }); const t = await r.text(); if (!r.ok) throw new Error(`${fn}: ${r.status} ${t.slice(0, 200)}`); return t ? JSON.parse(t) : null; };
    const select = async path => { const r = await rest(path); if (!r.ok) throw new Error(`select: ${r.status}`); return r.json(); };
    const p = payload.payslip, uid = user.id;

    try {
      // Empresa: reutiliza la que ya existe con el mismo número de loonheffingen (mismo código interno).
      const lhn = payload.employer?.loonheffingennummer;
      if (lhn) {
        const emp = await select(`payroll_employers?user_id=eq.${uid}&loonheffingennummer=eq.${encodeURIComponent(lhn)}&select=normalized_code,name&limit=1`);
        if (emp[0]?.normalized_code) payload.employer = { ...payload.employer, code: emp[0].normalized_code, name: emp[0].name || payload.employer.name };
      }
      // Semana: reutiliza la etiqueta existente y marca como pago adicional si ya hay una nómina normal de esa semana con otro número.
      const same = await select(`payroll_payslips?user_id=eq.${uid}&period_type=eq.weekly&period_year=eq.${p.period_year}&period_number=eq.${p.period_number}&select=period_label,payslip_number,is_correction`);
      const main = same.find(x => !x.is_correction);
      if (main?.period_label) p.period_label = main.period_label;
      if (main && String(main.payslip_number || "") !== String(p.payslip_number)) { p.is_correction = true; p.corrected_period_ref = main.period_label; }
      else { p.is_correction = false; p.corrected_period_ref = null; if (!main) p.payment_date = null; }
      // Siempre a revisión humana.
      payload.validation_status = "review_required";
      payload.confidence_overall = Math.min(Number(payload.confidence_overall) || 0, 0.84);

      const reg = await rpc("payroll_register_document", { p_user_id: uid, p_sha256: sha, p_file_name: fileName, p_source: "manual", p_source_ref: "app_upload", p_mime: "application/pdf", p_size: pdf.length, p_storage_path_raw: `${uid}/Inbox/${sha}.pdf` });
      if (reg?.is_duplicate) return json(res, 200, { ok: true, duplicate: true, documentId: reg.document_id, message: "Este PDF ya estaba subido." });
      const docId = reg?.document_id;
      if (!uuid.test(docId || "")) throw new Error("payroll_register_document sin documento");

      const up = await fetchImpl(`${cfg.url}/storage/v1/object/payroll/${uid}/Inbox/${sha}.pdf`, { method: "POST", headers: serviceHeaders(cfg.key, { "content-type": "application/pdf", "x-upsert": "true" }), body: pdf, signal: AbortSignal.timeout(20000) });
      if (!up.ok) { await rpc("payroll_mark_failed", { p_document_id: docId, p_error_code: "storage_upload", p_error_message: `HTTP ${up.status}`, p_step: "upload" }).catch(() => {}); throw new Error(`storage ${up.status}`); }

      let result;
      try { result = await rpc("payroll_ingest", { p_document_id: docId, p_payload: payload }); }
      catch (e) { await rpc("payroll_mark_failed", { p_document_id: docId, p_error_code: "ingest", p_error_message: String(e.message).slice(0, 300), p_step: "ingest" }).catch(() => {}); throw e; }

      // Copia al archivo ordenado (como hace el flujo de n8n); si falla, el PDF sigue en Inbox y se puede abrir.
      if (result?.storage_path_archive && result.storage_path_archive !== `${uid}/Inbox/${sha}.pdf`) {
        await fetchImpl(`${cfg.url}/storage/v1/object/copy`, { method: "POST", headers: serviceHeaders(cfg.key, { "content-type": "application/json" }), body: JSON.stringify({ bucketId: "payroll", sourceKey: `${uid}/Inbox/${sha}.pdf`, destinationKey: result.storage_path_archive }), signal: AbortSignal.timeout(15000) })
          .then(r => r.ok ? null : rest(`payroll_documents?id=eq.${docId}`, { method: "PATCH", body: JSON.stringify({ storage_path_archive: null }) }))
          .catch(() => {});
      }
      return json(res, 201, { ok: true, duplicate: Boolean(result?.duplicate), payslipId: result?.payslip_id || result?.existing_payslip_id || null, documentId: docId, reviewStatus: result?.review_status || "pending", isCorrection: p.is_correction, periodLabel: p.period_label });
    } catch (e) {
      console.error("payroll-upload", e?.message);
      return json(res, 502, { error: "No se pudo guardar la nómina. Inténtalo de nuevo más tarde." });
    }
  };
}

export default makeHandler();
