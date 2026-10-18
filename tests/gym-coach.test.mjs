import test from "node:test";
import assert from "node:assert/strict";
import { warmupSets, e1rmHistory, strengthTrend, sparklineSvg, trainingStreakWeeks, stalledLifts, deloadAdvice, applyDeload, weeklyMuscleSets, muscleBalance, alternatives, supersetLabels, photoReminder, mondayOf } from "../microapps/gym/coach.js";
import { GYM_LIBRARY } from "../microapps/gym/plan-editor.js";
import { exerciseInfo } from "../microapps/gym/exercise-info.js";

const S = (date, name, sets, muscle = "Espalda") => ({ id: date + name, workout_date: date, completed_at: date + "T20:00:00Z", exercises: [{ name, muscle, compound: true, sets: sets.map(([weight, reps]) => ({ weight, reps, rir: 2, completed: true })) }] });

test("Gym 2.38 · calentamiento solo en compuestos, sin repetir ni superar el peso de trabajo", () => {
  assert.deepEqual(warmupSets(100, { compound: true, bar: 20 }), [{ weight: 20, reps: 8 }, { weight: 60, reps: 5 }, { weight: 80, reps: 3 }]);
  assert.deepEqual(warmupSets(62.5, { compound: true }), [{ weight: 32.5, reps: 8 }, { weight: 47.5, reps: 4 }]);
  assert.deepEqual(warmupSets(60, { compound: false }), []);
  assert.deepEqual(warmupSets(15, { compound: true }), []);
  assert.deepEqual(warmupSets(25, { compound: true, bar: 20 }), [{ weight: 20, reps: 8 }]);
});

test("Gym 2.38 · tendencia de fuerza y gráfica sin inventar datos", () => {
  const rows = [S("2026-08-01", "Lat Pulldown", [[50, 10]]), S("2026-09-01", "Lat Pulldown", [[55, 10]]), S("2026-10-01", "Lat Pulldown", [[60, 10]])];
  const h = e1rmHistory(rows, "Lat Pulldown");
  assert.equal(h.length, 3); assert.equal(h[0].date, "2026-08-01");
  const t = strengthTrend(h);
  assert.equal(t.from.date, "2026-09-01"); assert.ok(Math.abs(t.pct - (60 - 55) / 55 * 100) < 1e-9);
  assert.equal(strengthTrend(h.slice(0, 1)), null);
  assert.equal(sparklineSvg(h.slice(0, 1)), "");
  assert.match(sparklineSvg(h), /<svg[^>]+role="img"/);
});

test("Gym 2.38 · descarga recomendada por semanas seguidas o compuestos estancados", () => {
  const weeks = [];
  for (let w = 0; w < 7; w++) { const d = new Date(Date.UTC(2026, 8, 7 + w * 7)); const a = d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 2); weeks.push(S(a, "Leg Press", [[100, 10]]), S(d.toISOString().slice(0, 10), "Leg Press", [[100, 10]])); }
  assert.equal(mondayOf("2026-10-18"), "2026-10-12");
  assert.equal(trainingStreakWeeks(weeks, "2026-10-25"), 7);
  const adv = deloadAdvice(weeks, ["Leg Press"], "2026-10-25");
  assert.ok(adv && /7 semanas/.test(adv.reason));
  assert.equal(deloadAdvice(weeks.slice(0, 4), [], "2026-09-27"), null);
  const flat = [100, 110, 112, 111, 112, 110].map((w, i) => S(`2026-09-${String(1 + i * 3).padStart(2, "0")}`, "Chest Press", [[w, 8]]));
  const flat2 = [80, 85, 90, 90, 89, 90].map((w, i) => S(`2026-09-${String(2 + i * 3).padStart(2, "0")}`, "Lat Pulldown", [[w, 8]]));
  assert.deepEqual(stalledLifts([...flat, ...flat2], ["Chest Press", "Lat Pulldown"]).sort(), ["Chest Press", "Lat Pulldown"]);
  assert.deepEqual(stalledLifts(flat.slice(0, 4), ["Chest Press"]), [], "con menos de 5 sesiones no se decide");
  const d = applyDeload({ compound: true, sets: [{ weight: 100 }, { weight: 100 }, { weight: 100 }, { weight: 100 }] });
  assert.equal(d.sets.length, 2); assert.equal(d.sets[0].weight, 90); assert.ok(d.deload);
  assert.equal(applyDeload({ compound: false, sets: [{ weight: 11.25 }] }).sets[0].weight, 10);
});

test("Gym 2.38 · balance semanal por músculo frente a 10–20 series", () => {
  const rows = [S("2026-10-12", "Lat Pulldown", [[60, 10], [60, 10], [60, 10], [60, 10]]), S("2026-10-14", "Seated Cable Row", Array(8).fill([50, 10])), S("2026-10-06", "Lat Pulldown", [[60, 10]])];
  assert.deepEqual(weeklyMuscleSets(rows, "2026-10-12"), { Espalda: 12 });
  const b = muscleBalance(rows, "2026-10-18", ["Espalda", "Pecho"]);
  assert.deepEqual(b.find(x => x.muscle === "Espalda"), { muscle: "Espalda", sets: 12, last: 1, state: "ok" });
  assert.equal(b.find(x => x.muscle === "Pecho").state, "low");
});

test("Gym 2.38 · alternativas, superseries y recordatorio de foto", () => {
  const alt = alternatives("Leg Press", GYM_LIBRARY, exerciseInfo);
  assert.ok(alt.length >= 4 && alt.every(x => x.name !== "Leg Press" && (x.muscle === "Piernas" || x.pattern === "Empuje de piernas")));
  assert.deepEqual(alternatives("Inventado", GYM_LIBRARY, exerciseInfo), []);
  assert.deepEqual(supersetLabels([{ superset: 1 }, {}, {}, { superset: 1 }, { superset: 1 }, {}]), ["A1", "A2", null, "B1", "B2", "B3"]);
  assert.deepEqual(supersetLabels([{}, { superset: 1 }]), [null, null], "el último no puede unirse a nada");
  assert.deepEqual(photoReminder(null, "2026-10-18"), { due: true, days: null });
  assert.deepEqual(photoReminder("2026-09-15", "2026-10-18"), { due: true, days: 33 });
  assert.equal(photoReminder("2026-10-01", "2026-10-18").due, false);
});
