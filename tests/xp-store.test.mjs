// Nivel único compartido: rango por nivel y valores para pintar en Gym, Study y Home.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rankFor, xpView, publishXp, getXp, onXp } from "../microapps/xp-store.js";
import { levelFor } from "../phase1.js";

test("rango por nivel: E hasta el 4, S desde el 30", () => {
  assert.deepEqual([1, 4, 5, 10, 15, 20, 29, 30, 99].map(rankFor), ["E", "E", "D", "C", "B", "A", "A", "S", "S"]);
});

test("xpView: sin datos muestra puntos suspensivos; con datos, nivel, XP y porcentaje coherentes", () => {
  publishXp(null);
  assert.equal(xpView().level, "…"); assert.equal(getXp(), null);
  let seen = null; const off = onXp(s => { seen = s; });
  publishXp({ xp: 1280, ...levelFor(1280) });
  const v = xpView(); off();
  assert.equal(v.level, "6"); assert.equal(v.nextLevel, "7"); assert.equal(v.toNext, "520"); assert.equal(v.rank, "D");
  assert.equal(v.pct, 5, "1280 XP: base 1250, siguiente 1800");
  assert.equal(seen.level, 6);
});
