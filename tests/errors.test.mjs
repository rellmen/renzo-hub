// Registro de errores de la app (microapps/errors.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { installErrorLog, shouldIgnore, normalizeError } from "../microapps/errors.js";

function fakeDb() {
  const inserts = [];
  const chain = q => new Proxy({}, { get(_, k) {
    if (k === "then") return (ok, bad) => Promise.resolve({ data: q.row ? { id: "x", ...q.row } : [], error: null }).then(ok, bad);
    return (...a) => { if (k === "insert") { q.row = a[0]; inserts.push(a[0]); } return chain(q); };
  } });
  return { inserts, from: () => chain({}) };
}
const tick = () => new Promise(r => setTimeout(r, 0));

test("ignora ruido de extensiones, ResizeObserver y Realtime sin red", () => {
  assert.ok(shouldIgnore("ResizeObserver loop completed with undelivered notifications."));
  assert.ok(shouldIgnore("x", "chrome-extension://abc/content.js"));
  assert.ok(shouldIgnore("WebSocket connection to 'wss://a.supabase.co/realtime/v1/websocket' failed"));
  assert.ok(!shouldIgnore("TypeError: x is undefined", "https://renzo-hub.vercel.app/app.js"));
});

test("normaliza y recorta mensajes y pila", () => {
  const n = normalizeError(new Error("a".repeat(500)));
  assert.equal(n.message.length, 300);
  assert.ok(n.stack.split("\n").length <= 6);
  assert.equal(normalizeError("texto").message, "texto");
});

test("guarda en hub_records system/app_error, deduplica y limita a 20 por sesión", async () => {
  const db = fakeDb();
  const log = installErrorLog(db, () => ({ id: "u1" }), { win: null, release: async () => "2.9.1" });
  assert.equal(log.report(new Error("fallo A"), { source: "/app.js", line: 3 }), true);
  assert.equal(log.report(new Error("fallo A"), { source: "/app.js", line: 3 }), false, "duplicado");
  await tick(); await tick();
  assert.equal(db.inserts.length, 1);
  const row = db.inserts[0];
  assert.equal(row.domain, "system"); assert.equal(row.record_type, "app_error"); assert.equal(row.owner_id, "u1");
  assert.equal(row.title, "fallo A"); assert.equal(row.status, "open"); assert.equal(row.payload.release, "2.9.1"); assert.equal(row.payload.line, 3);
  for (let i = 0; i < 30; i++) log.report(new Error("e" + i));
  assert.equal(log.sent, 20);
});

test("sin sesión guarda en cola y lo envía al iniciar sesión", async () => {
  const db = fakeDb(); let user = null;
  const log = installErrorLog(db, () => user, { win: null });
  log.report(new Error("antes de entrar")); await tick();
  assert.equal(db.inserts.length, 0);
  user = { id: "u1" }; await log.flush();
  assert.equal(db.inserts.length, 1); assert.equal(db.inserts[0].title, "antes de entrar");
});
