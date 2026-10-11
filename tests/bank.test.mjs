// Importación del extracto de ING (CSV) y enlace con las nóminas. Datos FICTICIOS (tests/fixtures/ing-ficticio.csv).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseIngCsv, euro, payslipNumbers, shortDescription, toRecord, transactionKey, matchPayslips, importSummary, BankCsvError } from "../microapps/bank/ing-csv.js";
import { payDate } from "../payroll.js";

const csv = readFileSync(new URL("./fixtures/ing-ficticio.csv", import.meta.url), "utf8");
const UID = "00000000-0000-4000-8000-0000000000aa";

test("importes y números de nómina", () => {
  assert.equal(euro("1.493,88"), 1493.88); assert.equal(euro("23,45"), 23.45); assert.equal(euro("666.48"), 666.48); assert.equal(euro("abc"), null);
  assert.deepEqual(payslipNumbers("Betreft loonslipnummers 19-20 IBAN: NL"), [19, 20]);
  assert.deepEqual(payslipNumbers("Betreft loonslipnummer 25 IBAN"), [25]);
  assert.deepEqual(payslipNumbers("loonslipnummers 3, 4 en 5"), [3, 4, 5]);
  assert.deepEqual(payslipNumbers("October Rent"), []);
  assert.equal(shortDescription("Name: R.Zar Description: October Rent IBAN: NL39 Date/time: 29-09"), "October Rent");
});

test("lee el CSV de ING en inglés: signos, saldo, nóminas y líneas rotas", () => {
  const p = parseIngCsv(csv);
  assert.equal(p.transactions.length, 5); assert.deepEqual(p.skippedLines, [7]);
  assert.equal(p.from, "2026-07-22"); assert.equal(p.to, "2026-07-29");
  const [salary, ah] = p.transactions;
  assert.equal(salary.amount, 493.88); assert.deepEqual(salary.payslipNumbers, [7]); assert.equal(salary.balance, 1493.88);
  assert.equal(ah.amount, -23.45); assert.equal(ah.name, "Albert Heijn 1234 EINDHOVEN NLD");
  assert.equal(p.transactions[3].description, "Huur augustus");
});

test("lee también la exportación en neerlandés (Af/Bij)", () => {
  const nl = '"Datum";"Naam / Omschrijving";"Rekening";"Tegenrekening";"Code";"Af Bij";"Bedrag (EUR)";"Mutatiesoort";"Mededelingen";"Saldo na mutatie";"Tag"\n'
    + '"20260729";"SD WORX";"NL00TEST0000000001";"NL00TEST0000000099";"OV";"Bij";"493,88";"Overschrijving";"Naam: SD WORX Omschrijving: Betreft loonslipnummer 7 IBAN: NL00";"1.493,88";""\n'
    + '"20260728";"Albert Heijn";"NL00TEST0000000001";"";"BA";"Af";"23,45";"Betaalautomaat";"Pasvolgnr: 900";"1.000,00";""';
  const p = parseIngCsv(nl);
  assert.deepEqual(p.transactions.map(t => t.amount), [493.88, -23.45]);
  assert.deepEqual(p.transactions[0].payslipNumbers, [7]); assert.equal(p.transactions[0].description, "Betreft loonslipnummer 7");
});

test("mismo movimiento = mismo id (en inglés o neerlandés); movimientos iguales del mismo día no se pisan", async () => {
  const en = parseIngCsv(csv).transactions;
  const ids = await Promise.all(en.map(t => toRecord(t, UID).then(r => r.id)));
  assert.equal(new Set(ids).size, 5, "dos compras iguales en Albert Heijn el mismo día siguen siendo dos movimientos");
  const again = await Promise.all(parseIngCsv(csv).transactions.map(t => toRecord(t, UID).then(r => r.id)));
  assert.deepEqual(again, ids);
  const nl = parseIngCsv('"Datum";"Naam / Omschrijving";"Rekening";"Tegenrekening";"Code";"Af Bij";"Bedrag (EUR)";"Mutatiesoort";"Mededelingen";"Saldo na mutatie";"Tag"\n"20260729";"SD WORX";"NL00TEST0000000001";"";"OV";"Bij";"493,88";"Overschrijving";"Omschrijving: loonslipnummer 7";"1.493,88";""').transactions[0];
  assert.equal((await toRecord(nl, UID)).id, ids[0]);
  assert.notEqual((await toRecord(en[0], "00000000-0000-4000-8000-0000000000bb")).id, ids[0], "otro usuario, otro id");
  assert.match(ids[0], /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.ok(transactionKey(en[0], UID).includes("2026-07-29"));
});

test("el registro guardado: money/bank_tx, importado y revisado, cuenta propia enmascarada", async () => {
  const r = await toRecord(parseIngCsv(csv).transactions[0], UID);
  assert.equal(r.domain, "money"); assert.equal(r.record_type, "bank_tx"); assert.equal(r.source, "import"); assert.equal(r.requires_review, false);
  assert.equal(r.payload.account, "…0001"); assert.deepEqual(r.payload.payslip_numbers, [7]); assert.equal(r.occurred_at, "2026-07-29T12:00:00.000Z");
  const ah = await toRecord(parseIngCsv(csv).transactions[1], UID);
  assert.equal(ah.payload.payslip_numbers, null);
});

test("rechaza archivos que no son extractos de ING", () => {
  assert.throws(() => parseIngCsv(""), BankCsvError);
  assert.throws(() => parseIngCsv('"Fecha";"Concepto"\n"1";"2"'), /No parece un extracto de ING/);
});

// Nóminas ficticias: nº 5 (semana 28, normal), nº 6 (pago extra de la semana 28), nº 7 (semana 29)
const slips = [
  { id: "a", payslip_number: "5", period_type: "weekly", period_year: 2026, period_number: 28, net_payment: 600, review_status: "approved" },
  { id: "b", payslip_number: "6", period_type: "weekly", period_year: 2026, period_number: 28, is_correction: true, payment_date: "2026-07-21", net_payment: 100, review_status: "pending" },
  { id: "c", payslip_number: "7", period_type: "weekly", period_year: 2026, period_number: 29, net_payment: 493.88, review_status: "approved" }
];

test("enlaza cada ingreso con sus nóminas, también dos nóminas en un solo ingreso", () => {
  const m = matchPayslips(slips, parseIngCsv(csv).transactions, payDate);
  assert.equal(m.size, 3);
  assert.deepEqual(m.get("a"), { date: "2026-07-22", amount: 700, numbers: [5, 6], together: ["6"], expected: 700, diff: 0 });
  assert.equal(m.get("b").date, "2026-07-22", "el pago extra se cobró el 22, no el 21 que pone la nómina");
  assert.equal(m.get("c").diff, 0);
});

test("no enlaza a medias, ni con otro año, ni lejos de la fecha de cobro", () => {
  const txs = parseIngCsv(csv).transactions;
  assert.equal(matchPayslips(slips.filter(p => p.id !== "b"), txs, payDate).has("a"), false, "falta la nº 6: el ingreso 5-6 no se enlaza");
  assert.equal(matchPayslips([{ ...slips[2], period_year: 2024 }], txs, payDate).size, 0);
  assert.equal(matchPayslips([{ ...slips[2], period_number: 10 }], txs, payDate).size, 0, "semana 10 se cobra en marzo, no en julio");
  assert.equal(matchPayslips([{ ...slips[2], review_status: "rejected" }], txs, payDate).size, 0);
});

test("avisa de diferencias y de nóminas que faltan en la app", () => {
  const parsed = parseIngCsv(csv);
  const s = importSummary(parsed, [slips[0], slips[1], { ...slips[2], net_payment: 490 }], payDate, new Set(["x"]), ["x", "y"]);
  assert.equal(s.total, 5); assert.equal(s.salaryCount, 2); assert.equal(s.salaryTotal, 1193.88); assert.equal(s.matched, 3);
  assert.equal(s.mismatched.length, 1); assert.equal(s.mismatched[0].diff, 3.88); assert.equal(s.alreadyImported, 1);
  assert.equal(s.income, 1193.88); assert.equal(s.expenses, -946.9);
  assert.deepEqual(importSummary(parsed, [slips[2]], payDate).unmatched, [5, 6]);
});
