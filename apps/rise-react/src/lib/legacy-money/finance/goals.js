// Exact Classic goal model (normalized and historical fields unchanged).
// My Finance · Fase 2C "Objetivos". Funciones puras (tests/finance-goals.test.mjs).
// Tipos elegidos por Renzo (16 oct 2026): fondo de emergencia, meta con fecha y aporte mensual a inversión.
// Datos: hub_records money/money_goal. El progreso sale solo de datos verificables (banco y fijos reales).
import { monthSummary } from "../gastos/categories.js";
import { parseEuro } from "./networth.js";

const round = n => Math.round(n * 100) / 100;
const DAY = 86400000;
export const GOAL_TYPES = Object.freeze({ emergency: "Fondo de emergencia", target: "Meta con fecha", invest: "Aporte mensual a inversión" });

const monthsBetween = (from, to) => { const out = []; let [y, m] = from.split("-").map(Number); const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) { out.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } } return out; };
const pct = (now, goal) => goal > 0 ? Math.max(0, Math.min(100, Math.round(now / goal * 100))) : null;

// Valida y normaliza lo que se guarda. Devuelve { ok, goal } o { ok:false, error }.
export function normalizeGoal(input) {
  const type = String(input?.type || "");
  if (!GOAL_TYPES[type]) return { ok: false, error: "Elige un tipo de objetivo." };
  const name = String(input.name || GOAL_TYPES[type]).trim().slice(0, 60);
  const num = v => typeof v === "number" ? v : parseEuro(v);
  if (type === "emergency") {
    const months = num(input.months);
    if (!Number.isFinite(months) || months < 1 || months > 24) return { ok: false, error: "Meses de fondo: entre 1 y 24." };
    return { ok: true, goal: { type, name, months: Math.round(months * 10) / 10 } };
  }
  if (type === "target") {
    const amount = num(input.amount), date = String(input.date || ""), start = String(input.start || "");
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Importe de la meta mayor que 0." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Fecha límite obligatoria." };
    if (!/^\d{4}-\d{2}$/.test(start)) return { ok: false, error: "Mes de inicio obligatorio." };
    if (start > date.slice(0, 7)) return { ok: false, error: "El inicio no puede ser después de la fecha límite." };
    return { ok: true, goal: { type, name, amount: round(amount), date, start } };
  }
  const monthly = num(input.monthly);
  if (!Number.isFinite(monthly) || monthly <= 0) return { ok: false, error: "Aporte mensual mayor que 0." };
  return { ok: true, goal: { type, name, monthly: round(monthly) } };
}

// ctx: { items (categorizados), today "YYYY-MM-DD", month "YYYY-MM", cash (saldo bancario o null), fixedMonthly (o null), months (con datos) }
export function goalProgress(goal, ctx) {
  // month = mes que se está viendo en el Resumen (por defecto, el de hoy); today = fecha real para los plazos.
  const today = ctx.today, month = ctx.month || today.slice(0, 7);
  if (goal.type === "emergency") {
    if (ctx.fixedMonthly == null || ctx.fixedMonthly <= 0) return { ...goal, status: "nodata", reason: "Sin gastos fijos detectados para calcular el fondo." };
    const target = round(goal.months * ctx.fixedMonthly);
    if (ctx.cash == null) return { ...goal, target, status: "nodata", reason: "Sin saldo bancario conocido." };
    const current = round(Math.max(0, ctx.cash));
    return { ...goal, target, current, missing: round(Math.max(0, target - current)), pct: pct(current, target), status: current >= target ? "done" : "progress",
      coverMonths: round(current / ctx.fixedMonthly) };
  }
  if (goal.type === "target") {
    const months = monthsBetween(goal.start, month).filter(m => ctx.months.includes(m));
    const saved = round(months.reduce((s, m) => s + monthSummary(ctx.items, m).net, 0));
    const missing = round(Math.max(0, goal.amount - saved));
    const daysLeft = Math.ceil((Date.parse(`${goal.date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
    const weeks = daysLeft > 0 ? Math.ceil(daysLeft / 7) : 0;
    const status = saved >= goal.amount ? "done" : daysLeft < 0 ? "late" : "progress";
    return { ...goal, current: saved, missing, pct: pct(Math.max(0, saved), goal.amount), status, weeksLeft: weeks,
      perWeek: status === "progress" && weeks > 0 ? round(missing / weeks) : null, monthsCounted: months.length };
  }
  const invested = m => round(ctx.items.filter(i => i.date.startsWith(m) && i.category === "inversion" && i.amount < 0).reduce((s, i) => s - i.amount, 0));
  const current = invested(month);
  const history = ctx.months.filter(m => m < month).sort().slice(-3).map(m => ({ month: m, amount: invested(m), met: invested(m) >= goal.monthly }));
  return { ...goal, current, missing: round(Math.max(0, goal.monthly - current)), pct: pct(current, goal.monthly), status: current >= goal.monthly ? "done" : "progress", history };
}
