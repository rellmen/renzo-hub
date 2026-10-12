// My Finance · panel "Presupuesto semanal" del Resumen (etapa C).
// Semana de miércoles a martes (Renzo cobra los miércoles). Límite por categoría guardado en un solo registro
// hub_records money/money_budget, payload.weekly = { categoria: euros }. Sin migraciones.
// Los datos del banco llegan al importar el extracto: si la semana no está importada se dice, no se enseña 0 €.
import { createRecords } from "../records.js";
import { esc, euro, localDay, noticeHTML } from "../ui.js";
import { CATEGORIES, CATEGORY } from "../gastos/categories.js";
import { payWeek, shiftWeek, budgetWeek, suggestBudgets, spendBetween, FIXED_HINT } from "./insights.js";

// Los fijos (alquiler, seguros, suscripciones…) ya tienen su panel: el presupuesto semanal es para el gasto variable.
const EXPENSE = new Set(CATEGORIES.filter(c => c.kind === "expense" && c.id !== "sin_categoria" && !FIXED_HINT.has(c.id)).map(c => c.id));
const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const range = (a, b) => a.slice(5, 7) === b.slice(5, 7) ? `${Number(a.slice(8))}–${day(b)}` : `${day(a)} – ${day(b)}`;
const STATUS = { ok: "", warn: " fx-bud--warn", over: " fx-bud--over" };

export function createBudgetPanel({ db, getUser, today = () => localDay() }) {
  const records = createRecords(db, getUser, { domain: "money", type: "money_budget" });
  let record = null, week = "", editing = false, busy = false, error = "", notice = "";
  const weekly = () => ({ ...(record?.payload?.weekly || {}) });

  async function save(values, ctx) {
    busy = true; error = ""; notice = ""; ctx.rerender();
    try {
      const payload = { ...(record?.payload || {}), weekly: values, week_starts: "wednesday" };
      record = record ? await records.update(record.id, { title: "Presupuesto semanal", payload }) : await records.add({ title: "Presupuesto semanal", payload });
      editing = false; notice = "Presupuesto guardado.";
    } catch (e) { error = e.message; }
    busy = false; ctx.rerender();
  }

  function editorHTML(items, current) {
    // Anclado al último extracto importado: si es antiguo, las sugerencias salen de esas semanas, no de semanas vacías.
    const last = items.reduce((m, i) => i.date > m ? i.date : m, "") || today();
    const anchor = last < current ? shiftWeek(payWeek(last).start, 1) : current;
    const sug = suggestBudgets(items, anchor, EXPENSE);
    const recent = spendBetween(items, shiftWeek(anchor, -8), last, EXPENSE);
    const w = weekly();
    const cats = CATEGORIES.filter(c => EXPENSE.has(c.id) && (recent.has(c.id) || w[c.id]))
      .sort((a, b) => (sug.get(b.id) || 0) - (sug.get(a.id) || 0) || a.name.localeCompare(b.name, "es"));
    if (!cats.length) return `<p class="gx-muted">Importa al menos un extracto para poder crear el presupuesto.</p>`;
    return `<form class="fx-bud-form" data-fx-bud-form>
      <p class="gx-muted fx-note">Límite por semana (miércoles a martes). Deja vacío lo que no quieras controlar. La sugerencia es tu media de las últimas 4 semanas.</p>
      <ul class="fx-bud-edit">${cats.map(c => `<li><label for="fxBud-${esc(c.id)}"><span aria-hidden="true">${esc(c.icon)}</span> ${esc(c.name)}${sug.has(c.id) ? `<small>Sugerido: ${esc(euro(sug.get(c.id)))}</small>` : ""}</label>
        <span class="fx-bud-input"><input id="fxBud-${esc(c.id)}" name="${esc(c.id)}" type="number" inputmode="decimal" min="0" step="5" value="${w[c.id] ? esc(w[c.id]) : ""}" placeholder="${sug.has(c.id) ? esc(sug.get(c.id)) : "—"}" data-suggest="${esc(sug.get(c.id) || "")}"><span aria-hidden="true">€</span></span></li>`).join("")}</ul>
      <div class="mx-actions fx-bud-actions"><button type="submit" class="primary" data-fx-bud-save ${busy ? "disabled" : ""}>${busy ? "Guardando…" : "Guardar presupuesto"}</button>
        ${sug.size ? `<button type="button" class="secondary" data-fx-bud-suggest>Usar sugerencias</button>` : ""}<button type="button" class="secondary" data-fx-bud-cancel>Cancelar</button></div>
    </form>`;
  }

  function rowHTML(r) {
    const c = CATEGORY[r.category], width = Math.min(100, r.pct);
    return `<li class="fx-row fx-bud${STATUS[r.status]}" data-bud="${esc(r.category)}">
      <span class="fx-row-icon" aria-hidden="true">${esc(c?.icon || "•")}</span>
      <span class="fx-row-name">${esc(c?.name || r.category)}<small>${esc(euro(r.spent))} de ${esc(euro(r.limit))}</small></span>
      <span class="fx-bud-left">${r.left >= 0 ? `Quedan<b>${esc(euro(r.left))}</b>` : `Te pasas<b>${esc(euro(-r.left))}</b>`}</span>
      <span class="fx-row-bar" role="img" aria-label="${r.pct} % del límite"><i style="width:${width}%"></i></span>
    </li>`;
  }

  return {
    setData(fin) { record = fin.budget || null; },
    reset() { record = null; week = ""; editing = busy = false; error = notice = ""; },
    html(items) {
      const now = today(), current = payWeek(now).start;
      if (!week) week = current;
      const b = budgetWeek(items, weekly(), week, EXPENSE, now);
      const first = items.length ? payWeek(items.reduce((m, i) => i.date < m ? i.date : m, items[0].date)).start : current;
      const canOlder = week > first, canNewer = week < current;
      const head = `<div class="fx-panel-head"><h2>Presupuesto semanal</h2>${b.rows.length && !editing ? `<button type="button" class="fx-link" data-fx-bud-edit>Editar</button>` : ""}</div>`;
      const nav = `<nav class="fx-weeknav" aria-label="Cambiar de semana">
        <button type="button" class="secondary" data-fx-week="-1" ${canOlder ? "" : "disabled"} aria-label="Semana anterior">‹</button>
        <span><b>${esc(range(b.start, b.end))}</b><small>${b.isCurrent ? `Esta semana · ${b.daysLeft === 1 ? "último día" : `quedan ${b.daysLeft} días`}` : "Miércoles a martes"}</small></span>
        <button type="button" class="secondary" data-fx-week="1" ${canNewer ? "" : "disabled"} aria-label="Semana siguiente">›</button></nav>`;
      const cover = b.coverage === "none" ? `<button type="button" class="fx-alert" data-fx-go="gastos" data-fx-focus="import"><span aria-hidden="true">!</span><span><b>Esta semana aún no está importada</b><small>Tus datos llegan hasta el ${esc(b.dataUntil ? day(b.dataUntil) : "—")}. Importa el extracto para verla.</small></span><span aria-hidden="true">›</span></button>`
        : b.coverage === "partial" ? `<p class="fx-cover gx-muted">Datos del banco hasta el ${esc(day(b.dataUntil))}: lo posterior aún no está.</p>` : "";
      let body;
      if (editing) body = editorHTML(items, current);
      else if (!b.rows.length) body = `<div class="fx-bud-empty"><p class="gx-muted">Pon un límite semanal a las categorías que quieras controlar (súper, restaurantes, gasolina…). Te sugiero cifras según lo que gastas de verdad.</p><button type="button" class="primary" data-fx-bud-edit>Crear presupuesto</button></div>`;
      else if (b.coverage === "none") body = `${cover}<p class="fx-bud-limits gx-muted">Tus límites: ${b.rows.map(r => `${esc(CATEGORY[r.category]?.name || r.category)} ${esc(euro(r.limit))}`).join(" · ")}</p>`;
      else body = `${cover}<ul class="fx-rows">${b.rows.map(rowHTML).join("")}</ul>
        <p class="fx-bud-total">Total: <b>${esc(euro(b.used))}</b> de ${esc(euro(b.limit))} · ${b.left >= 0 ? `quedan <b>${esc(euro(b.left))}</b>` : `te pasas <b>${esc(euro(-b.left))}</b>`}</p>`;
      return `<section class="card fx-panel" data-fx-budget>${head}${noticeHTML(error, "error")}${noticeHTML(notice)}${editing ? "" : nav}${body}</section>`;
    },
    handleClick(target, ctx) {
      const wk = target.closest("[data-fx-week]");
      if (wk) { week = shiftWeek(week || payWeek(today()).start, Number(wk.dataset.fxWeek)); notice = ""; ctx.rerender(); ctx.root?.querySelector(`[data-fx-week="${wk.dataset.fxWeek}"]:not([disabled])`)?.focus(); return true; }
      if (target.closest("[data-fx-bud-edit]")) { editing = true; notice = ""; ctx.rerender(); ctx.root?.querySelector("[data-fx-bud-form] input")?.focus(); return true; }
      if (target.closest("[data-fx-bud-cancel]")) { editing = false; ctx.rerender(); return true; }
      if (target.closest("[data-fx-bud-suggest]")) {
        target.closest("[data-fx-budget]")?.querySelectorAll("[data-fx-bud-form] input").forEach(i => { if (!i.value && i.dataset.suggest) i.value = i.dataset.suggest; });
        return true;
      }
      return false;
    },
    // Guardar con el botón o con Intro en cualquier campo (el Resumen evita que el formulario recargue la página).
    handleSubmit(form, ctx) {
      if (!form.matches("[data-fx-bud-form]") || busy) return false;
      const values = {};
      for (const input of form.querySelectorAll("input[name]")) { const v = Number(String(input.value).replace(",", ".")); if (input.value !== "" && Number.isFinite(v) && v > 0) values[input.name] = Math.round(v * 100) / 100; }
      save(values, ctx); return true;
    }
  };
}
