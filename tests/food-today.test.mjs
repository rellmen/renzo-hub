import test from "node:test";
import assert from "node:assert/strict";
import { progressAgainst, renderFoodToday } from "../microapps/food/today.js";

test("objetivo por rango: por debajo, dentro y por encima", () => {
  assert.deepEqual(progressAgainst(1500, 2200, 2400), { pct: 63, state: "under", left: 700, target: "2200–2400", minPct: 92 });
  assert.equal(progressAgainst(2300, 2200, 2400).state, "in");
  assert.equal(progressAgainst(2600, 2200, 2400).pct, 100);
  assert.equal(progressAgainst(2600, 2200, 2400).state, "over");
  assert.equal(progressAgainst(150, 150, null).target, "150");
});

test("sin perfil no inventa objetivo", () => {
  assert.equal(progressAgainst(900, null, null).pct, null);
  const html = renderFoodToday({ kcal: 900, protein: 50, meals: 2 }, {});
  assert.match(html, /Sin objetivo\. Añádelo en Ajustes/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.match(html, /2 comidas/);
});

test("con perfil muestra lo que falta y la marca del mínimo", () => {
  const html = renderFoodToday({ kcal: 1240, protein: 92, meals: 3 }, { kcalMin: 2200, kcalMax: 2400, proteinMin: 140, proteinMax: 160 });
  assert.match(html, /Faltan 960 kcal para el mínimo · objetivo 2200–2400 kcal/);
  assert.match(html, /Faltan 48 g para el mínimo/);
  assert.equal((html.match(/role="progressbar"/g) || []).length, 2);
});
