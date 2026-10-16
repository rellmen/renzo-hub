// My Finance · Fase 2A "Ingreso confirmado".
// El ingreso del mes sigue saliendo SOLO del banco (una sola fuente, sin duplicados). Las nóminas no suman
// dinero: sirven para confirmar cada cobro de nómina del banco, señalar diferencias y avisar de nóminas
// aprobadas que no aparecen en el banco. Funciones puras: se prueban en tests/finance-income.test.mjs.
import { monthSummary } from "../gastos/categories.js";
import { matchPayslips } from "../bank/ing-csv.js";

const round = n => Math.round(n * 100) / 100;
const TOLERANCE = 0.02;
export const isConfirmedPayslip = p => ["approved", "not_required"].includes(p?.review_status) && p?.validation_status !== "failed";
const usable = p => p && p.review_status !== "rejected" && p.validation_status !== "failed";

// Estados de un cobro de nómina en el banco:
//   confirmed   · todas sus nóminas están aprobadas y el importe coincide (±0,02 €)
//   difference  · nóminas aprobadas, pero el banco recibió otra cantidad
//   review      · alguna de sus nóminas está pendiente de revisar
//   unlinked    · no se encontró la nómina (número desconocido o ingreso sin número)
export function incomeBreakdown({ items = [], txs = [], payslips = [], month, expectedDate, lastImport = null }) {
  const s = monthSummary(items, month);
  const inMonth = t => String(t.date || "").startsWith(month);
  const raw = txs.map(tx => ({ id: tx.id, ...(tx.payload || tx) })).filter(t => inMonth(t) && Number(t.amount) > 0);
  const itemById = new Map(items.map(i => [i.id, i]));
  // Misma clasificación que el Resumen (categoría "nomina"), para que salario + otros = ingresos del mes.
  const salary = raw.filter(t => itemById.get(t.id)?.category === "nomina");
  const valid = payslips.filter(usable);
  const matches = matchPayslips(valid, salary, expectedDate);

  const rows = salary.map(t => {
    const nums = (t.payslip_numbers || []).map(String);
    const linked = valid.filter(p => matches.get(p.id)?.date === t.date && nums.includes(String(p.payslip_number)));
    const m = linked.length ? matches.get(linked[0].id) : null;
    let status = "unlinked";
    if (linked.length && linked.length === nums.length) {
      if (!linked.every(isConfirmedPayslip)) status = "review";
      else status = Math.abs(m.diff) <= TOLERANCE ? "confirmed" : "difference";
    }
    return { id: t.id, date: t.date, amount: round(Number(t.amount)), numbers: nums, status,
      expected: m ? m.expected : null, diff: m ? m.diff : null, payslipIds: linked.map(p => p.id) };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const sum = list => round(list.reduce((acc, r) => acc + r.amount, 0));
  const salaryTotal = sum(rows);
  const linkedIds = new Set([...matches.keys()]);
  const due = valid.filter(p => isConfirmedPayslip(p) && !linkedIds.has(p.id) && String(expectedDate(p) || "").startsWith(month))
    .map(p => ({ id: p.id, number: String(p.payslip_number ?? ""), period: p.period_label || null, date: expectedDate(p),
      net: round(Number(p.net_payment ?? p.net_salary ?? 0)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  // Solo es "no está en el banco" si el extracto ya llega hasta esa fecha; si no, falta importar.
  const missing = lastImport ? due.filter(p => p.date <= lastImport) : [];
  const notImported = due.filter(p => !lastImport || p.date > lastImport);

  return {
    month, earned: s.earned, salary: salaryTotal,
    confirmed: sum(rows.filter(r => r.status === "confirmed")),
    unverified: sum(rows.filter(r => r.status !== "confirmed")),
    other: round(s.earned - salaryTotal),
    rows, missing, notImported,
    complete: rows.every(r => r.status === "confirmed") && !missing.length && !notImported.length
  };
}
