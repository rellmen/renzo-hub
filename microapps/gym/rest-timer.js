// Temporizador de descanso entre series (como en las apps de registro tipo Symmetry).
// Vive fuera del contenido de Gym para sobrevivir a los re-renderizados; guarda la hora de fin en sessionStorage.
// Descanso del programa para ese ejercicio (Recomp: rest_seconds del CSV) o, si no hay, 150 s compuestos / 90 s aislamiento.
export const restSeconds = exercise => { const r = Number(exercise?.rest); return r >= 5 && r <= 900 ? r : exercise?.compound ? 150 : 90; };
const MAX_REST = 15 * 60; // un descanso guardado más largo que esto es un resto de otra sesión: se descarta
export const fmtClock = s => { const v = Math.max(0, Math.round(s)); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`; };
const KEY = "rise-gym-rest-v1";

export function mountRestTimer(doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return { start() {}, stop() {}, remaining: () => 0 };
  let bar = doc.getElementById("gymRestTimer"), tick = null, audio = null, endAt = 0, total = 0, label = "";
  if (!bar) {
    bar = doc.createElement("div"); bar.id = "gymRestTimer"; bar.className = "gym-rest"; bar.hidden = true;
    bar.setAttribute("role", "timer"); bar.setAttribute("aria-live", "off");
    bar.innerHTML = `<div class="gym-rest-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle class="gym-rest-arc" cx="18" cy="18" r="15.5"/></svg></div><div class="gym-rest-copy"><span class="gym-rest-label">Descanso</span><b class="gym-rest-time">0:00</b></div><div class="gym-rest-actions"><button type="button" data-rest="-15" aria-label="Restar 15 segundos">−15</button><button type="button" data-rest="15" aria-label="Sumar 15 segundos">+15</button><button type="button" data-rest="skip">Saltar</button></div>`;
    doc.body.append(bar);
  }
  const arc = bar.querySelector(".gym-rest-arc"), time = bar.querySelector(".gym-rest-time"), lab = bar.querySelector(".gym-rest-label");
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ endAt, total, label })); } catch {} };
  const clear = () => { try { sessionStorage.removeItem(KEY); } catch {} };
  function beep() {
    try { navigator.vibrate?.([220, 120, 220]); } catch {}
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain(); o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.5);
      o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.55);
    } catch {}
  }
  function paint() {
    const left = (endAt - Date.now()) / 1000;
    if (left <= 0) {
      clearInterval(tick); tick = null; clear(); beep();
      bar.classList.add("done"); time.textContent = "¡A por la siguiente!"; lab.textContent = "Descanso terminado"; arc.style.strokeDashoffset = "0";
      bar.setAttribute("aria-live", "assertive");
      setTimeout(() => { if (!tick) { bar.hidden = true; bar.classList.remove("done"); } }, 5000);
      return;
    }
    time.textContent = fmtClock(left); lab.textContent = label || "Descanso";
    arc.style.strokeDashoffset = String(97.4 * (1 - left / Math.max(1, total)));
  }
  function run() { bar.hidden = false; bar.classList.remove("done"); bar.setAttribute("aria-live", "off"); clearInterval(tick); tick = setInterval(paint, 250); paint(); }
  function start(seconds, name = "") {
    total = Math.min(MAX_REST, Math.max(5, Number(seconds) || 90)); endAt = Date.now() + total * 1000; label = name ? `Descanso · ${name}` : "Descanso"; save();
    try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch {}
    run();
  }
  function stop() { clearInterval(tick); tick = null; clear(); bar.hidden = true; }
  bar.onclick = e => {
    const b = e.target.closest("[data-rest]"); if (!b) return;
    if (b.dataset.rest === "skip") { stop(); return; }
    const d = Number(b.dataset.rest); endAt = Math.min(Date.now() + MAX_REST * 1000, Math.max(Date.now() + 1000, endAt + d * 1000)); total = Math.min(MAX_REST, Math.max(total + d, 5)); save(); paint();
  };
  // Si el usuario recargó o cambió de pestaña con un descanso en marcha, se recupera.
  try { const s = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (s && s.endAt > Date.now() && s.endAt - Date.now() <= MAX_REST * 1000) { endAt = s.endAt; total = s.total; label = s.label; run(); } } catch {}
  return { start, stop, remaining: () => Math.max(0, (endAt - Date.now()) / 1000) };
}
