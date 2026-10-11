// Tarjeta "Importar extracto de ING (CSV)": el CSV se lee en el dispositivo, se enseña un resumen
// (movimientos, nóminas enlazadas, ya importados) y solo se guarda cuando el usuario confirma.
// Se guarda en hub_records (domain money, record_type bank_tx) con id estable: importar dos veces no duplica.
import { parseIngCsv, toRecord, importSummary } from "./ing-csv.js";

const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const eur = v => v == null ? "Sin datos" : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(v));
const day = iso => iso ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "Sin datos";
const MAX_BYTES = 5 * 1024 * 1024, CHUNK = 200;

// payroll: false oculta las líneas de nóminas (por ejemplo, en Gastos).
export function createBankImport({ db, getUser, getPayslips = () => [], expectedDate = () => null, onChange, onDone, payroll = true }) {
  let state = "idle", records = [], summary = null, message = "", error = "", fileName = "";
  const set = patch => { ({ state = state, message = message, error = error } = patch); onChange?.(); };

  async function existing(ids) {
    const found = new Set();
    for (let i = 0; i < ids.length; i += CHUNK) {
      const { data, error: e } = await db.from("hub_records").select("id").eq("owner_id", getUser()?.id).in("id", ids.slice(i, i + CHUNK));
      if (e) throw new Error(e.message);
      for (const r of data || []) found.add(r.id);
    }
    return found;
  }

  async function read(file) {
    records = []; summary = null; fileName = file?.name || "";
    if (!file) return;
    if (file.size > MAX_BYTES) return set({ state: "idle", error: "El archivo supera 5 MB. Descarga un periodo más corto.", message: "" });
    if (!/\.csv$/i.test(file.name) && !/csv|text/i.test(file.type)) return set({ state: "idle", error: "Elige el archivo CSV que descargas de ING.", message: "" });
    const uid = getUser()?.id;
    if (!uid) return set({ state: "idle", error: "Inicia sesión para importar.", message: "" });
    set({ state: "reading", error: "", message: "" });
    try {
      const parsed = parseIngCsv(await file.text());
      records = await Promise.all(parsed.transactions.map(t => toRecord(t, uid)));
      const ids = records.map(r => r.id);
      summary = importSummary(parsed, getPayslips(), expectedDate, await existing(ids), ids);
      set({ state: "preview" });
    } catch (e) {
      records = [];
      set({ state: "idle", error: e?.name === "BankCsvError" ? e.message : `No se pudo leer el CSV: ${e?.message || "error desconocido"}` });
    }
  }

  async function save() {
    if (state !== "preview" || !records.length) return;
    set({ state: "saving", error: "" });
    try {
      for (let i = 0; i < records.length; i += CHUNK) {
        const { error: e } = await db.from("hub_records").upsert(records.slice(i, i + CHUNK), { onConflict: "id", ignoreDuplicates: true });
        if (e) throw new Error(e.message);
      }
      const added = summary.total - summary.alreadyImported;
      const text = `${added} movimiento${added === 1 ? "" : "s"} nuevo${added === 1 ? "" : "s"} guardado${added === 1 ? "" : "s"}${summary.alreadyImported ? ` (${summary.alreadyImported} ya estaban)` : ""}.${payroll ? ` ${summary.matched} nómina${summary.matched === 1 ? "" : "s"} enlazada${summary.matched === 1 ? "" : "s"} con su cobro en el banco.` : ""}`;
      records = []; summary = null;
      set({ state: "idle", message: text, error: "" });
      onDone?.();
    } catch (e) {
      set({ state: "preview", error: e.message || "No se pudo guardar." });
    }
  }

  function cancel() { records = []; summary = null; set({ state: "idle", error: "", message: "" }); }

  function html() {
    const busy = state === "reading" || state === "saving";
    const picker = `<label class="pay-button pay-upload-pick${busy ? " is-busy" : ""}">${state === "reading" ? "Leyendo CSV…" : "Importar extracto ING (CSV)"}<input type="file" accept=".csv,text/csv" data-bank-file ${busy ? "disabled" : ""}></label>`;
    const note = `${message ? `<p class="pay-upload-ok" role="status" data-bank-ok>${esc(message)}</p>` : ""}${error ? `<p class="pay-upload-error" role="alert">${esc(error)}</p>` : ""}`;
    if (!(state === "preview" || state === "saving") || !summary) return `<div class="card pay-upload" data-bank-import>${picker}<p class="pay-muted">Mijn ING → Af- en bijschrijvingen → Downloaden → CSV. Se lee en tu dispositivo; nada se guarda hasta que confirmes.</p>${note}</div>`;
    const s = summary, isNew = s.total - s.alreadyImported;
    return `<div class="card pay-upload" data-bank-preview>
      <h3>Revisa antes de guardar</h3>
      <p class="pay-muted">${esc(fileName)} · cuenta ${esc(s.accounts.join(", ") || "sin identificar")}</p>
      <dl class="pay-fields">
        <div><dt>Periodo</dt><dd>${esc(day(s.from))} a ${esc(day(s.to))}</dd></div>
        <div><dt>Movimientos</dt><dd>${s.total} (${isNew} nuevos${s.alreadyImported ? `, ${s.alreadyImported} ya importados` : ""})</dd></div>
        <div><dt>Entradas</dt><dd>${esc(eur(s.income))}</dd></div>
        <div><dt>Salidas</dt><dd>${esc(eur(s.expenses))}</dd></div>
        ${payroll ? `<div><dt>Ingresos de nómina</dt><dd>${s.salaryCount} · ${esc(eur(s.salaryTotal))}</dd></div>
        <div><dt>Nóminas enlazadas</dt><dd>${s.matched}</dd></div>` : ""}
      </dl>
      ${payroll && s.unmatched.length ? `<p class="pay-upload-error">El banco menciona ${s.unmatched.length === 1 ? "la nómina" : "las nóminas"} nº ${esc(s.unmatched.join(", "))}, que no ${s.unmatched.length === 1 ? "está" : "están"} en la app. Súbela${s.unmatched.length === 1 ? "" : "s"} para enlazarla${s.unmatched.length === 1 ? "" : "s"}.</p>` : ""}
      ${(payroll ? s.mismatched : []).map(m => `<p class="pay-upload-error">Ingreso del ${esc(day(m.date))} (nº ${esc(m.numbers.join(", "))}): banco ${esc(eur(m.amount))}, nóminas ${esc(eur(m.expected))}. Diferencia ${esc(eur(m.diff))}.</p>`).join("")}
      ${s.skippedLines.length ? `<p class="pay-muted">${s.skippedLines.length} línea${s.skippedLines.length === 1 ? "" : "s"} sin leer (formato no reconocido).</p>` : ""}
      ${note}
      <div class="pay-actions"><button data-bank-save ${state === "saving" || !isNew ? "disabled" : ""}>${state === "saving" ? "Guardando…" : isNew ? `Guardar ${isNew} movimiento${isNew === 1 ? "" : "s"}` : "Nada nuevo que guardar"}</button><button data-bank-cancel ${state === "saving" ? "disabled" : ""}>Cancelar</button></div>
    </div>`;
  }

  const handled = new WeakMap();
  function fromInput(input) { const f = input.files?.[0]; if (!f || handled.get(input) === f) return; handled.set(input, f); read(f); }
  function handleChange(target) { const input = target.closest?.("[data-bank-file]"); if (!input) return false; fromInput(input); return true; }
  function handleClick(target) {
    const input = target.closest?.("[data-bank-file]");
    if (input) { input.addEventListener("change", () => fromInput(input), { once: true }); return false; }
    const b = target.closest?.("button");
    if (b?.hasAttribute("data-bank-save")) { save(); return true; }
    if (b?.hasAttribute("data-bank-cancel")) { cancel(); return true; }
    return false;
  }

  return { html, read, save, cancel, handleChange, handleClick, get state() { return state; }, get summary() { return summary; }, reset() { state = "idle"; records = []; summary = null; message = error = ""; } };
}
