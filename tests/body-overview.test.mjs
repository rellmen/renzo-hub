import test from "node:test";
import assert from "node:assert/strict";
import { summarizeBody, renderBodyToday, moduleTexts, weekStart } from "../microapps/body/overview.js";

const w = (date, value) => ({ payload: { date, value }, occurred_at: `${date}T12:00:00.000Z` });

test("Body sin datos no inventa cifras", () => {
  const s = summarizeBody({ today: "2026-10-19" });
  assert.equal(s.weight.current, null);
  assert.equal(s.weight.goal, null);
  assert.equal(s.food, null);
  const html = renderBodyToday(s);
  assert.match(html, /Sin registros de peso/);
  assert.match(html, /Sin meta de peso/);
  assert.match(html, /Sin comidas registradas hoy/);
  assert.doesNotMatch(html, /\d+\/\d+ sesiones/);
});

test("peso actual, cambio en 30 días y meta desde el primer registro", () => {
  const s = summarizeBody({ today: "2026-10-19", weights: [w("2026-08-01", 84), w("2026-09-20", 80.2), w("2026-10-10", 79.6), w("2026-10-18", 79), w("2026-10-25", 70)], goals: { targetWeight: 78, sessionsPerWeek: 4 } });
  assert.deepEqual(s.weight.current, { date: "2026-10-18", value: 79 });
  assert.equal(s.weight.change, -1.2); // 80,2 (20 sep) → 79 (18 oct); el registro futuro se ignora
  assert.deepEqual(s.weight.goal, { target: 78, left: 1, pct: 83 });
});

test("sesiones de esta semana (lunes a domingo), comida y skin de hoy", () => {
  assert.equal(weekStart("2026-10-19"), "2026-10-19");
  assert.equal(weekStart("2026-10-25"), "2026-10-19");
  const s = summarizeBody({
    today: "2026-10-22",
    goals: { sessionsPerWeek: 4 },
    sessions: [{ workout_date: "2026-10-18", title: "Pull A", completed_at: "x" }, { workout_date: "2026-10-20", title: "Push A", completed_at: "x" }, { workout_date: "2026-10-21", title: "Piernas", completed_at: null }],
    food: [{ payload: { date: "2026-10-22", kcal: 600, protein: 40.4 } }, { payload: { date: "2026-10-22", kcal: "350", protein: 22 } }, { payload: { date: "2026-10-21", kcal: 900, protein: 50 } }],
    skin: [{ session: "am", completed_steps: [0, 1, 2] }, { session: "pm", completed_steps: [] }],
  });
  assert.deepEqual(s.gym, { week: 1, perWeek: 4, last: { date: "2026-10-20", title: "Push A" } });
  assert.deepEqual(s.food, { meals: 2, kcal: 950, protein: 62 });
  assert.deepEqual(s.skin, { am: 3, pm: 0 });
  const t = moduleTexts(s);
  assert.equal(t.gym[0], "Push A");
  assert.equal(t.skin.join(" · "), "AM hecho · PM pendiente");
  assert.match(renderBodyToday(s), /1\/4 sesiones esta semana/);
});

test("escapa el texto del usuario", () => {
  const s = summarizeBody({ today: "2026-10-20", sessions: [{ workout_date: "2026-10-20", title: "<img src=x>", completed_at: "x" }] });
  assert.equal(moduleTexts(s).gym[0], "<img src=x>"); // se pinta con textContent
  assert.doesNotMatch(renderBodyToday(s), /<img/);
});
