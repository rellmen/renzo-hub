// Sobrecarga progresiva automática (doble progresión con RIR), inspirada en Symmetry.
// Puro y testeable: no toca DOM ni Supabase. Las sugerencias son orientativas; el usuario siempre decide.

// Fuerza estimada (Epley). Igual que trends.js: solo series de hasta 12 reps cuentan para el récord.
export const e1rm = (weight, reps) => {
  const w = Number(weight), r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0 || r > 12) return 0;
  return w * (1 + r / 30);
};
const valid = s => s && s.completed && Number.isFinite(Number(s.weight)) && Number(s.weight) > 0 && Number.isFinite(Number(s.reps)) && Number(s.reps) > 0;

// Mejor e1RM histórico de un ejercicio, opcionalmente sin contar una sesión (la que está en curso).
export function bestE1rm(sessions, name, excludeId = null) {
  let best = 0;
  for (const s of sessions || []) {
    if (!s?.completed_at || s.id === excludeId) continue;
    for (const ex of s.exercises || []) if (ex.name === name) for (const set of ex.sets || []) if (valid(set)) best = Math.max(best, e1rm(set.weight, set.reps));
  }
  return best;
}

// Series completadas de la última sesión en la que se hizo el ejercicio.
export function lastSets(sessions, name, excludeId = null) {
  const done = (sessions || []).filter(s => s?.completed_at && s.id !== excludeId).sort((a, b) => String(b.workout_date).localeCompare(String(a.workout_date)) || String(b.completed_at).localeCompare(String(a.completed_at)));
  for (const s of done) {
    const ex = (s.exercises || []).find(e => e.name === name);
    const sets = (ex?.sets || []).filter(valid).map(x => ({ weight: Number(x.weight), reps: Number(x.reps), rir: x.rir === null || x.rir === undefined || x.rir === "" ? null : Number(x.rir) }));
    if (sets.length) return { date: s.workout_date, sets };
  }
  return null;
}

// RIR objetivo: el que marque el programa para ese ejercicio (Recomp) o, si no hay, 2 en compuestos y 1 en aislamiento.
export const targetRir = exercise => (Number.isFinite(Number(exercise?.rir)) && exercise?.rir !== null && exercise?.rir !== "" ? Number(exercise.rir) : exercise?.compound ? 2 : 1);
// Incremento mínimo: 2,5 kg en compuestos; 1,25 kg en aislamiento (mancuernas, poleas y máquinas pequeñas).
export const increment = exercise => (exercise?.compound ? 2.5 : 1.25);
const round = (w, step = 0.25) => Math.round(w / step) * step;

// Sugerencia por serie para la próxima sesión.
// - Sin historial: null (la primera sesión fija la referencia).
// - Todas las series en el tope del rango sin llegar al fallo: sube el incremento mínimo y vuelve al mínimo de reps.
// - Alguna serie por debajo del mínimo y al fallo: baja un ~5 % para volver al rango.
// - Si no: mismo peso y una repetición más por serie (sin pasar del máximo).
export function suggestSets(exercise, previous) {
  if (!exercise) return null;
  const sets = previous?.sets || previous || [];
  const count = exercise.sets?.length || exercise.count || sets.length;
  if (!sets.length || !count) return null;
  const min = Number(exercise.min) || 1, max = Math.max(min, Number(exercise.max) || min), rir = targetRir(exercise), inc = increment(exercise);
  const at = j => sets[Math.min(j, sets.length - 1)];
  const coveredAll = sets.length >= count;
  const allTop = coveredAll && sets.slice(0, count).every(s => s.reps >= max && (s.rir === null || s.rir >= rir - 0.5));
  if (allTop) {
    const base = Math.max(...sets.map(s => s.weight));
    return { mode: "increase", reason: `Completaste ${max} reps en todas las series: +${String(inc).replace(".", ",")} kg`, sets: Array.from({ length: count }, () => ({ weight: round(base + inc), reps: min, rir })) };
  }
  const struggling = sets.some(s => s.reps < min && s.rir !== null && s.rir <= 0.5);
  if (struggling) {
    return { mode: "deload", reason: `Quedaste por debajo de ${min} reps al fallo: baja un poco y vuelve al rango`, sets: Array.from({ length: count }, (_, j) => ({ weight: round(at(j).weight * 0.95, inc >= 2.5 ? 2.5 : 0.25), reps: min, rir })) };
  }
  return { mode: "reps", reason: `Mismo peso: suma 1 repetición por serie hasta llegar a ${max}`, sets: Array.from({ length: count }, (_, j) => ({ weight: at(j).weight, reps: Math.min(max, Math.max(min, at(j).reps + 1)), rir })) };
}

// Récord personal: una serie supera el mejor e1RM previo (con margen para no celebrar redondeos).
export const isRecord = (set, previousBest) => previousBest > 0 && e1rm(set?.weight, set?.reps) > previousBest + 0.05;

// Resumen de la sesión recién terminada (para la pantalla final).
export function sessionSummary(session, sessions) {
  const done = (session?.exercises || []).map(ex => ({ ex, sets: (ex.sets || []).filter(valid) })).filter(x => x.sets.length);
  const volume = done.reduce((a, { sets }) => a + sets.reduce((b, s) => b + Number(s.weight) * Number(s.reps), 0), 0);
  const records = done.flatMap(({ ex, sets }) => {
    const prev = bestE1rm(sessions, ex.name, session.id), top = Math.max(...sets.map(s => e1rm(s.weight, s.reps)));
    return prev > 0 && top > prev + 0.05 ? [{ name: ex.name, before: prev, after: top }] : [];
  });
  return { exercises: done.length, sets: done.reduce((a, x) => a + x.sets.length, 0), volume: Math.round(volume), records, minutes: session?.duration_minutes ?? null };
}

// Calculadora de discos por lado (barra olímpica 20 kg, EZ 10 kg). Devuelve null si el peso no cuadra con los discos.
export function platesPerSide(total, bar = 20, plates = [25, 20, 15, 10, 5, 2.5, 1.25]) {
  let rest = (Number(total) - bar) / 2;
  if (!Number.isFinite(rest) || rest < 0) return null;
  const out = [];
  for (const p of plates) while (rest >= p - 1e-9) { out.push(p); rest = Math.round((rest - p) * 100) / 100; }
  return rest > 0.01 ? null : out;
}
