// My Finance · cálculos del Resumen a partir de los movimientos del banco ya categorizados
// (microapps/gastos/categories.js). Funciones puras, sin red ni DOM: se prueban en tests/finance.test.mjs.
// Nada se inventa: si falta un dato se devuelve null y la interfaz muestra "sin datos".
import { monthSummary, monthsOf } from "../gastos/categories.js";

const round = n => Math.round(n * 100) / 100;

// "2026-09" → "2026-08"
export function prevMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}
export function nextMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

// Mes anterior y siguiente que tienen movimientos (para las flechas ‹ ›).
export function neighbours(items, month) {
  const months = monthsOf(items); // de más reciente a más antiguo
  const i = months.indexOf(month);
  return { older: i >= 0 ? months[i + 1] || null : null, newer: i > 0 ? months[i - 1] : null };
}

// Variación en % (null si no hay base con la que comparar).
export const change = (now, before) => before > 0 ? Math.round((now - before) / before * 100) : null;

// Resumen del mes: ahorro real (ingresos − gastos; los traspasos entre tus cuentas no cuentan),
// tasa de ahorro y comparación con el mes anterior, total y por categoría.
export function monthInsights(items, month) {
  const cur = monthSummary(items, month);
  const before = prevMonth(month);
  const hasPrev = items.some(i => i.date.startsWith(before));
  const prev = hasPrev ? monthSummary(items, before) : null;
  const prevBy = new Map((prev?.expenses || []).map(g => [g.id, g.total]));
  const categories = cur.expenses.filter(g => g.total > 0).map(g => {
    const p = prevBy.get(g.id) ?? 0;
    return { id: g.id, name: g.name, icon: g.icon, total: g.total, count: g.count, prevTotal: prev ? p : null,
      delta: prev ? round(g.total - p) : null, change: prev ? change(g.total, p) : null,
      share: cur.spent > 0 ? Math.round(g.total / cur.spent * 100) : 0 };
  });
  return {
    month, count: cur.count, earned: cur.earned, spent: cur.spent,
    savings: cur.net, rate: cur.earned > 0 ? Math.round(cur.net / cur.earned * 100) : null,
    uncategorized: cur.uncategorized, categories,
    prev: prev ? { month: before, earned: prev.earned, spent: prev.spent, savings: prev.net } : null,
    spentChange: prev ? change(cur.spent, prev.spent) : null,
    savingsDelta: prev ? round(cur.net - prev.net) : null
  };
}

// Última fecha importada por banco: { ING: "2026-09-30", Revolut: null }.
export function lastImported(items) {
  const out = {};
  for (const i of items) { const bank = /revolut/i.test(i.bank) ? "Revolut" : "ING"; if (!out[bank] || i.date > out[bank]) out[bank] = i.date; }
  return out;
}

// Dinero pasado a Revolut en el mes cuando aún no hay ningún extracto de Revolut importado:
// lo que se gaste desde Revolut no se ve, así que el gasto puede estar incompleto.
export function revolutGap(items, month) {
  if (items.some(i => /revolut/i.test(i.bank))) return 0;
  return round(items.filter(i => i.date.startsWith(month) && i.category === "traspaso" && i.amount < 0 && /revolut/i.test(i.name)).reduce((s, i) => s - i.amount, 0));
}

// --- Gastos fijos y suscripciones (etapa B) ---
// Un comercio es fijo si:
//   · lo marcaste tú como fijo (regla money_rule con fixed: true), o
//   · es de una categoría que suele ser fija (alquiler, seguros, suscripciones, teléfono, energía), o
//   · aparece en al menos 2 de los últimos 3 meses, una sola vez al mes y con importe parecido (±20 %),
//     salvo en categorías de gasto variable (súper, restaurantes, gasolina, compras, transporte…), que solo cuentan si las marcas tú.
// Lo que marcaste como "no es fijo" (fixed: false) nunca cuenta. Los aportes al alquiler restan.
export const FIXED_HINT = new Set(["alquiler", "seguros", "suscripciones", "telefono", "energia"]);
const WINDOW = 3;
export const VARIABLE = new Set(["supermercado", "restaurantes", "gasolina", "compras", "transporte", "viajes", "coche", "personas_enviado", "salud", "familia", "deudas", "otros_gastos"]);
const median = xs => { const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Misma fecha un mes después (31 ene → 28/29 feb): fecha prevista, no confirmada.
export function addMonth(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return `${ny}-${String(nm).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

// flags: Map merchantKey → true | false (de las reglas del usuario).
export function fixedFlags(rules = []) {
  const out = new Map();
  for (const r of rules) { const p = r.payload || r; if (p.merchant && typeof p.fixed === "boolean") out.set(p.merchant, p.fixed); }
  return out;
}

export function recurring(items, month, flags = new Map()) {
  const months = [month]; for (let i = 1; i < WINDOW; i++) months.push(prevMonth(months[i - 1]));
  const inWindow = items.filter(i => months.includes(i.date.slice(0, 7)) && i.date.slice(0, 7) <= month);
  const byMerchant = new Map();
  for (const i of inWindow) {
    // Dinero que entra en Alquiler (aporte de quien comparte piso, con o sin "huur" en la descripción) resta.
    const isContribution = i.amount > 0 && (i.contribution || i.category === "alquiler");
    if (!isContribution && !(i.amount < 0)) continue;
    if (["traspaso", "prestamos", "nomina"].includes(i.category)) continue;
    const key = i.merchant.toLowerCase();
    if (!byMerchant.has(key)) byMerchant.set(key, { key, name: i.merchant, category: i.category, contribution: isContribution, perMonth: new Map(), lastDate: i.date, count: 0 });
    const g = byMerchant.get(key);
    g.perMonth.set(i.date.slice(0, 7), (g.perMonth.get(i.date.slice(0, 7)) || []).concat(-i.amount));
    g.count++; if (i.date > g.lastDate) { g.lastDate = i.date; g.category = i.category; }
  }
  const out = [];
  for (const g of byMerchant.values()) {
    const flag = flags.get(g.key);
    if (flag === false) continue;
    const sums = [...g.perMonth.values()].map(v => v.reduce((a, b) => a + b, 0));
    const maxPerMonth = Math.max(...[...g.perMonth.values()].map(v => v.length));
    const med = median(sums);
    const steady = !VARIABLE.has(g.category) && g.perMonth.size >= 2 && maxPerMonth === 1 && sums.every(s => Math.abs(s - med) <= Math.abs(med) * 0.2);
    const source = flag === true ? "manual" : FIXED_HINT.has(g.category) && maxPerMonth <= 2 ? "categoria" : steady ? "repetido" : null;
    if (!source) continue;
    out.push({ key: g.key, name: g.name, category: g.category, monthly: round(med), months: g.perMonth.size, lastDate: g.lastDate,
      nextDate: g.contribution ? null : addMonth(g.lastDate), source, contribution: g.contribution, subscription: g.category === "suscripciones" });
  }
  out.sort((a, b) => b.monthly - a.monthly);
  // Los aportes al alquiler van justo debajo del alquiler, para leer el coste real de un vistazo.
  const contribs = out.filter(r => r.contribution), rest = out.filter(r => !r.contribution);
  const at = rest.findIndex(r => r.category === "alquiler");
  rest.splice(at < 0 ? rest.length : at + 1, 0, ...contribs);
  out.length = 0; out.push(...rest);
  const total = round(out.reduce((s, r) => s + r.monthly, 0));
  return { items: out, total, subscriptions: round(out.filter(r => r.subscription).reduce((s, r) => s + r.monthly, 0)) };
}

// Dinero libre del mes: ingresos − fijos (lo que queda para el gasto variable y el ahorro).
export function freeMoney(earned, fixedTotal) {
  return earned > 0 ? round(earned - fixedTotal) : null;
}

// --- Presupuesto semanal (etapa C) ---
// La semana va de miércoles a martes: Renzo cobra los miércoles, así cada semana empieza con la nómina.
const DAY_MS = 86400000;
const iso = ms => new Date(ms).toISOString().slice(0, 10);
const utc = d => Date.parse(`${d}T00:00:00Z`);
export function payWeek(date) {
  const t = utc(date), dow = new Date(t).getUTCDay(); // 0 domingo … 3 miércoles
  const start = t - ((dow - 3 + 7) % 7) * DAY_MS;
  return { start: iso(start), end: iso(start + 6 * DAY_MS) };
}
export const shiftWeek = (start, n) => iso(utc(start) + n * 7 * DAY_MS);

// Gasto por categoría en un rango de fechas (abonos restan, como en el resumen mensual).
export function spendBetween(items, start, end, expenseIds) {
  const out = new Map();
  for (const i of items) {
    if (i.date < start || i.date > end || !expenseIds.has(i.category)) continue;
    out.set(i.category, round((out.get(i.category) || 0) - i.amount));
  }
  return out;
}

// Sugerencia por categoría: media semanal de las últimas 4 semanas completas con datos (redondeada a 5 €).
export function suggestBudgets(items, weekStart, expenseIds, weeks = 4) {
  const last = items.reduce((m, i) => i.date > m ? i.date : m, "");
  const sums = new Map(); let counted = 0;
  for (let k = 1; k <= 12 && counted < weeks; k++) {
    const start = shiftWeek(weekStart, -k), end = iso(utc(start) + 6 * DAY_MS);
    if (end > last || !items.some(i => i.date >= start && i.date <= end)) continue;
    counted++;
    for (const [c, v] of spendBetween(items, start, end, expenseIds)) sums.set(c, (sums.get(c) || 0) + v);
  }
  const out = new Map();
  if (!counted) return out;
  for (const [c, v] of sums) { const avg = v / counted; if (avg > 0) out.set(c, Math.max(5, Math.round(avg / 5) * 5)); }
  return out;
}

// Estado del presupuesto en una semana. budgets: { categoria: límite semanal }.
// dataUntil: última fecha importada; si la semana no está cubierta, se avisa en vez de enseñar 0 €.
export function budgetWeek(items, budgets, weekStart, expenseIds, today) {
  const end = iso(utc(weekStart) + 6 * DAY_MS);
  const spent = spendBetween(items, weekStart, end, expenseIds);
  const dataUntil = items.reduce((m, i) => i.date > m ? i.date : m, "");
  const rows = Object.entries(budgets || {}).filter(([c, v]) => expenseIds.has(c) && Number(v) > 0).map(([category, limit]) => {
    const s = spent.get(category) || 0, l = Number(limit);
    const pct = Math.round(s / l * 100);
    return { category, limit: l, spent: round(s), left: round(l - s), pct, status: s > l ? "over" : pct >= 80 ? "warn" : "ok" };
  }).sort((a, b) => b.pct - a.pct);
  const limit = round(rows.reduce((t, r) => t + r.limit, 0)), used = round(rows.reduce((t, r) => t + r.spent, 0));
  const isCurrent = today >= weekStart && today <= end;
  const daysLeft = isCurrent ? Math.round((utc(end) - utc(today)) / DAY_MS) + 1 : 0;
  return { start: weekStart, end, rows, limit, used, left: round(limit - used), daysLeft, isCurrent,
    dataUntil: dataUntil || null, coverage: !dataUntil || dataUntil < weekStart ? "none" : dataUntil < (isCurrent ? today : end) ? "partial" : "full" };
}
