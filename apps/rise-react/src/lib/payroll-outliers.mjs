// Aviso automático de nóminas fuera de lo normal (Fase A, 31-10-2026).
// Solo lectura: compara cada nómina con la mediana de las nóminas ya revisadas anteriores.
// No aprueba, no rechaza, no modifica nada: el aviso es una pregunta para Renzo, no una conclusión.
const REFERENCE_STATUSES = new Set(["approved", "reviewed", "not_required"]);
export const OUTLIER_RATIO = 0.7; // por debajo del 70 % de lo habitual se avisa
export const MIN_REFERENCES = 4; // con menos historial no se avisa (no hay "normal" fiable)
const WINDOW = 8; // nóminas revisadas anteriores que cuentan como referencia

const num = (v) => { const n = typeof v === "string" ? Number(v) : v; return typeof n === "number" && Number.isFinite(n) ? n : null; };
const netOf = (r) => num(r.net_payment) ?? num(r.net_salary);
const dateOf = (r) => String(r.period_end || r.payment_date || "");
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const round2 = (n) => Math.round(n * 100) / 100;

/** Devuelve un aviso para la nómina `row` o null si es normal o no hay historial suficiente. */
export function payrollOutlier(row, rows) {
  if (!row || row.review_status === "rejected") return null;
  const net = netOf(row);
  if (net === null) return null;
  const refs = rows
    .filter((r) => r.id !== row.id && REFERENCE_STATUSES.has(r.review_status) && dateOf(r) && dateOf(r) < dateOf(row) && netOf(r) !== null)
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
    .slice(0, WINDOW);
  if (refs.length < MIN_REFERENCES) return null;
  const usualNet = median(refs.map(netOf));
  if (!(usualNet > 0) || net >= usualNet * OUTLIER_RATIO) return null;
  const hourRefs = refs.map((r) => num(r.worked_hours)).filter((h) => h !== null);
  const hours = num(row.worked_hours);
  const usualHours = hourRefs.length >= MIN_REFERENCES ? median(hourRefs) : null;
  let cause = "unknown";
  if (hours !== null && usualHours) cause = hours < usualHours * OUTLIER_RATIO ? "fewer_hours" : "deductions";
  const question = {
    fewer_hours: "Las horas también bajan: ¿hubo vacaciones, baja, festivo o menos turnos esa semana?",
    deductions: "Las horas son normales pero el neto baja: revisa deducciones, retenciones o conceptos que falten.",
    unknown: "Confirma las horas trabajadas de esa semana y si hubo vacaciones o baja.",
  }[cause];
  return {
    level: "warning", cause, net: round2(net), usualNet: round2(usualNet), ratio: round2(net / usualNet),
    hours, usualHours, references: refs.length, question,
  };
}

/** Avisos de todas las nóminas, en el mismo orden que `rows`. */
export function payrollOutliers(rows = []) {
  return rows.map((r) => ({ id: r.id, outlier: payrollOutlier(r, rows) })).filter((x) => x.outlier);
}
