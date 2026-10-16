// My Finance · panel "Patrimonio" del Resumen (Fase 2B).
// Cuentas: saldo del último extracto de ING y Revolut. Inversiones y deudas: valoraciones a mano con fecha
// (hub_records money/money_asset; una fila por valoración, nunca se sobrescribe la anterior). Sin migraciones.
import { createRecords } from "../records.js";
import { esc, euro, noticeHTML, localDay } from "../ui.js";
import { netWorth, netWorthHistory, monthEnd, parseEuro } from "./networth.js";
import { monthsOf } from "../gastos/categories.js";

const day = iso => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const monthShort = m => new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));
const signed = n => `${n > 0 ? "+" : n < 0 ? "−" : ""}${euro(Math.abs(n))}`;
const KIND = { investment: "Inversión", debt: "Deuda" };

export function createNetWorthPanel({ db, getUser, today = () => localDay() }) {
  const records = createRecords(db, getUser, { domain: "money", type: "money_asset" });
  let assets = [], txs = [], busy = false, error = "", notice = "";

  async function load() { assets = await records.list({ limit: 500 }); }

  const row = (icon, name, sub, value, chip = "") => `<li class="fx-row"><span class="fx-row-icon" aria-hidden="true">${icon}</span>
    <span class="fx-row-name">${esc(name)}<small>${esc(sub)}</small></span><span class="fx-row-total">${esc(value)}${chip}</span></li>`;
  const staleChip = x => x.stale ? `<span class="fx-chip fx-chip--flat">Desactualizado</span>` : "";

  return {
    async setData(fin) {
      txs = fin.txs || []; error = "";
      if (!getUser()?.id) return;
      try { await load(); } catch (e) { assets = []; error = `No se pudieron leer inversiones y deudas: ${e.message}`; }
    },
    html(items, month) {
      if (!month) return "";
      const now = today(), asOf = monthEnd(month) < now ? monthEnd(month) : now;
      const nw = netWorth(txs, assets, asOf);
      const history = netWorthHistory(txs, assets, monthsOf(items).slice(0, 6)).filter(h => h.month <= month);
      const names = [...new Set(assets.map(a => a.payload?.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
      const rows = [
        ...nw.accounts.map(a => row("🏦", `${a.bank}${a.account ? ` ${a.account}` : ""}`, `Saldo del extracto · ${day(a.date)}`, euro(a.balance), staleChip(a))),
        ...nw.investments.map(v => row("📈", v.name, `Inversión · valor del ${day(v.date)}`, euro(v.value), staleChip(v))),
        ...nw.debts.map(v => row("🧾", v.name, `Deuda · pendiente a ${day(v.date)}`, `−${euro(v.value)}`, staleChip(v)))
      ].join("");
      const evolution = history.length > 1 ? `<details class="fx-add"><summary>Evolución (${history.length} meses)</summary><ul class="fx-rows">${history.slice().reverse().map(h =>
        `<li class="fx-row"><span class="fx-row-name">${esc(monthShort(h.month))}<small>Cuentas ${esc(euro(h.cash))} · inversiones ${esc(euro(h.invested))} · deudas ${esc(euro(h.owed))}</small></span>
        <span class="fx-row-total">${esc(euro(h.total))}${h.change == null ? "" : `<span class="fx-chip ${h.change >= 0 ? "fx-chip--good" : "fx-chip--bad"}">${esc(signed(h.change))}</span>`}</span></li>`).join("")}</ul></details>` : "";
      return `<section class="card fx-panel" data-fx-networth>
        <h2>Patrimonio</h2>${noticeHTML(error, "error")}${noticeHTML(notice)}
        <dl class="fx-split"><div><dt>Patrimonio neto</dt><dd data-fx-networth-total>${esc(nw.total == null ? "Sin datos" : euro(nw.total))}</dd><small>a ${esc(day(asOf))}</small></div>
          <div><dt>En tus cuentas</dt><dd>${esc(euro(nw.cash))}</dd><small>${nw.invested || nw.owed ? `+ ${esc(euro(nw.invested))} invertido · − ${esc(euro(nw.owed))} deudas` : "sin inversiones ni deudas"}${nw.stale ? ` · ${nw.stale} valor${nw.stale === 1 ? "" : "es"} antiguo${nw.stale === 1 ? "" : "s"}` : ""}</small></div></dl>
        ${rows ? `<ul class="fx-rows">${rows}</ul>` : `<p class="gx-muted">Importa un extracto con saldo o añade una inversión para empezar.</p>`}
        ${evolution}
        <details class="fx-add"><summary>Añadir o actualizar una inversión o deuda</summary>
          <form class="fx-form" data-fx-asset-form>
            <label>Tipo<select name="kind" required><option value="investment">Inversión</option><option value="debt">Deuda</option></select></label>
            <label>Nombre<input name="name" required maxlength="60" list="fxAssetNames" placeholder="Trade Republic, DEGIRO, préstamo…"></label>
            <datalist id="fxAssetNames">${names.map(n => `<option value="${esc(n)}">`).join("")}</datalist>
            <label>Valor actual (€)<input name="value" required inputmode="decimal" placeholder="0,00"></label>
            <label>Fecha del valor<input name="date" type="date" required value="${esc(now)}" max="${esc(now)}"></label>
            <button type="submit" class="primary" ${busy ? "disabled" : ""}>Guardar valor</button>
          </form>
          <p class="gx-muted fx-note">Cada valor se guarda con su fecha y no borra los anteriores: así se ve la evolución. Para la deuda, pon lo que queda por pagar.</p>
        </details>
        <p class="gx-muted fx-note">Cuentas = saldo del último extracto importado de cada cuenta; no se conecta al banco.</p>
      </section>`;
    },
    handleSubmit(form, ctx) {
      if (!form.matches("[data-fx-asset-form]")) return false;
      const f = new FormData(form);
      const kind = f.get("kind") === "debt" ? "debt" : "investment";
      const name = String(f.get("name") || "").trim().slice(0, 60);
      const value = parseEuro(f.get("value"));
      const date = String(f.get("date") || "");
      error = notice = "";
      if (!name || !Number.isFinite(value) || value < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today()) { error = "Revisa nombre, valor (0 o más) y fecha (no futura)."; ctx.rerender(); return true; }
      if (busy) return true;
      busy = true; ctx.rerender();
      (async () => {
        try {
          await records.add({ title: `${KIND[kind]} · ${name}`, occurred_at: `${date}T12:00:00Z`, payload: { kind, name, value: Math.round(value * 100) / 100, date } });
          await load(); notice = `${name}: ${euro(value)} guardado.`;
        } catch (e) { error = e.message; }
        busy = false; ctx.rerender();
      })();
      return true;
    },
    reset() { assets = []; txs = []; busy = false; error = notice = ""; }
  };
}
