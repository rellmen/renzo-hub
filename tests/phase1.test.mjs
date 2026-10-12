// Tests de la lógica de Fase 1 (sin red ni DOM).
import test from "node:test";
import assert from "node:assert/strict";
import { xpEvents, levelFor, weekStats, stableId, XP_RULES } from "../phase1.js";

const data = {
  gym: [{ id: "g1", workout_date: "2026-10-06", completed_at: "2026-10-06T18:00:00Z" }, { id: "g2", workout_date: "2026-10-07", completed_at: null }],
  skin: [{ routine_date: "2026-10-07", session: "am", completed_steps: ["a"] }, { routine_date: "2026-10-07", session: "pm", completed_steps: [] }],
  food: [{ id: "f1", payload: { date: "2026-10-07", kcal: 600, protein: 40 } }, { id: "f2", payload: { date: "2026-10-07", kcal: 900, protein: 50 } }, { id: "f3", payload: { date: "2026-10-05", kcal: 2000 } }],
  weight: [{ id: "w1", payload: { date: "2026-09-01", value: 84 } }, { id: "w2", payload: { date: "2026-10-07", value: 82.4 } }],
  habits: [{ id: "h1", payload: { habit: "Agua", date: "2026-10-07", done: true } }, { id: "h2", payload: { habit: "Leer", date: "2026-10-07", done: false } }],
  vocabulary: [{ id: "v1", occurred_at: "2026-10-07T12:00:00Z" }],
  portfolio: [],
  money: [{ status: "active", payload: { kind: "payslip", net: 700, date: "2026-10-03" } }, { status: "active", payload: { kind: "expense", amount: 50, date: "2026-10-04" } },
    { status: "void", payload: { kind: "expense", amount: 999, date: "2026-10-04" } }],
};

test("XP solo a partir de registros reales y completados", () => {
  const ev = xpEvents(data);
  const kinds = ev.reduce((m, e) => (m[e.kind] = (m[e.kind] || 0) + 1, m), {});
  assert.deepEqual(kinds, { workout: 1, skincare: 1, food_day: 2, weight_day: 2, habit: 1, vocabulary: 1 });
  assert.equal(ev.reduce((s, e) => s + e.points, 0), XP_RULES.workout + XP_RULES.skincare + 2 * XP_RULES.food_day + 2 * XP_RULES.weight_day + XP_RULES.habit + XP_RULES.vocabulary);
});

test("XP sin duplicados: claves de evento únicas y ids estables", async () => {
  const ev = xpEvents({ ...data, food: data.food.concat(data.food) });
  const keys = ev.map(e => `${e.kind}:${e.sourceId}`);
  assert.equal(new Set(keys).size, keys.length);
  const a = await stableId("u1", "xp", "workout", "g1"), b = await stableId("u1", "xp", "workout", "g1"), c = await stableId("u2", "xp", "workout", "g1");
  assert.equal(a, b); assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("niveles", () => {
  assert.equal(levelFor(0).level, 1); assert.equal(levelFor(49).level, 1); assert.equal(levelFor(50).level, 2);
  assert.equal(levelFor(200).level, 3); assert.equal(levelFor(120).toNext, 80);
});

test("estadísticas de 7 días con datos reales y 'sin datos' cuando faltan", () => {
  const s = weekStats(data, "2026-10-07", ["Agua", "Leer"]);
  assert.equal(s.workouts, 1); assert.equal(s.skin, 1); assert.equal(s.foodDays, 2);
  assert.equal(s.kcalAvg, Math.round((600 + 900 + 2000) / 2));
  assert.deepEqual(s.weight, { value: 82.4, date: "2026-10-07", delta: -1.6 });
  assert.deepEqual(s.habits, { done: 1, possible: 14 });
  assert.deepEqual(s.money, { net: 650, count: 2 }); // el movimiento anulado no cuenta
  const empty = weekStats({}, "2026-10-07", []);
  assert.equal(empty.weight, null); assert.equal(empty.money, null); assert.equal(empty.habits, null); assert.equal(empty.kcalAvg, null);
});

test("nivel único: check-in Body, práctica de neerlandés, entregables y movimientos revisados suman XP", () => {
  const events = [
    { id: "e1", payload: { kind: "body", date: "2026-10-01" } },
    { id: "e2", payload: { kind: "learning", stage: "Application", date: "2026-10-01" } },
    { id: "e3", payload: { kind: "learning", stage: "Consumption", date: "2026-10-01" } },
    { id: "e4", payload: { kind: "project_done", date: "2026-10-02" } },
    { id: "e5", payload: { kind: "output", date: "2026-10-02" } }
  ];
  const money = [{ id: "m1", status: "active", payload: { reviewed: true, date: "2026-10-03" } }, { id: "m2", status: "active", payload: { date: "2026-10-03" } }, { id: "m3", status: "void", payload: { reviewed: true, date: "2026-10-03" } }];
  const ev = xpEvents({ events, money });
  assert.deepEqual(ev.map(e => e.kind).sort(), ["checkin", "deliverable", "deliverable", "dutch_practice", "money_review"]);
  assert.equal(ev.reduce((s, e) => s + e.points, 0), XP_RULES.checkin + XP_RULES.dutch_practice + 2 * XP_RULES.deliverable + XP_RULES.money_review);
  assert.equal(xpEvents({ events: [{ id: "x", payload: { kind: "learning", stage: "Consumption" } }] }).length, 0, "consumir sin aplicar no da XP");
});
