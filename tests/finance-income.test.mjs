// My Finance · Fase 2A: ingreso confirmado sin duplicados. Datos FICTICIOS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { categorizeAll } from "../microapps/gastos/categories.js";
import { incomeBreakdown, isConfirmedPayslip } from "../microapps/finance/income.js";
import { payDate } from "../payroll.js";

let n = 0;
const tx = (date, name, amount, extra = {}) => ({ id: `i${n++}`, payload: { date, name, amount, code: "OV", bank: "ING", ...extra } });
const slip = (number, week, net, extra = {}) => ({ id: `p${number}`, payslip_number: String(number), period_type: "weekly", period_year: 2026,
  period_number: week, period_label: `2026-W${week}`, is_correction: false, net_payment: net, review_status: "approved", validation_status: "verified", ...extra });
// W36 → cobro mié 2026-09-09 · W37 → 16-09 · W38 → 23-09 · W39 → 30-09
const txs = [
  tx("2026-09-09", "SD WORX STAFFING SOLUTIONS B.V.", 600, { payslip_numbers: [22] }),
  tx("2026-09-16", "SD WORX STAFFING SOLUTIONS B.V.", 700, { payslip_numbers: [23] }),
  tx("2026-09-23", "SD WORX STAFFING SOLUTIONS B.V.", 650, { payslip_numbers: [24] }),
  tx("2026-09-25", "Belastingdienst toeslag", 120, { description: "zorgtoeslag" }),
  tx("2026-09-26", "Albert Heijn 1", -80)
];
const items = categorizeAll(txs);
const payslips = [slip(22, 36, 600), slip(23, 37, 690), slip(24, 38, 650, { review_status: "pending", validation_status: "review_required" }), slip(25, 39, 640)];
const run = (extra = {}) => incomeBreakdown({ items, txs, payslips, month: "2026-09", expectedDate: payDate, lastImport: "2026-09-30", ...extra });

test("el ingreso del mes sigue siendo solo el del banco: las nóminas no se suman otra vez", () => {
  const r = run();
  assert.equal(r.earned, 2070);
  assert.equal(r.salary, 1950);
  assert.equal(r.other, 120);
  assert.equal(r.salary + r.other, r.earned);
  assert.equal(r.confirmed + r.unverified, r.salary);
});

test("cada cobro de nómina recibe su estado", () => {
  const byDate = Object.fromEntries(run().rows.map(x => [x.date, x]));
  assert.equal(byDate["2026-09-09"].status, "confirmed");
  assert.equal(byDate["2026-09-16"].status, "difference");
  assert.equal(byDate["2026-09-16"].diff, 10);
  assert.equal(byDate["2026-09-23"].status, "review");
  assert.equal(run().confirmed, 600);
});

test("nómina aprobada que no llegó al banco: aviso solo si el extracto ya cubre esa fecha", () => {
  const r = run();
  assert.deepEqual(r.missing.map(p => p.number), ["25"]);
  assert.equal(r.missing[0].date, "2026-09-30");
  const early = run({ lastImport: "2026-09-26" });
  assert.deepEqual(early.missing, []);
  assert.deepEqual(early.notImported.map(p => p.number), ["25"]);
  assert.equal(r.complete, false);
});

test("ingreso con número de nómina desconocido queda sin enlazar y no cuenta como confirmado", () => {
  const extra = [...txs, tx("2026-09-30", "SD WORX STAFFING SOLUTIONS B.V.", 640, { payslip_numbers: [99] })];
  const r = incomeBreakdown({ items: categorizeAll(extra), txs: extra, payslips, month: "2026-09", expectedDate: payDate, lastImport: "2026-09-30" });
  const row = r.rows.find(x => x.numbers[0] === "99");
  assert.equal(row.status, "unlinked");
  assert.equal(r.salary, 2590);
  assert.equal(r.confirmed, 600);
});

test("nóminas rechazadas o fallidas se ignoran; correcciones usan su fecha de pago", () => {
  assert.equal(isConfirmedPayslip({ review_status: "approved", validation_status: "failed" }), false);
  assert.equal(isConfirmedPayslip({ review_status: "not_required" }), true);
  const ps = [...payslips, slip(30, 39, 50, { id: "corr", is_correction: true, payment_date: "2026-09-29" })];
  const r = run({ payslips: ps });
  assert.ok(r.missing.some(p => p.id === "corr" && p.date === "2026-09-29"));
  const rejected = run({ payslips: payslips.map(p => p.id === "p25" ? { ...p, review_status: "rejected" } : p) });
  assert.deepEqual(rejected.missing, []);
});

test("mes sin movimientos ni nóminas: todo a cero y completo", () => {
  const r = incomeBreakdown({ items, txs, payslips, month: "2026-07", expectedDate: payDate, lastImport: "2026-09-30" });
  assert.deepEqual([r.earned, r.salary, r.other, r.rows.length, r.missing.length], [0, 0, 0, 0, 0]);
  assert.equal(r.complete, true);
});
