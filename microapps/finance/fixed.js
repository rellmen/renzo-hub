// My Finance · panel "Gastos fijos y suscripciones" del Resumen (etapa B).
// Detecta lo que se repite cada mes (microapps/finance/insights.js → recurring) y deja corregirlo:
// "No es fijo" y "Añadir un fijo" se guardan como marca en la regla del comercio (hub_records money/money_rule,
// payload.fixed), la misma regla que guarda su categoría. Sin migraciones.
import { createRecords } from "../records.js";
import { esc, euro, emptyHTML, noticeHTML } from "../ui.js";
import { CATEGORY } from "../gastos/categories.js";
import { recurring, fixedFlags, freeMoney } from "./insights.js";
import { monthSummary } from "../gastos/categories.js";

const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const SOURCE = { manual: "Marcado por ti", categoria: "Cada mes", repetido: "Se repite cada mes" };
const TOP = 6;

export function computeFixed(items, rules, month) {
  const r = recurring(items, month, fixedFlags(rules));
  const s = monthSummary(items, month);
  return { ...r, earned: s.earned, free: freeMoney(s.earned, r.total), share: s.earned > 0 ? Math.round(r.total / s.earned * 100) : null };
}

export function createFixedPanel({ db, getUser }) {
  const records = createRecords(db, getUser, { domain: "money", type: "money_rule" });
  let rules = [], busy = false, error = "", notice = "", showAll = false;

  async function setFixed(key, name, fixed, ctx) {
    if (busy) return;
    busy = true; error = ""; notice = ""; ctx.rerender();
    try {
      const existing = rules.find(r => r.payload?.merchant === key);
      const payload = { ...(existing?.payload || {}), merchant: key, fixed };
      if (existing) await records.update(existing.id, { title: existing.title || `${name} · regla`, payload });
      else await records.add({ title: `${name} · ${fixed ? "fijo" : "no es fijo"}`, payload });
      notice = fixed ? `${name} cuenta ahora como gasto fijo.` : `${name} ya no cuenta como gasto fijo.`;
      busy = false; await ctx.reload();
    } catch (e) { busy = false; error = e.message; ctx.rerender(); }
  }

  function rowHTML(f) {
    const cat = CATEGORY[f.category];
    const meta = f.contribution ? "Aporte al alquiler · resta"
      : `${f.subscription ? "Suscripción" : SOURCE[f.source]}${f.nextDate ? ` · ~${esc(day(f.nextDate))}` : ""}`;
    return `<li class="fx-row fx-fixed-row" data-fixed="${esc(f.key)}">
      <span class="fx-row-icon" aria-hidden="true">${esc(f.contribution ? "↙" : cat?.icon || "•")}</span>
      <span class="fx-row-name">${esc(f.name)}<small>${meta}</small></span>
      <span class="fx-row-total">${esc(euro(f.monthly))}<button type="button" class="fx-link fx-unfix" data-fx-unfix="${esc(f.key)}" data-name="${esc(f.name)}" ${busy ? "disabled" : ""} aria-label="${esc(f.name)} no es un gasto fijo">No es fijo</button></span>
    </li>`;
  }

  return {
    setData(fin) { rules = fin.rules || []; },
    reset() { rules = []; busy = false; error = notice = ""; showAll = false; },
    html(items, month) {
      if (!month) return "";
      const f = computeFixed(items, rules, month);
      const candidates = [...new Map(items.filter(i => i.date.startsWith(month) && i.amount < 0 && CATEGORY[i.category]?.kind === "expense")
        .map(i => [i.merchant.toLowerCase(), i.merchant])).entries()].filter(([k]) => !f.items.some(x => x.key === k)).sort((a, b) => a[1].localeCompare(b[1], "es"));
      return `<section class="card fx-panel" data-fx-fixed>
        <h2>Gastos fijos y suscripciones</h2>${noticeHTML(error, "error")}${noticeHTML(notice)}
        ${f.items.length ? `<dl class="fx-split fx-fixed-kpis">
          <div><dt>Fijos al mes</dt><dd>${esc(euro(f.total))}</dd><small>${f.share == null ? "sin ingresos este mes" : `${f.share} % de tus ingresos`}</small></div>
          <div><dt>Dinero libre</dt><dd>${esc(f.free == null ? "Sin datos" : euro(f.free))}</dd><small>para lo variable y ahorrar</small></div></dl>
          ${f.subscriptions ? `<p class="fx-subs gx-muted">Suscripciones: <b>${esc(euro(f.subscriptions))}</b> al mes</p>` : ""}
          <ul class="fx-rows">${(showAll ? f.items : f.items.slice(0, TOP)).map(rowHTML).join("")}</ul>${!showAll && f.items.length > TOP ? `<button type="button" class="secondary fx-more" data-fx-fixed-all>Ver los ${f.items.length} fijos</button>` : ""}` : emptyHTML("Aún no se ven gastos que se repitan cada mes. Con 2 meses de extractos aparecen solos.")}
        ${candidates.length ? `<details class="fx-add"><summary>Añadir un gasto fijo</summary>
          <div class="fx-add-row"><label class="sr-only" for="fxAddFixed">Comercio</label><select id="fxAddFixed" data-fx-add-select>${candidates.map(([k, n]) => `<option value="${esc(k)}">${esc(n)}</option>`).join("")}</select>
          <button type="button" class="secondary" data-fx-add ${busy ? "disabled" : ""}>Añadir</button></div></details>` : ""}
        <p class="gx-muted fx-note">Fijo = alquiler, seguros, suscripciones, teléfono y energía, más lo que se repite una vez al mes con importe parecido. "~" es la fecha prevista, no confirmada.</p>
      </section>`;
    },
    handleClick(target, ctx) {
      if (target.closest("[data-fx-fixed-all]")) { showAll = true; ctx.rerender(); return true; }
      const un = target.closest("[data-fx-unfix]");
      if (un) { setFixed(un.dataset.fxUnfix, un.dataset.name, false, ctx); return true; }
      if (target.closest("[data-fx-add]")) {
        const sel = target.closest("[data-fx-fixed]")?.querySelector("[data-fx-add-select]");
        if (sel?.value) setFixed(sel.value, sel.selectedOptions[0]?.textContent || sel.value, true, ctx);
        return true;
      }
      return false;
    }
  };
}
