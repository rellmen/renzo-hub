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

// --- Etapa B: fijos y suscripciones ---
import { recurring, fixedFlags, addMonth, freeMoney } from "../microapps/finance/insights.js";

const fixedSample = () => categorizeAll([
  tx("2026-07-01", "Huurbaas Ficticio", -1350, { description: "huur" }), tx("2026-08-01", "Huurbaas Ficticio", -1350, { description: "huur" }), tx("2026-09-01", "Huurbaas Ficticio", -1350, { description: "huur" }),
  tx("2026-09-03", "K. Ficticia", 675, { code: "GT", counterparty: "NL00TEST" }),
  tx("2026-08-04", "Spotify P2C", -11.99), tx("2026-09-04", "Spotify P2C", -11.99),
  tx("2026-09-25", "Centraal Beheer verzekering", -62.4),
  tx("2026-08-15", "Basic-Fit Nederland", -34.99), tx("2026-09-15", "Basic-Fit Nederland", -34.99),
  tx("2026-08-20", "Kapsalon Ficticio", -25), tx("2026-09-21", "Kapsalon Ficticio", -27),
  ...["02", "09", "16", "23"].map(d => tx(`2026-09-${d}`, "Albert Heijn 1234", -40)), tx("2026-08-10", "Albert Heijn 1234", -35),
  tx("2026-08-05", "Jumbo Weert", -30), tx("2026-08-19", "Jumbo Weert", -28), tx("2026-09-05", "Jumbo Weert", -29), tx("2026-09-19", "Jumbo Weert", -30),
  tx("2026-08-21", "McDonald's Weert", -11.9), tx("2026-09-21", "McDonald's Weert", -11.9),
  tx("2026-08-11", "Restaurant Ficticio", -20), tx("2026-09-11", "Restaurant Ficticio", -95)
]);

test("fecha prevista: mismo día del mes siguiente, ajustado a fin de mes", () => {
  assert.equal(addMonth("2026-09-04"), "2026-10-04");
  assert.equal(addMonth("2026-01-31"), "2026-02-28");
  assert.equal(addMonth("2026-12-15"), "2027-01-15");
});

test("fijos: categoría fija, repetidos con importe parecido y aporte al alquiler que resta", () => {
  const r = recurring(fixedSample(), "2026-09");
  const by = Object.fromEntries(r.items.map(i => [i.name, i]));
  assert.equal(by["Huurbaas Ficticio"].monthly, 1350); assert.equal(by["Huurbaas Ficticio"].source, "categoria");
  assert.equal(by["Huurbaas Ficticio"].nextDate, "2026-10-01");
  assert.equal(by["K. Ficticia"].monthly, -675); assert.ok(by["K. Ficticia"].contribution);
  assert.equal(by["Spotify"].subscription, true);
  assert.equal(by["Centraal Beheer Verzekering"].source, "categoria", "un seguro cuenta aunque solo haya un mes");
  assert.equal(by["Basic-Fit Nederland"].source, "repetido");
  assert.equal(by["Kapsalon Ficticio"].source, "repetido", "25 € y 27 €: dentro del ±20 %");
  assert.ok(!by["Albert Heijn"], "el supermercado (4 veces al mes) no es fijo");
  assert.ok(!by["Restaurant Ficticio"], "importes muy distintos: no es fijo");
  assert.ok(!by["Jumbo"], "súper con importe parecido cada quincena: gasto variable, no fijo");
  assert.ok(!by["McDonald's"], "restaurante con el mismo importe: variable salvo que lo marques");
  assert.equal(r.total, 1350 - 675 + 11.99 + 62.4 + 34.99 + 26);
  assert.equal(r.subscriptions, 11.99);
});

test("tus marcas mandan: 'no es fijo' lo quita y 'es fijo' lo añade", () => {
  const flags = fixedFlags([{ payload: { merchant: "basic-fit nederland", fixed: false } }, { payload: { merchant: "restaurant ficticio", fixed: true } }, { payload: { merchant: "spotify", category: "ocio" } }]);
  assert.equal(flags.size, 2, "una regla solo de categoría no es una marca de fijo");
  const r = recurring(fixedSample(), "2026-09", flags);
  const names = r.items.map(i => i.name);
  assert.ok(!names.includes("Basic-Fit Nederland"));
  const rest = r.items.find(i => i.name === "Restaurant Ficticio");
  assert.equal(rest.source, "manual"); assert.equal(rest.monthly, 57.5, "mediana de 20 y 95");
});

test("aporte al alquiler con 'huur' en la descripción también resta de los fijos", () => {
  const items = categorizeAll([tx("2026-09-01", "Huurbaas Ficticio", -1350, { description: "huur" }), tx("2026-09-03", "K. Ficticia", 675, { description: "Huur deel" })]);
  const r = recurring(items, "2026-09");
  assert.equal(r.total, 675);
  assert.equal(r.items.find(i => i.name === "K. Ficticia").contribution, true);
  assert.deepEqual(r.items.map(i => i.name), ["Huurbaas Ficticio", "K. Ficticia"], "el aporte va justo debajo del alquiler");
});

test("dinero libre = ingresos − fijos; sin ingresos no se inventa", () => {
  assert.equal(freeMoney(2400, 870.38), 1529.62);
  assert.equal(freeMoney(0, 100), null);
});

// --- Etapa C: presupuesto semanal (miércoles a martes) ---
import { payWeek, shiftWeek, spendBetween, suggestBudgets, budgetWeek } from "../microapps/finance/insights.js";
import { CATEGORIES } from "../microapps/gastos/categories.js";
const EXPENSE = new Set(CATEGORIES.filter(c => c.kind === "expense").map(c => c.id));

test("semana de cobro: de miércoles a martes", () => {
  assert.deepEqual(payWeek("2026-10-07"), { start: "2026-10-07", end: "2026-10-13" }); // miércoles
  assert.deepEqual(payWeek("2026-10-12"), { start: "2026-10-07", end: "2026-10-13" }); // lunes
  assert.deepEqual(payWeek("2026-10-13"), { start: "2026-10-07", end: "2026-10-13" }); // martes
  assert.deepEqual(payWeek("2026-10-14"), { start: "2026-10-14", end: "2026-10-20" });
  assert.equal(shiftWeek("2026-10-07", -1), "2026-09-30");
});

const weekly = () => categorizeAll([
  tx("2026-09-09", "Albert Heijn", -40), tx("2026-09-12", "Albert Heijn", -30), // semana 9–15 sep: 70
  tx("2026-09-16", "Albert Heijn", -50), tx("2026-09-18", "Jumbo", -30),          // 16–22: 80
  tx("2026-09-23", "Albert Heijn", -60), tx("2026-09-24", "Shell Leende", -50),   // 23–29: 60
  tx("2026-09-30", "Albert Heijn", -55), tx("2026-10-01", "Albert Heijn", 5, { description: "retour" }), // 30 sep–6 oct: 50
  tx("2026-10-08", "Albert Heijn", -45), tx("2026-10-09", "Restaurant Ficticio", -30)                     // 7–13 oct
]);

test("gasto de una semana por categoría; las devoluciones restan", () => {
  const s = spendBetween(weekly(), "2026-09-30", "2026-10-06", EXPENSE);
  assert.equal(s.get("supermercado"), 50);
});

test("sugerencia: media de las 4 semanas completas anteriores, redondeada a 5 €", () => {
  const s = suggestBudgets(weekly(), "2026-10-07", EXPENSE);
  assert.equal(s.get("supermercado"), 65); // (70 + 80 + 60 + 50) / 4
  assert.equal(s.get("gasolina"), 15);     // 50 / 4 = 12,5 → 15
});

test("estado del presupuesto: gastado, lo que queda, aviso al 80 % y pasado", () => {
  const b = budgetWeek(weekly(), { supermercado: 50, restaurantes: 25, gasolina: 40, alquiler: 0 }, "2026-10-07", EXPENSE, "2026-10-12");
  const by = Object.fromEntries(b.rows.map(r => [r.category, r]));
  assert.equal(by.supermercado.spent, 45); assert.equal(by.supermercado.status, "warn"); assert.equal(by.supermercado.left, 5);
  assert.equal(by.restaurantes.status, "over"); assert.equal(by.restaurantes.left, -5);
  assert.equal(by.gasolina.spent, 0); assert.equal(by.gasolina.status, "ok");
  assert.ok(!by.alquiler, "un límite de 0 no cuenta");
  assert.equal(b.rows[0].category, "restaurantes", "primero lo más gastado en proporción");
  assert.equal(b.limit, 115); assert.equal(b.used, 75); assert.equal(b.daysLeft, 2);
});

test("cobertura: avisa si la semana aún no está importada (no enseña 0 € como si fuera real)", () => {
  const items = weekly().filter(i => i.date <= "2026-09-30");
  assert.equal(budgetWeek(items, { supermercado: 50 }, "2026-10-07", EXPENSE, "2026-10-12").coverage, "none");
  assert.equal(budgetWeek(items, { supermercado: 50 }, "2026-09-30", EXPENSE, "2026-10-12").coverage, "partial");
  assert.equal(budgetWeek(weekly(), { supermercado: 50 }, "2026-09-23", EXPENSE, "2026-10-12").coverage, "full");
});
