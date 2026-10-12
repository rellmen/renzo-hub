// Fase 1 · Nutrición, Peso, Hábitos, Progreso y XP.
// Persistencia: public.hub_records (RLS por owner_id) y public.user_settings (lista de hábitos).
// Reglas: nunca se inventan datos (sin registros = "sin datos"); el XP se calcula a partir de registros
// reales y se guarda en un libro (record_type xp_event) con id determinista, así no se duplica.
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (key, n) => { const [y, m, d] = key.split("-").map(Number); return dayKey(new Date(y, m - 1, d + n)); };
const num = v => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const fmt = (n, digits = 0) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits }).format(n);
const euros = n => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

export const XP_RULES = { workout: 50, skincare: 10, food_day: 10, weight_day: 5, habit: 5, vocabulary: 2, portfolio: 20 };
export const levelFor = xp => { const level = Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1; const next = 50 * level * level; return { level, next, toNext: Math.max(0, next - xp) }; };

export async function stableId(...parts) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts.join(":")))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Eventos de XP derivados de datos reales. Cada evento tiene una clave estable (kind + sourceId).
export function xpEvents(d) {
  const ev = [];
  for (const s of d.gym || []) if (s.completed_at) ev.push({ kind: "workout", sourceId: s.id, date: s.workout_date });
  for (const s of d.skin || []) if (Array.isArray(s.completed_steps) && s.completed_steps.length) ev.push({ kind: "skincare", sourceId: `${s.routine_date}:${s.session}`, date: s.routine_date });
  for (const day of new Set((d.food || []).map(r => r.payload?.date).filter(Boolean))) ev.push({ kind: "food_day", sourceId: day, date: day });
  for (const day of new Set((d.weight || []).map(r => r.payload?.date || r.occurred_at?.slice(0, 10)).filter(Boolean))) ev.push({ kind: "weight_day", sourceId: day, date: day });
  for (const h of d.habits || []) if (h.payload?.done) ev.push({ kind: "habit", sourceId: h.id, date: h.payload.date });
  for (const v of d.vocabulary || []) ev.push({ kind: "vocabulary", sourceId: v.id, date: v.occurred_at?.slice(0, 10) });
  for (const p of d.portfolio || []) ev.push({ kind: "portfolio", sourceId: p.id, date: p.occurred_at?.slice(0, 10) });
  return ev.map(e => ({ ...e, points: XP_RULES[e.kind] }));
}

export function weekStats(d, today, habitNames = []) {
  const from = addDays(today, -6), inWeek = k => k && k >= from && k <= today;
  const workouts = (d.gym || []).filter(s => s.completed_at && inWeek(s.workout_date)).length;
  const skin = (d.skin || []).filter(s => inWeek(s.routine_date) && Array.isArray(s.completed_steps) && s.completed_steps.length).length;
  const foodWeek = (d.food || []).filter(r => inWeek(r.payload?.date));
  const foodDays = new Set(foodWeek.map(r => r.payload.date));
  const kcalTotal = foodWeek.reduce((s, r) => s + (num(r.payload.kcal) || 0), 0);
  const weights = (d.weight || []).map(r => ({ date: r.payload?.date || r.occurred_at?.slice(0, 10), value: num(r.payload?.value) })).filter(w => w.date && w.value !== null).sort((a, b) => a.date.localeCompare(b.date));
  const last = weights.at(-1), base = weights.filter(w => w.date <= addDays(today, -30)).at(-1) || weights[0];
  const habitsDone = (d.habits || []).filter(h => h.payload?.done && inWeek(h.payload.date)).length;
  const month = today.slice(0, 7);
  let income = 0, expense = 0, moneyCount = 0;
  for (const r of d.money || []) {
    const p = r.payload || {}; if (!(p.date || "").startsWith(month) || r.status === "void") continue;
    const v = num(p.amount ?? p.net) || 0; moneyCount++;
    if (["income", "payslip"].includes(p.kind)) income += v; else if (p.kind === "expense") expense += v;
  }
  const vocab = (d.vocabulary || []).filter(v => inWeek(v.occurred_at?.slice(0, 10))).length;
  return {
    workouts, skin, foodDays: foodDays.size, kcalAvg: foodDays.size ? Math.round(kcalTotal / foodDays.size) : null,
    weight: last ? { value: last.value, date: last.date, delta: base && base !== last ? Math.round((last.value - base.value) * 10) / 10 : null } : null,
    habits: habitNames.length ? { done: habitsDone, possible: habitNames.length * 7 } : null,
    money: moneyCount ? { net: Math.round((income - expense) * 100) / 100, count: moneyCount } : null,
    vocab,
  };
}

export function mountPhase1(supabase, getUser) {
  const $ = id => document.getElementById(id);
  let data = {}, habitNames = [], loading = false;
  const today = () => dayKey(new Date());

  async function fetchAll(build) {
    const out = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data: rows, error } = await build().range(from, from + 999);
      if (error) throw error;
      out.push(...(rows || [])); if (!rows || rows.length < 1000) break;
    }
    return out;
  }
  const records = (uid, type, cols = "id,payload,occurred_at,status") =>
    fetchAll(() => supabase.from("hub_records").select(cols).eq("owner_id", uid).eq("record_type", type).order("occurred_at", { ascending: true }));

  async function readSettings(uid) {
    const { data: row, error } = await supabase.from("user_settings").select("settings").eq("user_id", uid).maybeSingle();
    if (error) throw error; return row?.settings && typeof row.settings === "object" ? row.settings : {};
  }

  async function load() {
    const user = getUser(); if (!user || loading) return; loading = true;
    try {
      const uid = user.id;
      const [food, weight, habits, vocabulary, portfolio, money, xp, gym, skin, settings] = await Promise.all([
        records(uid, "food_log"), records(uid, "body_weight"), records(uid, "habit_log"), records(uid, "renzo_vocabulary", "id,occurred_at"),
        records(uid, "renzo_portfolio", "id,occurred_at"), records(uid, "renzo_money"), records(uid, "xp_event", "id,payload"),
        fetchAll(() => supabase.from("gym_sessions").select("id,workout_date,completed_at").eq("user_id", uid).order("workout_date")),
        fetchAll(() => supabase.from("skin_routine_logs").select("routine_date,session,completed_steps").eq("user_id", uid).order("routine_date")),
        readSettings(uid)]);
      if (getUser()?.id !== uid) return;
      data = { food, weight, habits, vocabulary, portfolio, money, xp, gym, skin };
      habitNames = Array.isArray(settings.habits) ? settings.habits.slice(0, 12) : [];
      await syncXp(uid);
      render();
    } finally { loading = false; }
  }

  // Inserta solo los eventos nuevos; ids deterministas + ignoreDuplicates = sin duplicados entre dispositivos.
  async function syncXp(uid) {
    const known = new Set(data.xp.map(r => r.id)), rows = [];
    for (const e of xpEvents(data)) {
      const id = await stableId(uid, "xp", e.kind, e.sourceId);
      if (known.has(id)) continue;
      rows.push({ id, owner_id: uid, domain: "system", record_type: "xp_event", title: `XP · ${e.kind}`, status: "active",
        occurred_at: `${e.date || today()}T12:00:00.000Z`, payload: { kind: e.kind, sourceId: String(e.sourceId), points: e.points, date: e.date || null },
        source: "automation", requires_review: false });
    }
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from("hub_records").upsert(rows.slice(i, i + 200), { onConflict: "id", ignoreDuplicates: true });
      if (error) { console.warn("[renzo-hub] XP no sincronizado", error.message); return; }
    }
    data.xp = data.xp.concat(rows.map(r => ({ id: r.id, payload: r.payload })));
  }

  const totalXp = () => data.xp.reduce((s, r) => s + (Number(r.payload?.points) || 0), 0);

  function render() {
    renderFood(); renderWeight(); renderHome(); renderHabitSettings();
  }

  function renderFood() {
    const box = $("p1Food"); if (!box) return;
    const t = today(), rows = (data.food || []).filter(r => r.payload?.date === t);
    const kcal = rows.reduce((s, r) => s + (num(r.payload.kcal) || 0), 0), protein = rows.reduce((s, r) => s + (num(r.payload.protein) || 0), 0);
    box.innerHTML = `<div class="section"><h3>Registro de hoy</h3><span class="small">${rows.length ? `${fmt(kcal)} kcal · ${fmt(protein)} g proteína` : "sin registros"}</span></div>
      <form class="card worldform" data-food-form><label>Comida<select name="meal"><option>Desayuno</option><option>Comida</option><option>Snack</option><option>Cena</option></select></label>
      <label>Qué has comido<input name="description" required maxlength="160"></label>
      <label>kcal<input name="kcal" type="number" min="0" max="5000" inputmode="numeric"></label>
      <label>Proteína (g)<input name="protein" type="number" min="0" max="400" step="0.1" inputmode="decimal"></label>
      <button type="submit">Añadir</button><span class="small" role="status"></span></form>
      ${rows.map(r => `<div class="card row" style="margin-top:8px"><div><b>${esc(r.payload.meal)}</b><div class="small">${esc(r.payload.description)}</div></div><div class="small">${r.payload.kcal ?? "–"} kcal · ${r.payload.protein ?? "–"} g <button class="switch" data-del-food="${esc(r.id)}" aria-label="Borrar registro">✕</button></div></div>`).join("")}`;
    box.querySelector("[data-food-form]").onsubmit = async e => {
      e.preventDefault(); const f = e.currentTarget, v = Object.fromEntries(new FormData(f)), st = f.querySelector("[role=status]");
      const user = getUser(); if (!user) return;
      const date = today(), id = crypto.randomUUID();
      const payload = { meal: v.meal, description: v.description.trim().slice(0, 160), kcal: num(v.kcal), protein: num(v.protein), date };
      f.querySelector("button").disabled = true;
      const { error } = await supabase.from("hub_records").insert({ id, owner_id: user.id, domain: "body", record_type: "food_log", title: `${v.meal} · ${payload.description}`.slice(0, 500), status: "active", occurred_at: `${date}T12:00:00.000Z`, payload, source: "manual", requires_review: false });
      f.querySelector("button").disabled = false;
      if (error) { st.textContent = `No se pudo guardar: ${error.message}`; return; }
      data.food.push({ id, payload, occurred_at: `${date}T12:00:00.000Z`, status: "active" }); await syncXp(user.id); render();
    };
    box.querySelectorAll("[data-del-food]").forEach(b => b.onclick = async () => {
      const user = getUser(); if (!user || !confirmDelete()) return;
      const { error } = await supabase.from("hub_records").delete().eq("id", b.dataset.delFood).eq("owner_id", user.id).eq("record_type", "food_log");
      if (!error) { data.food = data.food.filter(r => r.id !== b.dataset.delFood); render(); }
    });
  }
  // Borrado solo de entradas propias de comida; se pide confirmación explícita en la interfaz.
  const confirmDelete = () => (typeof window !== "undefined" && window.__RH_CONFIRM__) ? window.__RH_CONFIRM__() : window.confirm("¿Borrar este registro?");

  function sparkline(points) {
    if (points.length < 2) return "";
    const vals = points.map(p => p.value), min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const path = points.map((p, i) => `${i ? "L" : "M"}${(i / (points.length - 1) * 300).toFixed(1)},${(70 - (p.value - min) / span * 60).toFixed(1)}`).join(" ");
    return `<svg viewBox="0 0 300 80" role="img" aria-label="Evolución del peso" style="width:100%;height:80px"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function renderWeight() {
    const box = $("p1Weight"); if (!box) return;
    const pts = (data.weight || []).map(r => ({ id: r.id, date: r.payload?.date || r.occurred_at?.slice(0, 10), value: num(r.payload?.value) })).filter(p => p.date && p.value !== null).sort((a, b) => a.date.localeCompare(b.date));
    const last = pts.at(-1), first = pts[0];
    box.innerHTML = `<div class="section"><h3>Peso</h3><span class="small">${last ? `${fmt(last.value, 1)} kg · ${esc(last.date)}` : "sin datos"}</span></div>
      <div class="card">${pts.length >= 2 ? sparkline(pts.slice(-60)) + `<p class="small">${fmt(first.value, 1)} kg (${esc(first.date)}) → ${fmt(last.value, 1)} kg · ${last.value - first.value >= 0 ? "+" : ""}${fmt(last.value - first.value, 1)} kg</p>` : `<p class="small">${pts.length ? "Necesitas al menos dos registros para ver la evolución." : "Aún no hay registros de peso."}</p>`}
      <form class="worldform" data-weight-form><label>Peso (kg)<input name="value" type="number" step="0.1" min="30" max="300" required inputmode="decimal"></label>
      <label>Fecha<input name="date" type="date" required value="${today()}" max="${today()}"></label><button type="submit">Guardar peso</button><span class="small" role="status"></span></form></div>`;
    box.querySelector("[data-weight-form]").onsubmit = async e => {
      e.preventDefault(); const f = e.currentTarget, v = Object.fromEntries(new FormData(f)), st = f.querySelector("[role=status]");
      const user = getUser(); if (!user) return; const value = num(v.value);
      if (value === null || value < 30 || value > 300) { st.textContent = "Peso fuera de rango."; return; }
      // Un registro por día: id determinista; guardar de nuevo el mismo día corrige el valor.
      const id = await stableId(user.id, "body_weight", v.date);
      const payload = { value: Math.round(value * 10) / 10, unit: "kg", date: v.date, via: "hub" };
      const { error } = await supabase.from("hub_records").upsert({ id, owner_id: user.id, domain: "body", record_type: "body_weight", title: `Peso ${payload.value} kg`, status: "active", occurred_at: `${v.date}T12:00:00.000Z`, payload, source: "manual", requires_review: false }, { onConflict: "id" });
      if (error) { st.textContent = `No se pudo guardar: ${error.message}`; return; }
      data.weight = data.weight.filter(r => r.id !== id).concat({ id, payload, occurred_at: `${v.date}T12:00:00.000Z` }); await syncXp(user.id); render();
    };
  }

  function renderHome() {
    const box = $("p1Home"); if (!box) return;
    const t = today(), s = weekStats(data, t, habitNames), xp = totalXp(), lv = levelFor(xp);
    const doneToday = new Set((data.habits || []).filter(h => h.payload?.date === t && h.payload?.done).map(h => h.payload.habit));
    const done = habitNames.filter(h => doneToday.has(h)).length, pct = habitNames.length ? Math.round(done / habitNames.length * 100) : 0;
    const base = 50 * (lv.level - 1) ** 2, lvPct = Math.min(100, Math.round((xp - base) / (lv.next - base) * 100));
    const stat = (label, value) => `<div class="card rise-stat"><span class="small">${label}</span><b>${value}</b></div>`;
    // Hoy: misiones (hábitos de System → Ajustes) y progreso real (XP de tus registros). Sin rangos ni cifras inventadas.
    box.innerHTML = `<div class="card rise-quests"><div class="rise-card-head"><span class="ey">Misiones de hoy</span><span class="small">${habitNames.length ? `${done} de ${habitNames.length} · ${pct}%` : ""}</span></div>
        ${habitNames.length ? `<div class="rise-meter" aria-hidden="true"><i style="width:${pct}%"></i></div><div class="rise-quest-list">${habitNames.map(h => `<label class="rise-quest${doneToday.has(h) ? " is-done" : ""}"><input type="checkbox" data-habit="${esc(h)}" ${doneToday.has(h) ? "checked" : ""}><span>${esc(h)}</span></label>`).join("")}</div>` : `<p class="small">Sin hábitos definidos. Añádelos en System → Ajustes → Hábitos.</p>`}</div>
      <div class="card rise-level"><div class="rise-card-head"><h3>Progreso</h3><span class="small">Nivel ${lv.level} · ${fmt(xp)} XP</span></div>
        <div class="rise-level-row"><div class="rise-level-badge" aria-hidden="true"><span>Nivel</span><b>${lv.level}</b></div><div class="rise-level-copy"><p class="small">Faltan ${fmt(lv.toNext)} XP para el nivel ${lv.level + 1}</p><div class="rise-meter" aria-hidden="true"><i style="width:${lvPct}%"></i></div></div></div>
        <div class="rise-level-mini"><div><span class="small">Hoy</span><b>${habitNames.length ? `${done}/${habitNames.length}` : "sin datos"}</b></div><div><span class="small">Hábitos 7 días</span><b>${s.habits ? `${s.habits.done}/${s.habits.possible}` : "sin datos"}</b></div><div><span class="small">Entrenos 7 días</span><b>${s.workouts || "sin datos"}</b></div></div></div>`;
    const ov = $("p1Overview");
    if (ov) ov.innerHTML = `<div class="reportgrid rise-stats">
        ${stat("Peso actual", s.weight ? `${fmt(s.weight.value, 1)} kg${s.weight.delta !== null ? ` (${s.weight.delta >= 0 ? "+" : ""}${fmt(s.weight.delta, 1)})` : ""}` : "sin datos")}
        ${stat("Entrenos completados · 7 días", s.workouts || "sin datos")}
        ${stat("Sesiones de skincare · 7 días", s.skin || "sin datos")}
        ${stat("Días con comidas registradas", s.foodDays ? `${s.foodDays}${s.kcalAvg !== null ? ` · ${fmt(s.kcalAvg)} kcal/día` : ""}` : "sin datos")}
        ${stat("Neto del mes (My Finance)", s.money ? euros(s.money.net) : "sin datos")}
        ${stat("Vocabulario nuevo · 7 días", s.vocab || "sin datos")}
      </div>`;
    box.querySelectorAll("[data-habit]").forEach(cb => cb.onchange = async () => {
      const user = getUser(); if (!user) return; const habit = cb.dataset.habit, date = today();
      const id = await stableId(user.id, "habit", date, habit);
      cb.disabled = true;
      const payload = { habit, date, done: cb.checked };
      const { error } = await supabase.from("hub_records").upsert({ id, owner_id: user.id, domain: "personal", record_type: "habit_log", title: `${habit} · ${date}`.slice(0, 500), status: cb.checked ? "done" : "undone", occurred_at: `${date}T12:00:00.000Z`, payload, source: "manual", requires_review: false }, { onConflict: "id" });
      cb.disabled = false;
      if (error) { cb.checked = !cb.checked; return; }
      data.habits = data.habits.filter(h => h.id !== id).concat({ id, payload }); await syncXp(user.id); render();
    });
  }

  function renderHabitSettings(statusText = "") {
    const box = $("habitsCard"); if (!box) return;
    box.innerHTML = `<b>Hábitos</b><p class="small">Un hábito por línea (máx. 12). Aparecen como checklist diario en Home.</p>
      <form class="worldform" data-habits-form><textarea name="habits" rows="4" maxlength="600">${esc(habitNames.join("\n"))}</textarea><button type="submit">Guardar hábitos</button><span class="small" role="status">${esc(statusText)}</span></form>`;
    box.querySelector("[data-habits-form]").onsubmit = async e => {
      e.preventDefault(); const f = e.currentTarget, st = f.querySelector("[role=status]"), user = getUser(); if (!user) return;
      const list = [...new Set(String(new FormData(f).get("habits")).split("\n").map(s => s.trim().slice(0, 60)).filter(Boolean))].slice(0, 12);
      try {
        const current = await readSettings(user.id); // leer-modificar-escribir: no pisa el perfil corporal
        const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, settings: { ...current, habits: list }, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
        if (error) throw error;
        habitNames = list; renderHome(); renderHabitSettings("Hábitos guardados.");
      } catch (err) { st.textContent = `No se pudo guardar: ${err.message}`; }
    };
  }

  // world.js avisa cuando termina de guardar (Portfolio, vocabulario, Money): se recalcula el XP sin esperar a recargar.
  let rerun = false;
  async function refresh() { if (loading) { rerun = true; return; } await load(); if (rerun) { rerun = false; await load(); } }
  if (typeof document !== "undefined") document.addEventListener("renzo:synced", () => { if (getUser()) refresh().catch(e => console.warn("[renzo-hub] XP", e.message)); });

  function reset() { data = {}; habitNames = []; for (const id of ["p1Food", "p1Weight", "p1Home", "p1Overview", "habitsCard"]) { const n = $(id); if (n) n.replaceChildren(); } }
  return { load, reset };
}
