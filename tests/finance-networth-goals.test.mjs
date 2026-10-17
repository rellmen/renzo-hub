// My Finance · Fase 2B Patrimonio y 2C Objetivos. Datos FICTICIOS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { categorizeAll, categorize } from "../microapps/gastos/categories.js";
import { accountBalances, latestValuations, netWorth, netWorthHistory, monthEnd } from "../microapps/finance/networth.js";
import { normalizeGoal, goalProgress } from "../microapps/finance/goals.js";

let n = 0;
const tx = (date, name, amount, balance, extra = {}) => ({ id: `n${n++}`, payload: { date, name, amount, balance, code: "BA", bank: "ING", account: "…0001", ...extra } });
const txs = [
  tx("2026-08-28", "SD WORX STAFFING SOLUTIONS B.V.", 1000, 1500, { payslip_numbers: [1] }),
  tx("2026-08-30", "Albert Heijn 1", -100, 1400),
  tx("2026-09-02", "Huurbaas", -900, 500, { description: "huur" }),
  tx("2026-09-10", "SD WORX STAFFING SOLUTIONS B.V.", 1200, 1700, { payslip_numbers: [2] }),
  // mismo día: el orden del extracto no importa, el cierre es el que no es punto de partida de otro
  tx("2026-09-20", "Albert Heijn 1", -50, 1550),
  tx("2026-09-20", "Trade Republic Bank GmbH", -100, 1600),
  tx("2026-09-25", "Revolut**1591*", 30, 30, { bank: "Revolut", account: "" })
];
const assets = [
  { id: "a1", updated_at: "2026-09-01T10:00:00Z", payload: { kind: "investment", name: "Trade Republic", value: 2000, date: "2026-08-31" } },
  { id: "a2", updated_at: "2026-09-30T10:00:00Z", payload: { kind: "investment", name: "trade republic", value: 2200, date: "2026-09-30" } },
  { id: "a3", payload: { kind: "debt", name: "Aplazamiento", value: 300, date: "2026-09-15" } },
  { id: "a4", payload: { kind: "investment", name: "Futuro", value: 999, date: "2026-12-01" } },
  { id: "bad", payload: { kind: "debt", name: "", value: 10, date: "2026-09-01" } }
];

test("saldo de cierre por cuenta, también con varios movimientos el mismo día", () => {
  const b = accountBalances(txs, "2026-09-30");
  assert.deepEqual(b.map(x => [x.bank, x.balance, x.date]), [["ING", 1550, "2026-09-20"], ["Revolut", 30, "2026-09-25"]]);
  assert.equal(accountBalances(txs, "2026-08-31")[0].balance, 1400);
  assert.deepEqual(accountBalances([tx("2026-09-01", "x", -5, null)], "2026-09-30"), []);
});

test("valoraciones: la última por nombre y fecha, sin futuras ni inválidas", () => {
  const v = latestValuations(assets, "2026-09-30");
  assert.deepEqual(v.map(x => [x.kind, x.name, x.value]), [["debt", "Aplazamiento", 300], ["investment", "trade republic", 2200]]);
  assert.equal(latestValuations(assets, "2026-08-31").find(x => x.kind === "investment").value, 2000);
});

test("patrimonio neto = cuentas + inversiones − deudas; sin datos → null", () => {
  const nw = netWorth(txs, assets, "2026-09-30");
  assert.deepEqual([nw.cash, nw.invested, nw.owed, nw.total], [1580, 2200, 300, 3480]);
  assert.equal(netWorth([], [], "2026-09-30").total, null);
  const h = netWorthHistory(txs, assets, ["2026-09", "2026-08", "2026-07"]);
  assert.deepEqual(h.map(x => [x.month, x.total, x.change]), [["2026-08", 3400, null], ["2026-09", 3480, 80]]);
  assert.equal(monthEnd("2026-02"), "2026-02-28");
});

test("aportes a plataformas de inversión: categoría propia que no es gasto", () => {
  assert.equal(categorize({ payload: { name: "Trade Republic Bank GmbH", amount: -100 } }).category, "inversion");
  assert.equal(categorize({ payload: { name: "DEGIRO", amount: -50 } }).category, "inversion");
  const items = categorizeAll(txs);
  const sep = items.filter(i => i.date.startsWith("2026-09") && i.category === "inversion");
  assert.equal(sep.length, 1);
});

test("objetivos: validación de lo que se guarda", () => {
  assert.equal(normalizeGoal({ type: "x" }).ok, false);
  assert.equal(normalizeGoal({ type: "emergency", months: 0 }).ok, false);
  assert.deepEqual(normalizeGoal({ type: "emergency", months: "3" }).goal, { type: "emergency", name: "Fondo de emergencia", months: 3 });
  assert.equal(normalizeGoal({ type: "target", amount: 1000, date: "2026-12-31", start: "2027-01" }).ok, false);
  assert.equal(normalizeGoal({ type: "target", amount: "1500,50", date: "2026-12-31", start: "2026-09", name: "Viaje" }).goal.amount, 1500.5);
  assert.equal(normalizeGoal({ type: "invest", monthly: -1 }).ok, false);
});

test("objetivos: progreso con datos verificables", () => {
  const items = categorizeAll(txs);
  const ctx = { items, today: "2026-10-01", month: "2026-09", cash: 1580, fixedMonthly: 900, months: ["2026-09", "2026-08"] };
  const e = goalProgress({ type: "emergency", name: "Fondo", months: 3 }, ctx);
  assert.deepEqual([e.target, e.current, e.missing, e.pct, e.status], [2700, 1580, 1120, 59, "progress"]);
  assert.equal(goalProgress({ type: "emergency", months: 3 }, { ...ctx, fixedMonthly: null }).status, "nodata");
  const t = goalProgress({ type: "target", name: "Viaje", amount: 1000, date: "2026-10-29", start: "2026-08" }, ctx);
  // ahorro agosto (1000−100) + septiembre (1200−900−50) = 1150 ≥ 1000
  assert.deepEqual([t.current, t.status, t.monthsCounted], [1150, "done", 2]);
  const t2 = goalProgress({ type: "target", amount: 3000, date: "2026-10-29", start: "2026-09" }, ctx);
  assert.deepEqual([t2.current, t2.missing, t2.weeksLeft, t2.perWeek], [250, 2750, 4, 687.5]);
  assert.equal(goalProgress({ type: "target", amount: 3000, date: "2026-09-01", start: "2026-09" }, ctx).status, "late");
  const i = goalProgress({ type: "invest", monthly: 150 }, ctx);
  assert.deepEqual([i.current, i.missing, i.status], [100, 50, "progress"]);
  assert.deepEqual(i.history.map(h => [h.month, h.amount, h.met]), [["2026-08", 0, false]]);
});
