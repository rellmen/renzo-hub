// Gym · Entrenar en modo "un ejercicio a la vez" (19 oct 2026, idea de Renzo con una captura de referencia).
// Reorganiza en pantalla el formulario de sesión que pinta gym.js SIN cambiar sus campos: los nombres
// (w-i-j, r-i-j, i-i-j, c-i-j, n-i, s-i-j, side-i-j) y save() siguen igual. Ilustraciones propias
// (mapa corporal con el músculo trabajado), nada de imágenes de otras apps.
import { bodyMapSvg } from "./body-map.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const BACK = new Set(["Espalda", "Tríceps", "Glúteos", "Isquiotibiales"]);
const REGION = { Piernas: ["Cuádriceps", "Glúteos", "Isquiotibiales"], Glúteos: ["Glúteos"], Pecho: ["Pecho"], Espalda: ["Espalda"], Hombros: ["Hombros"], "Bíceps": ["Bíceps"], "Tríceps": ["Tríceps"], Core: ["Core"], Gemelos: ["Gemelos"], "Cuádriceps": ["Cuádriceps"], Isquiotibiales: ["Isquiotibiales"] };
const state = new Map(); // id de sesión → { focus, list, advance }

// Qué vista del cuerpo y qué zonas pintar para un músculo del plan.
export function muscleView(muscle) {
  const regions = REGION[muscle] || [muscle];
  const view = BACK.has(regions[0]) ? "back" : "front";
  return { view, regions };
}
export function muscleFigure(muscle, cls = "") {
  const { view, regions } = muscleView(muscle), fills = Object.fromEntries(regions.map(r => [r, "var(--accent)"]));
  return `<span class="gp-fig ${cls}" aria-hidden="true">${bodyMapSvg({}, view, fills)}</span>`;
}
export function prevLabel(set) {
  return set && set.completed && Number.isFinite(Number(set.weight)) && Number.isFinite(Number(set.reps)) ? `${Number(set.weight).toLocaleString("es-ES")} × ${Number(set.reps)}` : "—";
}
export const elapsed = (start, now = Date.now()) => {
  const s = Math.max(0, Math.floor((now - new Date(start).getTime()) / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`;
};
// Siguiente ejercicio con series pendientes (o el mismo si es el último pendiente).
export function nextPending(exercises, from) {
  for (let k = 1; k <= exercises.length; k++) { const i = (from + k) % exercises.length; if (exercises[i].sets.some(s => !s.completed)) return i; }
  return from;
}

const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true" class="gp-ic">${d}</svg>`;
const IC = {
  down: '<path d="m6 9 6 6 6-6"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>', gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="M6 3l14 9-14 9V3z"/>', swap: '<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>', pen: '<path d="M12 20h9M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
};

export function enhanceSession(content, ctx) {
  const form = content.querySelector("#workoutForm"), active = ctx.active;
  if (!form || !active || form.dataset.player) return;
  form.dataset.player = "1";
  const st = state.get(active.id) || { focus: nextPending(active.exercises, active.exercises.length - 1), list: false, advance: false };
  state.set(active.id, st);
  if (st.advance) { st.advance = false; if (active.exercises[st.focus]?.sets.every(s => s.completed)) st.focus = nextPending(active.exercises, st.focus); }
  const details = [...form.querySelectorAll("details.exercise")];
  const total = active.exercises.length;

  // Barra superior: modo, tiempo, descanso, ajustes de sesión y finalizar
  const bar = document.createElement("div");
  bar.className = "gp-bar";
  bar.innerHTML = `<button type="button" class="gp-iconbtn" data-gp-list aria-pressed="${st.list}" aria-label="${st.list ? "Ver un ejercicio a la vez" : "Ver todos los ejercicios"}">${icon(st.list ? IC.down : IC.list)}</button><span class="gp-time" aria-label="Tiempo de sesión"><b data-gp-clock>${elapsed(active.started_at)}</b></span><button type="button" class="gp-iconbtn" data-gp-rest aria-label="Empezar descanso">${icon(IC.timer)}</button><button type="button" class="gp-iconbtn" data-gp-meta aria-expanded="false" aria-label="Datos de la sesión">${icon(IC.gear)}</button><button type="button" class="gp-finish" data-gp-finish>Finalizar</button>`;
  content.prepend(bar);
  const clock = bar.querySelector("[data-gp-clock]");
  const tick = setInterval(() => { if (!clock.isConnected) { clearInterval(tick); return; } clock.textContent = elapsed(active.started_at); }, 1000);

  const meta = form.querySelector(".card.meta");
  if (meta) meta.classList.add("gp-meta");
  bar.querySelector("[data-gp-meta]").onclick = e => { if (!meta) return; const open = meta.classList.toggle("gp-meta-open"); e.currentTarget.setAttribute("aria-expanded", String(open)); if (open) meta.scrollIntoView?.({ block: "nearest" }); };
  bar.querySelector("[data-gp-rest]").onclick = () => ctx.startRest(st.focus);
  bar.querySelector("[data-gp-finish]").onclick = () => form.requestSubmit();
  bar.querySelector("[data-gp-list]").onclick = () => { st.list = !st.list; apply(); };

  // Tira de ejercicios
  const strip = document.createElement("nav");
  strip.className = "gp-strip"; strip.setAttribute("aria-label", "Ejercicios de la sesión");
  strip.innerHTML = active.exercises.map((ex, i) => `<button type="button" data-gp-go="${i}" aria-label="${i + 1}. ${esc(ex.name)}">${muscleFigure(ex.muscle, "gp-fig-mini")}<span class="gp-strip-n">${ex.sets.every(s => s.completed) ? icon(IC.check) : i + 1}</span></button>`).join("");
  form.insertBefore(strip, details[0] || null);
  strip.querySelectorAll("[data-gp-go]").forEach(b => b.onclick = () => { st.focus = +b.dataset.gpGo; st.list = false; apply(); content.scrollIntoView?.({ block: "start" }); });

  details.forEach((d, i) => {
    const ex = active.exercises[i]; if (!ex) return;
    d.open = true; d.classList.add("gp-ex"); d.dataset.gpEx = String(i);
    const rank = ctx.rankOf?.(ex.name), info = ctx.info?.(ex.name), prev = ctx.previous(ex.name)[0];
    const hero = document.createElement("div");
    hero.className = "gp-hero";
    hero.innerHTML = `<div class="gp-stage">${muscleFigure(ex.muscle, "gp-fig-big")}<span class="gp-count">${i + 1}/${total}</span></div>
<h2 class="gp-name">${esc(ex.name)}</h2><p class="small gp-sub">${esc(ex.muscle || "")}${ex.swappedFrom ? ` · en lugar de ${esc(ex.swappedFrom)}` : ""}</p>
<div class="gp-chips">${rank ? `<span class="gp-chip gp-rank" style="--rank:${esc(rank.color)}" title="Rango en este ejercicio">◆ ${esc(rank.label)}</span>` : ""}${info ? `<button type="button" class="gp-chip" data-gp-tech aria-expanded="false">${icon(IC.play)}Técnica</button>` : ""}<button type="button" class="gp-chip" data-gp-swap>${icon(IC.swap)}Cambiar</button><button type="button" class="gp-chip" data-gp-notes aria-expanded="false">${icon(IC.pen)}Notas</button><button type="button" class="gp-chip" data-gp-rest-ex>${icon(IC.timer)}Descanso</button></div>
${info ? `<div class="gp-tech" hidden><b>${esc(info.pattern)} · ${esc(info.equipment)}</b><ul>${info.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul><p class="small">Evita: ${esc(info.mistake)}</p></div>` : ""}`;
    d.querySelector("summary")?.after(hero);
    hero.querySelector("[data-gp-tech]")?.addEventListener("click", e => { const t = hero.querySelector(".gp-tech"); t.hidden = !t.hidden; e.currentTarget.setAttribute("aria-expanded", String(!t.hidden)); });
    hero.querySelector("[data-gp-swap]").onclick = () => d.querySelector(`[data-swap="${i}"]`)?.click();
    hero.querySelector("[data-gp-rest-ex]").onclick = () => ctx.startRest(i);
    hero.querySelector("[data-gp-notes]").onclick = e => { const on = d.classList.toggle("gp-notes-open"); e.currentTarget.setAttribute("aria-expanded", String(on)); };

    // Tabla: Serie | Anterior | kg | Reps | RIR | ✓
    const head = d.querySelector(".setrow.sethead");
    if (head) head.innerHTML = "<span title=\"Serie\">Nº</span><span>Anterior</span><span>kg</span><span>Reps</span><span>RIR</span><span class=\"gp-sr\">Hecha</span>";
    d.querySelectorAll(".setrow:not(.sethead)").forEach((row, j) => {
      row.classList.add("gp-row");
      const p = document.createElement("span"); p.className = "gp-prev"; p.textContent = prevLabel(prev?.sets?.[j]);
      row.children[0].after(p);
      const box = row.querySelector('input[type="checkbox"]');
      const actions = row.nextElementSibling?.classList.contains("gym-quick-actions") ? row.nextElementSibling : null;
      const done = actions?.querySelector("[data-quick-done]");
      const extra = document.createElement("div"); extra.className = "gp-set-extra";
      if (actions) { actions.after(extra); extra.append(actions); }
      // Lado y nota de la serie van con las acciones secundarias (se ven con "Notas")
      let n = extra.nextElementSibling;
      while (n && (n.querySelector?.("select[name^='side-']") || n.matches("input[name^='s-']"))) { const next = n.nextElementSibling; extra.append(n); n = next; }
      box.classList.add("gp-box");
      if (box.checked) {
        row.classList.add("gp-done");
        const undo = document.createElement("button"); undo.type = "button"; undo.className = "gp-tick gp-tick-on"; undo.innerHTML = icon(IC.check);
        undo.setAttribute("aria-label", `Serie ${j + 1} hecha. Pulsa para desmarcarla`);
        undo.onclick = () => { box.checked = false; ctx.saveDraft(); };
        row.append(undo);
      } else if (done) {
        done.classList.add("gp-tick"); done.innerHTML = icon(IC.check); done.setAttribute("aria-label", `Guardar serie ${j + 1}`);
        done.addEventListener("click", () => { const pending = ex.sets.filter((s, k) => !s.completed && k !== j).length; if (!pending) st.advance = true; }, { capture: true });
        row.append(done);
      }
    });
    // Navegación entre ejercicios
    const nav = document.createElement("div"); nav.className = "gp-nav";
    nav.innerHTML = `<button type="button" class="secondary" data-gp-step="-1" ${i === 0 ? "disabled" : ""}>← Anterior</button><button type="button" class="primary" data-gp-step="1" ${i === total - 1 ? "disabled" : ""}>Siguiente →</button>`;
    d.append(nav);
    nav.querySelectorAll("[data-gp-step]").forEach(b => b.onclick = () => { st.focus = Math.max(0, Math.min(total - 1, i + Number(b.dataset.gpStep))); apply(); content.scrollIntoView?.({ block: "start" }); });
  });

  function apply() {
    form.classList.toggle("gp-player", !st.list);
    details.forEach((d, i) => d.classList.toggle("gp-current", i === st.focus));
    strip.querySelectorAll("[data-gp-go]").forEach((b, i) => { b.classList.toggle("gp-on", i === st.focus); b.classList.toggle("gp-ok", active.exercises[i].sets.every(s => s.completed)); if (i === st.focus) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    const lb = bar.querySelector("[data-gp-list]");
    lb.setAttribute("aria-pressed", String(st.list)); lb.setAttribute("aria-label", st.list ? "Ver un ejercicio a la vez" : "Ver todos los ejercicios"); lb.innerHTML = icon(st.list ? IC.down : IC.list);
    strip.querySelector(".gp-on")?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }
  apply();
}
