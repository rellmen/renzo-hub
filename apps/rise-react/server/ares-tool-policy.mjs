// Ares · contrato declarativo de herramientas (Nocturne).
// Única fuente de verdad de QUÉ puede pedir Ares a un agente externo y bajo qué condiciones.
// Principios: deny-by-default, aprobación humana previa registrada, un solo intento,
// sin finanzas/nóminas/credenciales, sin Nodalys, solo preview hasta autorización separada.
// Este módulo no hace red ni lee secretos: solo evalúa datos ya leídos con el JWT del propietario.

export const SENSITIVE =
  /n[oó]minas?|payroll|payslip|salari|sueldo|iban|\bbic\b|banco|bank|transfer|pago|payment|factura|invoice|gasto|expense|tarjeta|card number|contraseñ|password|passwd|token|api[ _-]?key|secret|credencial|credential|\bpin\b|\bbsn\b|dni|pasaporte|passport|nodalys/i;

export const TOOLS = Object.freeze({
  "jarvis.capture_task": Object.freeze({
    id: "jarvis.capture_task",
    agent: "Jarvis",
    description: "Entregar a Jarvis una tarea ya aprobada como captura de texto. No ejecuta acciones financieras.",
    kind: "dispatch",
    requiresApproval: true,
    flag: "ARES_JARVIS_DISPATCH_ENABLED",
    environments: Object.freeze(["preview"]),
    maxTitle: 180,
    maxNote: 600,
    attempts: 1
  })
});

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, max);

export function toolForOperation(row) {
  const requested = row?.payload?.tool;
  if (requested !== undefined) return TOOLS[requested] || null;
  // Operaciones históricas de Classic: agente Jarvis sin campo tool.
  return row?.payload?.agent === "Jarvis" ? TOOLS["jarvis.capture_task"] : null;
}

export function toolEnabled(tool, env = process.env) {
  return Boolean(tool && tool.environments.includes(env.VERCEL_ENV) && env[tool.flag] === "true");
}

export function publicContract(env = process.env) {
  return Object.values(TOOLS).map(t => ({
    id: t.id, agent: t.agent, description: t.description, kind: t.kind,
    requiresApproval: t.requiresApproval, attempts: t.attempts, enabled: toolEnabled(t, env)
  }));
}

// Devuelve {ok:true, tool, title, note} o {ok:false, code, reason}. Nunca lanza.
export function evaluateOperation(row, ownerId) {
  if (!row || row.record_type && row.record_type !== "ares_operation") return {ok: false, code: 404, reason: "Solicitud no encontrada"};
  if (row.owner_id && row.owner_id !== ownerId) return {ok: false, code: 404, reason: "Solicitud no encontrada"};
  const tool = toolForOperation(row);
  if (!tool) return {ok: false, code: 422, reason: "Herramienta no permitida para Ares"};
  if (row.payload?.agent !== tool.agent) return {ok: false, code: 422, reason: "Agente no coincide con la herramienta"};
  // Classic guardaba aprobaciones sin approvedBy; Nocturne guarda approvedBy:'owner'. Cualquier otro valor se rechaza.
  const approver = row.payload?.approvedBy;
  if (tool.requiresApproval && (row.status !== "approved" || (approver !== undefined && approver !== "owner")))
    return {ok: false, code: 409, reason: "Solicitud no aprobada o ya procesada"};
  if (row.payload?.executed !== false || row.payload?.executionStatus !== "not_connected")
    return {ok: false, code: 409, reason: "Solicitud no aprobada o ya procesada"};
  const title = clean(row.title, tool.maxTitle);
  const note = clean(row.payload?.details, tool.maxNote);
  if (!title) return {ok: false, code: 422, reason: "Falta el título"};
  if (SENSITIVE.test(title) || SENSITIVE.test(note))
    return {ok: false, code: 422, reason: "Contenido sensible: finanzas, nóminas, credenciales o Nodalys no se envían a agentes."};
  return {ok: true, tool, title, note};
}
