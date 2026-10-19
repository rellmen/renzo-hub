// Programa "Recomp 12 semanas" (recomp_rise_hub.csv de Renzo, 19 oct 2026). Sustituye la rutina de 5 días anterior.
// Formato del plan (el mismo de siempre, validateGymPlan): [título, cardio, [[nombre, series, repsMín, repsMáx, músculo, compuesto, superserieConElSiguiente, opciones]]].
// opciones = { program, rest (s), rir, note, unit, ref } · ref = ficha de técnica de la biblioteca (exercise-info.js).
export const RECOMP_PROGRAM_ID = "recomp_12w";

// [nombre, series, "reps", descanso s, RIR, superserie con el siguiente, nota, músculo, compuesto, ficha]
const DAYS = [
  ["Lunes · Push", [
    ["Press inclinado con mancuernas", 3, "6-10", 150, 2, 0, "Banco 20-30 grados", "Pecho", 1, "Incline Dumbbell Press"],
    ["Press pecho en máquina", 2, "8-12", 120, 2, 0, "Controlar bajada", "Pecho", 1, "Chest Press"],
    ["Press hombro en máquina", 2, "8-12", 120, 2, 0, "Sin arquear espalda", "Hombros", 1, "Shoulder Press"],
    ["Elevaciones laterales en polea", 4, "12-20", 75, 2, 0, "Última serie RIR 1", "Hombros", 0, "Cable Lateral Raise"],
    ["Extensión tríceps cuerda", 3, "10-15", 75, 2, 0, "Codos estables", "Tríceps", 0, "Rope Pushdown"],
    ["Extensión tríceps sobre cabeza polea", 2, "10-15", 75, 2, 0, "Recorrido cómodo", "Tríceps", 0, "Overhead Cable Extension"]]],
  ["Martes · Pull", [
    ["Jalón al pecho agarre neutro", 3, "8-12", 120, 2, 0, "Depresión escapular", "Espalda", 1, "Neutral-Grip Lat Pulldown"],
    ["Remo pecho apoyado", 3, "8-12", 120, 2, 0, "Sin impulso", "Espalda", 1, "Chest Supported Row"],
    ["Jalón unilateral polea", 2, "10-15", 90, 2, 0, "Controlar estiramiento", "Espalda", 0, "Single Arm Lat Pulldown"],
    ["Pájaros en peck deck", 3, "12-20", 75, 2, 0, "Deltoides posterior", "Hombros", 0, "Reverse Pec Deck"],
    ["Curl bíceps banco inclinado", 3, "8-12", 75, 2, 0, "Sin balanceo", "Bíceps", 0, "Incline Dumbbell Curl"],
    ["Curl martillo", 2, "10-15", 75, 2, 0, "Agarre neutro", "Bíceps", 0, "Hammer Curl"]]],
  ["Miércoles · Legs + Core", [
    ["Sentadilla hack o prensa", 3, "6-10", 150, 2, 0, "Profundidad controlada", "Cuádriceps", 1, "Hack Squat"],
    ["Peso muerto rumano", 3, "8-10", 150, 2, 0, "Cadera atrás y espalda neutra", "Isquiotibiales", 1, "Romanian Deadlift"],
    ["Curl femoral sentado", 3, "10-15", 90, 2, 0, "Pausa en contracción", "Isquiotibiales", 0, "Seated Leg Curl"],
    ["Extensión cuádriceps", 2, "10-15", 75, 2, 0, "Sin rebote", "Cuádriceps", 0, "Leg Extension"],
    ["Elevación gemelos", 3, "10-15", 75, 2, 0, "Pausa abajo", "Gemelos", 0, "Calf Raise"],
    ["Crunch en polea", 3, "10-15", 60, 2, 1, "Superserie con dead bug", "Core", 0, "Cable Crunch"],
    ["Dead bug", 3, "8-12 por lado", 60, 3, 0, "Después del crunch; descanso tras la pareja", "Core", 0, "Dead Bug"]]],
  ["Viernes · Upper", [
    ["Dominadas asistidas o jalón", 3, "6-10", 120, 2, 0, "Priorizar amplitud", "Espalda", 1, "Assisted Pull-Up"],
    ["Remo unilateral polea", 2, "10-12", 90, 2, 0, "Recorrido completo", "Espalda", 0, "Single Arm Row"],
    ["Press inclinado en máquina", 3, "8-12", 120, 2, 0, "Pecho superior", "Pecho", 1, "Incline Chest Press"],
    ["Elevaciones laterales mancuerna", 4, "12-20", 60, 2, 0, "Sin balanceo", "Hombros", 0, "Lateral Raise"],
    ["Face pull", 2, "12-20", 60, 2, 1, "Superserie con curl en polea", "Hombros", 0, "Face Pull"],
    ["Curl bíceps en polea", 2, "10-15", 75, 2, 0, "Descanso tras la pareja", "Bíceps", 0, "Cable Curl"],
    ["Extensión tríceps unilateral", 2, "10-15", 75, 2, 0, "Sin dolor en codo", "Tríceps", 0, "Single Arm Cable Pushdown"]]],
  ["Sábado · Arms + Lower", [
    ["Zancadas búlgaras", 2, "8-12 por pierna", 120, 2, 0, "Apoyo estable", "Cuádriceps", 1, "Bulgarian Split Squat"],
    ["Hip thrust máquina", 2, "8-12", 120, 2, 0, "Pausa arriba", "Glúteos", 1, "Hip Thrust"],
    ["Elevación gemelos", 2, "12-20", 60, 2, 0, "Recorrido completo", "Gemelos", 0, "Calf Raise"],
    ["Curl predicador", 3, "8-12", 75, 2, 1, "Superserie con extensión tríceps cuerda", "Bíceps", 0, "Preacher Curl"],
    ["Extensión tríceps cuerda", 3, "10-15", 75, 2, 0, "Descanso tras la pareja", "Tríceps", 0, "Rope Pushdown"],
    ["Curl martillo cuerda", 2, "10-15", 75, 2, 1, "Superserie con tríceps sobre cabeza", "Bíceps", 0, "Hammer Curl"],
    ["Extensión tríceps sobre cabeza polea", 2, "10-15", 75, 2, 0, "Descanso tras la pareja", "Tríceps", 0, "Overhead Cable Extension"],
    ["Elevaciones laterales polea", 2, "15-20", 60, 2, 0, "Serie ligera de bombeo", "Hombros", 0, "Cable Lateral Raise"]]]
];

// "8-12 por pierna" → { min: 8, max: 12, unit: "por pierna" }
export function parseReps(text) {
  const m = String(text || "").match(/(\d+)\s*[-–]\s*(\d+)\s*(.*)/);
  if (!m) { const n = parseInt(text, 10) || 1; return { min: n, max: n, unit: "" }; }
  return { min: Number(m[1]), max: Number(m[2]), unit: m[3].trim() };
}

export const RECOMP_PLAN = DAYS.map(([title, list]) => [title, "", list.map(([name, sets, reps, rest, rir, superset, note, muscle, compound, ref]) => {
  const r = parseReps(reps);
  return [name, sets, r.min, r.max, muscle, compound, superset, { program: RECOMP_PROGRAM_ID, rest, rir, note, unit: r.unit, ref }];
})]);

export const isRecompPlan = plan => Array.isArray(plan) && plan.some(d => d?.[2]?.some(e => e?.[7]?.program === RECOMP_PROGRAM_ID));
