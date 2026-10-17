import test from "node:test";
import assert from "node:assert/strict";
import { e1rm, bestE1rm, lastSets, suggestSets, isRecord, sessionSummary, platesPerSide } from "../microapps/gym/progression.js";
import { TIERS, standardFor, rankFor, exerciseRanks, muscleRanks, overallRank, latestBodyWeight } from "../microapps/gym/ranks.js";
import { exerciseInfo } from "../microapps/gym/exercise-info.js";
import { restSeconds, fmtClock } from "../microapps/gym/rest-timer.js";
import { DEFAULT_PLAN } from "../gym.js";
import { GYM_LIBRARY } from "../microapps/gym/plan-editor.js";

const S = (id, date, name, sets, extra = {}) => ({ id, workout_date: date, completed_at: date + "T20:00:00Z", exercises: [{ name, muscle: "Espalda", compound: true, sets: sets.map(([weight, reps, rir]) => ({ weight, reps, rir, completed: true })) }], ...extra });

test("Gym · e1RM Epley y récords solo con series de hasta 12 reps", () => {
  assert.equal(e1rm(100, 0), 0); assert.equal(e1rm(100, 15), 0);
  assert.ok(Math.abs(e1rm(60, 10) - 80) < 1e-9);
  const rows = [S("a", "2026-10-01", "Lat Pulldown", [[60, 10, 2]]), S("b", "2026-10-05", "Lat Pulldown", [[62.5, 8, 2]])];
  assert.ok(Math.abs(bestE1rm(rows, "Lat Pulldown") - 80) < 1e-9);
  assert.equal(bestE1rm(rows, "Lat Pulldown", "a").toFixed(2), (62.5 * (1 + 8 / 30)).toFixed(2));
  assert.ok(isRecord({ weight: 65, reps: 9 }, 80)); assert.ok(!isRecord({ weight: 60, reps: 10 }, 80)); assert.ok(!isRecord({ weight: 60, reps: 10 }, 0));
  assert.equal(lastSets(rows, "Lat Pulldown").date, "2026-10-05");
});

test("Gym · doble progresión: sube peso, suma reps o descarga", () => {
  const compound = { name: "Lat Pulldown", min: 6, max: 10, compound: true, sets: [{}, {}, {}] };
  const up = suggestSets(compound, { sets: [{ weight: 60, reps: 10, rir: 2 }, { weight: 60, reps: 10, rir: 2 }, { weight: 60, reps: 10, rir: 2 }] });
  assert.equal(up.mode, "increase"); assert.deepEqual(up.sets.map(s => [s.weight, s.reps]), [[62.5, 6], [62.5, 6], [62.5, 6]]);
  const reps = suggestSets(compound, { sets: [{ weight: 60, reps: 8, rir: 2 }, { weight: 60, reps: 7, rir: 1 }] });
  assert.equal(reps.mode, "reps"); assert.deepEqual(reps.sets.map(s => [s.weight, s.reps]), [[60, 9], [60, 8], [60, 8]]);
  const down = suggestSets(compound, { sets: [{ weight: 70, reps: 4, rir: 0 }] });
  assert.equal(down.mode, "deload"); assert.equal(down.sets[0].weight, 67.5);
  const iso = { name: "Lateral Raise", min: 12, max: 20, compound: false, sets: [{}, {}] };
  assert.equal(suggestSets(iso, { sets: [{ weight: 10, reps: 20, rir: 1 }, { weight: 10, reps: 20, rir: 1 }] }).sets[0].weight, 11.25);
  assert.equal(suggestSets(compound, null), null);
  // Llegar al tope pero al fallo (RIR 0 en compuesto) no sube el peso.
  assert.equal(suggestSets(compound, { sets: [{ weight: 60, reps: 10, rir: 0 }, { weight: 60, reps: 10, rir: 0 }, { weight: 60, reps: 10, rir: 0 }] }).mode, "reps");
});

test("Gym · resumen de sesión con récords y calculadora de discos", () => {
  const prev = S("a", "2026-10-01", "Lat Pulldown", [[60, 10, 2]]);
  const now = S("b", "2026-10-08", "Lat Pulldown", [[65, 10, 2], [65, 9, 1]], { duration_minutes: 48 });
  const sum = sessionSummary(now, [prev, now]);
  assert.equal(sum.sets, 2); assert.equal(sum.volume, 65 * 19); assert.equal(sum.records.length, 1); assert.equal(sum.minutes, 48);
  assert.deepEqual(platesPerSide(100), [25, 15]); assert.deepEqual(platesPerSide(42.5), [10, 1.25]); assert.equal(platesPerSide(10), null); assert.deepEqual(platesPerSide(30, 10), [10]); assert.equal(platesPerSide(21), null);
});

test("Gym · rangos por ejercicio y músculo con estándares orientativos", () => {
  assert.equal(TIERS.length, 7);
  assert.equal(standardFor("Leg Press").muscle, "Cuádriceps"); assert.equal(standardFor("Romanian Deadlift").muscle, "Isquiotibiales");
  assert.equal(standardFor("Cable Lateral Raise").pattern, "Elevación lateral en polea/máquina"); assert.equal(standardFor("Incline Dumbbell Curl").pattern, "Curl con mancuerna");
  assert.equal(standardFor("Hanging Knee Raise"), null);
  const t = [0.5, 0.7, 0.9, 1.1, 1.3, 1.5];
  assert.equal(rankFor(0.3, t).label, "Hierro 2"); assert.equal(rankFor(0.55, t).label, "Bronce 1"); assert.equal(rankFor(0.95, t).tier.name, "Oro"); assert.equal(rankFor(2, t).label, "Élite"); assert.equal(rankFor(0, t), null);
  const rows = [S("a", "2026-10-01", "Lat Pulldown", [[60, 10, 2]], { body_weight: 80 }), { ...S("b", "2026-10-02", "Leg Press", [[150, 10, 2]]), exercises: [{ name: "Leg Press", muscle: "Piernas", sets: [{ weight: 150, reps: 10, rir: 2, completed: true }] }] }];
  const bw = latestBodyWeight(rows, 84); assert.deepEqual(bw, { kg: 80, estimated: false });
  assert.deepEqual(latestBodyWeight([], 84), { kg: 84, estimated: true });
  const ex = exerciseRanks(rows, 80); const lat = ex.find(x => x.name === "Lat Pulldown");
  assert.equal(lat.rank.tier.name, "Oro"); assert.equal(lat.muscle, "Espalda"); assert.ok(lat.nextKg > lat.e1rm);
  const m = muscleRanks(ex); assert.ok(m.Espalda && m["Cuádriceps"]); assert.ok(overallRank(m).label);
});

test("Gym · fichas de técnica para todo el plan inicial y la biblioteca", () => {
  const names = new Set([...DEFAULT_PLAN.flatMap(d => d[2].map(e => e[0])), ...GYM_LIBRARY.map(x => x.name)]);
  const missing = [...names].filter(n => !exerciseInfo(n));
  assert.deepEqual(missing, []);
  for (const n of names) { const i = exerciseInfo(n); assert.ok(i.cues.length >= 3 && i.mistake && i.pattern, n); }
  assert.equal(exerciseInfo("Inventado"), null);
  assert.equal(restSeconds({ compound: true }), 150); assert.equal(restSeconds({}), 90); assert.equal(fmtClock(95), "1:35");
});
