import test from "node:test";
import assert from "node:assert/strict";
import { muscleView, prevLabel, elapsed, nextPending } from "../microapps/gym/player.js";

test("vista del cuerpo según el músculo del plan", () => {
  assert.deepEqual(muscleView("Espalda"), { view: "back", regions: ["Espalda"] });
  assert.deepEqual(muscleView("Tríceps"), { view: "back", regions: ["Tríceps"] });
  assert.equal(muscleView("Pecho").view, "front");
  assert.deepEqual(muscleView("Piernas").regions, ["Cuádriceps", "Glúteos", "Isquiotibiales"]);
  assert.equal(muscleView("Piernas").view, "front");
});

test("columna Anterior: solo series hechas y con datos", () => {
  assert.equal(prevLabel({ weight: 39, reps: 15, completed: true }), "39 × 15");
  assert.equal(prevLabel({ weight: 62.5, reps: 6, completed: true }), "62,5 × 6");
  assert.equal(prevLabel({ weight: 40, reps: 8, completed: false }), "—");
  assert.equal(prevLabel(undefined), "—");
});

test("reloj de sesión", () => {
  const t0 = Date.parse("2026-10-19T10:00:00Z");
  assert.equal(elapsed("2026-10-19T10:00:00Z", t0 + 3000), "0:03");
  assert.equal(elapsed("2026-10-19T10:00:00Z", t0 + 61000), "1:01");
  assert.equal(elapsed("2026-10-19T10:00:00Z", t0 + 3723000), "1:02:03");
  assert.equal(elapsed("2026-10-19T10:00:00Z", t0 - 5000), "0:00");
});

test("paso al siguiente ejercicio con series pendientes", () => {
  const ex = s => ({ sets: s.map(c => ({ completed: c })) });
  const list = [ex([true, true]), ex([false]), ex([true]), ex([false, true])];
  assert.equal(nextPending(list, 0), 1);
  assert.equal(nextPending(list, 1), 3);
  assert.equal(nextPending(list, 3), 1);
  assert.equal(nextPending([ex([true])], 0), 0);
});
