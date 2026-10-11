// Extracto de Revolut → movimientos normalizados (mismo formato que el CSV de ING: date, amount con signo, name, …).
// Admite el PDF del extracto (neerlandés, inglés o español; se lee con pdf.js en el dispositivo) y el CSV de la app.
// Comprueba el saldo de cada movimiento contra el anterior: si algo no cuadra, se avisa en la vista previa.
import { BankCsvError, payslipNumbers } from "./ing-csv.js";

const MONTHS = { jan: 1, ene: 1, feb: 2, mrt: 3, mar: 3, apr: 4, abr: 4, mei: 5, may: 5, jun: 6, jul: 7, aug: 8, ago: 8, sep: 9, sept: 9, okt: 10, oct: 10, nov: 11, dec: 12, dic: 12 };
const DATE = /^(\d{1,2})\s+([a-zé]{3,4})\.?\s+(\d{4})$/i;
const pad = n => String(n).padStart(2, "0");
export function revolutDate(s) {
  const m = DATE.exec(String(s ?? "").trim()); if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()]; if (!month) return null;
  const iso = `${m[3]}-${pad(month)}-${pad(m[1])}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === iso ? iso : null;
}
// "€1.185,80" · "€7,50" · "-€3,00" · "€1,185.80" (inglés)
export function revolutAmount(s) {
  let t = String(s ?? "").replace(/\s|€|EUR/g, "");
  if (!/^-?[\d.,]+$/.test(t)) return null;
  if (/,\d{2}$/.test(t)) t = t.replace(/\./g, "").replace(",", "."); else t = t.replace(/,/g, "");
  const n = Number(t); return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const HEAD = { date: /^(datum|date|fecha)$/i, desc: /^(beschrijving|description|descripci[oó]n)$/i, out: /^(uitgegeven geld|money out|dinero saliente|salida)$/i, in: /^(ontvangen geld|money in|dinero entrante|entrada)$/i, bal: /^(saldo|balance)$/i };
const IGNORED_SECTION = /teruggedraaid|reverted|revertid|in behandeling|pending|pendiente|in afwachting/i;
const MAIN_SECTION = /rekeningtransacties|account transactions|transacciones de la cuenta/i;
const FOOTER = /^(©|pagina|page|página)\b|revolut bank uab|verloren of gestolen|report lost|deposito|gereguleerd|draudimas/i;

const isTransfer = d => /^(overschrijving (van|naar)|to |transfer (to|from)|betaling van|payment from|transferencia (a|de))/i.test(d);
const isTopUp = d => /geld toevoegen|top.?up|added money|money added|recarga|apple pay top|\{xpay\}/i.test(d);
const cleanName = (desc, party) => {
  const d = desc.replace(/^(overschrijving (van|naar)|to|transfer (to|from)|betaling van|payment from|transferencia (a|de))\s+/i, "").replace(/\s+via\s+.*$/i, "");
  return (party && isTransfer(desc) ? party.replace(/\s+via\s+.*$/i, "") : d).trim();
};

// Filas de pdf.js ({ page, y, items: [{ s, x }] }) → movimientos.
export function parseRevolutRows(rows) {
  const all = rows.map(r => r.items.map(i => i.s).join(" ")).join("\n");
  if (!/revolut/i.test(all)) throw new BankCsvError("No parece un extracto de Revolut.");
  const iban = (all.match(/\b(NL\d{2}REVO\d{10}|LT\d{2}3250\d{11}|[A-Z]{2}\d{2}REVO[0-9A-Z]{8,20})\b/) || [])[1] || "";
  const currency = (all.match(/(?:afschrift|statement|extracto)\s+([A-Z]{3})\b/i) || [])[1] || "EUR";
  if (currency.toUpperCase() !== "EUR") throw new BankCsvError(`El extracto es en ${currency}. Solo se admiten cuentas en euros.`);
  let cols = null, skip = false;
  const txs = [], problems = [];
  let cur = null;
  const close = () => { if (cur) { txs.push(cur); cur = null; } };
  for (const r of rows) {
    const first = r.items[0]?.s || "", text = r.items.map(i => i.s).join(" ");
    if (r.items.some(i => HEAD.date.test(i.s)) && r.items.some(i => HEAD.bal.test(i.s))) {
      close();
      const x = re => r.items.find(i => re.test(i.s))?.x;
      cols = { date: x(HEAD.date), desc: x(HEAD.desc), out: x(HEAD.out), in: x(HEAD.in), bal: x(HEAD.bal) };
      continue;
    }
    if (FOOTER.test(text)) { close(); continue; }
    if (!cols) continue;
    const date = revolutDate(first);
    if (date && Math.abs(r.items[0].x - cols.date) <= 12) {
      close();
      if (skip) continue;
      const money = r.items.slice(1).filter(i => /€|^-?[\d.,]+$/.test(i.s) && revolutAmount(i.s) != null && i.x > cols.desc + 60);
      const pick = (lo, hi) => money.find(i => i.x >= lo && i.x < hi);
      const outItem = pick(cols.out - 30, (cols.out + cols.in) / 2), inItem = pick((cols.out + cols.in) / 2, (cols.in + cols.bal) / 2 - 10), balItem = pick((cols.in + cols.bal) / 2 - 10, Infinity);
      const desc = r.items.filter(i => i.x >= cols.desc - 5 && i.x < cols.out - 30).map(i => i.s).join(" ").trim();
      const out = outItem ? revolutAmount(outItem.s) : null, inn = inItem ? revolutAmount(inItem.s) : null;
      if ((out == null) === (inn == null)) { problems.push(`${date} ${desc}`); continue; }
      cur = { date, desc, amount: out != null ? -out : inn, balance: balItem ? revolutAmount(balItem.s) : null, extra: [] };
      continue;
    }
    if (!date && Math.abs((r.items[0]?.x ?? 0) - (cols.date ?? 0)) <= 12 && r.items.length === 1 && !/^\d/.test(first)) {
      // Título de sección (por ejemplo "Teruggedraaide transacties"): se ignoran sus movimientos.
      close();
      if (IGNORED_SECTION.test(text)) skip = true; else if (MAIN_SECTION.test(text)) skip = false;
      continue;
    }
    if (cur && r.items[0].x >= cols.desc - 5) cur.extra.push(text);
  }
  close();
  if (!txs.length) throw new BankCsvError("No se ha podido leer ningún movimiento del extracto de Revolut.");
  const out = txs.map(t => {
    const ref = (t.extra.find(l => /^(referentie|reference|referencia):/i.test(l)) || "").replace(/^[^:]+:\s*/, "");
    const partyLine = (t.extra.find(l => /^(aan|van|to|from|a|de):/i.test(l)) || "").replace(/^[^:]+:\s*/, "");
    const card = t.extra.some(l => /^(kaart|card|tarjeta):/i.test(l));
    const wrapped = t.extra.filter(l => !/^[a-z]+:/i.test(l)).join(" ");
    const desc = `${t.desc}${wrapped && isTransfer(t.desc) ? " " + wrapped : ""}`.replace(/\s+/g, " ").trim();
    const counterpartyIban = (partyLine.match(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/) || [])[0] || null;
    const party = partyLine.replace(/,\s*[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b.*$/, "").trim();
    const topUp = isTopUp(desc);
    return {
      bank: "Revolut", date: t.date, amount: t.amount, balance: t.balance, account: iban,
      name: topUp ? "Recarga desde tu tarjeta" : cleanName(desc, party).slice(0, 200),
      description: [party && !isTransfer(desc) ? party : "", ref].filter(Boolean).join(" · ").slice(0, 200),
      notes: [desc, ...t.extra].join(" | ").slice(0, 1000),
      counterparty: counterpartyIban || (isTransfer(desc) ? party : ""),
      code: topUp ? "TOPUP" : card ? "BA" : isTransfer(desc) ? "GT" : "",
      type: topUp ? "Top-up" : card ? "Card" : isTransfer(desc) ? "Transfer" : "", tag: "",
      payslipNumbers: payslipNumbers(ref)
    };
  });
  return finish(out, problems, rows);
}

// Saldo de cada movimiento = saldo anterior + importe (±1 céntimo). Devuelve las fechas donde no cuadra.
export function balanceBreaks(txs) {
  const breaks = [];
  for (let i = 1; i < txs.length; i++) {
    const a = txs[i - 1], b = txs[i];
    if (a.balance == null || b.balance == null) continue;
    if (Math.abs(Math.round((a.balance + b.amount) * 100) - Math.round(b.balance * 100)) > 1) breaks.push(`${b.date} ${b.name}`);
  }
  return breaks;
}

function finish(out, problems) {
  const dates = out.map(t => t.date).sort();
  return { bank: "Revolut", transactions: out, accounts: [...new Set(out.map(t => t.account).filter(Boolean))], from: dates[0], to: dates[dates.length - 1], skippedLines: problems, balanceBreaks: balanceBreaks(out) };
}

// CSV de la app de Revolut: Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
function splitCsv(line) {
  const out = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c; }
  out.push(cur); return out.map(s => s.trim());
}
export function parseRevolutCsv(text) {
  const lines = String(text ?? "").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim());
  const head = splitCsv(lines[0] || "").map(h => h.toLowerCase());
  const col = k => head.indexOf(k);
  if (col("completed date") < 0 || col("amount") < 0 || col("description") < 0) throw new BankCsvError("No parece un CSV de Revolut.");
  const out = [], problems = [];
  lines.slice(1).forEach((line, idx) => {
    const f = splitCsv(line), get = k => col(k) < 0 ? "" : f[col(k)] ?? "";
    if (get("currency") && get("currency").toUpperCase() !== "EUR") return;
    if (get("state") && !/completed|voltooid|completado/i.test(get("state"))) return; // pendientes o revertidos no cuentan
    const date = (get("completed date") || get("started date")).slice(0, 10), amount = revolutAmount(get("amount")), fee = revolutAmount(get("fee")) || 0;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || amount == null) { problems.push(idx + 2); return; }
    const desc = get("description"), type = get("type"), topUp = /topup|top-up/i.test(type) || isTopUp(desc), transfer = /transfer/i.test(type) || isTransfer(desc);
    out.push({ bank: "Revolut", date, amount: Math.round((amount - fee) * 100) / 100, balance: revolutAmount(get("balance")), account: "",
      name: topUp ? "Recarga desde tu tarjeta" : cleanName(desc, ""), description: "", notes: [type, get("product"), desc].join(" | "),
      counterparty: transfer ? cleanName(desc, "") : "", code: topUp ? "TOPUP" : transfer ? "GT" : /card/i.test(type) ? "BA" : "", type, tag: "", payslipNumbers: [] });
  });
  if (!out.length) throw new BankCsvError("No se ha podido leer ningún movimiento del CSV de Revolut.");
  out.sort((a, b) => a.date.localeCompare(b.date));
  return finish(out, problems);
}
