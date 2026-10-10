// "Subir nómina" dentro de My Finance → Nóminas: el usuario elige el PDF, la app lo lee en el móvil/ordenador
// (payroll-pdf.js), enseña lo leído y, al confirmar, lo envía a /api/payroll-upload. Siempre queda pendiente de revisión.
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const eur = v => v == null ? "Sin datos" : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(v));
const day = iso => iso ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T12:00:00`)) : "Sin datos";
const MAX = 3 * 1024 * 1024;

async function sha256Hex(buffer) {
  const h = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function toBase64(buffer) {
  const bytes = new Uint8Array(buffer); let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function createPayrollUpload({ db, onChange, onDone, parser = () => import("./payroll-pdf.js"), endpoint = "/api/payroll-upload" }) {
  let state = "idle", file = null, buffer = null, payload = null, message = "", error = "", result = null;
  const set = patch => { ({ state = state, message = message, error = error } = patch); onChange(); };

  async function read(f) {
    file = f; buffer = null; payload = null; result = null;
    if (!f) return;
    if (f.size > MAX) return set({ state: "idle", error: "El PDF supera 3 MB.", message: "" });
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) return set({ state: "idle", error: "Elige un PDF de nómina.", message: "" });
    set({ state: "reading", error: "", message: "" });
    try {
      buffer = await f.arrayBuffer();
      const { extractRows, parseSdWorx } = await parser();
      payload = parseSdWorx(await extractRows(new Uint8Array(buffer.slice(0))));
      set({ state: "preview" });
    } catch (e) {
      set({ state: "idle", error: e?.name === "PayslipParseError" || e?.constructor?.name === "PayslipParseError" ? e.message : `No se pudo leer el PDF: ${e?.message || "error desconocido"}` });
    }
  }

  async function send() {
    if (state !== "preview" || !buffer || !payload) return;
    set({ state: "sending", error: "" });
    try {
      const { data } = await db.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Inicia sesión otra vez.");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: file?.name || "nomina.pdf", sha256: await sha256Hex(buffer), pdfBase64: toBase64(buffer), payload })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Error ${response.status}`);
      result = body;
      const p = payload.payslip;
      const text = body.duplicate ? `La nómina nº ${p.payslip_number} ya estaba en la app.` : `Nómina nº ${p.payslip_number} (semana ${p.period_number}) subida${body.isCorrection ? " como pago adicional" : ""}. Revísala y apruébala.`;
      file = buffer = payload = null;
      set({ state: "idle", message: text, error: "" });
      onDone?.(body);
    } catch (e) {
      set({ state: "preview", error: e.message || "No se pudo subir la nómina." });
    }
  }

  function cancel() { file = buffer = payload = null; set({ state: "idle", error: "", message: "" }); }

  function html() {
    const busy = state === "reading" || state === "sending";
    const picker = `<label class="pay-button pay-upload-pick${busy ? " is-busy" : ""}">${state === "reading" ? "Leyendo PDF…" : "Subir nómina (PDF)"}<input type="file" accept="application/pdf,.pdf" data-upload-file ${busy ? "disabled" : ""}></label>`;
    const note = `${message ? `<p class="pay-upload-ok" role="status">${esc(message)}</p>` : ""}${error ? `<p class="pay-upload-error" role="alert">${esc(error)}</p>` : ""}`;
    if (!(state === "preview" || state === "sending") || !payload) return `<div class="card pay-upload">${picker}<p class="pay-muted">Nóminas semanales de SD Worx. Se leen en tu dispositivo y quedan pendientes de revisión.</p>${note}</div>`;
    const p = payload.payslip, failed = payload.checks.filter(c => !c.passed);
    return `<div class="card pay-upload" data-upload-preview>
      <h3>Revisa antes de subir</h3>
      <dl class="pay-fields">
        <div><dt>Nómina</dt><dd>nº ${esc(p.payslip_number)}</dd></div>
        <div><dt>Semana</dt><dd>${esc(p.period_number)} de ${esc(p.period_year)} (${esc(day(p.period_start))} a ${esc(day(p.period_end))})</dd></div>
        <div><dt>Bruto</dt><dd>${esc(eur(p.gross_salary))}</dd></div>
        <div><dt>Neto a cobrar</dt><dd>${esc(eur(p.net_payment))}</dd></div>
        <div><dt>Retención</dt><dd>${esc(eur(p.loonheffing))}</dd></div>
        <div><dt>Fecha de la nómina</dt><dd>${esc(day(p.document_date))}</dd></div>
      </dl>
      <p class="${failed.length ? "pay-upload-error" : "pay-muted"}">${failed.length ? `Atención: ${esc(failed.map(c => c.message).join(" · "))}. Podrás corregirlo al revisarla.` : "Las cuentas cuadran: bruto, retenciones y neto."}</p>
      ${note}
      <div class="pay-actions"><button value="approve" data-upload-send ${state === "sending" ? "disabled" : ""}>${state === "sending" ? "Subiendo…" : "Subir y revisar"}</button><button data-upload-cancel ${state === "sending" ? "disabled" : ""}>Cancelar</button></div>
    </div>`;
  }

  // El input de fichero puede quedar fuera del DOM si la pantalla se repinta mientras el selector está abierto,
  // así que el listener se engancha al propio input en el momento del toque.
  const handled = new WeakMap();
  function fromInput(input) {
    const f = input.files?.[0];
    if (!f || handled.get(input) === f) return;
    handled.set(input, f); read(f);
  }
  function handleChange(target) {
    const input = target.closest?.("[data-upload-file]");
    if (!input) return false;
    fromInput(input); return true;
  }
  function handleClick(target) {
    const input = target.closest?.("[data-upload-file]");
    if (input) { input.addEventListener("change", () => fromInput(input), { once: true }); return false; }
    const b = target.closest?.("button");
    if (b?.hasAttribute("data-upload-send")) { send(); return true; }
    if (b?.hasAttribute("data-upload-cancel")) { cancel(); return true; }
    return false;
  }

  return { html, handleClick, handleChange, read, send, cancel, get state() { return state; }, get payload() { return payload; }, get result() { return result; }, reset() { state = "idle"; file = buffer = payload = result = null; message = error = ""; } };
}
