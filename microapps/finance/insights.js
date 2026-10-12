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
