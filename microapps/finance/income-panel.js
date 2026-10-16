// My Finance · panel "Ingresos del mes" del Resumen (Fase 2A, ingreso confirmado).
// Lee las nóminas (solo lectura, RLS por usuario) y las cruza con los cobros del banco. No suma nada nuevo:
// el ingreso del mes es el del banco; aquí se ve cuánto está confirmado por una nómina aprobada.
import { esc, euro, noticeHTML } from "../ui.js";
import { incomeBreakdown } from "./income.js";
import { lastImported } from "./insights.js";
import { payDate } from "../../payroll.js";

const COLS = "id,payslip_number,period_type,period_year,period_number,period_label,is_correction,payment_date,period_end,document_date,net_payment,net_salary,review_status,validation_status";
const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const STATUS = {
  confirmed: ["Confirmada", "fx-chip--good", "Coincide con la nómina aprobada"],
  difference: ["Diferencia", "fx-chip--bad", ""],
  review: ["Por revisar", "fx-chip--flat", "La nómina está pendiente de revisar"],
  unlinked: ["Sin nómina", "fx-chip--bad", "No hay una nómina que encaje con este cobro"]
};

export async function loadPayslipsForIncome(db, uid) {
  const { data, error } = await db.from("payroll_payslips").select(COLS).eq("user_id", uid).order("period_start", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return data || [];
}

export function createIncomePanel({ db, getUser }) {
  let payslips = [], txs = [], error = "";

  return {
    async setData(fin) {
      txs = fin.txs || []; error = "";
      const uid = getUser()?.id; if (!uid) return;
      try { payslips = await loadPayslipsForIncome(db, uid); } catch (e) { payslips = []; error = `No se pudieron leer las nóminas: ${e.message}`; }
    },
    html(items, month) {
      if (!month) return "";
      const r = incomeBreakdown({ items, txs, payslips, month, expectedDate: payDate, lastImport: lastImported(items).ING || null });
      if (!r.earned && !r.missing.length && !r.notImported.length) return "";
      const rows = r.rows.map(x => {
        const [label, cls, hint] = STATUS[x.status];
        const detail = x.status === "difference" ? `Nómina ${euro(x.expected)} · banco ${euro(x.amount)} (${x.diff > 0 ? "+" : "−"}${euro(Math.abs(x.diff))})` : hint;
        return `<li class="fx-row" data-fx-income-row="${esc(x.status)}"><span class="fx-row-icon" aria-hidden="true">💼</span>
          <span class="fx-row-name">${esc(day(x.date))}${x.numbers.length ? ` · nómina nº ${esc(x.numbers.join(", "))}` : ""}<small>${esc(detail)}</small></span>
          <span class="fx-row-total">${esc(euro(x.amount))}<span class="fx-chip ${cls}">${esc(label)}</span></span></li>`;
      }).join("");
      const missing = r.missing.map(p => `<li class="fx-row" data-fx-income-missing><span class="fx-row-icon" aria-hidden="true">!</span>
        <span class="fx-row-name">Nómina nº ${esc(p.number)}${p.period ? ` (${esc(p.period)})` : ""}<small>Aprobada, se esperaba el ${esc(day(p.date))} y no está en el banco</small></span>
        <span class="fx-row-total">${esc(euro(p.net))}<span class="fx-chip fx-chip--bad">No cobrada</span></span></li>`).join("");
      const pending = r.notImported.length ? `<p class="gx-muted fx-note">${r.notImported.length === 1 ? "1 nómina aprobada se cobra" : `${r.notImported.length} nóminas aprobadas se cobran`} después del último extracto importado; importa uno más reciente para comprobarla.</p>` : "";
      return `<section class="card fx-panel" data-fx-income>
        <h2>Ingresos del mes</h2>${noticeHTML(error, "error")}
        <dl class="fx-split"><div><dt>Nómina confirmada</dt><dd data-fx-income-confirmed>${esc(euro(r.confirmed))}</dd><small>de ${esc(euro(r.salary))} cobrados de nómina</small></div>
          <div><dt>Otros ingresos</dt><dd>${esc(euro(r.other))}</dd><small>toeslagen, personas y otros</small></div></dl>
        ${rows || missing ? `<ul class="fx-rows">${rows}${missing}</ul>` : ""}${pending}
        <p class="gx-muted fx-note">El total de ingresos sale solo del banco; las nóminas confirman cada cobro y nunca se suman dos veces.</p>
      </section>`;
    },
    reset() { payslips = []; txs = []; error = ""; }
  };
}
