// Tests del Bloque 1 · ejecutar con: npm test  (Node 24, sin dependencias)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("dbSource solo devuelve valores aceptados por hub_records_source_check", async () => {
  const { dbSource, DB_SOURCES } = await import("../world.js");
  for (const v of ["manual", "capture", "import", "automation", "ai_draft"]) assert.equal(dbSource(v), v);
  assert.equal(dbSource("jarvis"), "automation");
  assert.equal(dbSource("portfolio"), "manual");
  assert.equal(dbSource(undefined), "manual");
  assert.equal(dbSource("JARVIS"), "automation");
  for (const v of ["x", "", null, "telegram", "portfolio"]) assert.ok(DB_SOURCES.has(dbSource(v)));
});

test("world.js y world-extensions.js no escriben source inválido en la columna", () => {
  const w = read("world.js"), x = read("world-extensions.js");
  assert.ok(!w.includes('source:item.source||"manual"'));
  assert.ok(w.includes("source:dbSource(item.source)"));
  assert.ok(w.includes("upsertIndividually"), "fallback registro a registro presente");
  // source:"portfolio" solo puede aparecer dentro del payload, no como columna
  assert.ok(!/\}, source:"portfolio"/.test(x));
});

function mockRes() {
  return { statusCode: 0, headers: {}, body: null,
    setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
}

test("/api/jarvis: nómina con confianza 1.0 queda en needs_review (sin auto-registro en Money)", async () => {
  process.env.JARVIS_INBOUND_TOKEN = "test-inbound-token-123";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  process.env.JARVIS_OWNER_ID = "11111111-1111-4111-8111-111111111111";
  let posted = null;
  globalThis.fetch = async (url, opts) => { posted = { url: String(url), body: JSON.parse(opts.body), headers: opts.headers }; return { ok: true, status: 201 }; };
  const { default: handler } = await import("../api/jarvis.js");
  const res = mockRes();
  await handler({ method: "POST", headers: { authorization: "Bearer test-inbound-token-123" },
    body: { type: "payslip", title: "Nómina semana 40", eventId: "evt-1", confidence: 1,
      extracted: { net: 650.5, gross: 820, period: "2026-W40" } } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, "needs_review");
  assert.equal(res.body.requiresReview, true);
  assert.equal(posted.body.record_type, "renzo_inbox");
  assert.equal(posted.body.requires_review, true);
  assert.equal(posted.body.status, "needs_review");
  assert.equal(posted.body.source, "automation");
  assert.ok(!("authorization" in posted.headers), "sb_secret no se envía como Bearer");
});

test("/api/jarvis: token incorrecto no puede escribir", async () => {
  const { default: handler } = await import("../api/jarvis.js");
  let called = false; globalThis.fetch = async () => { called = true; return { ok: false }; };
  const res = mockRes();
  await handler({ method: "POST", headers: { authorization: "Bearer wrong" }, body: { type: "note", title: "x" } }, res);
  assert.equal(res.statusCode, 401); // cae en salida → requiere sesión
  assert.equal(called, false);
});

test("perfil corporal: saneado de entradas", async () => {
  const { sanitizeBodyProfile } = await import("../profile.js");
  const p = sanitizeBodyProfile({ startWeight: "84,5", height: "1.70", kcalMin: "", phases: "78, 74–75, <script>", proteinMax: "-3" });
  assert.equal(p.startWeight, 84.5); assert.equal(p.height, 1.7);
  assert.ok(!("kcalMin" in p)); assert.ok(!("proteinMax" in p));
  assert.deepEqual(p.phases, ["78", "74–75"]);
});

test("index.html: sin script inline, sin registro público y sin datos corporales fijos", () => {
  const h = read("index.html");
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(h), "no hay <script> inline (CSP sin unsafe-inline)");
  assert.ok(h.includes('<script type="module" src="/app.js"></script>'));
  assert.ok(!h.includes("signupBtn"));
  for (const s of ["84 kg", "1,70 m", "2.100–2.200", "150–170 g", "78 kg", "74–75 kg"]) assert.ok(!h.includes(s), s);
  assert.ok(!read("app.js").includes("signUp("));
});

test("Vercel: no publica docs, SQL ni scripts y envía cabeceras de seguridad", () => {
  const ig = read(".vercelignore").split("\n").map(s => s.trim());
  for (const p of ["*.md", "supabase/", "scripts/", "integrations/", "tests/", "docs/"]) assert.ok(ig.includes(p), p);
  const v = JSON.parse(read("vercel.json"));
  const all = v.headers.find(h => h.source === "/(.*)").headers.map(h => h.key);
  for (const k of ["Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Permissions-Policy"]) assert.ok(all.includes(k), k);
  const csp = v.headers.find(h => h.source === "/(.*)").headers.find(h => h.key === "Content-Security-Policy").value;
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp));
});

test("sw.js precachea los módulos nuevos", () => {
  const s = read("sw.js");
  assert.ok(s.includes("'/app.js'") && s.includes("'/profile.js'"));
});
