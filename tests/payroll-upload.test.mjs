// Subida de nóminas sin n8n: lectura del PDF (reglas de SD Worx) y endpoint /api/payroll-upload.
// Usa una nómina FICTICIA (tests/fixtures/nomina-sdworx-ficticia.*): ningún dato es real.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseSdWorx, num, hours } from "../payroll-pdf.js";
import { makeHandler, validatePayload } from "../api/payroll-upload.js";

const rows = JSON.parse(readFileSync(new URL("./fixtures/nomina-sdworx-ficticia.rows.json", import.meta.url), "utf8"));
const pdf = readFileSync(new URL("./fixtures/nomina-sdworx-ficticia.pdf", import.meta.url));

test("números y horas en formato neerlandés", () => {
  assert.equal(num("1.314,43"), 1314.43); assert.equal(num("-0,58"), -0.58);
  assert.equal(hours("26:15"), 26.25); assert.equal(hours("abc"), null);
});

test("lee la nómina ficticia de SD Worx y las cuentas cuadran", () => {
  const p = parseSdWorx(rows), s = p.payslip;
  assert.equal(s.payslip_number, "7"); assert.equal(s.period_label, "2026-W30");
  assert.deepEqual([s.period_type, s.period_year, s.period_number], ["weekly", 2026, 30]);
  assert.equal(s.period_start, "2026-07-20"); assert.equal(s.period_end, "2026-07-26"); assert.equal(s.document_date, "2026-07-28");
  assert.equal(s.gross_salary, 583.2); assert.equal(s.net_salary, 473.88); assert.equal(s.net_payment, 493.88);
  assert.equal(s.regular_pay, 150); assert.equal(s.shift_allowance, 390); assert.equal(s.vakantiegeld, 43.2);
  assert.equal(s.loonheffing, 76.62); assert.equal(s.pension_contribution, 22.5); assert.equal(s.social_contributions, 10.2);
  assert.equal(s.travel_allowance, 20); assert.equal(s.hourly_rate, 15); assert.equal(s.worked_hours, 30);
  assert.equal(s.cumulative_gross, 4000); assert.equal(s.cumulative_tax, 400); assert.equal(s.employee_number, "1234567");
  assert.equal(p.employer.loonheffingennummer, "0000.00.000");
  assert.equal(p.validation_status, "review_required");
  assert.ok(p.checks.every(c => c.passed), JSON.stringify(p.checks));
});

test("rechaza documentos que no son nóminas semanales de SD Worx", () => {
  const swap = (from, to) => rows.map(r => ({ ...r, items: r.items.map(i => ({ ...i, s: i.s.replace(from, to) })) }));
  assert.throws(() => parseSdWorx(swap("SD Worx", "Otra Empresa")), /SD Worx/);
  assert.throws(() => parseSdWorx(swap("Tijdvak: Week 30", "Tijdvak: Maand 7")), /semana/);
  assert.throws(() => parseSdWorx(swap("Loonspecificatie", "Factuur")), /nómina/);
});

test("una devolución de impuestos resta de la retención (no suma)", () => {
  const r = structuredClone(rows);
  const tax = r.find(x => x.items[0].s === "Loonheffingen (Week wit)");
  tax.items.find(i => i.s === "-60,00").s = "2,00";
  const p = parseSdWorx(r);
  assert.equal(p.payslip.loonheffing, 14.62);
  assert.equal(p.checks.find(c => c.rule === "net_salary").passed, false, "con el neto original ya no cuadra y se avisa");
});

test("validatePayload acepta lo leído y rechaza datos incoherentes", () => {
  const p = parseSdWorx(rows);
  assert.equal(validatePayload(p), null);
  assert.match(validatePayload({ ...p, payslip: { ...p.payslip, period_number: 60 } }), /Semana/);
  assert.match(validatePayload({ ...p, payslip: { ...p.payslip, net_payment: 1 } }), /no cuadran/);
  assert.match(validatePayload({ ...p, payslip: { ...p.payslip, payslip_number: "x" } }), /Número/);
  assert.match(validatePayload(null), /Faltan/);
});

// --- Endpoint con Supabase simulado ---
const UID = "00000000-0000-4000-8000-0000000000aa", DOC = "00000000-0000-4000-8000-0000000000dd";
function env() { Object.assign(process.env, { SUPABASE_URL: "https://x.supabase.co", SUPABASE_PUBLISHABLE_KEY: "pk", SUPABASE_SECRET_KEY: "sb_secret_test" }); }
function res() { const r = { code: 0, body: null, headers: {}, setHeader(k, v) { r.headers[k] = v; }, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; }
function fakeFetch({ existing = [], employer = [{ normalized_code: "SDWORX_REAL", name: "SD Worx Staffing Solutions" }], duplicateFile = false } = {}) {
  const calls = [];
  const reply = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
  const f = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.endsWith("/auth/v1/user")) return init.headers.authorization === "Bearer good" ? reply(200, { id: UID }) : reply(401, {});
    if (url.includes("/rest/v1/payroll_employers")) return reply(200, employer);
    if (url.includes("/rest/v1/payroll_payslips")) return reply(200, existing);
    if (url.endsWith("/rpc/payroll_register_document")) return reply(200, duplicateFile ? { document_id: DOC, is_duplicate: true } : { document_id: DOC, is_new: true, is_duplicate: false });
    if (url.includes("/storage/v1/object/payroll/")) return reply(200, {});
    if (url.endsWith("/rpc/payroll_ingest")) return reply(200, { ok: true, duplicate: false, payslip_id: "00000000-0000-4000-8000-0000000000ee", review_status: "pending", storage_path_archive: `${UID}/Payroll/2026/Payslips/x.pdf` });
    if (url.endsWith("/storage/v1/object/copy")) return reply(200, {});
    return reply(404, {});
  };
  f.calls = calls; return f;
}
const post = (body, token = "good") => ({ method: "POST", headers: { host: "app.test", origin: "https://app.test", authorization: `Bearer ${token}` }, body });
const good = () => ({ fileName: "n.pdf", pdfBase64: pdf.toString("base64"), payload: parseSdWorx(rows) });

test("endpoint: sin configurar, sin sesión, origen ajeno y fichero que no es PDF", async () => {
  for (const k of ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) delete process.env[k];
  let r = res(); await makeHandler({ fetchImpl: fakeFetch() })({ method: "GET", headers: {} }, r);
  assert.deepEqual([r.code, r.body.configured], [200, false]);
  r = res(); await makeHandler({ fetchImpl: fakeFetch() })(post(good()), r); assert.equal(r.code, 503);
  env();
  r = res(); await makeHandler({ fetchImpl: fakeFetch() })(post(good(), "bad"), r); assert.equal(r.code, 401);
  r = res(); await makeHandler({ fetchImpl: fakeFetch() })({ ...post(good()), headers: { ...post(good()).headers, origin: "https://evil.test" } }, r); assert.equal(r.code, 403);
  r = res(); await makeHandler({ fetchImpl: fakeFetch() })(post({ ...good(), pdfBase64: Buffer.from("x".repeat(200)).toString("base64") }), r); assert.equal(r.code, 400);
  r = res(); await makeHandler({ fetchImpl: fakeFetch() })(post({ ...good(), payload: { payslip: { period_type: "monthly" } } }), r); assert.equal(r.code, 422);
});

test("endpoint: registra, sube al bucket privado e ingesta SIEMPRE pendiente de revisión", async () => {
  env(); const f = fakeFetch(), r = res();
  await makeHandler({ fetchImpl: f })(post(good()), r);
  assert.equal(r.code, 201, JSON.stringify(r.body)); assert.equal(r.body.reviewStatus, "pending"); assert.equal(r.body.isCorrection, false);
  const order = f.calls.map(c => new URL(c.url).pathname.replace(/\/[0-9a-f-]{36}\/Inbox\/[0-9a-f]{64}\.pdf$/, "/<raw>"));
  assert.deepEqual(order, ["/auth/v1/user", "/rest/v1/payroll_employers", "/rest/v1/payroll_payslips", "/rest/v1/rpc/payroll_register_document", "/storage/v1/object/payroll/<raw>", "/rest/v1/rpc/payroll_ingest", "/storage/v1/object/copy"]);
  const reg = JSON.parse(f.calls[3].init.body);
  assert.equal(reg.p_user_id, UID); assert.match(reg.p_sha256, /^[0-9a-f]{64}$/); assert.equal(reg.p_source, "manual");
  const ingest = JSON.parse(f.calls[5].init.body).p_payload;
  assert.equal(ingest.validation_status, "review_required"); assert.ok(ingest.confidence_overall < 0.85);
  assert.equal(ingest.employer.code, "SDWORX_REAL", "reutiliza la empresa existente");
  assert.equal(f.calls[4].init.headers.apikey, "sb_secret_test"); assert.equal(f.calls[4].init.headers.authorization, undefined);
});

test("endpoint: segunda nómina de la misma semana = pago adicional con la etiqueta existente", async () => {
  env(); const f = fakeFetch({ existing: [{ period_label: "2026-30", payslip_number: "6", is_correction: false }] }), r = res();
  await makeHandler({ fetchImpl: f })(post(good()), r);
  assert.equal(r.body.isCorrection, true);
  const p = JSON.parse(f.calls.find(c => c.url.endsWith("/rpc/payroll_ingest")).init.body).p_payload.payslip;
  assert.equal(p.is_correction, true); assert.equal(p.period_label, "2026-30"); assert.equal(p.corrected_period_ref, "2026-30");
  assert.equal(p.payment_date, "2026-07-28", "el pago adicional conserva su fecha de pago");
});

test("endpoint: el mismo PDF otra vez no crea otra nómina", async () => {
  env(); const f = fakeFetch({ duplicateFile: true }), r = res();
  await makeHandler({ fetchImpl: f })(post(good()), r);
  assert.equal(r.body.duplicate, true);
  assert.ok(!f.calls.some(c => c.url.includes("/storage/") || c.url.endsWith("/rpc/payroll_ingest")));
});

test("reconoce 'Loon overwerkuren 150%' (formato SD Worx W40/W41) y cuadra el bruto", () => {
  // Nómina FICTICIA: se mueve 1 h del ORT a horas extra sin cambiar el bruto total.
  const r = structuredClone(rows);
  const declOrt = r.find(x => x.items[0].s === "ORT -Loon onregelmatige uren 130");
  declOrt.items.find(i => i.s === "20:00 à").s = "19:00 à";
  r.splice(r.indexOf(declOrt) + 1, 0, { ...declOrt, y: declOrt.y - 1, items: [
    { ...declOrt.items[0], s: "Loon overwerkuren 150" }, { ...declOrt.items[1], s: "1:00 à" },
    { ...declOrt.items[2], s: "150,00%" }, { ...declOrt.items[3], s: "15,00" }, { ...declOrt.items[4], s: "22,50" }] });
  const tableOrt = r.find(x => x.items[0].s === "ORT -Loon onregelmatige uren 130%");
  tableOrt.items.forEach(i => { if (i.s === "390,00") i.s = "367,50"; });
  r.splice(r.indexOf(tableOrt) + 1, 0, { ...tableOrt, y: tableOrt.y - 1, items: tableOrt.items.map((i, k) => ({ ...i, s: k === 0 ? "Loon overwerkuren 150%" : i.s === "367,50" ? "22,50" : i.s })) });
  const p = parseSdWorx(r), s = p.payslip;
  assert.equal(s.overtime_pay, 22.5); assert.equal(s.shift_allowance, 367.5);
  assert.equal(s.overtime_hours, 1); assert.equal(s.worked_hours, 30);
  assert.ok(p.checks.every(c => c.passed), JSON.stringify(p.checks));
  assert.ok(p.line_items.some(l => l.code === "overtime_pay" && l.label_original === "Loon overwerkuren 150%"));
});
