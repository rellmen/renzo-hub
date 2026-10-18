// Gym · pack final (2.38.0): calentamiento, tendencia de fuerza, descarga, balance semanal por músculo,
// alternativas de ejercicio, superseries y recordatorio de foto. Funciones puras: sin DOM ni red.
// Regla de RISE HUB: si faltan datos se devuelve null / "sin datos"; nunca se inventan cifras.
import { e1rm } from "./progression.js";

const round = (v, step = 2.5) => Math.round(v / step) * step;
const DAY = 86400000;
const toDate = d => new Date(d + "T12:00:00Z");
export const mondayOf = date => { const d = toDate(date); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
const addDays = (date, n) => new Date(toDate(date).getTime() + n * DAY).toISOString().slice(0, 10);

// Series de calentamiento para un compuesto. No se registran como series de trabajo (no cuentan en volumen ni récords).
// Con barra: barra vacía × 8 → 60 % × 5 → 80 % × 3. Máquina: 50 % × 8 → 75 % × 4.
export function warmupSets(workWeight, { compound = false, bar = null } = {}) {
  const w = Number(workWeight);
  if (!compound || !Number.isFinite(w) || w < 20) return [];
  const steps = bar ? [[0, 8], [0.6, 5], [0.8, 3]] : [[0.5, 8], [0.75, 4]];
  const out = [];
  for (const [pct, reps] of steps) {
    const weight = pct === 0 ? bar : Math.max(bar || 0, round(w * pct));
    if (weight >= w || out.some(s => s.weight === weight)) continue;
    out.push({ weight, reps });
  }
  return out;
}

// Mejor e1RM de cada sesión completada para un ejercicio, de la más antigua a la más reciente.
export function e1rmHistory(sessions, name) {
  const pts = [];
  for (const s of sessions || []) {
    if (!s?.completed_at) continue;
    const ex = (s.exercises || []).filter(e => e.name === name);
    const best = Math.max(0, ...ex.flatMap(e => (e.sets || []).filter(x => x.completed).map(x => e1rm(x.weight, x.reps))));
    if (best > 0) pts.push({ date: s.workout_date, e1rm: best });
  }
  return pts.sort((a, b) => a.date.localeCompare(b.date));
}

// Cambio porcentual entre el mejor valor antes de la ventana y el último dentro de ella (por defecto 4 semanas).
export function strengthTrend(points, days = 28) {
  if (!points || points.length < 2) return null;
  const last = points[points.length - 1], cutoff = addDays(last.date, -days);
  const base = [...points].reverse().find(p => p.date <= cutoff) || points[0];
  if (base === last) return null;
  const pct = (last.e1rm - base.e1rm) / base.e1rm * 100;
  return { pct, from: base, to: last, days: Math.round((toDate(last.date) - toDate(base.date)) / DAY) };
}

// Mini gráfica SVG (sin librerías) de la evolución del e1RM. Devuelve '' con menos de 2 puntos.
export function sparklineSvg(points, { width = 160, height = 40 } = {}) {
  if (!points || points.length < 2) return "";
  const vals = points.map(p => p.e1rm), min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1, pad = 3;
  const xy = points.map((p, i) => [pad + i * (width - 2 * pad) / (points.length - 1), height - pad - (p.e1rm - min) / span * (height - 2 * pad)]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  return `<svg class="gym-spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Evolución del récord estimado: de ${min.toFixed(1)} a ${vals[vals.length - 1].toFixed(1)} kg"><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="currentColor"/></svg>`;
}

// Semanas seguidas (hasta la actual) con al menos 2 sesiones completadas.
export function trainingStreakWeeks(sessions, today) {
  const per = {};
  for (const s of sessions || []) if (s?.completed_at) { const w = mondayOf(s.workout_date); (per[w] ??= new Set()).add(s.workout_date); }
  let week = mondayOf(today), n = 0;
  if ((per[week]?.size || 0) < 2) week = addDays(week, -7); // la semana en curso aún puede completarse
  while ((per[week]?.size || 0) >= 2) { n++; week = addDays(week, -7); }
  return n;
}

// Compuestos estancados: en sus 3 últimas sesiones no superan el mejor e1RM anterior a ellas.
export function stalledLifts(sessions, compoundNames) {
  return [...new Set(compoundNames || [])].filter(name => {
    const h = e1rmHistory(sessions, name);
    if (h.length < 5) return false;
    const before = Math.max(...h.slice(0, -3).map(p => p.e1rm));
    return h.slice(-3).every(p => p.e1rm <= before * 1.005);
  });
}

// Recomendación de semana de descarga: ≥6 semanas seguidas entrenando o ≥2 compuestos estancados.
export function deloadAdvice(sessions, compoundNames, today) {
  const weeks = trainingStreakWeeks(sessions, today), stalled = stalledLifts(sessions, compoundNames);
  if (weeks < 6 && stalled.length < 2) return null;
  const reasons = [];
  if (weeks >= 6) reasons.push(`llevas ${weeks} semanas seguidas entrenando`);
  if (stalled.length >= 2) reasons.push(`${stalled.length} compuestos sin progresar en 3 sesiones (${stalled.slice(0, 3).join(", ")})`);
  return { weeks, stalled, reason: reasons.join(" y ") };
}

// Ajuste de una sesión en semana de descarga: mitad de series (mínimo 1) y −10 % de carga redondeada.
export function applyDeload(exercise) {
  const keep = Math.max(1, Math.ceil(exercise.sets.length / 2));
  const sets = exercise.sets.slice(0, keep).map(s => ({ ...s, weight: s.weight == null ? null : Math.max(0, round(s.weight * 0.9, exercise.compound ? 2.5 : 1.25)) }));
  return { ...exercise, sets, deload: true };
}

// Series efectivas por músculo en una semana (lunes a domingo) frente a un rango orientativo de 10–20.
export const WEEKLY_RANGE = [10, 20];
export function weeklyMuscleSets(sessions, weekStart) {
  const end = addDays(weekStart, 7), out = {};
  for (const s of sessions || []) {
    if (!s?.completed_at || s.workout_date < weekStart || s.workout_date >= end) continue;
    for (const e of s.exercises || []) {
      const n = (e.sets || []).filter(x => x.completed).length;
      if (n) out[e.muscle || "Otros"] = (out[e.muscle || "Otros"] || 0) + n;
    }
  }
  return out;
}
export function muscleBalance(sessions, today, muscles) {
  const week = mondayOf(today), now = weeklyMuscleSets(sessions, week), prev = weeklyMuscleSets(sessions, addDays(week, -7));
  const names = [...new Set([...(muscles || []), ...Object.keys(now), ...Object.keys(prev)])];
  return names.map(m => {
    const sets = now[m] || 0, last = prev[m] || 0;
    return { muscle: m, sets, last, state: sets < WEEKLY_RANGE[0] ? "low" : sets > WEEKLY_RANGE[1] ? "high" : "ok" };
  });
}

// Alternativas para cambiar un ejercicio en mitad de la sesión: mismo patrón primero, luego mismo músculo.
export function alternatives(name, library, info, limit = 8) {
  const cur = library.find(x => x.name === name), pattern = info?.(name)?.pattern;
  const muscle = cur?.muscle;
  if (!muscle && !pattern) return [];
  return library.filter(x => x.name !== name && (x.muscle === muscle || (pattern && x.pattern === pattern)))
    .sort((a, b) => (b.pattern === pattern) - (a.pattern === pattern) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Superseries: el ejercicio con marca 7.º campo = 1 se une al siguiente. Devuelve etiquetas A1, A2, B1…
export function supersetLabels(exercises) {
  const labels = new Array(exercises.length).fill(null);
  let group = 0;
  for (let i = 0; i < exercises.length; i++) {
    if (!exercises[i].superset || i === exercises.length - 1) continue;
    if (labels[i] === null) { group++; labels[i] = { group: String.fromCharCode(64 + group), pos: 1 }; }
    labels[i + 1] = { group: labels[i].group, pos: labels[i].pos + 1 };
  }
  return labels.map(l => l && `${l.group}${l.pos}`);
}

// Recordatorio de foto de progreso: toca si nunca hay foto o la última tiene ≥ 28 días.
export function photoReminder(lastPhotoDate, today, days = 28) {
  if (!lastPhotoDate) return { due: true, days: null };
  const d = Math.round((toDate(today) - toDate(lastPhotoDate)) / DAY);
  return { due: d >= days, days: d };
}
