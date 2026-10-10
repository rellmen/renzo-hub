// Kit de microapps: capa de datos (records.js) y generador (tools/new-microapp.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createRecords, RECORD_DOMAINS } from "../microapps/records.js";

// Cliente falso que registra la consulta construida.
function fakeDb(result = { data: [], error: null }) {
  const calls = [];
  const builder = table => {
    const q = { table, ops: [] };
    calls.push(q);
    const chain = new Proxy({}, {
      get(_, key) {
        if (key === "then") return (ok, bad) => Promise.resolve(result).then(ok, bad);
        return (...args) => { q.ops.push([key, ...args]); return chain; };
      }
    });
    return chain;
  };
  return { calls, from: builder };
}
const user = () => ({ id: "u1" });

test("records: solo dominios permitidos por el CHECK de hub_records y tipos válidos", () => {
  assert.deepEqual(RECORD_DOMAINS, ["personal", "work", "body", "money", "learning", "news", "system"]);
  assert.throws(() => createRecords(fakeDb(), user, { domain: "otros", type: "note" }), /Dominio/);
  assert.throws(() => createRecords(fakeDb(), user, { domain: "personal", type: "Nota mala" }), /Tipo/);
});

test("records: list filtra por dueño, dominio y tipo", async () => {
  const db = fakeDb({ data: [{ id: "1" }], error: null });
  const rows = await createRecords(db, user, { domain: "personal", type: "note" }).list();
  assert.deepEqual(rows, [{ id: "1" }]);
  const ops = db.calls[0].ops;
  assert.equal(db.calls[0].table, "hub_records");
  for (const f of [["eq", "owner_id", "u1"], ["eq", "domain", "personal"], ["eq", "record_type", "note"]])
    assert.ok(ops.some(o => JSON.stringify(o) === JSON.stringify(f)), JSON.stringify(f));
});

test("records: add fija dueño, dominio, tipo y origen manual; rechaza payload no objeto", async () => {
  const db = fakeDb({ data: { id: "n1" }, error: null });
  const store = createRecords(db, user, { domain: "personal", type: "note" });
  await store.add({ title: "Hola", payload: { body: "x" }, owner_id: "otro" });
  const insert = db.calls[0].ops.find(o => o[0] === "insert")[1];
  assert.deepEqual(insert, { title: "Hola", payload: { body: "x" }, owner_id: "u1", domain: "personal", record_type: "note", source: "manual" });
  await assert.rejects(store.add({ title: "x", payload: [1] }), /payload/);
});

test("records: sin sesión no guarda y los errores de Supabase se propagan", async () => {
  await assert.rejects(createRecords(fakeDb(), () => null, { domain: "personal", type: "note" }).add({ title: "x" }), /Inicia sesión/);
  await assert.rejects(createRecords(fakeDb({ data: null, error: { message: "RLS" } }), user, { domain: "personal", type: "note" }).list(), /RLS/);
});

test("generador: crea módulo, entrada de registro y caché; rechaza ids repetidos", () => {
  const dir = mkdtempSync(join(tmpdir(), "renzo-microapp-"));
  const repo = new URL("../", import.meta.url).pathname;
  for (const p of ["tools", "microapps", "sw.js"]) cpSync(join(repo, p), join(dir, p), { recursive: true });
  const run = (...args) => execFileSync(process.execPath, [join(dir, "tools/new-microapp.mjs"), ...args], { encoding: "utf8", stdio: "pipe" });
  run("habits", "Hábitos", "body", "--tab");
  assert.ok(existsSync(join(dir, "microapps/habits/habits.js")));
  const mod = readFileSync(join(dir, "microapps/habits/habits.js"), "utf8");
  assert.match(mod, /export function mountHabits\(/);
  assert.match(mod, /domain: "body", type: "habit"/);
  assert.match(readFileSync(join(dir, "microapps/registry.js"), "utf8"), /\{ id: "habits", name: "Hábitos", area: "body", module: "\/microapps\/habits\/habits.js", mount: "mountHabits", tab: "Hábitos" \}/);
  assert.match(readFileSync(join(dir, "sw.js"), "utf8"), /'\/microapps\/habits\/habits.js'/);
  assert.throws(() => run("payroll", "X", "money"), /ya existe/);
  assert.throws(() => run("Mala-Id", "X", "money"));
});
