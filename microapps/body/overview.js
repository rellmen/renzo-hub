// Body · resumen de hoy (diseño del prototipo de Lovable, 19 oct 2026).
// Solo datos reales guardados en la cuenta: sin cifras de ejemplo ni objetivos inventados.
// Fuentes: hub_records (body_weight, food_log), gym_sessions, skin_routine_logs y la meta de Gym (user_metadata.gym_goals).

const MS_DAY = 864e5;
const isDate = d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n, d = 1) => n.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const dayLabel = d => new Date(`${d}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
export const localDay = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
const shift = (day, days) => localDay(new Date(new Date(`${day}T12:00:00`).getTime() + days * MS_DAY));
export function weekStart(day) { const d = new Date(`${day}T12:00:00`); return shift(day, -((d.getDay() + 6) % 7)); }

export function summarizeBody({ weights = [], sessions = [], food = [], skin = [], goals = null, today = localDay() } = {}) {
  const pts = weights.map(r => ({ date: r?.payload?.date || r?.occurred_at?.slice(0, 10), value: num(r?.payload?.value) }))
    .filter(p => isDate(p.date) && p.value !== null && p.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  const current = pts.at(-1) || null;
  const since = shift(today, -30), window = pts.filter(p => p.date >= since);
  const base = window.length >= 2 ? window[0] : null;
  const change = current && base && base !== current ? Math.round((current.value - base.value) * 10) / 10 : null;
  const target = num(goals?.targetWeight);
  let goal = null;
  if (current && target !== null) {
    const start = pts[0].value, total = start - target, left = Math.round((current.value - target) * 10) / 10;
    const pct = total === 0 ? (left === 0 ? 100 : 0) : Math.max(0, Math.min(100, Math.round((start - current.value) / total * 100)));
    goal = { target, left, pct };
  }
  const done = sessions.filter(s => s?.completed_at && isDate(s.workout_date) && s.workout_date <= today).sort((a, b) => b.workout_date.localeCompare(a.workout_date));
  const ws = weekStart(today);
  const perWeek = Number.isInteger(goals?.sessionsPerWeek) ? goals.sessionsPerWeek : null;
  const gym = { week: done.filter(s => s.workout_date >= ws).length, perWeek, last: done[0] ? { date: done[0].workout_date, title: String(done[0].title || "Entrenamiento") } : null };
  const meals = food.filter(r => r?.payload?.date === today);
  const foodToday = meals.length ? { meals: meals.length, kcal: Math.round(meals.reduce((s, r) => s + (num(r.payload.kcal) || 0), 0)), protein: Math.round(meals.reduce((s, r) => s + (num(r.payload.protein) || 0), 0)) } : null;
  const steps = { am: 0, pm: 0 };
  for (const row of skin) if ((row?.session === "am" || row?.session === "pm") && Array.isArray(row.completed_steps)) steps[row.session] = Math.max(steps[row.session], row.completed_steps.filter(n => Number.isInteger(n) && n >= 0).length);
  return { today, weight: { current, change, points: window.length >= 2 ? window : pts.slice(-30), goal, count: pts.length }, gym, food: foodToday, skin: steps };
}

function sparkline(points) {
  if (points.length < 2) return "";
  const vals = points.map(p => p.value), min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const xy = points.map((p, i) => [i / (points.length - 1) * 300, 66 - (p.value - min) / span * 56]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy.at(-1);
  return `<svg class="body-spark" viewBox="0 0 300 76" preserveAspectRatio="none" role="img" aria-label="Evolución del peso, ${points.length} registros"><path d="M0 72H300" class="body-spark-base"/><path d="${line}" class="body-spark-line"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4" class="body-spark-dot"/></svg><div class="body-spark-dates"><span>${esc(dayLabel(points[0].date))}</span><span>${esc(dayLabel(points.at(-1).date))}</span></div>`;
}

const ICON = {
  scale: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1Z"/><path d="M2 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  gym: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 14.4 9.6 9.6M18.66 21.51a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.37-6.37a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83ZM21.5 21.5l-1.4-1.4M3.9 3.9 2.5 2.5M6.4 12.77a2 2 0 1 1-2.83-2.83l1.76-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.76a2 2 0 1 1 2.83 2.83Z"/></svg>',
  food: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9ZM7 21h10M19.5 12 22 6M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/></svg>',
  skin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05Z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
};
export const BODY_ICONS = ICON;

export function renderBodyToday(s) {
  const w = s.weight, g = s.gym;
  const weightBlock = w.current
    ? `<div class="body-w"><p class="body-w-value">${fmt(w.current.value)}<span> kg</span></p><p class="small">Último registro · ${esc(dayLabel(w.current.date))}</p>${w.change !== null ? `<p class="body-w-change">${w.change > 0 ? "+" : ""}${fmt(w.change)} kg <span>en 30 días</span></p>` : `<p class="small">Necesitas dos registros en 30 días para ver el cambio.</p>`}</div><div class="body-w-chart">${sparkline(w.points)}</div>`
    : `<div class="body-w"><p class="body-w-empty">Sin registros de peso</p><p class="small">Añade el primero en "Peso", más abajo.</p></div>`;
  const goalBlock = w.goal
    ? `<div class="body-goal"><div><span>Meta <b>${fmt(w.goal.target)} kg</b></span><span class="small">${w.goal.left > 0 ? `${fmt(w.goal.left)} kg por recorrer` : w.goal.left < 0 ? `${fmt(-w.goal.left)} kg por debajo` : "Meta alcanzada"}</span></div><div class="body-bar" role="progressbar" aria-label="Progreso hacia la meta de peso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${w.goal.pct}"><i style="width:${w.goal.pct}%"></i></div></div>`
    : `<p class="small body-goal-none">Sin meta de peso. Puedes ponerla en Gym → Más → Objetivos.</p>`;
  const chips = [
    [ICON.gym, g.perWeek ? `${g.week}/${g.perWeek} sesiones esta semana` : `${g.week} ${g.week === 1 ? "sesión" : "sesiones"} esta semana`],
    [ICON.food, s.food ? `${s.food.protein} g proteína · ${s.food.kcal} kcal` : "Sin comidas registradas hoy"],
    [ICON.skin, `AM ${s.skin.am ? "hecho" : "pendiente"} · PM ${s.skin.pm ? "hecho" : "pendiente"}`],
  ];
  return `<section class="body-today" aria-labelledby="bodyTodayTitle"><div class="body-sec-title">${ICON.scale}<h2 id="bodyTodayTitle">Tu cuerpo, hoy</h2><span class="small">${esc(dayLabel(s.today))}</span></div><div class="body-w-row">${weightBlock}</div>${goalBlock}<div class="body-chips">${chips.map(([i, t]) => `<span>${i}<span>${esc(t)}</span></span>`).join("")}</div></section>`;
}

export function moduleTexts(s) {
  const g = s.gym;
  return {
    gym: [g.last ? `${g.last.title}` : "Sin sesiones aún", g.last ? `Último: ${dayLabel(g.last.date)} · ${g.perWeek ? `${g.week}/${g.perWeek}` : g.week} esta semana` : "Empieza tu primera sesión"],
    food: [s.food ? `${s.food.protein} g proteína` : "Sin comidas hoy", s.food ? `${s.food.kcal} kcal · ${s.food.meals} ${s.food.meals === 1 ? "comida" : "comidas"}` : "Registra lo que comes hoy"],
    skin: [s.skin.am ? "AM hecho" : "AM pendiente", s.skin.pm ? "PM hecho" : "PM pendiente"],
  };
}

export function mountBodyOverview(root, db, getUser) {
  let seq = 0;
  const fill = s => {
    if (!root) return;
    root.innerHTML = s ? renderBodyToday(s) : "";
    const t = s ? moduleTexts(s) : null;
    for (const key of ["gym", "food", "skin"]) {
      const main = document.querySelector(`[data-body-mod="${key}"]`), sub = document.querySelector(`[data-body-mod-sub="${key}"]`);
      if (main) main.textContent = t ? t[key][0] : "—";
      if (sub && t) sub.textContent = t[key][1];
    }
  };
  async function load() {
    const user = getUser(); if (!user) { fill(null); return; }
    const run = ++seq, uid = user.id, today = localDay(), from = shift(today, -120);
    const [weights, sessions, food, skin] = await Promise.all([
      db.from("hub_records").select("payload,occurred_at").eq("owner_id", uid).eq("record_type", "body_weight").gte("occurred_at", `${from}T00:00:00.000Z`).order("occurred_at", { ascending: true }).limit(400),
      db.from("gym_sessions").select("workout_date,title,completed_at").eq("user_id", uid).not("completed_at", "is", null).gte("workout_date", shift(today, -14)).order("workout_date", { ascending: false }).limit(30),
      db.from("hub_records").select("payload").eq("owner_id", uid).eq("record_type", "food_log").gte("occurred_at", `${today}T00:00:00.000Z`).limit(50),
      db.from("skin_routine_logs").select("session,completed_steps").eq("user_id", uid).eq("routine_date", today),
    ]);
    if (run !== seq || getUser()?.id !== uid) return;
    const goals = user.user_metadata?.gym_goals || null;
    fill(summarizeBody({ weights: weights.data || [], sessions: sessions.data || [], food: food.data || [], skin: skin.data || [], goals, today }));
    const failed = [weights, sessions, food, skin].filter(r => r.error).length;
    if (failed && root) root.insertAdjacentHTML("beforeend", `<p class="small body-warn" role="status">No se pudieron cargar ${failed} de 4 fuentes. Lo que ves puede estar incompleto.</p>`);
  }
  return { load: () => load().catch(error => { console.error(error); if (root) root.innerHTML = `<p class="small body-warn" role="status">No se pudo cargar el resumen de Body.</p>`; }), reset() { seq++; fill(null); } };
}
