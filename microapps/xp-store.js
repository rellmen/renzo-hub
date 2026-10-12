// Nivel único de RISE HUB (2.19.0): phase1.js calcula el XP (libro xp_event) y lo publica aquí.
// Gym, Study y Home lo muestran con atributos data-rise-* que se actualizan en el sitio (sin repintar la microapp,
// así no se pierde lo que estés escribiendo). Sin datos todavía = "…".
const subs = new Set();
let state = null;

// Etiqueta de rango por nivel (antes Gym tenía su propio rango E–S por XP de Gym). Solo es un nombre, no una estadística.
export const RANKS = [[30, "S"], [20, "A"], [15, "B"], [10, "C"], [5, "D"], [1, "E"]];
export const rankFor = level => (RANKS.find(([min]) => level >= min) || RANKS.at(-1))[1];

export const getXp = () => state;
export function onXp(fn) { subs.add(fn); return () => subs.delete(fn); }

const nf = n => new Intl.NumberFormat("es-ES").format(n);
// Valores ya formateados para pintar (o "…" mientras carga).
export function xpView(s = state) {
  if (!s) return { level: "…", xp: "…", toNext: "…", nextLevel: "…", pct: 0, rank: "…" };
  const base = 50 * (s.level - 1) ** 2, pct = Math.max(0, Math.min(100, Math.round((s.xp - base) / (s.next - base) * 100)));
  return { level: String(s.level), xp: nf(s.xp), toNext: nf(s.toNext), nextLevel: String(s.level + 1), pct, rank: rankFor(s.level) };
}

export function paintXp(root = typeof document !== "undefined" ? document : null) {
  if (!root) return;
  const v = xpView();
  for (const [attr, key] of [["data-rise-level", "level"], ["data-rise-xp", "xp"], ["data-rise-tonext", "toNext"], ["data-rise-nextlevel", "nextLevel"], ["data-rise-rank", "rank"]])
    root.querySelectorAll(`[${attr}]`).forEach(el => { el.textContent = v[key]; });
  root.querySelectorAll("[data-rise-bar]").forEach(el => { el.style.width = `${v.pct}%`; });
}

export function publishXp(next) {
  state = next ? { xp: next.xp, level: next.level, next: next.next, toNext: next.toNext } : null;
  paintXp();
  for (const fn of subs) { try { fn(state); } catch (e) { console.warn("[renzo-hub] xp-store", e?.message); } }
}
