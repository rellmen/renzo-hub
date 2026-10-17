// Rangos por ejercicio y por músculo (Hierro → Élite), inspirados en el sistema de Symmetry.
// Se basan en la fuerza estimada (e1RM) relativa al peso corporal frente a estándares ORIENTATIVOS por patrón de movimiento.
// Las máquinas y poleas varían mucho entre gimnasios: el rango sirve para seguir tu progreso, no para compararte con nadie.
import { e1rm } from "./progression.js";

export const TIERS = [
  { id: "hierro", name: "Hierro", color: "#8f8a83" },
  { id: "bronce", name: "Bronce", color: "#c8895a" },
  { id: "plata", name: "Plata", color: "#c7cbd3" },
  { id: "oro", name: "Oro", color: "#e3c47e" },
  { id: "platino", name: "Platino", color: "#8fd3c8" },
  { id: "diamante", name: "Diamante", color: "#9ec5ff" },
  { id: "elite", name: "Élite", color: "#baa3fe" }
];

// Umbrales (e1RM ÷ peso corporal) para empezar Bronce, Plata, Oro, Platino, Diamante y Élite.
// Mancuernas: peso de UNA mancuerna. Orden importa: el primer patrón que coincide gana.
const STANDARDS = [
  [/leg press|prensa/i, "Prensa", [1.0, 1.5, 2.0, 2.75, 3.5, 4.5], "Cuádriceps"],
  [/romanian|rdl|peso muerto rumano/i, "Peso muerto rumano", [0.6, 0.9, 1.25, 1.6, 2.0, 2.4], "Isquiotibiales"],
  [/deadlift|peso muerto/i, "Peso muerto", [0.9, 1.25, 1.6, 2.0, 2.4, 2.8], "Isquiotibiales"],
  [/squat|sentadilla|hack/i, "Sentadilla", [0.75, 1.1, 1.4, 1.75, 2.1, 2.5], "Cuádriceps"],
  [/hip thrust/i, "Hip thrust", [0.75, 1.1, 1.5, 2.0, 2.5, 3.0], "Glúteos"],
  [/leg curl|femoral/i, "Curl femoral", [0.3, 0.45, 0.65, 0.85, 1.05, 1.25], "Isquiotibiales"],
  [/leg extension|extensi[oó]n de cu[aá]driceps/i, "Extensión de cuádriceps", [0.35, 0.5, 0.7, 0.9, 1.1, 1.3], "Cuádriceps"],
  [/calf|gemelo/i, "Gemelos", [0.5, 0.8, 1.1, 1.5, 1.9, 2.3], "Gemelos"],
  [/dumbbell (bench |chest )?press|db press/i, "Press con mancuernas", [0.18, 0.27, 0.36, 0.45, 0.55, 0.65], "Pecho"],
  [/shoulder press|overhead press|military|press militar/i, "Press de hombro", [0.35, 0.5, 0.7, 0.85, 1.0, 1.2], "Hombros"],
  [/bench|chest press|smith press|incline.*press|press banca/i, "Press de pecho", [0.5, 0.75, 1.0, 1.25, 1.5, 1.75], "Pecho"],
  [/dip/i, "Fondos", [0.5, 0.8, 1.1, 1.4, 1.7, 2.0], "Tríceps"],
  [/fly|pec deck|aperturas/i, "Aperturas", [0.25, 0.4, 0.55, 0.7, 0.85, 1.0], "Pecho"],
  [/reverse pec|face pull|rear delt/i, "Deltoide posterior", [0.15, 0.25, 0.35, 0.45, 0.55, 0.65], "Hombros"],
  [/single arm.*row|one arm.*row|single arm row/i, "Remo a una mano", [0.25, 0.35, 0.45, 0.6, 0.75, 0.9], "Espalda"],
  [/single arm lat|single arm pulldown/i, "Jalón a una mano", [0.25, 0.35, 0.45, 0.55, 0.65, 0.75], "Espalda"],
  [/straight arm/i, "Pullover en polea", [0.2, 0.3, 0.4, 0.5, 0.6, 0.7], "Espalda"],
  [/pulldown|jal[oó]n|pull-?up|dominada/i, "Jalón", [0.5, 0.7, 0.9, 1.1, 1.3, 1.5], "Espalda"],
  [/row|remo/i, "Remo", [0.5, 0.7, 0.9, 1.1, 1.3, 1.5], "Espalda"],
  [/cable lateral|machine.*lateral/i, "Elevación lateral en polea/máquina", [0.03, 0.05, 0.08, 0.11, 0.14, 0.17], "Hombros"],
  [/lateral raise|elevaci[oó]n lateral/i, "Elevación lateral", [0.05, 0.08, 0.11, 0.14, 0.17, 0.2], "Hombros"],
  [/ez bar curl|barbell curl|curl con barra/i, "Curl con barra", [0.2, 0.3, 0.4, 0.55, 0.7, 0.85], "Bíceps"],
  [/cable curl|bayesian|preacher/i, "Curl en polea/predicador", [0.15, 0.22, 0.3, 0.4, 0.5, 0.6], "Bíceps"],
  [/curl/i, "Curl con mancuerna", [0.08, 0.12, 0.17, 0.23, 0.29, 0.35], "Bíceps"],
  [/pushdown|overhead.*extension|skull|tr[ií]ceps/i, "Extensión de tríceps", [0.2, 0.3, 0.42, 0.55, 0.68, 0.8], "Tríceps"],
  [/crunch/i, "Crunch en polea", [0.3, 0.5, 0.7, 0.9, 1.1, 1.3], "Core"]
];
const MUSCLE_MAP = { Piernas: "Cuádriceps", Glúteos: "Glúteos", Pecho: "Pecho", Espalda: "Espalda", Hombros: "Hombros", "Bíceps": "Bíceps", "Tríceps": "Tríceps", Core: "Core" };

export function standardFor(name) {
  const hit = STANDARDS.find(([re]) => re.test(String(name || "")));
  return hit ? { pattern: hit[1], thresholds: hit[2], muscle: hit[3] } : null;
}

// Rango a partir de la relación fuerza/peso. score continuo: 0–1 Hierro, 1–2 Bronce… 6 = Élite.
export function rankFor(ratio, thresholds) {
  const r = Number(ratio);
  if (!Number.isFinite(r) || r <= 0 || !thresholds) return null;
  let i = thresholds.findIndex(t => r < t);
  if (i === -1) return { tier: TIERS[6], tierIndex: 6, sub: null, label: TIERS[6].name, score: 6, progress: 1, next: null };
  const lo = i === 0 ? 0 : thresholds[i - 1], hi = thresholds[i], frac = Math.max(0, Math.min(0.999, (r - lo) / (hi - lo)));
  const sub = Math.min(3, 1 + Math.floor(frac * 3)), tier = TIERS[i];
  return { tier, tierIndex: i, sub, label: `${tier.name} ${sub}`, score: i + frac, progress: frac, next: { tier: TIERS[i + 1], ratio: hi } };
}

// Peso corporal: el último registrado en una sesión; si no hay, el de referencia (marcado como estimado).
export function latestBodyWeight(sessions, fallback = null) {
  const withBw = (sessions || []).filter(s => Number(s?.body_weight) > 0).sort((a, b) => String(b.workout_date).localeCompare(String(a.workout_date)));
  return withBw.length ? { kg: Number(withBw[0].body_weight), estimated: false } : (fallback ? { kg: Number(fallback), estimated: true } : null);
}

// Mejor e1RM por ejercicio (todas las sesiones completadas) y su rango.
export function exerciseRanks(sessions, bodyWeightKg) {
  const best = new Map();
  for (const s of sessions || []) {
    if (!s?.completed_at) continue;
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        if (!set?.completed) continue;
        const v = e1rm(set.weight, set.reps);
        if (v > (best.get(ex.name)?.e1rm || 0)) best.set(ex.name, { name: ex.name, muscle: ex.muscle, e1rm: v, date: s.workout_date });
      }
    }
  }
  const bw = Number(bodyWeightKg);
  return [...best.values()].map(x => {
    const std = standardFor(x.name), ratio = bw > 0 ? x.e1rm / bw : null;
    const rank = std && ratio ? rankFor(ratio, std.thresholds) : null;
    const muscle = std?.muscle || MUSCLE_MAP[x.muscle] || x.muscle || "Otros";
    const nextKg = rank?.next ? Math.ceil(rank.next.ratio * bw * 2) / 2 : null;
    return { ...x, muscle, pattern: std?.pattern || null, ratio, rank, nextKg };
  }).sort((a, b) => (b.rank?.score ?? -1) - (a.rank?.score ?? -1));
}

// Rango por músculo: media de sus dos mejores ejercicios con rango.
export function muscleRanks(exRanks) {
  const by = {};
  for (const x of exRanks || []) if (x.rank) (by[x.muscle] ??= []).push(x.rank.score);
  return Object.fromEntries(Object.entries(by).map(([muscle, scores]) => {
    const top = scores.sort((a, b) => b - a).slice(0, 2), score = top.reduce((a, b) => a + b, 0) / top.length;
    const idx = Math.min(6, Math.floor(score)), tier = TIERS[idx], sub = idx === 6 ? null : Math.min(3, 1 + Math.floor((score - idx) * 3));
    return [muscle, { score, tier, tierIndex: idx, sub, label: sub ? `${tier.name} ${sub}` : tier.name, exercises: scores.length }];
  }));
}

// Puntuación global (media de músculos con rango) para el encabezado.
export function overallRank(mRanks) {
  const list = Object.values(mRanks || {});
  if (!list.length) return null;
  const score = list.reduce((a, m) => a + m.score, 0) / list.length, idx = Math.min(6, Math.floor(score)), tier = TIERS[idx];
  const sub = idx === 6 ? null : Math.min(3, 1 + Math.floor((score - idx) * 3));
  return { score, tier, sub, label: sub ? `${tier.name} ${sub}` : tier.name };
}
