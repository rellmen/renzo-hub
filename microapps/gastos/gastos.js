// Microapp Gastos (My Finance → Gastos). Guía: docs/MICROAPPS.md
// Datos: los movimientos importados del banco (hub_records money/bank_tx) y las reglas del usuario por comercio
// (hub_records money/money_rule). Sin migración; RLS por dueño. La categoría se calcula al vuelo
// (microapps/gastos/categories.js); solo se guarda cuando el usuario la cambia.
import { createRecords } from "../records.js";
import { esc, euro, headerHTML, emptyHTML, noticeHTML } from "../ui.js";
import { createBankImport } from "../bank/bank-import-ui.js";
import { CATEGORIES, CATEGORY, categorizeAll, monthsOf, monthSummary } from "./categories.js";

const PAGE = 1000;
const monthName = m => (t => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`)));
const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const pct = (part, total) => total > 0 ? Math.max(0, Math.min(100, Math.round(part / total * 100))) : 0;

export function mountGastos(root, db, getUser, go) {
  const rules = createRecords(db, getUser, { domain: "money", type: "money_rule" });
  let txs = [], userRules = [], items = [], owner = null, loading = false, busy = false, notice = "", error = "", month = "", pending = null, open = new Set();
  const importer = createBankImport({ db, getUser, payroll: false, onChange: () => render(), onDone: () => load() });

  async function loadTxs(uid) {
    const out = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error: e } = await db.from("hub_records").select("id,payload,occurred_at,updated_at").eq("owner_id", uid).eq("record_type", "bank_tx").order("occurred_at", { ascending: false }).range(from, from + PAGE - 1);
      if (e) throw new Error(e.message);
      out.push(...(data || []));
      if ((data || []).length < PAGE) return out;
    }
  }

  async function load() {
    const uid = getUser()?.id; if (!uid) return;
    owner = uid; loading = true; error = ""; render();
    try {
      const [t, r] = await Promise.all([loadTxs(uid), rules.list({ limit: 1000 })]);
      if (owner !== uid) return;
      txs = t; userRules = r; recompute();
      const months = monthsOf(items);
      if (!months.includes(month)) month = months[0] || "";
    } catch (e) { if (owner === uid) error = e.message; }
    if (owner === uid) { loading = false; render(); }
  }
  const recompute = () => { items = categorizeAll(txs, userRules); };

  async function setCategory(id, category, scope) {
    const uid = owner, item = items.find(i => i.id === id), tx = txs.find(t => t.id === id);
    if (!item || !tx || !CATEGORY[category]) return;
    busy = true; error = ""; notice = ""; render();
    try {
      if (scope === "merchant") {
        const key = item.merchant.toLowerCase(), existing = userRules.find(r => r.payload?.merchant === key);
        const fields = { title: `${item.merchant} → ${CATEGORY[category].name}`, payload: { merchant: key, category } };
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
      ${i.description ? `<small class="gx-muted">${esc(i.description)}</small>` : ""}${i.contribution ? `<small class="gx-tag">Aporte al alquiler</small>` : ""}
      <label class="gx-cat">Categoría${i.source === "manual" ? " (puesta por ti)" : i.source === "rule" ? " (tu regla)" : i.source === "none" ? " (sin reconocer)" : ""}<select data-cat="${esc(i.id)}" ${busy ? "disabled" : ""}>${options(ask ? pending.category : i.category)}</select></label>
      ${ask ? `<div class="gx-ask" role="group" aria-label="Aplicar el cambio"><span>¿Aplicar a todos los movimientos de <b>${esc(i.merchant)}</b>?</span><div class="mx-actions"><button class="primary" data-scope="merchant" ${busy ? "disabled" : ""}>Todos de ${esc(i.merchant)}</button><button class="secondary" data-scope="one" ${busy ? "disabled" : ""}>Solo este</button><button class="secondary" data-scope="cancel" ${busy ? "disabled" : ""}>Cancelar</button></div></div>` : ""}
    </li>`;
  }
  function group(g, total, kind) {
    const isOpen = open.has(g.id);
    return `<details class="card gx-group" data-group="${esc(g.id)}" ${isOpen ? "open" : ""}>
      <summary><span class="gx-icon" aria-hidden="true">${esc(g.icon)}</span><span class="gx-name">${esc(g.name)}</span><span class="gx-total">${esc(euro(g.total))}</span>
        ${kind === "expense" ? `<span class="gx-bar" aria-hidden="true"><i style="width:${pct(g.total, total)}%"></i></span><small class="gx-muted">${pct(g.total, total)} % del gasto · ${g.count} movimiento${g.count === 1 ? "" : "s"}</small>` : `<small class="gx-muted">${g.count} movimiento${g.count === 1 ? "" : "s"}</small>`}</summary>
      ${g.merchants.length > 1 ? `<ul class="gx-merchants">${g.merchants.map(m => `<li><span>${esc(m.name)}</span><span>${esc(euro(m.total))}${m.count > 1 ? ` · ${m.count}` : ""}</span></li>`).join("")}</ul>` : ""}
      <ul class="gx-items">${g.items.map(itemRow).join("")}</ul>
    </details>`;
  }

  function render() {
    if (!owner) { root.innerHTML = ""; return; }
    const months = monthsOf(items), s = month ? monthSummary(items, month) : null;
    const hasRevolut = txs.some(t => /revolut/i.test(t.payload?.bank || ""));
    const toRevolut = s ? s.transfers.flatMap(g => g.items).filter(i => /revolut/i.test(i.name) && i.amount < 0).reduce((n, i) => n - i.amount, 0) : 0;
    root.innerHTML = headerHTML("gastos", { eyebrow: "My Finance · Gastos por categoría" })
      + `<div class="mx-stack">${noticeHTML(error, "error")}${noticeHTML(notice)}${importer.html()}
      ${loading && !items.length ? `<p role="status">Cargando movimientos…</p>` : !items.length ? emptyHTML("Aún no hay movimientos. Importa el extracto de ING (CSV) para ver tus gastos por categoría.") : `
      <label class="gx-month">Mes <select data-month>${months.map(m => `<option value="${m}" ${m === month ? "selected" : ""}>${esc(monthName(m))}</option>`).join("")}</select></label>
      <article class="card gx-hero" data-gx-summary>
        <div class="ey">${esc(monthName(month))} · ${s.count} movimientos</div>
        <p class="mx-total">${esc(euro(s.spent))}</p><p>Gastado</p>
        <dl class="gx-kpis"><div><dt>Ingresos</dt><dd>${esc(euro(s.earned))}</dd></div><div><dt>Ingresos − gastos</dt><dd>${esc(euro(s.net))}</dd></div><div><dt>Traspasos a tus cuentas</dt><dd>${esc(euro(Math.abs(s.transferTotal)))}</dd></div></dl>
        ${!hasRevolut && toRevolut > 0 ? `<p class="gx-warn" data-gx-revolut>Pasaste ${esc(euro(toRevolut))} a Revolut. Lo que gastes desde Revolut no aparece aquí hasta que importes su extracto.</p>` : ""}
        ${s.uncategorized ? `<p class="gx-warn">${s.uncategorized} movimiento${s.uncategorized === 1 ? "" : "s"} sin categoría: ábrelos en "Sin categoría" y asígnales una.</p>` : ""}
      </article>
      <h2 class="gx-h">Gastos por categoría</h2>${s.expenses.length ? s.expenses.map(g => group(g, s.spent, "expense")).join("") : emptyHTML("Sin gastos este mes.")}
      <h2 class="gx-h">Ingresos</h2>${s.income.length ? s.income.map(g => group(g, s.earned, "income")).join("") : emptyHTML("Sin ingresos este mes.")}
      ${s.transfers.length ? `<h2 class="gx-h">No cuentan como gasto</h2>${s.transfers.map(g => group(g, 0, "transfer")).join("")}` : ""}
      <p class="gx-muted">Las categorías se ponen solas por el nombre del comercio. Si cambias una, puedes aplicarla a todos los movimientos de ese comercio. Los abonos (devoluciones, aportes) restan del gasto de su categoría.</p>`}</div>`;
  }

  root.addEventListener("change", e => {
    if (importer.handleChange(e.target)) return;
    if (e.target.matches("[data-month]")) { month = e.target.value; pending = null; notice = ""; render(); return; }
    const sel = e.target.closest("[data-cat]");
    if (sel) { const item = items.find(i => i.id === sel.dataset.cat); if (item && sel.value !== item.category) { pending = { id: item.id, category: sel.value }; render(); root.querySelector(`[data-item="${CSS.escape(item.id)}"] [data-scope]`)?.focus(); } }
  });
  root.addEventListener("toggle", e => { const d = e.target.closest?.("[data-group]"); if (d) { if (d.open) open.add(d.dataset.group); else open.delete(d.dataset.group); } }, true);
  root.addEventListener("click", e => {
    if (importer.handleClick(e.target)) return;
    const b = e.target.closest("[data-scope]"); if (!b || !pending || busy) return;
    if (b.dataset.scope === "cancel") { pending = null; render(); return; }
    setCategory(pending.id, pending.category, b.dataset.scope);
  });

  return {
    open() { if (getUser()?.id !== owner) load(); else render(); },
    close() { notice = ""; pending = null; },
    reset() { txs = []; userRules = []; items = []; owner = null; busy = loading = false; pending = null; notice = error = ""; month = ""; open = new Set(); importer.reset(); root.innerHTML = ""; }
  };
}
