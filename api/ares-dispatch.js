// Ares Center: deliberate, single-attempt handoff of a previously approved Jarvis task.
// Staging-only until separately authorized and released. Never performs financial actions.
// The Supabase REST API is accessed using the requesting user's JWT, not a service-role key.
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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, {error:"Method not allowed"});
  }
  // Fail closed for production and non-Vercel environments. Local automated tests set preview.
  if (process.env.VERCEL_ENV !== "preview") return respond(res, 403, {error:"Solo disponible en preview"});
  const origin = req.headers?.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return respond(res, 403, {error:"Origin not allowed"});
    } catch { return respond(res, 403, {error:"Origin not allowed"}); }
  }
  const bearer = req.headers?.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (!bearer || !UUID.test(body.operationId||"")) return respond(res, 400, {error:"Solicitud inválida o sesión ausente"});
  const url = safeUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return respond(res, 503, {error:"Supabase no configurado"});
  if (process.env.ARES_JARVIS_DISPATCH_ENABLED !== "true") return respond(res, 503, {error:"Envíos de Ares deshabilitados"});
  const webhook = safeUrl(process.env.JARVIS_WEBHOOK_URL);
  const secret = process.env.JARVIS_OUTBOUND_TOKEN;
  if (!webhook || !secret) return respond(res, 503, {error:"Jarvis de salida no configurado"});
  const base = url.origin + "/rest/v1/hub_records";
  const apiHeaders = {
    apikey:key,
    authorization:"Bearer " + bearer,
    "content-type":"application/json",
    accept:"application/json"
  };
  let user;
  try {
    const response=await fetch(url.origin+"/auth/v1/user",{
      headers:{apikey:key,authorization:"Bearer "+bearer},
      signal:AbortSignal.timeout(6500),redirect:"error"
    });
    if (!response.ok) return respond(res, 401, {error:"Inicia sesión de nuevo"});
    user=await response.json();
    if (!UUID.test(user?.id||"")) return respond(res, 401, {error:"Sesión inválida"});
  } catch { return respond(res, 502, {error:"No se pudo verificar la sesión"}); }
  const opId=body.operationId,owner=user.id;
  // All filters are scoped by the JWT's owner. RLS checks the same owner server-side.
  const filters = new URLSearchParams({
    id:"eq."+opId,owner_id:"eq."+owner,record_type:"eq.ares_operation"
  });
  let row;
  try {
    const response=await fetch(base+"?"+filters+"&select=id,title,status,payload",{
      headers:apiHeaders,signal:AbortSignal.timeout(6500),redirect:"error",cache:"no-store"
    });
    if (!response.ok) return respond(res, 502, {error:"No se pudo leer la solicitud"});
    const result=await response.json();
    if (!Array.isArray(result) || result.length !== 1) return respond(res, 404, {error:"Solicitud no encontrada"});
    row=result[0];
  } catch { return respond(res, 502, {error:"No se pudo leer la solicitud"}); }
  if (row.status!=="approved"||row.payload?.agent!=="Jarvis"||row.payload?.executed!==false
      ||row.payload?.executionStatus!=="not_connected")
    return respond(res, 409, {error:"Solicitud no aprobada o ya procesada"});
  const title=String(row.title||"").trim().slice(0,180);
  if (!title) return respond(res, 422, {error:"Falta el título"});
  // Atomic status transition. If a concurrent request already claimed the row,
  // only one PATCH can affect it. No automatic retry after a network attempt.
  const changed={...row.payload,executionStatus:"dispatching",dispatchStartedAt:new Date().toISOString(),executed:false};
  const updateFilter = new URLSearchParams({
    id:"eq."+opId,owner_id:"eq."+owner,record_type:"eq.ares_operation",status:"eq.approved"
  });
  let claimed;
  try {
    const response=await fetch(base+"?"+updateFilter+"&select=id",{
      method:"PATCH",headers:{...apiHeaders,Prefer:"return=representation"},
      body:JSON.stringify({status:"dispatching",payload:changed}),
      signal:AbortSignal.timeout(6500),redirect:"error"
    });
    if (!response.ok) return respond(res, 502, {error:"No se pudo reservar el envío"});
    const result=await response.json();
    claimed=Array.isArray(result)&&result.length===1;
  } catch { return respond(res, 502, {error:"Estado del envío sin verificar. No reintentes."}); }
  if (!claimed) return respond(res, 409, {error:"Solicitud enviada o reservada previamente"});
  const event={
    event:"renzo_hub.capture",version:1,occurredAt:new Date().toISOString(),
    eventId:opId,
    record:{type:"task",title,note:String(row.payload?.details||"").slice(0,600),
      date:today(),source:"renzo-hub",origin:"ares",eventId:opId}
  };
  let accepted=false;
  try {
    const response=await fetch(webhook.toString(),{
      method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+secret,
        "Idempotency-Key":opId},body:JSON.stringify(event),
      signal:AbortSignal.timeout(10000),redirect:"error"
    });
    accepted=response.ok;
  } catch { /* May have reached receiver; do NOT retry automatically. */ }
  const terminal=accepted?"submitted":"delivery_unknown";
  try {
    await fetch(base+"?"+new URLSearchParams({
      id:"eq."+opId,owner_id:"eq."+owner,record_type:"eq.ares_operation",status:"eq.dispatching"
    })+"&select=id",{
      method:"PATCH",headers:{...apiHeaders,Prefer:"return=representation"},
      body:JSON.stringify({status:terminal,payload:{...changed,executionStatus:terminal,
        submittedAt:accepted?new Date().toISOString():null,executed:false}}),
      signal:AbortSignal.timeout(6500),redirect:"error"
    });
  } catch { /* Persisted dispatching acts as a hard stop to duplicate delivery. */ }
  if (!accepted) return respond(res, 502, {error:"Entrega no confirmada. Comprueba Jarvis antes de intentar otra vez.",status:terminal});
  return respond(res, 200, {ok:true,submitted:true,executed:false,status:terminal});
}
