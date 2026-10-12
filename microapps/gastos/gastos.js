// Microapp Gastos (My Finance → Gastos). Guía: docs/MICROAPPS.md
// Datos: los movimientos importados del banco (hub_records money/bank_tx) y las reglas del usuario por comercio
// (hub_records money/money_rule). Sin migración; RLS por dueño. La categoría se calcula al vuelo
// (microapps/gastos/categories.js); solo se guarda cuando el usuario la cambia.
import { createRecords } from "../records.js";
import { esc, euro, headerHTML, emptyHTML, noticeHTML } from "../ui.js";
import { createBankImport } from "../bank/bank-import-ui.js";
import { CATEGORIES, CATEGORY, categorizeAll, monthsOf, monthSummary } from "./categories.js";
import { loadBankTxs, financeNav } from "../finance/data.js";
import { prevMonth, change, lastImported, revolutGap } from "../finance/insights.js";
import { monthNavHTML, monthName, changeChip, bankStatusHTML } from "../finance/summary.js";

const TOP = 6;
const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const pct = (part, total) => total > 0 ? Math.max(0, Math.min(100, Math.round(part / total * 100))) : 0;

export function mountGastos(root, db, getUser, go) {
  const rules = createRecords(db, getUser, { domain: "money", type: "money_rule" });
  let txs = [], userRules = [], items = [], owner = null, loading = false, busy = false, notice = "", error = "", month = "", pending = null, open = new Set();
  let showImport = false, showAll = false;
  const importer = createBankImport({ db, getUser, payroll: false, onChange: () => render(),
    onDone: () => { showImport = false; notice = "Extracto importado. Las cifras ya están actualizadas."; load(); } });

  async function load() {
    const uid = getUser()?.id; if (!uid) return;
    owner = uid; loading = true; error = ""; render();
    try {
      const [t, r] = await Promise.all([loadBankTxs(db, uid), rules.list({ limit: 1000 })]);
      if (owner !== uid) return;
      txs = t; userRules = r; recompute();
      const months = monthsOf(items);
      if (!months.includes(month)) month = months.includes(financeNav.month) ? financeNav.month : months[0] || "";
    } catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) { loading = false; render(); applyFocus(); }
  }
  const recompute = () => { items = categorizeAll(txs, userRules); };

  // Viene del Resumen: abrir el importador o la categoría "Sin categoría".
  function applyFocus() {
    const focus = financeNav.focus; if (!focus || !items.length && focus !== "import") return;
    financeNav.focus = "";
    if (focus === "import") { showImport = true; render(); root.querySelector("[data-bank-file]")?.closest("label")?.focus(); root.querySelector("[data-bank-import]")?.scrollIntoView({ block: "start" }); return; }
    open.add(focus); showAll = true; render();
    const el = root.querySelector(`[data-group="${CSS.escape(focus)}"]`);
    if (el) { el.scrollIntoView({ block: "start" }); el.querySelector("summary")?.focus(); }
  }

  async function setCategory(id, category, scope) {
    const uid = owner, item = items.find(i => i.id === id), tx = txs.find(t => t.id === id);
    if (!item || !tx || !CATEGORY[category]) return;
    busy = true; error = ""; notice = ""; render();
    try {
      if (scope === "merchant") {
        const key = item.merchant.toLowerCase(), existing = userRules.find(r => r.payload?.merchant === key);
        const fields = { title: `${item.merchant} → ${CATEGORY[category].name}`, payload: { ...(existing?.payload || {}), merchant: key, category } };
        if (existing) await rules.update(existing.id, fields); else await rules.add(fields);
        // Los movimientos de ese comercio con una categoría puesta a mano antes siguen como estaban, salvo este.
        if (tx.payload.category) await saveOverride(tx, null);
        notice = `Todos los movimientos de ${item.merchant} pasan a ${CATEGORY[category].name}, también los que importes después.`;
      } else {
        await saveOverride(tx, category);
        notice = `Movimiento cambiado a ${CATEGORY[category].name}.`;
      }
      if (owner !== uid) return;
      userRules = await rules.list({ limit: 1000 }); recompute();
    } catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) { busy = false; pending = null; render(); }
  }
  async function saveOverride(tx, category) {
    const payload = { ...tx.payload }; if (category) payload.category = category; else delete payload.category;
    const { error: e } = await db.from("hub_records").update({ payload }).eq("id", tx.id).eq("owner_id", owner).eq("record_type", "bank_tx");
    if (e) throw new Error(e.message);
    tx.payload = payload;
  }

  const options = selected => CATEGORIES.map(c => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${esc(c.icon)} ${esc(c.name)}</option>`).join("");
  function itemRow(i) {
    const ask = pending?.id === i.id;
    return `<li class="gx-item" data-item="${esc(i.id)}">
      <div class="gx-item-main"><span class="gx-date">${esc(day(i.date))}</span><b>${esc(i.merchant)}</b><span class="gx-amount ${i.amount > 0 ? "gx-in" : ""}">${esc(euro(i.amount))}</span></div>
      ${i.description ? `<small class="gx-muted">${esc(i.description)}</small>` : ""}${i.contribution ? `<small class="gx-tag">Aporte al alquiler</small>` : ""}${/revolut/i.test(i.bank) ? `<small class="gx-bank">Revolut</small>` : ""}
      <label class="gx-cat">Categoría${i.source === "manual" ? " (puesta por ti)" : i.source === "rule" ? " (tu regla)" : i.source === "none" ? " (sin reconocer)" : ""}<select data-cat="${esc(i.id)}" ${busy ? "disabled" : ""}>${options(ask ? pending.category : i.category)}</select></label>
      ${ask ? `<div class="gx-ask" role="group" aria-label="Aplicar el cambio"><span>¿Aplicar a todos los movimientos de <b>${esc(i.merchant)}</b>?</span><div class="mx-actions"><button class="primary" data-scope="merchant" ${busy ? "disabled" : ""}>Todos de ${esc(i.merchant)}</button><button class="secondary" data-scope="one" ${busy ? "disabled" : ""}>Solo este</button><button class="secondary" data-scope="cancel" ${busy ? "disabled" : ""}>Cancelar</button></div></div>` : ""}
    </li>`;
  }
  function group(g, total, kind, prevTotals) {
    const isOpen = open.has(g.id), prevTotal = prevTotals?.get(g.id);
    const meta = kind === "expense" ? `${pct(g.total, total)} % · ${g.count} mov.` : `${g.count} movimiento${g.count === 1 ? "" : "s"}`;
    const chip = kind === "expense" && prevTotals ? changeChip(prevTotal ? change(g.total, prevTotal) : null) : "";
    return `<details class="card gx-group${g.id === "sin_categoria" ? " gx-group--todo" : ""}" data-group="${esc(g.id)}" ${isOpen ? "open" : ""}>
      <summary><span class="gx-icon" aria-hidden="true">${esc(g.icon)}</span><span class="gx-name">${esc(g.name)}<small>${esc(meta)}</small></span><span class="gx-total">${esc(euro(g.total))}${chip}</span>
        ${kind === "expense" ? `<span class="gx-bar" aria-hidden="true"><i style="width:${Math.max(2, pct(g.total, total))}%"></i></span>` : ""}</summary>
      ${g.merchants.length > 1 ? `<ul class="gx-merchants">${g.merchants.map(m => `<li><span>${esc(m.name)}</span><span>${esc(euro(m.total))}${m.count > 1 ? ` · ${m.count}` : ""}</span></li>`).join("")}</ul>` : ""}
      <ul class="gx-items">${g.items.map(itemRow).join("")}</ul>
    </details>`;
  }

  function expensesHTML(s, prevTotals) {
    if (!s.expenses.length) return emptyHTML("Sin gastos este mes.");
    const todo = s.expenses.find(g => g.id === "sin_categoria");
    const rest = s.expenses.filter(g => g.id !== "sin_categoria");
    const shown = showAll ? rest : rest.slice(0, TOP);
    const hidden = rest.length - shown.length;
    return (todo ? group(todo, s.spent, "expense", prevTotals) : "")
      + shown.map(g => group(g, s.spent, "expense", prevTotals)).join("")
      + (hidden > 0 ? `<button type="button" class="secondary gx-more" data-gx-all>Ver ${hidden} categoría${hidden === 1 ? "" : "s"} más</button>` : "");
  }

  function render() {
    if (!owner) { root.innerHTML = ""; return; }
    const s = month ? monthSummary(items, month) : null;
    const before = month ? prevMonth(month) : "";
    const prev = month && items.some(i => i.date.startsWith(before)) ? monthSummary(items, before) : null;
    const prevTotals = prev ? new Map(prev.expenses.map(g => [g.id, g.total])) : null;
    const gap = month ? revolutGap(items, month) : 0;
    const last = lastImported(items);
    const importBusy = ["reading", "preview", "saving"].includes(importer.state);
    const importOpen = !items.length || showImport || importBusy;
    const actions = items.length && !importOpen ? `<button type="button" class="secondary gx-import-btn" data-gx-import aria-label="Importar extracto">↑ Importar</button>` : "";
    root.innerHTML = headerHTML("gastos", { eyebrow: "My Finance · Gastos por categoría", actions })
      + `<div class="mx-stack">${noticeHTML(error, "error")}${noticeHTML(notice)}
      ${importOpen ? importer.html() + (items.length && !importBusy ? `<button type="button" class="fx-link gx-import-close" data-gx-import-close>Cerrar importación</button>` : "") : ""}
      ${loading && !items.length ? `<p role="status">Cargando movimientos…</p>` : !items.length ? emptyHTML("Aún no hay movimientos. Importa el extracto de ING (CSV) para ver tus gastos por categoría.") : `
      ${monthNavHTML(items, month)}
      <article class="card gx-hero" data-gx-summary>
        <div class="ey">${s.count} movimientos este mes</div><p class="gx-banks">${bankStatusHTML(items)}</p>
        <p class="mx-total">${esc(euro(s.spent))}</p><p>Gastado${prev ? ` ${changeChip(change(s.spent, prev.spent))}` : ""}</p>
        <dl class="gx-kpis"><div><dt>Ingresos</dt><dd>${esc(euro(s.earned))}</dd></div><div><dt>${gap > 0 ? "Ahorro provisional (falta Revolut)" : "Ahorro real"}</dt><dd>${gap > 0 ? "Hasta " : ""}${esc(euro(s.net))}</dd></div><div><dt>Traspasos a tus cuentas</dt><dd>${esc(euro(Math.abs(s.transferTotal)))}</dd></div></dl>
        ${gap > 0 ? `<button type="button" class="gx-warn gx-warn--btn" data-gx-import data-gx-revolut>⇄ ${esc(euro(gap))} a Revolut sin detalle · importa su extracto ›</button>` : ""}
        ${s.uncategorized ? `<button type="button" class="gx-warn gx-warn--btn" data-gx-todo>? ${s.uncategorized} movimiento${s.uncategorized === 1 ? "" : "s"} sin categoría · asígnales una ›</button>` : ""}
      </article>
      <h2 class="gx-h">Gastos por categoría</h2>${expensesHTML(s, prevTotals)}
      <h2 class="gx-h">Ingresos</h2>${s.income.length ? s.income.map(g => group(g, s.earned, "income")).join("") : emptyHTML("Sin ingresos este mes.")}
      ${s.transfers.length ? `<h2 class="gx-h">No cuentan como gasto</h2>${s.transfers.map(g => group(g, 0, "transfer")).join("")}` : ""}
      <p class="gx-muted">Las categorías se ponen solas por el nombre del comercio. Si cambias una, puedes aplicarla a todos los movimientos de ese comercio. Los abonos (devoluciones, aportes) restan del gasto de su categoría.</p>`}</div>`;
  }

  function openGroup(id) {
    open.add(id); showAll = true; render();
    const el = root.querySelector(`[data-group="${CSS.escape(id)}"]`);
    if (el) { el.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); el.querySelector("summary")?.focus({ preventScroll: true }); }
  }

  root.addEventListener("change", e => {
    if (importer.handleChange(e.target)) return;
    const sel = e.target.closest("[data-cat]");
    if (sel) { const item = items.find(i => i.id === sel.dataset.cat); if (item && sel.value !== item.category) { pending = { id: item.id, category: sel.value }; render(); root.querySelector(`[data-item="${CSS.escape(item.id)}"] [data-scope]`)?.focus(); } }
  });
  root.addEventListener("toggle", e => { const d = e.target.closest?.("[data-group]"); if (d) { if (d.open) open.add(d.dataset.group); else open.delete(d.dataset.group); } }, true);
  root.addEventListener("click", e => {
    if (importer.handleClick(e.target)) return;
    const m = e.target.closest("[data-fx-month]");
    if (m && m.dataset.fxMonth) { const older = m === m.parentElement.firstElementChild; month = m.dataset.fxMonth; financeNav.month = month; pending = null; notice = ""; render(); root.querySelector(`.fx-monthnav button:${older ? "first" : "last"}-of-type:not([disabled])`)?.focus(); return; }
    if (e.target.closest("[data-gx-import]")) { showImport = true; notice = ""; render(); root.querySelector("[data-bank-import]")?.scrollIntoView({ block: "start" }); return; }
    if (e.target.closest("[data-gx-import-close]")) { showImport = false; importer.cancel?.(); render(); return; }
    if (e.target.closest("[data-gx-todo]")) { openGroup("sin_categoria"); return; }
    if (e.target.closest("[data-gx-all]")) { showAll = true; render(); return; }
    const b = e.target.closest("[data-scope]"); if (!b || !pending || busy) return;
    if (b.dataset.scope === "cancel") { pending = null; render(); return; }
    setCategory(pending.id, pending.category, b.dataset.scope);
  });

  return {
    open() {
      if (getUser()?.id !== owner) { load(); return; }
      if (financeNav.month && monthsOf(items).includes(financeNav.month)) month = financeNav.month;
      render(); applyFocus();
    },
    close() { notice = ""; pending = null; showImport = false; showAll = false; },
    reset() { txs = []; userRules = []; items = []; owner = null; busy = loading = false; pending = null; notice = error = ""; month = ""; open = new Set(); showImport = showAll = false; importer.reset(); root.innerHTML = ""; }
  };
}
