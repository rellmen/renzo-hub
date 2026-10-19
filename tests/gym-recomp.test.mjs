import test from "node:test";
import assert from "node:assert/strict";
import { RECOMP_PLAN, isRecompPlan, parseReps } from "../microapps/gym/recomp-plan.js";
import { DEFAULT_PLAN } from "../gym.js";
import { validateGymPlan } from "../microapps/gym/plan-editor.js";
import { exerciseInfo } from "../microapps/gym/exercise-info.js";
import { standardFor } from "../microapps/gym/ranks.js";
import { restSeconds } from "../microapps/gym/rest-timer.js";
import { targetRir, suggestSets } from "../microapps/gym/progression.js";
import { supersetLabels } from "../microapps/gym/coach.js";
import { sessionClock, isStale } from "../microapps/gym/player.js";
import { readFileSync } from "node:fs";

test("Recomp 12 semanas · el CSV entero está en el plan por defecto", () => {
  assert.equal(DEFAULT_PLAN, RECOMP_PLAN);
  assert.equal(validateGymPlan(RECOMP_PLAN), true);
  assert.ok(isRecompPlan(RECOMP_PLAN));
  assert.equal(isRecompPlan([["X", "", [["Lat Pulldown", 3, 8, 12, "Espalda"]]]]), false);
  const csv = readFileSync(new URL("./fixtures/recomp_rise_hub.csv", import.meta.url), "utf8").trim().split("\n").slice(1).map(l => l.split(","));
  const flat = RECOMP_PLAN.flatMap(d => d[2]);
  assert.equal(flat.length, csv.length);
  csv.forEach((c, k) => {
    const e = flat[k], r = parseReps(c[6]);
    assert.equal(e[0], c[4]); assert.equal(e[1], Number(c[5])); assert.equal(e[2], r.min); assert.equal(e[3], r.max);
    assert.equal(e[7].rest, Number(c[7])); assert.equal(e[7].rir, Number(c[8]));
    // superserie: el primero de la pareja lleva la marca y el segundo comparte superset_id
    if (c[9] && flat[k + 1] && csv[k + 1]?.[9] === c[9]) assert.equal(e[6], 1);
    assert.ok(exerciseInfo(e[0]), `sin ficha: ${e[0]}`);
  });
  assert.deepEqual(parseReps("8-12 por pierna"), { min: 8, max: 12, unit: "por pierna" });
});

test("Recomp · descanso, RIR, superseries y rangos por ejercicio", () => {
  assert.equal(restSeconds({ rest: 75, compound: true }), 75);
  assert.equal(restSeconds({ compound: true }), 150);
  assert.equal(targetRir({ rir: 3 }), 3); assert.equal(targetRir({ compound: true }), 2);
  const wed = RECOMP_PLAN[2][2].map(e => ({ superset: !!e[6] }));
  assert.deepEqual(supersetLabels(wed).slice(5), ["A1", "A2"]);
  assert.ok(standardFor("Peso muerto rumano"));
  assert.equal(standardFor("Dominadas asistidas o jalón"), null);
  const s = suggestSets({ min: 8, max: 12, rir: 2, sets: [{}, {}] }, [{ weight: 20, reps: 12, rir: 2 }, { weight: 20, reps: 12, rir: 2 }]);
  assert.equal(s.mode, "increase");
});

test("Reloj de sesión · una sesión olvidada no muestra cientos de horas", () => {
  const start = "2026-10-07T10:00:00Z", now = Date.parse("2026-10-19T10:00:00Z");
  assert.ok(isStale(start, now));
  assert.match(sessionClock(start, now), /^Abierta desde /);
  assert.doesNotMatch(sessionClock(start, now), /288/);
  assert.equal(sessionClock("2026-10-19T09:00:00Z", now), "1:00:00");
});
