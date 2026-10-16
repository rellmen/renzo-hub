// Lectura de nóminas en PDF de SD Worx (Loonspecificatie) en el navegador, sin IA ni n8n.
// 1) extractRows: texto con posiciones (pdf.js, servido desde /vendor/pdfjs).
// 2) parseSdWorx: reglas fijas sobre esas posiciones -> payload de payroll_ingest.
// Todo lo leído pasa siempre por revisión humana (validation_status "review_required").

const NUM = /^-?\d{1,3}(?:\.\d{3})*,\d{2}$/;
const HOURS = /^(\d{1,3}):(\d{2})$/;
export const num = s => Number(String(s).replace(/\./g, "").replace(",", "."));
export const hours = s => { const m = HOURS.exec(String(s).trim()); return m ? Number(m[1]) + Number(m[2]) / 60 : null; };
const isoDate = s => { const m = /(\d{2})-(\d{2})-(\d{4})/.exec(s || ""); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; };
const round2 = n => Math.round(n * 100) / 100;

let pdfjsPromise = null;
async function loadPdfjs() {
  if (!pdfjsPromise) pdfjsPromise = import("/vendor/pdfjs/pdf.min.js").then(lib => {
    lib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
    return lib;
  });
  return pdfjsPromise;
}

// Filas de texto: [{ page, y, items: [{ s, x }] }], de arriba abajo y de izquierda a derecha.
export async function extractRows(data, lib, maxPages = 4) {
  const pdfjs = lib || await loadPdfjs();
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  const rows = [];
  for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    const pageRows = [];
    for (const it of tc.items) {
      const s = String(it.str || "").trim(); if (!s) continue;
      const x = Math.round(it.transform[4]), y = Math.round(it.transform[5]);
      let row = pageRows.find(r => Math.abs(r.y - y) <= 2);
      if (!row) { row = { page: p, y, items: [] }; pageRows.push(row); }
      row.items.push({ s, x });
    }
    pageRows.forEach(r => r.items.sort((a, b) => a.x - b.x));
    rows.push(...pageRows.sort((a, b) => b.y - a.y));
  }
  await doc.destroy?.();
  return rows;
}

const text = r => r.items.map(i => i.s).join(" ");
const label = r => r.items[0]?.s || "";
// Valor tras los dos puntos: pdf.js a veces junta ":" y el valor en un mismo trozo de texto.
const valueAfterColon = r => {
  const i = r.items.findIndex(it => /^:/.test(it.s) || /:\s*$/.test(it.s));
  if (i < 0) return r.items.at(-1)?.s;
  const rest = r.items[i].s.replace(/^.*?:\s*/, "").trim();
  return rest || r.items[i + 1]?.s;
};

// Columnas de la tabla principal (x en puntos), iguales en todas las nóminas de SD Worx revisadas.
function columns(r) {
  const c = {};
  for (const it of r.items) {
    if (!NUM.test(it.s)) continue;
    const v = num(it.s), x = it.x;
    if (x >= 225 && x < 260) c.base = v;
    else if (x >= 260 && x < 310) c.mutFiscal = v;
    else if (x >= 310 && x < 352) c.mutPay = v;
    else if (x >= 352 && x < 395) c.totBase = v;
    else if (x >= 395 && x < 440) c.totFiscal = v;
    else if (x >= 440 && x < 495) c.totPay = v;
  }
  c.mut = c.mutPay ?? c.mutFiscal ?? null;
  return c;
}

const RULES = [
  [/^Loon normale uren/i, "income", "regular_pay"],
  [/^ORT/i, "income", "shift_allowance"],
  // SD Worx etiqueta las horas extra como "Loon overwerkuren 130%" / "Loon overwerkuren 150%" (W40/W41 2026).
  [/^(Loon\s+)?(Overuren|Overwerk)/i, "income", "overtime_pay"],
  [/^Vakantiedagen/i, "income", "holiday_pay"],
  [/^Feestdagen/i, "income", "holiday_pay"],
  [/^Vakantiegeld/i, "income", "vakantiegeld"],
  [/^Totaal bruto loon/i, "total", "gross_salary"],
  [/^PAWW/i, "deduction", "social"],
  [/^Premie AZV/i, "deduction", "social"],
  [/^StiPP|Pensioen/i, "deduction", "pension_contribution"],
  [/^Loon voor loonbelasting/i, "total", "loon_voor_loonheffing"],
  [/^Loonheffingen/i, "deduction", "loonheffing"],
  [/^Gediff\. premie Whk|WGA/i, "deduction", "social"],
  [/^Netto loon/i, "total", "net_salary"],
  [/^Reiskostenvergoeding/i, "income_net", "travel_allowance"],
  [/^Netto te betalen/i, "total", "net_payment"]
];

export class PayslipParseError extends Error {}

export function parseSdWorx(rows) {
  const all = rows.map(text).join("\n");
  if (!rows.some(r => /^Loonspecificatie$/i.test(label(r)))) throw new PayslipParseError("No parece una nómina (Loonspecificatie).");
  if (!/SD Worx/i.test(all)) throw new PayslipParseError("Solo se leen nóminas de SD Worx por ahora.");
  const find = rx => rows.find(r => rx.test(text(r)));
  const tijdvak = /Tijdvak:\s*Week\s*(\d{1,2})\s*\((\d{4})\)/i.exec(all);
  if (!tijdvak) throw new PayslipParseError("No encuentro la semana (Tijdvak). Solo se leen nóminas semanales.");
  const week = Number(tijdvak[1]), year = Number(tijdvak[2]);
  const periode = /Periode:\s*(\d{2}-\d{2}-\d{4})\s*t\/m\s*(\d{2}-\d{2}-\d{4})/i.exec(all);
  const numberRow = find(/Nummer loonspecificatie/i);
  const payslipNumber = numberRow ? valueAfterColon(numberRow) : null;
  if (!payslipNumber || !/^\d{1,4}$/.test(payslipNumber)) throw new PayslipParseError("No encuentro el número de nómina.");
  const employerRow = find(/Loonheffingennummer/i);
  const verloning = isoDate(find(/Datum verloning/i) && valueAfterColon(find(/Datum verloning/i)));
  const administratie = isoDate(find(/Datum administratie/i) && valueAfterColon(find(/Datum administratie/i)));
  const employeeNumber = /Personeelsnummer:\s*(\d+)/i.exec(all)?.[1] || null;
  const nameRow = rows.find(r => r.page === 1 && /^(De heer|Mevrouw|Dhr\.|Mw\.)\s/i.test(label(r)));
  const employeeName = nameRow ? label(nameRow).replace(/^(De heer|Mevrouw|Dhr\.|Mw\.)\s+/i, "") : null;

  // Tabla principal: desde la cabecera "Omschrijving" hasta "Netto te betalen" (página 1).
  const head = rows.findIndex(r => r.page === 1 && /^Omschrijving/i.test(label(r)));
  const end = rows.findIndex((r, i) => i > head && /^Netto te betalen/i.test(label(r)));
  if (head < 0 || end < 0) throw new PayslipParseError("No encuentro la tabla de importes de la nómina.");

  const out = { regular_pay: 0, shift_allowance: 0, overtime_pay: 0, holiday_pay: 0, vakantiegeld: 0, social: 0, pension_contribution: 0, loonheffing: 0, travel_allowance: 0 };
  const totals = {}, lineItems = [], unknown = [];
  let bijzonder = null;
  for (const r of rows.slice(head + 1, end + 1)) {
    const name = label(r);
    if (/^-+/.test(name) || /^=+/.test(name)) continue;
    const c = columns(r);
    const rule = RULES.find(([rx]) => rx.test(name));
    if (!rule) { if (c.mut != null) unknown.push(name); continue; }
    const [, kind, field] = rule;
    if (kind === "total") { totals[field] = c.mut; continue; }
    if (c.mut == null || c.mut === 0) continue;
    // Retenciones en positivo; una devolución (importe positivo en la columna Betalen) resta.
    const amount = kind === "deduction" ? -c.mut : c.mut;
    out[field] = round2(out[field] + amount);
    if (field === "loonheffing" && /bijz/i.test(name) && c.base) bijzonder = round2(Math.abs(c.mut) / c.base * 100);
    lineItems.push({ category: kind === "deduction" ? "deduction" : "income", code: field, label_original: name, amount: c.mut, rate: c.base ?? null });
  }
  for (const k of ["gross_salary", "loon_voor_loonheffing", "net_salary", "net_payment"])
    if (totals[k] == null) throw new PayslipParseError(`No encuentro el importe "${k}" en la nómina.`);

  // Bloque de declaración (encima de la tabla): horas y tarifa por hora.
  let regularHours = 0, shiftHours = 0, overtimeHours = 0, hourlyRate = null;
  for (const r of rows.slice(0, head)) {
    if (r.page !== 1) continue;
    const h = r.items.map(i => hours(i.s.replace(/\s*à$/, ""))).find(v => v != null);
    if (h == null) continue;
    const rate = r.items.find(i => NUM.test(i.s) && i.x >= 225 && i.x < 260);
    if (/^Loon normale uren/i.test(label(r))) { regularHours += h; if (rate) hourlyRate = num(rate.s); }
    else if (/^ORT/i.test(label(r))) shiftHours += h;
    else if (/^(Loon\s+)?(Overuren|Overwerk)/i.test(label(r))) overtimeHours += h;
  }

  // Página 2: acumulados del año y saldo de vacaciones.
  const cumRow = rows.find(r => /^IB \+ IIB/i.test(label(r)) && r.items.some(i => NUM.test(i.s) && i.x >= 215 && i.x < 260));
  const cumTaxRow = rows.find(r => /^\d{4}\.\d{2}\.\d{3}\.L\d+/.test(label(r)));
  const cumGross = cumRow ? num(cumRow.items.find(i => NUM.test(i.s) && i.x >= 215 && i.x < 260).s) : null;
  const cumTaxable = cumTaxRow ? (v => v ? num(v.s) : null)(cumTaxRow.items.find(i => NUM.test(i.s) && i.x >= 340 && i.x < 395)) : null;
  const cumTax = cumTaxRow ? (v => v ? num(v.s) : null)(cumTaxRow.items.find(i => NUM.test(i.s) && i.x >= 395 && i.x < 440)) : null;
  const holidayRow = rows.find(r => r.page > 1 && /^Vakantiedagen/i.test(label(r)));
  const holidayTaken = holidayRow ? hours(holidayRow.items.find(i => i.x >= 440 && i.x < 480 && HOURS.test(i.s))?.s || "") : null;

  const social = out.social, deductions = round2(out.pension_contribution + social + out.loonheffing);
  const incomeSum = round2(out.regular_pay + out.shift_allowance + out.overtime_pay + out.holiday_pay + out.vakantiegeld);
  const check = (rule, expected, actual, message) => ({ rule, severity: "error", passed: Math.abs(expected - actual) <= 0.02, expected: round2(expected), actual: round2(actual), difference: round2(actual - expected), message });
  const checks = [
    check("gross_sum", incomeSum, totals.gross_salary, "La suma de conceptos coincide con el bruto"),
    check("net_salary", totals.gross_salary - deductions, totals.net_salary, "Bruto menos retenciones coincide con el neto"),
    check("net_payment", totals.net_salary + out.travel_allowance, totals.net_payment, "Neto más gastos de viaje coincide con lo pagado")
  ];
  if (unknown.length) checks.push({ rule: "unknown_lines", severity: "warning", passed: false, message: `Conceptos no reconocidos: ${unknown.join(", ")}` });
  const passed = checks.every(c => c.passed);

  const payslip = {
    employee_name: employeeName, employee_number: employeeNumber, payslip_number: payslipNumber,
    period_type: "weekly", period_year: year, period_number: week, period_label: `${year}-W${String(week).padStart(2, "0")}`,
    period_start: isoDate(periode?.[1]), period_end: isoDate(periode?.[2]),
    payment_date: verloning, document_date: verloning || administratie, currency: "EUR",
    hourly_rate: hourlyRate, worked_hours: round2(regularHours + shiftHours + overtimeHours) || null, regular_hours: round2(regularHours) || null,
    overtime_hours: round2(overtimeHours) || null,
    holiday_hours: holidayTaken || null,
    gross_salary: totals.gross_salary, regular_pay: out.regular_pay || null, overtime_pay: out.overtime_pay || null,
    holiday_pay: out.holiday_pay || null, vakantiegeld: out.vakantiegeld || null, shift_allowance: out.shift_allowance || null,
    travel_allowance: out.travel_allowance || null, taxable_income: totals.loon_voor_loonheffing,
    loonheffing: out.loonheffing, wage_tax: out.loonheffing, social_contributions: social || null,
    pension_contribution: out.pension_contribution || null, total_deductions: deductions,
    net_salary: totals.net_salary, net_payment: totals.net_payment, bank_payment: totals.net_payment,
    loon_voor_loonheffing: totals.loon_voor_loonheffing, bijzonder_tarief_pct: bijzonder, tabel_type: "week",
    cumulative_gross: cumGross, cumulative_tax: cumTax, cumulative_taxable_income: cumTaxable,
    is_correction: false, corrected_period_ref: null
  };
  return {
    employer: { name: employerRow ? label(employerRow) : "SD Worx Staffing Solutions", code: "SDWORX", loonheffingennummer: employerRow ? valueAfterColon(employerRow) : null },
    payslip, line_items: lineItems, checks,
    validation_status: "review_required", confidence_overall: passed ? 0.95 : 0.5,
    text_method: "text_layer", model_name: "renzo-hub-parser", prompt_version: "sdworx-v1",
    summary: `Nómina nº ${payslipNumber} · semana ${week} de ${year} · neto ${totals.net_payment}`
  };
}
