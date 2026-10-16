// My Finance · panel "Objetivos" del Resumen (Fase 2C).
// Guarda cada objetivo en hub_records money/money_goal. "Archivar" lo oculta (status archived) sin borrarlo.
import { createRecords } from "../records.js";
import { esc, euro, noticeHTML, localDay } from "../ui.js";
import { GOAL_TYPES, normalizeGoal, goalProgress } from "./goals.js";
import { netWorth, monthEnd } from "./networth.js";
import { computeFixed } from "./fixed.js";
import { monthsOf } from "../gastos/categories.js";

const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const monthShort = m => new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));
const num = n => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(n);
const STATUS = { done: ["Cumplido", "fx-chip--good"], progress: ["En curso", "fx-chip--flat"], late: ["Fuera de plazo", "fx-chip--bad"], nodata: ["Sin datos", "fx-chip--flat"] };

function detail(g) {
  if (g.status === "nodata") return g.reason;
  if (g.type === "emergency") return `${num(g.months)} meses de gastos fijos = ${euro(g.target)} · cubres ${num(g.coverMonths)} meses${g.missing ? ` · faltan ${euro(g.missing)}` : ""}`;
  if (g.type === "target") return g.status === "done" ? `Ahorrado ${euro(g.current)} desde ${monthShort(g.start)}` :
    g.status === "late" ? `Plazo ${day(g.date)} vencido · faltan ${euro(g.missing)}` :
    `Ahorrado ${euro(g.current)} desde ${monthShort(g.start)} · ${g.perWeek == null ? "" : `${euro(g.perWeek)} por semana durante ${g.weeksLeft} semanas`} hasta el ${day(g.date)}`;
  const hist = (g.history || []).map(h => `${monthShort(h.month)} ${h.met ? "✓" : "✗"}`).join(" · ");
  return `Aportado ${euro(g.current)} de ${euro(g.monthly)} este mes${hist ? ` · ${hist}` : ""}`;
}

export function createGoalsPanel({ db, getUser, today = () => localDay() }) {
  const records = createRecords(db, getUser, { domain: "money", type: "money_goal" });
  let goals = [], txs = [], rules = [], assets = [], busy = false, error = "", notice = "";
  const assetsDb = createRecords(db, getUser, { domain: "money", type: "money_asset" });

  async function load() {
    const [g, a] = await Promise.all([records.list({ limit: 100 }), assetsDb.list({ limit: 500 })]);
    goals = g.filter(r => r.status !== "archived"); assets = a;
  }

  return {
    async setData(fin) {
      txs = fin.txs || []; rules = fin.rules || []; error = "";
      if (!getUser()?.id) return;
      try { await load(); } catch (e) { goals = []; error = `No se pudieron leer los objetivos: ${e.message}`; }
    },
    html(items, month) {
      if (!month) return "";
      const now = today(), asOf = monthEnd(month) < now ? monthEnd(month) : now;
      const nw = netWorth(txs, assets, asOf);
      const fixed = computeFixed(items, rules, month);
      const ctx = { items, today: now, month, cash: nw.accounts.length ? nw.cash : null, fixedMonthly: fixed.items.length ? fixed.total : null, months: monthsOf(items) };
      const list = goals.map(r => ({ id: r.id, ...goalProgress(r.payload, ctx) }));
      const rows = list.map(g => {
        const [label, cls] = STATUS[g.status];
        return `<li class="fx-row" data-fx-goal="${esc(g.type)}"><span class="fx-row-icon" aria-hidden="true">${g.type === "emergency" ? "🛟" : g.type === "target" ? "🎯" : "📈"}</span>
          <span class="fx-row-name">${esc(g.name)}<small>${esc(detail(g))}</small>
          ${g.pct == null ? "" : `<span class="fx-row-bar" role="img" aria-label="${g.pct} % completado"><i style="width:${Math.max(3, g.pct)}%"></i></span>`}</span>
          <span class="fx-row-total">${g.pct == null ? "" : `${g.pct} %`}<span class="fx-chip ${cls}">${label}</span>
          <button type="button" class="fx-link" data-fx-goal-archive="${esc(g.id)}" ${busy ? "disabled" : ""}>Archivar</button></span></li>`;
      }).join("");
      const thisMonth = now.slice(0, 7);
      return `<section class="card fx-panel" data-fx-goals>
        <h2>Objetivos</h2>${noticeHTML(error, "error")}${noticeHTML(notice)}
        ${rows ? `<ul class="fx-rows">${rows}</ul>` : `<p class="gx-muted">Sin objetivos todavía.</p>`}
        <details class="fx-add" ${rows ? "" : "open"}><summary>Nuevo objetivo</summary>
          <form class="fx-form" data-fx-goal-form>
            <label>Tipo<select name="type" required>${Object.entries(GOAL_TYPES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select></label>
            <label>Nombre (opcional)<input name="name" maxlength="60" placeholder="Viaje a Perú, colchón…"></label>
            <label>Fondo de emergencia · meses de gastos fijos<input name="months" inputmode="decimal" placeholder="3"></label>
            <label>Meta con fecha · importe (€)<input name="amount" inputmode="decimal" placeholder="1500"></label>
            <label>Meta con fecha · fecha límite<input name="date" type="date" min="${esc(now)}"></label>
            <label>Meta con fecha · ahorro cuenta desde<input name="start" type="month" value="${esc(thisMonth)}"></label>
            <label>Inversión · aporte mensual (€)<input name="monthly" inputmode="decimal" placeholder="150"></label>
            <button type="submit" class="primary" ${busy ? "disabled" : ""}>Guardar objetivo</button>
          </form>
          <p class="gx-muted fx-note">Rellena solo los campos de tu tipo. Fondo: saldo de tus cuentas frente a N meses de gastos fijos reales. Meta: ahorro real (ingresos − gastos del banco) desde el mes de inicio. Inversión: transferencias a Trade Republic, DEGIRO, Scalable y similares.</p>
        </details>
      </section>`;
    },
    handleSubmit(form, ctx) {
      if (!form.matches("[data-fx-goal-form]")) return false;
      const r = normalizeGoal(Object.fromEntries(new FormData(form)));
      error = notice = "";
      if (!r.ok) { error = r.error; ctx.rerender(); return true; }
      if (busy) return true;
      busy = true; ctx.rerender();
      (async () => {
        try { await records.add({ title: r.goal.name, status: "active", payload: r.goal }); await load(); notice = `Objetivo "${r.goal.name}" guardado.`; }
        catch (e) { error = e.message; }
        busy = false; ctx.rerender();
      })();
      return true;
    },
    handleClick(target, ctx) {
      const b = target.closest("[data-fx-goal-archive]");
      if (!b) return false;
      const row = goals.find(g => g.id === b.dataset.fxGoalArchive);
      if (!row || busy) return true;
      busy = true; error = notice = ""; ctx.rerender();
      (async () => {
        try { await records.update(row.id, { status: "archived" }); await load(); notice = `"${row.title}" archivado.`; }
        catch (e) { error = e.message; }
        busy = false; ctx.rerender();
      })();
      return true;
    },
    reset() { goals = []; txs = []; rules = []; assets = []; busy = false; error = notice = ""; }
  };
}
