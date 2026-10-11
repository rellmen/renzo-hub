// Extracto de ING (Países Bajos) en CSV → movimientos normalizados. Funciona en el navegador y en Node (sin dependencias).
// Admite la exportación en inglés ("Date";"Name / Description";…;"Debit/credit";"Amount (EUR)";…) y en neerlandés
// ("Datum";"Naam / Omschrijving";…;"Af Bij";"Bedrag (EUR)";…). Nada se guarda aquí: solo se lee y se valida.

export class BankCsvError extends Error { constructor(message) { super(message); this.name = "BankCsvError"; } }

const HEADERS = {
  date: ["date", "datum"],
  name: ["name / description", "naam / omschrijving"],
  account: ["account", "rekening"],
  counterparty: ["counterparty", "tegenrekening"],
  code: ["code"],
  direction: ["debit/credit", "af bij"],
  amount: ["amount (eur)", "bedrag (eur)"],
  type: ["transaction type", "mutatiesoort"],
  notes: ["notifications", "mededelingen"],
  balance: ["resulting balance", "saldo na mutatie"],
  tag: ["tag"]
};
const REQUIRED = ["date", "name", "direction", "amount"];
export const MAX_ROWS = 5000;

// Separa una línea CSV respetando comillas ("" dentro de un campo = comilla literal).
function splitLine(line, sep) {
  const out = []; let cur = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

// "1.314,43" → 1314.43 · "-0,58" → -0.58 · "666.48" → 666.48
export function euro(text) {
  const s = String(text ?? "").trim().replace(/\s|€/g, "");
  if (!/^-?[\d.,]+$/.test(s)) return null;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function isoDate(text) {
  const s = String(text ?? "").trim();
  let m = s.match(/^(\d{4})(\d{2})(\d{2})$/) || s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return valid(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  return m ? valid(`${m[3]}-${m[2]}-${m[1]}`) : null;
}
function valid(iso) { const d = new Date(`${iso}T00:00:00Z`); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === iso ? iso : null; }

// "Betreft loonslipnummers 19-20" → [19, 20] · "loonslipnummer 25" → [25] · "loonslipnummers 3, 4 en 5" → [3, 4, 5]
export function payslipNumbers(text) {
  const m = String(text ?? "").match(/loonslip\s*nummers?\s*:?\s*([\d\s,\-–]+(?:\s*(?:en|and|y)\s*\d+)?)/i);
  if (!m) return [];
  const nums = new Set();
  for (const part of m[1].split(/,|\s(?:en|and|y)\s/i)) {
    const range = part.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) { const a = Number(range[1]), b = Number(range[2]); if (b >= a && b - a <= 10) for (let n = a; n <= b; n++) nums.add(n); }
    else for (const d of part.match(/\d+/g) || []) nums.add(Number(d));
  }
  return [...nums].filter(n => n > 0 && n < 10000).sort((a, b) => a - b);
}

// Texto útil de "Notifications/Mededelingen": la descripción si la hay, sin IBAN ni referencias largas.
export function shortDescription(notes) {
  const s = String(notes ?? "");
  const d = s.match(/(?:Description|Omschrijving):\s*(.*?)(?=\s+(?:IBAN|Reference|Kenmerk|Value date|Valutadatum|Date\/time|Datum\/Tijd|Mandate|Machtiging|Creditor|Incassant)\b|$)/i);
  return (d ? d[1] : "").trim().slice(0, 200);
}

export function parseIngCsv(text) {
  const raw = String(text ?? "").replace(/^﻿/, "");
  const lines = raw.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new BankCsvError("El archivo está vacío o no tiene movimientos.");
  const sep = lines[0].includes(";") ? ";" : ",";
  const head = splitLine(lines[0], sep).map(h => h.toLowerCase());
  const col = {};
  for (const [key, names] of Object.entries(HEADERS)) { const i = head.findIndex(h => names.includes(h)); if (i >= 0) col[key] = i; }
  const missing = REQUIRED.filter(k => col[k] === undefined);
  if (missing.length) throw new BankCsvError("No parece un extracto de ING en CSV: faltan las columnas de fecha, nombre, débito/crédito o importe.");
  if (lines.length - 1 > MAX_ROWS) throw new BankCsvError(`El archivo tiene más de ${MAX_ROWS} movimientos. Descarga un periodo más corto.`);
  const out = [], problems = [];
  lines.slice(1).forEach((line, idx) => {
    const f = splitLine(line, sep), get = k => col[k] === undefined ? "" : f[col[k]] ?? "";
    const date = isoDate(get("date")), amount = euro(get("amount")), dir = get("direction").toLowerCase();
    const credit = ["credit", "bij"].includes(dir), debit = ["debit", "af"].includes(dir);
    if (!date || amount == null || amount < 0 || (!credit && !debit)) { problems.push(idx + 2); return; }
    const notes = get("notes");
    out.push({
      date, amount: credit ? amount : -amount, name: get("name").slice(0, 200),
      account: get("account"), counterparty: get("counterparty"), code: get("code"), type: get("type"),
      description: shortDescription(notes), notes: notes.slice(0, 1000),
      balance: col.balance === undefined ? null : euro(get("balance")), tag: get("tag"),
      payslipNumbers: payslipNumbers(notes)
    });
  });
  if (!out.length) throw new BankCsvError("No se ha podido leer ningún movimiento del archivo.");
  const accounts = [...new Set(out.map(t => t.account).filter(Boolean))];
  const dates = out.map(t => t.date).sort();
  return { bank: "ING", transactions: out, accounts, from: dates[0], to: dates[dates.length - 1], skippedLines: problems };
}

// Huella estable de un movimiento: mismo movimiento = mismo id aunque se importe dos veces o en otro idioma.
// Usa fecha, importe con signo, saldo resultante y cuenta (el saldo hace único cada movimiento del día).
export function transactionKey(t, ownerId) {
  return [ownerId, "ING", t.account, t.date, t.amount.toFixed(2), t.balance == null ? "" : t.balance.toFixed(2), t.balance == null ? t.name + "|" + t.notes : ""].join("|");
}

// sha-256 → UUID con forma válida (versión 5, variante RFC 4122), para usarlo como id en hub_records.
export async function uuidFromKey(key) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const mask = iban => iban && iban.length > 4 ? `…${iban.slice(-4)}` : iban || "";

// Fila de hub_records (domain money, record_type bank_tx). La cuenta propia se guarda solo con los 4 últimos dígitos.
export async function toRecord(t, ownerId) {
  return {
    id: await uuidFromKey(transactionKey(t, ownerId)),
    owner_id: ownerId, domain: "money", record_type: "bank_tx",
    title: t.name || "Movimiento", status: "confirmed", occurred_at: `${t.date}T12:00:00.000Z`,
    source: "import", requires_review: false,
    payload: {
      bank: "ING", account: mask(t.account), date: t.date, amount: t.amount, name: t.name,
      counterparty: t.counterparty || null, code: t.code || null, type: t.type || null,
      description: t.description || null, notes: t.notes || null, balance: t.balance, tag: t.tag || null,
      payslip_numbers: t.payslipNumbers.length ? t.payslipNumbers : null
    }
  };
}

// --- Nóminas ↔ banco ---
const DAY = 86400000;
const days = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY);
const isSalary = t => (t.payslip_numbers || t.payslipNumbers || []).length > 0;

// Enlaza cada ingreso "loonslipnummer N" con su nómina: mismo número, mismo año y cobro cerca de la fecha esperada
// (entre 10 días antes y 30 después). Devuelve Map(payslipId → { date, amount, numbers, together, expected, diff }).
export function matchPayslips(payslips, txs, expectedDate) {
  const out = new Map();
  for (const tx of txs) {
    const t = tx.payload || tx, nums = t.payslip_numbers || t.payslipNumbers || [];
    if (!isSalary(t) || !(t.amount > 0)) continue;
    const found = nums.map(n => payslips.find(p => String(p.payslip_number ?? "").trim() === String(n)
      && p.validation_status !== "failed" && p.review_status !== "rejected"
      && Math.abs(Number(p.period_year) - Number(t.date.slice(0, 4))) <= 1
      && (d => d == null || (d >= -30 && d <= 10))(expectedDate(p) ? days(expectedDate(p), t.date) : null))).filter(Boolean);
    if (found.length !== nums.length) continue; // si falta alguna nómina del ingreso, no se enlaza a medias
    const expected = Math.round(found.reduce((s, p) => s + Number(p.net_payment ?? p.net_salary ?? 0), 0) * 100) / 100;
    for (const p of found) out.set(p.id, { date: t.date, amount: t.amount, numbers: nums, together: found.filter(x => x !== p).map(x => x.payslip_number), expected, diff: Math.round((t.amount - expected) * 100) / 100 });
  }
  return out;
}

// Resumen para la vista previa de la importación.
export function importSummary(parsed, payslips, expectedDate, existingIds = new Set(), ids = []) {
  const txs = parsed.transactions;
  const salary = txs.filter(isSalary);
  const matches = matchPayslips(payslips, salary, expectedDate);
  const matchedNumbers = new Set([...matches.keys()].map(id => String(payslips.find(p => p.id === id)?.payslip_number)));
  const unmatched = salary.flatMap(t => t.payslipNumbers).filter(n => !matchedNumbers.has(String(n)));
  const mismatched = [...new Map([...matches.values()].filter(m => Math.abs(m.diff) > 0.02).map(m => [m.date + m.numbers.join(","), m])).values()];
  const sum = list => Math.round(list.reduce((s, t) => s + t.amount, 0) * 100) / 100;
  return {
    total: txs.length, from: parsed.from, to: parsed.to, accounts: parsed.accounts.map(mask),
    income: sum(txs.filter(t => t.amount > 0)), expenses: sum(txs.filter(t => t.amount < 0)),
    salaryCount: salary.length, salaryTotal: sum(salary), matched: matches.size, unmatched, mismatched,
    alreadyImported: ids.filter(id => existingIds.has(id)).length, skippedLines: parsed.skippedLines
  };
}
