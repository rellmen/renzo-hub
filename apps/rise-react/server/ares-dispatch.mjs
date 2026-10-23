// Ares Center (Nocturne) · entrega deliberada, de un solo intento, de una operación YA aprobada.
// Portado de api/ares-dispatch.js (Classic, solo lectura) y endurecido con ares-tool-policy.mjs.
// - Solo preview; producción requiere autorización separada (no existe bandera para ella aquí).
// - Apagado salvo ARES_JARVIS_DISPATCH_ENABLED=true. Sin service-role: REST con el JWT del propietario + RLS.
// - Reserva atómica approved→dispatching; nunca reintenta tras un intento de red.
import {TOOLS, evaluateOperation, publicContract, toolEnabled} from "./ares-tool-policy.mjs";

const respond = (res, status, body) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(status).json(body);
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1", "::1"].includes(url.hostname) && !url.username && !url.password ? url : null;
  } catch { return null; }
};
const today = () => new Date().toISOString().slice(0, 10);

export default async function handler(req, res) {
  // Contrato público: qué herramientas existen y si están habilitadas. Sin secretos ni destinos.
  if (req.method === "GET") return respond(res, 200, {tools: publicContract(), executesFinancialActions: false});
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return respond(res, 405, {error: "Method not allowed"});
  }
  if (process.env.VERCEL_ENV !== "preview") return respond(res, 403, {error: "Solo disponible en preview"});
  const origin = req.headers?.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return respond(res, 403, {error: "Origin not allowed"});
    } catch { return respond(res, 403, {error: "Origin not allowed"}); }
  }
  const bearer = req.headers?.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (!bearer) return respond(res, 401, {error: "Sesión necesaria"});
  if (!UUID.test(body.operationId || "")) return respond(res, 400, {error: "Solicitud inválida"});
  const jarvis = TOOLS["jarvis.capture_task"];
  if (!toolEnabled(jarvis)) return respond(res, 503, {error: "Envíos de Ares deshabilitados"});
  const url = safeUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return respond(res, 503, {error: "Supabase no configurado"});
  const webhook = safeUrl(process.env.JARVIS_WEBHOOK_URL);
  const secret = process.env.JARVIS_OUTBOUND_TOKEN;
  if (!webhook || !secret) return respond(res, 503, {error: "Jarvis de salida no configurado"});
  const base = url.origin + "/rest/v1/hub_records";
  const apiHeaders = {apikey: key, authorization: "Bearer " + bearer, "content-type": "application/json", accept: "application/json"};

  let owner;
  try {
    const response = await fetch(url.origin + "/auth/v1/user", {
      headers: {apikey: key, authorization: "Bearer " + bearer}, signal: AbortSignal.timeout(6500), redirect: "error"
    });
    if (!response.ok) return respond(res, 401, {error: "Inicia sesión de nuevo"});
    owner = (await response.json())?.id;
    if (!UUID.test(owner || "")) return respond(res, 401, {error: "Sesión inválida"});
  } catch { return respond(res, 502, {error: "No se pudo verificar la sesión"}); }

  const opId = body.operationId;
  const scope = {id: "eq." + opId, owner_id: "eq." + owner, record_type: "eq.ares_operation"};
  let row;
  try {
    const response = await fetch(base + "?" + new URLSearchParams(scope) + "&select=id,owner_id,record_type,title,status,payload,updated_at", {
      headers: apiHeaders, signal: AbortSignal.timeout(6500), redirect: "error", cache: "no-store"
    });
    if (!response.ok) return respond(res, 502, {error: "No se pudo leer la solicitud"});
    const result = await response.json();
    if (!Array.isArray(result) || result.length !== 1) return respond(res, 404, {error: "Solicitud no encontrada"});
    row = result[0];
  } catch { return respond(res, 502, {error: "No se pudo leer la solicitud"}); }

  const verdict = evaluateOperation(row, owner);
  if (!verdict.ok) return respond(res, verdict.code, {error: verdict.reason});
  if (verdict.tool.id !== jarvis.id) return respond(res, 422, {error: "Herramienta no permitida para Ares"});

  // Reserva atómica: solo un PATCH puede pasar de approved a dispatching (filtro status + updated_at).
  const changed = {...row.payload, tool: jarvis.id, executionStatus: "dispatching", dispatchStartedAt: new Date().toISOString(), executed: false};
  const claimFilter = new URLSearchParams({...scope, status: "eq.approved", ...(row.updated_at ? {updated_at: "eq." + row.updated_at} : {})});
  let claimed;
  try {
    const response = await fetch(base + "?" + claimFilter + "&select=id", {
      method: "PATCH", headers: {...apiHeaders, Prefer: "return=representation"},
      body: JSON.stringify({status: "dispatching", payload: changed}),
      signal: AbortSignal.timeout(6500), redirect: "error"
    });
    if (!response.ok) return respond(res, 502, {error: "No se pudo reservar el envío"});
    const result = await response.json();
    claimed = Array.isArray(result) && result.length === 1;
  } catch { return respond(res, 502, {error: "Estado del envío sin verificar. No reintentes."}); }
  if (!claimed) return respond(res, 409, {error: "Solicitud enviada, reservada o modificada en otro dispositivo"});

  const event = {
    event: "renzo_hub.capture", version: 1, occurredAt: new Date().toISOString(), eventId: opId,
    record: {type: "task", title: verdict.title, note: verdict.note, date: today(), source: "renzo-hub", origin: "ares", tool: jarvis.id, eventId: opId}
  };
  let accepted = false;
  try {
    const response = await fetch(webhook.toString(), {
      method: "POST",
      headers: {"content-type": "application/json", authorization: "Bearer " + secret, "Idempotency-Key": opId},
      body: JSON.stringify(event), signal: AbortSignal.timeout(10000), redirect: "error"
    });
    accepted = response.ok;
  } catch { /* Puede haber llegado al receptor: no se reintenta automáticamente. */ }
  const terminal = accepted ? "submitted" : "delivery_unknown";
  try {
    await fetch(base + "?" + new URLSearchParams({...scope, status: "eq.dispatching"}) + "&select=id", {
      method: "PATCH", headers: {...apiHeaders, Prefer: "return=representation"},
      body: JSON.stringify({status: terminal, payload: {...changed, executionStatus: terminal,
        submittedAt: accepted ? new Date().toISOString() : null, executed: false}}),
      signal: AbortSignal.timeout(6500), redirect: "error"
    });
  } catch { /* 'dispatching' persistido bloquea duplicados. */ }
  if (!accepted) return respond(res, 502, {error: "Entrega no confirmada. Comprueba Jarvis antes de intentar otra vez.", status: terminal});
  return respond(res, 200, {ok: true, submitted: true, executed: false, status: terminal});
}
