// My Finance · Resumen: ahorro real, comparación con el mes anterior, flechas de mes, último extracto y hueco de Revolut.
// Datos FICTICIOS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { categorizeAll } from "../microapps/gastos/categories.js";
import { prevMonth, nextMonth, neighbours, change, monthInsights, lastImported, revolutGap } from "../microapps/finance/insights.js";

let n = 0;
const tx = (date, name, amount, extra = {}) => ({ id: `t${n++}`, payload: { date, name, amount, code: "BA", bank: "ING", ...extra } });
const sample = () => categorizeAll([
  tx("2026-08-06", "SD WORX STAFFING SOLUTIONS B.V.", 1000, { payslip_numbers: [1] }),
  tx("2026-08-02", "Huurbaas Ficticio", -900, { description: "huur" }),
  tx("2026-08-05", "Albert Heijn 1234", -100),
  tx("2026-09-03", "SD WORX STAFFING SOLUTIONS B.V.", 1200, { payslip_numbers: [2] }),
  tx("2026-09-01", "Huurbaas Ficticio", -900, { description: "huur" }),
  tx("2026-09-05", "Albert Heijn 1234", -150),
  tx("2026-09-07", "Shell Leende", -50),
  tx("2026-09-12", "Revolut**1591* Dublin", -80),
  tx("2026-09-20", "Onbekende Winkel", -20)
]);

test("meses anterior y siguiente, también al cambiar de año", () => {
  assert.equal(prevMonth("2026-09"), "2026-08");
  assert.equal(prevMonth("2026-01"), "2025-12");
  assert.equal(nextMonth("2026-12"), "2027-01");
});

test("flechas: solo a meses que tienen movimientos", () => {
  const items = sample();
  assert.deepEqual(neighbours(items, "2026-09"), { older: "2026-08", newer: null });
  assert.deepEqual(neighbours(items, "2026-08"), { older: null, newer: "2026-09" });
});

test("variación en %: sin base no se inventa", () => {
  assert.equal(change(150, 100), 50);
  assert.equal(change(50, 100), -50);
  assert.equal(change(10, 0), null);
});

test("ahorro real = ingresos − gastos; el traspaso a Revolut no cuenta como gasto", () => {
  const s = monthInsights(sample(), "2026-09");
  assert.equal(s.earned, 1200);
  assert.equal(s.spent, 1120); // 900 + 150 + 50 + 20 sin categoría; los 80 a Revolut son traspaso
  assert.equal(s.savings, 80);
  assert.equal(s.rate, 7);
  assert.equal(s.uncategorized, 1);
});

test("comparación con el mes anterior, total y por categoría", () => {
  const s = monthInsights(sample(), "2026-09");
  assert.deepEqual(s.prev, { month: "2026-08", earned: 1000, spent: 1000, savings: 0 });
  assert.equal(s.spentChange, 12);
  assert.equal(s.savingsDelta, 80);
  const sup = s.categories.find(c => c.id === "supermercado");
  assert.equal(sup.prevTotal, 100); assert.equal(sup.change, 50); assert.equal(sup.delta, 50);
  const gas = s.categories.find(c => c.id === "gasolina");
  assert.equal(gas.prevTotal, 0); assert.equal(gas.change, null, "categoría nueva: sin % inventado");
  assert.deepEqual(s.categories.map(c => c.id).slice(0, 2), ["alquiler", "supermercado"], "ordenadas de mayor a menor");
});

test("primer mes: sin comparación y sin cifras inventadas", () => {
  const s = monthInsights(sample(), "2026-08");
  assert.equal(s.prev, null); assert.equal(s.spentChange, null); assert.equal(s.savingsDelta, null);
  assert.ok(s.categories.every(c => c.change === null && c.prevTotal === null));
});

test("sin ingresos: la tasa de ahorro es null, no 0 %", () => {
  const items = categorizeAll([tx("2026-07-02", "Albert Heijn", -10)]);
  const s = monthInsights(items, "2026-07");
  assert.equal(s.rate, null); assert.equal(s.savings, -10);
});

test("último extracto por banco y aviso de Revolut solo mientras no hay extracto de Revolut", () => {
  const items = sample();
  assert.deepEqual(lastImported(items), { ING: "2026-09-20" });
  assert.equal(revolutGap(items, "2026-09"), 80);
  assert.equal(revolutGap(items, "2026-08"), 0);
  const withRevolut = categorizeAll([...sample().map(i => ({ id: i.id + "x", payload: { date: i.date, name: i.name, amount: i.amount, bank: i.bank } })),
    tx("2026-09-13", "Jumbo", -30, { bank: "Revolut" })]);
  assert.equal(revolutGap(withRevolut, "2026-09"), 0);
  assert.equal(lastImported(withRevolut).Revolut, "2026-09-13");
});
