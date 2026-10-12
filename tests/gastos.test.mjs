// Gastos por categoría: nombres de comercio, reglas por defecto, reglas del usuario, aporte al alquiler y resumen mensual.
// Datos FICTICIOS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { merchantName, categorize, categorizeAll, monthSummary, monthsOf, rentContributions, CATEGORIES, CATEGORY } from "../microapps/gastos/categories.js";
import { parseIngCsv, toRecord } from "../microapps/bank/ing-csv.js";

const tx = (name, amount, extra = {}) => ({ id: name + amount + (extra.date || ""), payload: { name, amount, date: "2026-09-10", code: "BA", ...extra } });

test("nombre del comercio: marca, sin número de tienda, ciudad, país ni forma jurídica", () => {
  assert.equal(merchantName("Albert Heijn 1234 EINDHOVEN NLD"), "Albert Heijn");
  assert.equal(merchantName("AH to go 5521 Utrecht"), "Albert Heijn");
  assert.equal(merchantName("SP KBEAUTY STORE ROTTERDAM NLD"), "Kbeauty Store");
  assert.equal(merchantName("CCV*PERUVIAN CUISINE N AMSTERDAM"), "Peruvian Cuisine N");
  assert.equal(merchantName("de Brouwer Weert B.V. Weert NLD"), "De Brouwer Weert");
  assert.equal(merchantName("Golazo Athletics B.V., Golazo Let's via Stichting Mollie Payments"), "Golazo Athletics");
  assert.equal(merchantName("Supermarkt Smetsers B. LEENDE"), "Supermarkt Smetsers");
  assert.equal(merchantName("Revolut**1591* Dublin IRL"), "Revolut");
  assert.equal(merchantName("Q PARK HEUVEL EINDHOVEN NLD"), "Q-Park");
});

test("categorías por defecto con comercios habituales en Países Bajos", () => {
  const c = (name, amount = -10, extra) => categorize(tx(name, amount, extra)).category;
  assert.equal(c("Albert Heijn 1234 EINDHOVEN NLD"), "supermercado");
  assert.equal(c("Jumbo Weert"), "supermercado");
  assert.equal(c("Supermarkt Smetsers B. LEENDE"), "supermercado");
  assert.equal(c("Shell Nederweert"), "gasolina");
  assert.equal(c("Q PARK HEUVEL EINDHOVEN NLD"), "coche");
  assert.equal(c("All In Carw.Nederweert NLD"), "coche");
  assert.equal(c("CCV*PERUVIAN CUISINE N AMSTERDAM"), "restaurantes");
  assert.equal(c("NYX*VendingWork Groningen NLD"), "restaurantes");
  assert.equal(c("Zilveren Kruis Zorgverzekeringen"), "seguros");
  assert.equal(c("TransIP B.V.", -0.59, { code: "IC" }), "suscripciones");
  assert.equal(c("Uniqlo Koningsplein Amsterdam"), "compras");
  assert.equal(c("Kosten OranjePakket met korting", -3.55, { code: "DV" }), "banco");
  assert.equal(c("Revolut**1591* Dublin IRL", -50, { code: "GT" }), "traspaso");
  assert.equal(c("Belastingdienst", 129, { code: "OV" }), "toeslagen");
  assert.equal(c("Belastingdienst", -40, { code: "IC" }), "impuestos");
  assert.equal(c("SD WORX STAFFING SOLUTIONS B.V.", 600, { payslip_numbers: [25] }), "nomina");
  assert.equal(c("Huurbaas", -900, { code: "GT", counterparty: "NL00", description: "Huur augustus" }), "alquiler");
  assert.equal(c("Jan Jansen", 20, { code: "GT", counterparty: "NL00" }), "personas_recibido");
  assert.equal(c("Jan Jansen", -20, { code: "GT", counterparty: "NL00" }), "personas_enviado");
  assert.equal(c("Comercio Desconocido Weert"), "sin_categoria", "lo que no se reconoce queda sin categoría (no se inventa)");
  // Comercios que Renzo identificó (12 oct): Umans = gasolinera, Body Supplies = suplementos, el resto restaurantes
  assert.equal(c("Umans Winters HamontAchel BEL"), "gasolina"); assert.equal(c("Umans"), "gasolina"); assert.equal(c("UmansWinters Hamont BEL"), "gasolina");
  assert.equal(c("Body Supplies"), "salud"); assert.equal(c("Ls Smaeck"), "restaurantes");
  assert.equal(c("FEG Exploitatie B.V. WEERT NLD"), "restaurantes"); assert.equal(c("de Brouwer Weert B.V. Weert NLD"), "restaurantes");
});

test("prioridad: categoría puesta a mano > regla del usuario por comercio > regla por defecto", () => {
  const ah = tx("Albert Heijn 1234 EINDHOVEN NLD", -10);
  const rule = { payload: { merchant: "albert heijn", category: "restaurantes" } };
  assert.deepEqual([categorize(ah).category, categorize(ah).source], ["supermercado", "default"]);
  assert.deepEqual([categorize(ah, [rule]).category, categorize(ah, [rule]).source], ["restaurantes", "rule"]);
  const manual = { ...ah, payload: { ...ah.payload, category: "compras" } };
  assert.deepEqual([categorize(manual, [rule]).category, categorize(manual, [rule]).source], ["compras", "manual"]);
  assert.equal(categorize({ ...ah, payload: { ...ah.payload, category: "no-existe" } }).category, "supermercado", "categoría desconocida se ignora");
});

test("aporte al alquiler: mismo importe o la mitad, a 10 días o menos, resta del alquiler", () => {
  const items = categorizeAll([
    tx("Casero", -1350, { code: "GT", counterparty: "NL01", description: "October Rent", date: "2026-09-29" }),
    tx("Persona A", 675, { code: "GT", counterparty: "NL02", date: "2026-09-27" }),
    tx("Persona A", 50, { code: "GT", counterparty: "NL02", date: "2026-09-28" }),
    tx("Persona B", 675, { code: "GT", counterparty: "NL03", date: "2026-08-01" })
  ]);
  const byAmount = a => items.find(i => i.amount === a && i.date >= "2026-09");
  assert.equal(byAmount(675).category, "alquiler"); assert.equal(byAmount(675).contribution, true);
  assert.equal(byAmount(50).category, "personas_recibido");
  assert.equal(items.find(i => i.date === "2026-08-01").category, "personas_recibido", "lejos del pago de alquiler: no es aporte");
  const s = monthSummary(items, "2026-09");
  assert.equal(s.expenses.find(g => g.id === "alquiler").total, 675, "1350 de alquiler − 675 de aporte");
  assert.equal(rentContributions([]).size, 0);
});

test("resumen del mes con el CSV ficticio: gasto, ingresos, nómina y comercios agrupados", async () => {
  const csv = readFileSync(new URL("./fixtures/ing-ficticio.csv", import.meta.url), "utf8");
  const recs = await Promise.all(parseIngCsv(csv).transactions.map(t => toRecord(t, "00000000-0000-4000-8000-0000000000aa")));
  const items = categorizeAll(recs);
  assert.deepEqual(monthsOf(items), ["2026-07"]);
  const s = monthSummary(items, "2026-07");
  assert.equal(s.spent, 946.9); assert.equal(s.earned, 1193.88); assert.equal(s.net, 246.98); assert.equal(s.uncategorized, 0);
  const sup = s.expenses.find(g => g.id === "supermercado");
  assert.equal(sup.total, 46.9); assert.deepEqual(sup.merchants.map(m => [m.name, m.total, m.count]), [["Albert Heijn", 46.9, 2]]);
  assert.equal(s.expenses[0].id, "alquiler", "ordenado de mayor a menor gasto");
  assert.equal(s.income.find(g => g.id === "nomina").total, 1193.88);
});

test("los traspasos a tus cuentas no cuentan como gasto", () => {
  const s = monthSummary(categorizeAll([tx("Revolut**1591* Dublin IRL", -800, { code: "GT" }), tx("Albert Heijn 1", -20)]), "2026-09");
  assert.equal(s.spent, 20); assert.equal(s.transferTotal, -800);
});

test("catálogo de categorías coherente", () => {
  assert.equal(new Set(CATEGORIES.map(c => c.id)).size, CATEGORIES.length);
  assert.ok(CATEGORIES.every(c => ["expense", "income", "transfer"].includes(c.kind)));
  for (const id of ["deudas", "prestamos", "supermercado", "restaurantes", "alquiler", "gasolina", "seguros", "suscripciones", "traspaso", "sin_categoria"]) assert.ok(CATEGORY[id], id);
});
