import { createHash, timingSafeEqual, randomUUID } from "node:crypto";

const json = (res, status, body) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(status).json(body);
};

const sameSecret = (provided, expected) => {
  if (!provided || !expected) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
};

const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : new Date().toISOString().slice(0, 10);
function stableEventId(ownerId, externalId) {
  if (!externalId) return randomUUID();
  const bytes = createHash("sha256").update(`${ownerId}:${externalId}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
const allowedInboundTypes = new Set([
  "task", "note", "idea", "expense", "study", "reminder", "project",
  "document", "food", "weight", "workout", "calendar_event", "payslip", "receipt"
]);
const allowedOutboundTypes = new Set(["task", "note", "idea", "project", "study", "expense"]);

async function authenticatedUser(req) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) return null;
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
      headers: { apikey: key, authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) return null;
    const user = await response.json();
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

async function sendToJarvis(req, res) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return json(res, 403, { error: "Origin not allowed" });
    } catch {
      return json(res, 403, { error: "Origin not allowed" });
    }
  }
  const user = await authenticatedUser(req);
  if (!user) return json(res, 401, { error: "Sign in required" });

  const webhook = process.env.JARVIS_WEBHOOK_URL;
  const secret = process.env.JARVIS_OUTBOUND_TOKEN;
  if (!webhook || !secret) return json(res, 503, { error: "Jarvis outbound is not configured" });
  let target;
  try { target = new URL(webhook); } catch { return json(res, 503, { error: "Jarvis webhook URL is invalid" }); }
  if (target.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(target.hostname)) {
    return json(res, 503, { error: "Jarvis webhook must use a public HTTPS URL" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const type = text(body.type, 32).toLowerCase();
  const title = text(body.title, 180);
  const note = text(body.note, 1200);
  if (!allowedOutboundTypes.has(type) || !title) return json(res, 400, { error: "Choose a supported item and add a title" });
  let expenseFields = {};
  if (type === "expense") {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000 || text(body.expenseCategory, 32).toLowerCase() !== "car") {
      return json(res, 400, { error: "Car expenses need a positive amount and the car category" });
    }
    expenseFields = { amount: Math.round(amount * 100) / 100, currency: "EUR", expenseCategory: "car" };
  }
  const event = {
    event: "renzo_hub.capture",
    version: 1,
    occurredAt: new Date().toISOString(),
    record: { type, title, note, date: validDate(body.date), source: "renzo-hub", ...expenseFields }
  };
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(10000),
      redirect: "error"
    });
    if (!response.ok) return json(res, 502, { error: "Jarvis did not accept the event" });
    return json(res, 200, { ok: true, sent: true });
  } catch {
    return json(res, 502, { error: "Could not reach Jarvis" });
  }
}

async function receiveFromJarvis(req, res) {
  const provided = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!sameSecret(provided, process.env.JARVIS_INBOUND_TOKEN)) return json(res, 401, { error: "Unauthorized" });

  const projectUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.JARVIS_OWNER_ID;
  if (!projectUrl || !serviceKey || !ownerId) return json(res, 503, { error: "Jarvis inbound storage is not configured" });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ownerId)) {
    return json(res, 503, { error: "Jarvis owner is not configured" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const type = text(body.type, 32).toLowerCase();
  const title = text(body.title, 180);
  const note = text(body.note, 2000);
  if (!allowedInboundTypes.has(type) || !title) return json(res, 400, { error: "Unsupported item or missing title" });
  const extracted = body.extracted && typeof body.extracted === "object" && !Array.isArray(body.extracted) ? body.extracted : {};
  if (type === "expense" && text(body.expenseCategory || extracted.expenseCategory, 32).toLowerCase() === "car") extracted.expenseCategory = "car";
  let extractedJson;
  try { extractedJson = JSON.stringify(extracted); } catch { return json(res, 400, { error: "Invalid extracted fields" }); }
  if (extractedJson.length > 8000) return json(res, 413, { error: "Extracted fields exceed 8 KB" });
  const externalId = text(body.eventId || body.messageId, 180);
  const id = stableEventId(ownerId, externalId);
  const date = validDate(body.date);
  const confidence = Number(body.confidence);
  const confidenceValue = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null;
  const amountCandidate = extracted.amount ?? body.amount ?? extracted.net ?? body.net;
  const amount = Number(amountCandidate);
  const net = Number(extracted.net ?? body.net ?? (type === "payslip" ? amountCandidate : NaN));
  const gross = Number(extracted.gross ?? body.gross);
  const expenseCategory = text(body.expenseCategory || extracted.expenseCategory, 32).toLowerCase();
  const payPeriod = text(body.period || extracted.period, 16);
  const financialKind = type === "payslip" ? "payslip" : "expense";
  const financialAmount = type === "payslip" ? net : amount;
  const completeFinancialData = Number.isFinite(financialAmount) && financialAmount > 0 &&
    (type !== "payslip" || (Number.isFinite(gross) && gross >= net && !!payPeriod));
  const autoRecord = ["expense", "receipt", "payslip"].includes(type) && completeFinancialData && confidenceValue !== null && confidenceValue >= 0.9;
  const category = type === "payslip" ? "Salary" : expenseCategory === "car" ? "Car" : text(body.category || extracted.category, 40) || "Other";
  const financialPayload = {
    id,
    kind: financialKind,
    amount: Math.round(financialAmount * 100) / 100,
    date,
    category,
    expenseCategory: expenseCategory || (category === "Car" ? "car" : undefined),
    note,
    source: "jarvis",
    reviewed: true,
    importedConfidence: confidenceValue,
    ...(type === "payslip" ? {
      net: Math.round(net * 100) / 100,
      gross: Math.round(gross * 100) / 100,
      baseHours: Number(extracted.baseHours ?? body.baseHours) || 0,
      overtimeHours: Number(extracted.overtimeHours ?? body.overtimeHours) || 0,
      overtimeIncome: Number(extracted.overtimeIncome ?? body.overtimeIncome) || 0,
      allowances: Number(extracted.allowances ?? body.allowances) || 0,
      bonus: Number(extracted.bonus ?? body.bonus) || 0,
      deductions: Number(extracted.deductions ?? body.deductions) || 0,
      fuel: Number(extracted.fuel ?? body.fuel) || 0,
      period: payPeriod,
      validatedByUser: false
    } : {})
  };
  const payload = {
    id,
    title,
    category: type,
    note,
    extracted,
    date,
    status: "needs_review",
    source: "jarvis",
    requiresReview: true,
    confidence: confidenceValue,
    reviewReason: type === "payslip" || type === "expense" || type === "receipt" || type === "calendar_event"
      ? "Confianza baja o campos financieros incompletos; revisar antes de registrar en Money."
      : "Entrada de Jarvis pendiente de revisión."
  };
  try {
    const financialRow = autoRecord ? {
      id,
      owner_id: ownerId,
      domain: "money",
      record_type: "renzo_money",
      title: title.slice(0, 500),
      status: "active",
      occurred_at: `${date}T12:00:00.000Z`,
      payload: financialPayload,
      source: "automation",
      confidence: confidenceValue,
      requires_review: false
    } : null;
    const response = await fetch(`${projectUrl.replace(/\/$/, "")}/rest/v1/hub_records`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify({
        id,
        owner_id: ownerId,
        domain: financialRow?.domain || (type === "payslip" || type === "expense" || type === "receipt" ? "money" : type === "calendar_event" ? "personal" : "system"),
        record_type: financialRow?.record_type || "renzo_inbox",
        title: financialRow?.title || title,
        status: financialRow?.status || "needs_review",
        occurred_at: financialRow?.occurred_at || `${date}T12:00:00.000Z`,
        payload: financialRow?.payload || payload,
        source: financialRow?.source || "automation",
        confidence: financialRow?.confidence ?? payload.confidence,
        requires_review: financialRow?.requires_review ?? true
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error"
    });
    if (!response.ok) return json(res, 502, { error: "Hub could not store the incoming item" });
    return json(res, 201, { ok: true, id, status: autoRecord ? "saved_to_money" : "needs_review", requiresReview: !autoRecord });
  } catch {
    return json(res, 502, { error: "Hub could not store the incoming item" });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return json(res, 200, {
      outboundConfigured: Boolean(process.env.JARVIS_WEBHOOK_URL && process.env.JARVIS_OUTBOUND_TOKEN),
      inboundConfigured: Boolean(process.env.JARVIS_INBOUND_TOKEN && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.JARVIS_OWNER_ID),
      inboundPath: "/api/jarvis"
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  }
  if (req.headers.authorization?.startsWith("Bearer ") && process.env.JARVIS_INBOUND_TOKEN && sameSecret(req.headers.authorization.slice(7), process.env.JARVIS_INBOUND_TOKEN)) {
    return receiveFromJarvis(req, res);
  }
  return sendToJarvis(req, res);
}
