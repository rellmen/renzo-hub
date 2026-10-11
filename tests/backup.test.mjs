// "Exportar mis datos": lee todas las tablas del usuario y sus archivos, y el JSON sirve para restaurar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { buildExport, EXPORT_TABLES, EXPORT_BUCKETS, daysSince } from "../microapps/backup/export.js";

const UID = "00000000-0000-4000-8000-0000000000aa";
function fakeDb({ failTable = null } = {}) {
  const calls = [];
  const rows = { hub_records: [{ id: "r1", owner_id: UID, record_type: "bank_tx", payload: { amount: -12.5 } }], payroll_payslips: [{ id: "p1", user_id: UID, net_payment: 600 }] };
  const files = { payroll: { [UID]: [{ name: "Payroll", id: null }], [`${UID}/Payroll`]: [{ name: "n1.pdf", id: "f1", metadata: { size: 9, mimetype: "application/pdf" } }] } };
  return {
    calls,
    from(table) {
      const q = { filters: [], select() { return q; }, eq(k, v) { q.filters.push([k, v]); return q; },
        range(a, b) { calls.push({ table, filters: q.filters, a, b }); return Promise.resolve(table === failTable ? { data: null, error: { message: "fallo simulado" } } : { data: (rows[table] || []).slice(a, b + 1), error: null }); } };
      return q;
    },
    storage: { from(bucket) { return {
      list: async prefix => ({ data: files[bucket]?.[prefix] || [], error: null }),
      download: async path => ({ data: new Blob(["%PDF-1.4\n"], { type: "application/pdf" }), error: null, path })
    }; } }
  };
}

test("lee todas las tablas filtrando por su dueño y los archivos de todos los buckets", async () => {
  const db = fakeDb();
  const out = await buildExport(db, UID, { release: "2.14.0", project: "test", now: () => new Date("2026-10-12T10:00:00Z") });
  assert.equal(out.format, "renzo-hub-export"); assert.equal(out.taken_at, "2026-10-12T10:00:00.000Z");
  assert.deepEqual(Object.keys(out.tables), Object.keys(EXPORT_TABLES));
  assert.ok(db.calls.every(c => c.filters.length === 1 && c.filters[0][1] === UID && c.filters[0][0] === EXPORT_TABLES[c.table]), "siempre filtra por el dueño correcto");
  assert.equal(out.counts.hub_records, 1); assert.equal(out.counts.payroll_payslips, 1);
  assert.deepEqual(out.files.map(f => [f.bucket, f.path, f.content_type]), [["payroll", `${UID}/Payroll/n1.pdf`, "application/pdf"]]);
  assert.equal(Buffer.from(out.files[0].base64, "base64").toString(), "%PDF-1.4\n");
  assert.deepEqual(out.errors, []);
  assert.deepEqual(EXPORT_BUCKETS, ["payroll", "hub-private", "portfolio-files", "progress-photos"]);
});

test("si una tabla falla, la copia sigue y lo avisa", async () => {
  const out = await buildExport(fakeDb({ failTable: "gym_plans" }), UID);
  assert.deepEqual(out.errors, ["gym_plans: fallo simulado"]); assert.equal(out.counts.hub_records, 1);
});

test("la copia se restaura con snapshot_to_sql.py y extract_files.py (sin borrar nada)", async () => {
  const out = await buildExport(fakeDb(), UID, { project: "test" });
  const dir = mkdtempSync(join(tmpdir(), "rh-backup-")), file = join(dir, "copia.json");
  writeFileSync(file, JSON.stringify(out));
  const sql = execFileSync("python3", ["-I", "tools/backup/snapshot_to_sql.py", file], { encoding: "utf8" });
  assert.match(sql, /^-- Restauración no destructiva/); assert.match(sql, /insert into public\.hub_records select \* from json_populate_recordset/);
  assert.match(sql, /on conflict do nothing;/); assert.ok(!/delete|truncate|drop/i.test(sql));
  const log = execFileSync("python3", ["-I", "tools/backup/extract_files.py", file, join(dir, "files")], { encoding: "utf8" });
  assert.match(log, /1 archivos/);
  assert.equal(readFileSync(join(dir, "files", "payroll", UID, "Payroll", "n1.pdf"), "utf8"), "%PDF-1.4\n");
});

test("todas las tablas con datos del usuario que crean las migraciones están en la copia", () => {
  const sql = readdirSync("supabase/migrations").map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");
  const created = [...sql.matchAll(/create table (?:if not exists )?public\.([a-z_]+)/gi)].map(m => m[1].toLowerCase());
  const missing = [...new Set(created)].filter(t => !(t in EXPORT_TABLES));
  assert.deepEqual(missing, [], `añade a EXPORT_TABLES: ${missing.join(", ")}`);
});

test("días desde la última copia", () => {
  assert.equal(daysSince(null), null); assert.equal(daysSince("2026-10-05T10:00:00Z", new Date("2026-10-12T11:00:00Z")), 7);
});
