// My Finance · Resumen del mes (pestaña de entrada del área money).
// Una sola fuente para las cifras: los movimientos del banco (ING y Revolut) categorizados en Gastos.
// Los registros a mano y de Jarvis siguen debajo, en su propio bloque, y no se mezclan con estas cifras.
import { esc, euro, emptyHTML, noticeHTML } from "../ui.js";
import { loadFinance, loadPendingInbox, financeNav } from "./data.js";
import { monthInsights, neighbours, lastImported, revolutGap } from "./insights.js";
import { monthsOf } from "../gastos/categories.js";

export const monthName = m => (t => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`)));
const monthOnly = m => new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));
const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const signed = n => `${n > 0 ? "+" : n < 0 ? "−" : ""}${euro(Math.abs(n))}`;
const TOP = 5;

// Flechas de mes compartidas por Resumen y Gastos.
export function monthNavHTML(items, month) {
  const { older, newer } = neighbours(items, month);
  return `<nav class="fx-monthnav" aria-label="Cambiar de mes">
    <button type="button" class="secondary" data-fx-month="${esc(older || "")}" ${older ? "" : "disabled"} aria-label="${older ? `Ver ${esc(monthName(older))}` : "No hay meses anteriores"}">‹</button>
    <b aria-live="polite">${esc(monthName(month))}</b>
    <button type="button" class="secondary" data-fx-month="${esc(newer || "")}" ${newer ? "" : "disabled"} aria-label="${newer ? `Ver ${esc(monthName(newer))}` : "No hay meses posteriores"}">›</button>
  </nav>`;
}

// Chip de variación: en gastos, subir es malo. Siempre con flecha y texto, no solo color.
export function changeChip(pct, { goodWhenUp = false } = {}) {
  if (pct == null) return `<span class="fx-chip fx-chip--flat">nuevo</span>`;
  if (pct === 0) return `<span class="fx-chip fx-chip--flat">= mes anterior</span>`;
  const up = pct > 0, good = up === goodWhenUp;
  return `<span class="fx-chip ${good ? "fx-chip--good" : "fx-chip--bad"}">${up ? "↑" : "↓"} ${Math.abs(pct)} %</span>`;
}

export function mountFinanceSummary(root, db, getUser, go, { extras = [] } = {}) {
  let items = [], pending = 0, owner = null, loading = false, error = "", month = "";
  if (!root) return { open() {}, close() {}, reset() {}, reload() {} };

  async function load() {
    const uid = getUser()?.id; if (!uid) return;
    owner = uid; loading = true; error = ""; render();
    try {
      const [fin, inbox] = await Promise.all([loadFinance(db, uid), loadPendingInbox(db, uid).catch(() => 0)]);
      if (owner !== uid) return;
      items = fin.items; pending = inbox;
      for (const x of extras) x.setData?.(fin);
      const months = monthsOf(items);
      if (!months.includes(month)) month = months.includes(financeNav.month) ? financeNav.month : months[0] || "";
    } catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) { loading = false; render(); }
  }

  const ctx = () => ({ month, root, rerender: render, reload: load });

  function alertsHTML(s) {
    const out = [];
    if (s.uncategorized) out.push(`<button type="button" class="fx-alert" data-fx-go="gastos" data-fx-focus="sin_categoria"><span aria-hidden="true">?</span><span><b>${s.uncategorized} sin categoría</b><small>Asígnales una para que el resumen sea exacto</small></span><span aria-hidden="true">›</span></button>`);
    const gap = revolutGap(items, month);
    if (gap > 0) out.push(`<button type="button" class="fx-alert" data-fx-go="gastos" data-fx-focus="import"><span aria-hidden="true">⇄</span><span><b>${esc(euro(gap))} a Revolut sin detalle</b><small>Importa su extracto para ver en qué se gastó</small></span><span aria-hidden="true">›</span></button>`);
    if (pending) out.push(`<button type="button" class="fx-alert" data-fx-go="work"><span aria-hidden="true">✦</span><span><b>${pending} por revisar en AI Inbox</b><small>Entradas de dinero de Jarvis y capturas</small></span><span aria-hidden="true">›</span></button>`);
    return out.length ? `<div class="fx-alerts">${out.join("")}</div>` : "";
  }

  function heroHTML(s) {
    const positive = s.savings >= 0;
    const meter = s.earned > 0 ? Math.min(100, Math.round(s.spent / s.earned * 100)) : 100;
    const vs = s.prev ? `<p class="fx-vs"><span>Frente a ${esc(monthOnly(s.prev.month))}</span><span>Ahorro <b>${esc(signed(s.savingsDelta))}</b></span><span>Gasto ${changeChip(s.spentChange)}</span></p>` : `<p class="fx-vs gx-muted">Sin mes anterior con el que comparar.</p>`;
    return `<article class="card fx-hero ${positive ? "" : "fx-hero--neg"}" data-fx-hero>
      <div class="ey">Ahorro real · ${esc(monthName(month))}</div>
      <p class="fx-big">${esc(signed(s.savings))}</p>
      <p class="fx-sub">${s.rate == null ? "Sin ingresos registrados este mes" : positive ? `Ahorras el <b>${s.rate} %</b> de lo que ingresas` : `Gastaste ${esc(euro(-s.savings))} más de lo que ingresaste`}</p>
      <div class="fx-meter" role="img" aria-label="Has gastado el ${meter} % de tus ingresos"><i style="width:${meter}%"></i></div>
      <dl class="fx-split"><div><dt>Ingresos</dt><dd>${esc(euro(s.earned))}</dd></div><div><dt>Gastos</dt><dd>${esc(euro(s.spent))}</dd></div></dl>
      ${vs}
    </article>`;
  }

  function topHTML(s) {
    if (!s.categories.length) return `<section class="card fx-panel"><h2>Dónde se fue el dinero</h2>${emptyHTML("Sin gastos este mes.")}</section>`;
    const max = s.categories[0].total;
    const rows = s.categories.slice(0, TOP).map(c => `<li class="fx-row">
      <span class="fx-row-icon" aria-hidden="true">${esc(c.icon)}</span>
      <span class="fx-row-name">${esc(c.name)}<small>${c.share} % del gasto</small></span>
      <span class="fx-row-total">${esc(euro(c.total))}${s.prev ? changeChip(c.change) : ""}</span>
      <span class="fx-row-bar" aria-hidden="true"><i style="width:${Math.max(3, Math.round(c.total / max * 100))}%"></i></span>
    </li>`).join("");
    const rest = s.categories.length - TOP;
    return `<section class="card fx-panel" data-fx-top><h2>Dónde se fue el dinero</h2><ul class="fx-rows">${rows}</ul>
      <button type="button" class="secondary fx-more" data-fx-go="gastos">${rest > 0 ? `Ver las ${s.categories.length} categorías y movimientos` : "Ver movimientos en Gastos"} ›</button></section>`;
  }

  function sourcesHTML() {
    const last = lastImported(items);
    return `<p class="fx-sources gx-muted">Datos del banco: ING ${last.ING ? `hasta el ${esc(day(last.ING))}` : "sin importar"} · Revolut ${last.Revolut ? `hasta el ${esc(day(last.Revolut))}` : "sin importar"}.
      <button type="button" class="fx-link" data-fx-go="gastos" data-fx-focus="import">Importar extracto</button></p>`;
  }

  function render() {
    if (!owner) { root.innerHTML = ""; return; }
    if (loading && !items.length) { root.innerHTML = `<p role="status" class="fx-loading">Cargando el resumen…</p>`; return; }
    if (!items.length) {
      root.innerHTML = `<div class="fx">${noticeHTML(error, "error")}<article class="card fx-hero fx-hero--empty"><div class="ey">Resumen del mes</div><h2>Empieza importando tu extracto</h2>
        <p class="gx-muted">Con el CSV de ING (o el extracto de Revolut) verás aquí tu ahorro real, en qué se va el dinero y cómo cambia cada mes.</p>
        <button type="button" class="primary" data-fx-go="gastos" data-fx-focus="import">Importar extracto</button></article></div>`;
      return;
    }
    const s = monthInsights(items, month);
    root.innerHTML = `<div class="fx" data-fx-summary>${noticeHTML(error, "error")}${monthNavHTML(items, month)}${heroHTML(s)}${alertsHTML(s)}${topHTML(s)}
      ${extras.map(x => x.html?.(items, month) || "").join("")}${sourcesHTML()}</div>`;
  }

  root.addEventListener("click", e => {
    const m = e.target.closest("[data-fx-month]");
    if (m && m.dataset.fxMonth) {
      const older = m === m.parentElement.firstElementChild;
      month = m.dataset.fxMonth; financeNav.month = month; render();
      root.querySelector(`.fx-monthnav button:${older ? "first" : "last"}-of-type:not([disabled])`)?.focus();
      return;
    }
    const g = e.target.closest("[data-fx-go]");
    if (g) { financeNav.month = month; financeNav.focus = g.dataset.fxFocus || ""; go(g.dataset.fxGo); return; }
    for (const x of extras) if (x.handleClick?.(e.target, ctx())) return;
  });
  root.addEventListener("change", e => { for (const x of extras) if (x.handleChange?.(e.target, ctx())) return; });
  root.addEventListener("submit", e => { e.preventDefault(); for (const x of extras) if (x.handleSubmit?.(e.target, ctx())) return; });

  return {
    // Pinta lo que ya tiene y recarga en segundo plano: así ve al momento lo que se importó en Gastos.
    open() { if (getUser()?.id === owner) { if (financeNav.month && monthsOf(items).includes(financeNav.month)) month = financeNav.month; render(); } load(); },
    reload: load,
    close() {},
    reset() { items = []; pending = 0; owner = null; loading = false; error = ""; month = ""; for (const x of extras) x.reset?.(); root.innerHTML = ""; }
  };
}
