// Extracto de Revolut (PDF leído con pdf.js → filas, y CSV de la app). Datos FICTICIOS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRevolutRows, parseRevolutCsv, revolutDate, revolutAmount, balanceBreaks } from "../microapps/bank/revolut.js";
import { toRecord } from "../microapps/bank/ing-csv.js";
import { categorizeAll, monthSummary } from "../microapps/gastos/categories.js";
import { parseStatement } from "../microapps/bank/bank-import-ui.js";

const rows = JSON.parse(readFileSync(new URL("./fixtures/revolut-ficticio.rows.json", import.meta.url), "utf8"));

test("fechas e importes de Revolut (neerlandés, inglés, español)", () => {
  assert.equal(revolutDate("1 sep 2026"), "2026-09-01"); assert.equal(revolutDate("12 okt 2026"), "2026-10-12");
  assert.equal(revolutDate("3 Mar 2026"), "2026-03-03"); assert.equal(revolutDate("5 ago 2026"), "2026-08-05"); assert.equal(revolutDate("31 feb 2026"), null);
  assert.equal(revolutAmount("€1.185,80"), 1185.8); assert.equal(revolutAmount("€7,50"), 7.5); assert.equal(revolutAmount("€1,185.80"), 1185.8); assert.equal(revolutAmount("abc"), null);
});

test("lee el PDF: tarjeta, transferencia con nombre en dos líneas, recarga; ignora revertidos y pies de página", () => {
  const p = parseRevolutRows(rows);
  assert.equal(p.bank, "Revolut"); assert.deepEqual(p.accounts, ["NL00REVO0000000001"]);
  assert.equal(p.transactions.length, 3, "el movimiento revertido no cuenta");
  const [top, plus, juan] = p.transactions;
  assert.deepEqual([top.date, top.amount, top.balance, top.code, top.name], ["2026-07-01", 100, 110, "TOPUP", "Recarga desde tu tarjeta"]);
  assert.deepEqual([plus.amount, plus.code, plus.name, plus.description], [-12.5, "BA", "PLUS", "Supermarkt Test, Leende"]);
  assert.deepEqual([juan.amount, juan.code, juan.name, juan.description], [-40, "GT", "JUAN PEREZ GARCIA", "Cena"]);
  assert.deepEqual(p.balanceBreaks, []);
});

test("avisa si el saldo no cuadra con el movimiento anterior", () => {
  assert.deepEqual(balanceBreaks([{ date: "2026-07-01", name: "a", amount: 10, balance: 10 }, { date: "2026-07-02", name: "b", amount: -5, balance: 4 }]), ["2026-07-02 b"]);
});

test("rechaza lo que no es un extracto de Revolut en euros", () => {
  assert.throws(() => parseRevolutRows([{ page: 1, y: 1, items: [{ s: "Factuur", x: 1 }] }]), /Revolut/);
  const usd = structuredClone(rows); usd[0].items[0].s = "Afschrift USD";
  assert.throws(() => parseRevolutRows(usd), /USD/);
});

test("categorías: la recarga es un traspaso (no gasto) y PLUS es supermercado", async () => {
  const recs = await Promise.all(parseRevolutRows(rows).transactions.map(t => toRecord(t, "00000000-0000-4000-8000-0000000000aa")));
  assert.ok(recs.every(r => r.payload.bank === "Revolut" && r.payload.account === "…0001"));
  const s = monthSummary(categorizeAll(recs), "2026-07");
  assert.equal(s.spent, 52.5); assert.equal(s.transferTotal, 100);
  assert.equal(s.expenses.find(g => g.id === "supermercado").merchants[0].name, "Plus");
  assert.equal(s.expenses.find(g => g.id === "personas_enviado").total, 40);
});

test("CSV de la app de Revolut: solo completados en EUR, comisión incluida", () => {
  const csv = "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance\n"
    + "TOPUP,Current,2026-07-01 10:00:00,2026-07-01 10:00:01,Top-up by *0000,100.00,0.00,EUR,COMPLETED,110.00\n"
    + "CARD_PAYMENT,Current,2026-07-02 12:00:00,2026-07-03 09:00:00,PLUS,-12.50,0.00,EUR,COMPLETED,97.50\n"
    + "CARD_PAYMENT,Current,2026-07-04 12:00:00,,Winkel,-9.99,0.00,EUR,REVERTED,\n"
    + "CARD_PAYMENT,Current,2026-07-05 12:00:00,2026-07-05 12:00:00,Shop USA,-5.00,0.00,USD,COMPLETED,10.00\n"
    + "EXCHANGE,Current,2026-07-06 12:00:00,2026-07-06 12:00:00,Exchanged to USD,-20.00,-0.50,EUR,COMPLETED,77.00";
  const p = parseRevolutCsv(csv);
  assert.deepEqual(p.transactions.map(t => [t.date, t.amount, t.code]), [["2026-07-01", 100, "TOPUP"], ["2026-07-03", -12.5, "BA"], ["2026-07-06", -19.5, ""]]);
  assert.deepEqual(p.balanceBreaks, ["2026-07-06 Exchanged to USD"], "la comisión hace que no cuadre: se avisa");
  assert.throws(() => parseRevolutCsv("a,b\n1,2"), /CSV de Revolut/);
});

test("detección del banco por el archivo", async () => {
  const file = (name, type, text) => ({ name, type, text: async () => text, arrayBuffer: async () => new ArrayBuffer(0) });
  assert.equal((await parseStatement(file("r.csv", "text/csv", "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance\nCARD_PAYMENT,Current,2026-07-02,2026-07-02,PLUS,-1.00,0,EUR,COMPLETED,1.00"))).bank, "Revolut");
  assert.equal((await parseStatement(file("i.csv", "text/csv", readFileSync(new URL("./fixtures/ing-ficticio.csv", import.meta.url), "utf8")))).bank, "ING");
  assert.equal((await parseStatement(file("r.pdf", "application/pdf", ""), { pdfRows: async () => rows })).transactions.length, 3);
});
