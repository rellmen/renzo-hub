// SelfLearn · interfaz tipo Babbel (cursos, lección guiada, repaso, ajustes y laboratorio).
// El progreso se guarda tras CADA respuesta: run activo en hub_user_state.state.learningRuns,
// unidades completadas en hub_records (renzo_event "Study path") y tarjetas FSRS en renzo_vocabulary.
import * as E from "./engine.js";
import { pronunciationDrills } from "./pronunciation.js";
import { grammarDrills,checkGrammar } from "./grammar.js";
import { fsrs, createEmptyCard, Rating } from "./fsrs-bundle.js";

const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SKILLS = {
  nl: ["overall", "Vocabulary", "Grammar", "Listening", "Reading", "Writing", "Pronunciation", "Practical Dutch", "Logistics Dutch"],
  en: ["EN overall", "EN Speaking", "EN Writing", "EN Listening", "EN Reading", "EN Grammar", "EN Business English"]
};
const PRACTICE_PROMPTS = {
  nl: { "Mixto": "Escribe una frase que podrías decir hoy, dentro o fuera del trabajo.", "Vida diaria": "Inicia una conversación en una tienda o con un vecino.", "Logística": "Explica a un compañero dónde está un palé y qué has comprobado.", "Analítica": "Describe una cifra o una mejora en un proceso logístico ficticio." },
  en: { "Mixto": "Write two sentences about your day at work.", "Trabajo": "Write a short update for your manager about a stock discrepancy.", "Datos": "Describe a trend in one of your dashboards.", "Vida diaria": "Write a message inviting a friend for coffee.", "Finanzas": "Explain how you track your monthly budget." }
};

export function mountSelfLearn({ root, getData, persist, today, xpView, currentMode, onChange }) {
  let ui = fresh(), summary = null, voices = [], grammarFeedback = {};
  function fresh() { return { selected: null, feedback: null, built: [], matchLeft: null, matchDone: [], matchErrors: 0, typed: "", speech: "" }; }
  if (typeof window !== "undefined" && "speechSynthesis" in window) { const load = () => { voices = window.speechSynthesis.getVoices() || []; }; load(); window.speechSynthesis.onvoiceschanged = load; }

  // ── datos ──
  const data = () => getData();
  const settings = () => { const d = data(); if (!d.learningSettings || typeof d.learningSettings !== "object") d.learningSettings = {}; return d.learningSettings; };
  const activeCourse = () => E.COURSES[settings().activeCourse] ? settings().activeCourse : "nl";
  const runs = () => { const d = data(); if (!d.learningRuns || typeof d.learningRuns !== "object") d.learningRuns = {}; return d.learningRuns; };
  const activeRun = () => { const c = activeCourse(), r = runs()[c]; return E.validRun(r) ? r : null; };
  const cardCourse = v => v.course || (v.area === "English" ? "en" : "nl");
  const isDue = v => { const t = v.fsrsCard?.due ? Date.parse(v.fsrsCard.due) : NaN; return Number.isFinite(t) ? t <= Date.now() : !v.nextReview || v.nextReview <= today(); };
  const dueCards = c => data().vocabulary.filter(v => cardCourse(v) === c && isDue(v)).sort((a, b) => (Date.parse(a.fsrsCard?.due || 0) || 0) - (Date.parse(b.fsrsCard?.due || 0) || 0));

  // ── audio ──
  function speak(text, lang) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = .86;
    const v = voices.find(x => x.lang === lang) || voices.find(x => x.lang?.startsWith(lang.slice(0, 2))); if (v) u.voice = v;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }
  const lang = () => E.COURSES[activeCourse()].speech;
  const audioBtn = (text, label = "🔊") => `<button type="button" class="sl-audio" data-sl="speak" data-text="${esc(text)}" aria-label="Escuchar">${label}</button>`;

  // ── guardado ──
  function save(immediate = false) { persist(immediate); }
  function setRun(run) { const r = runs(), c = run?.course || activeCourse(); if (run) r[c] = run; else delete r[c]; }

  // ── vistas ──
  function render() {
    const run = activeRun();
    if (summary) root.innerHTML = summaryView();
    else if (run && ui.playing) root.innerHTML = playerView(run);
    else root.innerHTML = homeView();
    afterRender();
  }
  function afterRender() { const input = root.querySelector("[data-sl-type]"); if (input && !ui.feedback) input.focus({ preventScroll: true }); onChange?.(); }

  function homeView() {
    const c = activeCourse(), course = E.COURSES[c], d = data(), cfg = E.courseSettings(settings(), c);
    const done = E.completedUnitIds(d.entries, c), units = E.courseUnits(c), next = E.nextUnit(c, d.entries, settings());
    const due = dueCards(c).length, known = d.vocabulary.filter(v => cardCourse(v) === c && Number(v.fsrsCard?.stability) >= 21).length;
    const run = activeRun(), xv = xpView(), levels = E.levelProgress(c, d.entries), st = E.streak(d.entries, today());
    const runUnit = run?.mode === "lesson" ? E.findUnit(c, run.unitId) : null;
    const tabs = E.COURSE_IDS.map(id => { const k = E.COURSES[id], lv = k.levels; return `<button class="sl-tab ${id === c ? "on" : ""}" data-sl="course" data-course="${id}" aria-pressed="${id === c}"><span>${k.flag}</span><b>${esc(k.name)}</b><small>${lv[0].id}–${lv[lv.length - 1].id}</small></button>`; }).join("");
    const resume = run ? `<div class="sl-resume"><div><div class="ey">LECCIÓN EN CURSO · GUARDADA</div><b>${run.mode === "lesson" ? esc(runUnit?.title || "Lección") : run.mode === "review" ? "Repaso" : "Diagnóstico"}</b><div class="sl-bar"><span style="width:${E.progressPct(run)}%"></span></div><small>${run.index}/${run.queue.length} pasos · continúas donde lo dejaste</small></div><div class="sl-row"><button class="sl-primary" data-sl="resume">Continuar</button><button class="sl-ghost" data-sl="discard">Descartar</button></div></div>` : "";
    const levelHtml = levels.map(level => {
      const list = units.filter(u => u.level === level.id), pct = level.total ? Math.round(level.done / level.total * 100) : 0;
      const openLevel = list.some(u => u.id === next.id);
      return `<details class="sl-level" ${openLevel ? "open" : ""}><summary><div><b>${esc(level.id)} · ${esc(level.name)}</b><small>${esc(level.goal)}</small></div><span class="sl-count">${level.done}/${level.total}</span><div class="sl-bar sl-bar-thin"><span style="width:${pct}%"></span></div></summary><div class="sl-units">${list.map((u, i) => { const isDone = done.has(u.id), isNext = u.id === next.id; return `<button class="sl-unit ${isDone ? "done" : ""} ${isNext ? "next" : ""}" data-sl="start" data-unit="${esc(u.id)}"><span class="sl-unit-icon" aria-hidden="true">${isDone ? "✓" : isNext ? "▶" : i + 1}</span><span class="sl-unit-copy"><b>${esc(u.title)}</b><small>${esc(u.topic)} · ${esc(u.goal)}</small></span><span class="sl-unit-go">${isDone ? "Repasar" : isNext ? "Siguiente" : "Abrir"}</span></button>`; }).join("")}</div><p class="sl-exam">${esc(level.exam)}</p></details>`;
    }).join("");
    return `<div class="sl">
<div class="sl-tabs" role="tablist" aria-label="Cursos">${tabs}</div>
<div class="sl-hero"><div class="ey">SELFLEARN · ${esc(course.label.toUpperCase())}</div><h1>${course.flag} ${esc(course.name)} ${esc(course.levels[0].id)} → ${esc(course.levels[course.levels.length - 1].id)}</h1><p>${esc(course.tagline)}</p>
<div class="sl-stats"><div><strong>${st}</strong><small>días de racha</small></div><div><strong>${done.size}/${units.length}</strong><small>lecciones</small></div><div><strong>${known}</strong><small>palabras fijadas</small></div><div><strong>NV <b data-rise-level>${esc(xv.level)}</b></strong><small><b data-rise-xp>${esc(xv.xp)}</b> XP</small></div></div></div>
${resume}
<div class="sl-next"><div class="ey">TU SIGUIENTE LECCIÓN · ${esc(next.level)} · ${esc(next.topic)}</div><h2>${esc(next.title)}</h2><p>${esc(next.goal)}</p><div class="sl-row"><button class="sl-primary" data-sl="start" data-unit="${esc(next.id)}">${run?.mode === "lesson" && run.unitId === next.id ? "Continuar lección" : "Empezar lección"} · ${cfg.sessionMinutes} min</button><button class="sl-secondary" data-sl="review" ${due ? "" : "disabled"}>🧠 Repaso · ${due} ${due === 1 ? "palabra" : "palabras"}</button></div>${currentMode() ? `<p class="sl-note">Hoy tienes turno configurado: un repaso corto también cuenta para la racha.</p>` : ""}</div>
<div class="sl-section"><h2>Ruta del curso</h2><span>${done.size} de ${units.length} completadas</span></div>
${levelHtml}
<details class="sl-panel" open><summary>⚙️ Mi ruta personalizada · gramática y pronunciación</summary>${settingsForm(c, cfg)}</details>
<details class="sl-panel"><summary>📖 Entrenador de gramática · ${grammarDrills(c).length} ejercicios</summary>${grammarView(c)}</details>
<details class="sl-panel"><summary>🗣️ Entrenador de pronunciación · ${pronunciationDrills(c).length} ejercicios</summary>${pronunciationView(c)}</details>
<details class="sl-panel"><summary>✍️ Práctica libre, mis tarjetas e historial</summary>${labView(c, cfg)}</details>
<p class="sl-note">${esc(course.examNote)} Los niveles orientan la ruta; no certifican tu nivel.</p>
</div>`;
  }

  function settingsForm(c, cfg) {
    const course = E.COURSES[c], placement = cfg.placement, p = E.personalization(settings(),c);
    return `<form class="sl-form" data-sl-form="settings"><label>Empezar desde<select name="startingLevel">${course.levels.map(l => `<option value="${l.id}" ${cfg.startingLevel === l.id ? "selected" : ""}>${l.id} · ${esc(l.name)}</option>`).join("")}</select></label><label>Duración de cada lección<select name="sessionMinutes">${[[5, "Corta · 5 min"], [10, "Normal · 10 min"], [20, "Extendida · 20 min (con dictado)"]].map(([m, t]) => `<option value="${m}" ${cfg.sessionMinutes === m ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>Priorizar temas<select name="focus">${E.FOCUS[c].map(f => `<option ${cfg.focus === f ? "selected" : ""}>${f}</option>`).join("")}</select></label><fieldset><legend>Prioridades de aprendizaje · ${esc(p.goalLevel)} como objetivo</legend><p class="sl-note">Distribución de tiempo orientativa. Se normaliza automáticamente; no cambia tus lecciones completadas.</p>${[["grammar","Gramática"],["pronunciation","Pronunciación y escucha"],["context","Conversación y situaciones reales"],["review","Repaso"]].map(([k,label])=>`<label>${label}<input name="priority_${k}" type="number" min="0" max="100" step="5" value="${p.priorities[k]}"></label>`).join("")}</fieldset><button class="sl-secondary" type="submit">Guardar preferencias</button></form>
<div class="sl-diag"><b>¿Desde qué nivel empezar?</b><p>Prueba orientativa: 3 palabras por nivel. Ajusta tu punto de partida; no mide las cuatro destrezas.</p><button class="sl-secondary" data-sl="diagnostic">Hacer diagnóstico</button>${placement ? `<p class="sl-note">Última recomendación: <b>${esc(placement.recommended)}</b> · ${esc(placement.date)} · ${Number(placement.correct) || 0}/${Number(placement.total) || 0} aciertos.</p>` : ""}</div>`;
  }

  function grammarView(c) {
    const score = E.grammarAccuracy(data().entries,c);
    return `<div class="sl-lab"><p class="sl-note">Práctica específica de tus puntos débiles · ${score.total ? `${score.pct}% de aciertos (${score.total} intentos)` : "sin intentos todavía"}. Cada respuesta se guarda para seguir tu evolución.</p>${grammarDrills(c).map(d=>{const fb=grammarFeedback[d.id];return `<div class="sl-card"><div class="ey">${esc(d.level)} · ${esc(d.rule)}</div><h3>${esc(d.prompt)}</h3><div class="sl-options">${d.options.map((option,i)=>`<button class="sl-option" type="button" data-sl="grammar-answer" data-id="${esc(d.id)}" data-i="${i}" ${fb?"disabled":""}>${esc(option)}</button>`).join("")}</div>${fb?`<p class="sl-note" role="status"><b>${fb.ok?"Correcto":"Respuesta correcta: "+esc(d.answer)}</b> · ${esc(d.explanation)}</p>`:""}</div>`;}).join("")}<button type="button" class="sl-secondary" data-sl="grammar-reset">Repetir ejercicios</button></div>`;
  }

  function pronunciationView(c) {
    return `<div class="sl-lab"><p class="sl-note">Escucha y repite cada contraste. No se graba audio ni se asigna una nota automática. La voz depende de tu dispositivo.</p>${pronunciationDrills(c).map(d=>`<div class="sl-card"><div class="ey">${esc(d.level)} · PRONUNCIACIÓN</div><h3>${esc(d.title)}</h3><p>${esc(d.tip)}</p><p><b>${esc(d.contrast)}</b> ${audioBtn(d.contrast,"🔊 Escuchar contraste")}</p><p>${esc(d.example)} ${audioBtn(d.example,"🔊 Escuchar ejemplo")}</p></div>`).join("")}</div>`;
  }

  function labView(c, cfg) {
    const d = data(), area = E.areaFor(c), history = d.entries.filter(x => (x.kind === "learning" || x.kind === "learning_assessment") && (x.area === area || (!x.area && c === "nl") || (c === "nl" && ["Everyday Dutch", "Logistics Dutch", "Logística", "Vida diaria", "Analítica"].includes(x.area)))).slice().reverse().slice(0, 12);
    const cards = d.vocabulary.filter(v => cardCourse(v) === c), skills = SKILLS[c];
    return `<div class="sl-lab"><form class="sl-form" data-sl-form="practice"><b>Práctica libre · ${esc(cfg.focus)}</b><p>${esc(PRACTICE_PROMPTS[c][cfg.focus] || PRACTICE_PROMPTS[c].Mixto)}</p><textarea name="answer" rows="3" maxlength="1200" placeholder="${c === "nl" ? "Schrijf hier je zin…" : "Write your sentences here…"}"></textarea><button type="button" class="sl-ghost" data-sl="dictate">🎤 Dictar (si el navegador lo permite)</button><p class="sl-note" id="slDictStatus" role="status">El dictado no es una nota de pronunciación.</p><label>Minutos<input name="minutes" type="number" min="1" max="180" value="${cfg.sessionMinutes}"></label><button class="sl-secondary" type="submit">Guardar práctica</button></form>
<form class="sl-form" data-sl-form="card"><b>Añadir una palabra a mis tarjetas</b><label>${c === "nl" ? "Neerlandés" : "Inglés"}<input name="front" required maxlength="160"></label><label>Significado o ejemplo<input name="back" required maxlength="300"></label><button class="sl-secondary" type="submit">Añadir tarjeta</button><p class="sl-note">${cards.length} tarjetas en este curso · ${dueCards(c).length} para repasar.</p></form>
<form class="sl-form" data-sl-form="assessment"><b>Mi autoevaluación</b><label>Destreza<select name="skill">${skills.map(s => `<option>${s}</option>`).join("")}</select></label><label>Nivel<input name="level" maxlength="40" placeholder="A2, B1, C1…"></label><button class="sl-secondary" type="submit">Guardar nivel</button><div class="sl-skills">${skills.map(s => `<span><b>${esc(s.replace(/^EN /, ""))}</b> ${esc(d.learningSkills?.[s] || "—")}</span>`).join("")}</div></form>
<div class="sl-history"><b>Historial</b>${history.map(x => `<div><span>${esc(x.title)}</span><small>${esc(x.date || "")}${x.minutes ? ` · ${x.minutes} min` : ""}${x.score != null && x.totalQuestions ? ` · ${x.score}/${x.totalQuestions}` : ""}</small></div>`).join("") || `<p class="sl-note">Tus lecciones aparecerán aquí.</p>`}</div></div>`;
  }

  // ── reproductor ──
  function playerView(run) {
    if (E.isComplete(run)) return finishPending(run);
    const step = E.currentStep(run), fb = ui.feedback, c = run.course, unit = run.mode === "lesson" ? E.findUnit(c, run.unitId) : null;
    const head = `<div class="sl-player-top"><button class="sl-close" data-sl="pause" aria-label="Guardar y salir">✕</button><div class="sl-bar"><span style="width:${E.progressPct(run)}%"></span></div><span class="sl-step-count">${Math.min(run.index + 1, run.queue.length)}/${run.queue.length}</span></div>`;
    const title = `<div class="ey">${run.mode === "lesson" ? `${esc(unit?.level)} · ${esc(unit?.title)}` : run.mode === "review" ? "REPASO" : `DIAGNÓSTICO · ${esc(step.level)}`}</div>`;
    let body = "";
    const opts = (list, picked) => `<div class="sl-options">${list.map((o, i) => { let cls = ""; if (fb) { if (norm(o) === norm(step.answer)) cls = "good"; else if (picked === i) cls = "bad"; } return `<button class="sl-option ${cls}" data-sl="choose" data-i="${i}" ${fb ? "disabled" : ""}>${esc(o)}</button>`; }).join("")}</div>`;
    switch (step.type) {
      case "learn": body = `<div class="sl-card sl-learn"><span class="sl-new">PALABRA NUEVA</span><div class="sl-big">${esc(step.target)} ${audioBtn(step.target)}</div><p class="sl-mean">${esc(step.es)}</p>${step.example ? `<div class="sl-example"><p>${esc(step.example.t)} ${audioBtn(step.example.t, "🔉")}</p><small>${esc(step.example.es)}</small></div>` : ""}</div><button class="sl-primary sl-wide" data-sl="next">Continuar</button>`; break;
      case "grammar": body = `<div class="sl-card sl-grammar"><span class="sl-new">GRAMÁTICA</span><h2>${esc(step.title)}</h2><p>${esc(step.text)}</p>${step.example ? `<div class="sl-example"><p>${esc(step.example.t)} ${audioBtn(step.example.t, "🔉")}</p><small>${esc(step.example.es)}</small></div>` : ""}</div><button class="sl-primary sl-wide" data-sl="next">Entendido</button>`; break;
      case "choice": body = `<div class="sl-card"><h2>${esc(step.prompt)}</h2>${opts(step.options, ui.selected)}</div>`; break;
      case "listen": body = `<div class="sl-card"><h2>${esc(step.prompt)}</h2><button class="sl-listen" data-sl="speak" data-text="${esc(step.audio)}">🔊 Escuchar</button><details class="sl-transcript"><summary>Ver texto si el audio no funciona</summary><p>${esc(step.audio)}</p></details>${opts(step.options, ui.selected)}</div>`; break;
      case "gap": body = `<div class="sl-card"><h2>Completa la frase</h2><p class="sl-sentence">${esc(step.sentence).replace("____", `<span class="sl-blank">${fb ? esc(step.answer) : "____"}</span>`)}</p><p class="sl-mean">${esc(step.es)}</p>${opts(step.options, ui.selected)}</div>`; break;
      case "build": {
        const chosen = ui.built.map(i => step.tiles[i]);
        body = `<div class="sl-card"><h2>Ordena la frase</h2><p class="sl-mean">${esc(step.es)}</p><div class="sl-built" aria-live="polite">${chosen.map((t, k) => `<button class="sl-tile used" data-sl="unbuild" data-k="${k}" ${fb ? "disabled" : ""}>${esc(t)}</button>`).join("") || `<span class="sl-placeholder">Toca las palabras en orden</span>`}</div><div class="sl-tiles">${step.tiles.map((t, i) => `<button class="sl-tile" data-sl="build" data-i="${i}" ${ui.built.includes(i) || fb ? "disabled" : ""}>${esc(t)}</button>`).join("")}</div>${fb ? "" : `<button class="sl-primary sl-wide" data-sl="check-build" ${ui.built.length ? "" : "disabled"}>Comprobar</button>`}</div>`;
        break;
      }
      case "type": body = `<div class="sl-card"><h2>${esc(step.prompt)}</h2><form data-sl-form="type" class="sl-typeform"><input data-sl-type name="typed" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(ui.typed)}" ${fb ? "disabled" : ""} placeholder="Empieza por ${esc(step.hint)}" aria-label="Tu respuesta">${fb ? "" : `<button class="sl-primary" type="submit">Comprobar</button>`}</form>${fb ? "" : `<button class="sl-ghost" data-sl="giveup">No lo sé</button>`}</div>`; break;
      case "match": {
        const leftDone = new Set(ui.matchDone.map(p => p[0])), rightDone = new Set(ui.matchDone.map(p => p[1]));
        const rights = step.rights || step.pairs.map(p => p[1]);
        body = `<div class="sl-card"><h2>Empareja</h2><div class="sl-match"><div>${step.pairs.map(p => `<button class="sl-tile ${leftDone.has(p[0]) ? "matched" : ""} ${ui.matchLeft === p[0] ? "sel" : ""}" data-sl="match-left" data-v="${esc(p[0])}" ${leftDone.has(p[0]) ? "disabled" : ""}>${esc(p[0])}</button>`).join("")}</div><div>${rights.map(r => `<button class="sl-tile ${rightDone.has(r) ? "matched" : ""}" data-sl="match-right" data-v="${esc(r)}" ${rightDone.has(r) || !ui.matchLeft ? "disabled" : ""}>${esc(r)}</button>`).join("")}</div></div>${ui.matchErrors ? `<p class="sl-note">${ui.matchErrors} ${ui.matchErrors === 1 ? "fallo" : "fallos"}</p>` : ""}</div>`;
        break;
      }
      case "dialogue": body = `<div class="sl-card"><h2>Completa el diálogo</h2><div class="sl-dialogue">${step.lines.map((l, i) => `<div class="sl-line ${l.who === "Renzo" ? "me" : ""}"><small>${esc(l.who)}</small><p>${i === step.hideIndex && !fb ? "…" : `${esc(l.t)} ${audioBtn(l.t, "🔉")}`}</p><em>${i === step.hideIndex && !fb ? "" : esc(l.es)}</em></div>`).join("")}</div>${opts(step.options, ui.selected)}</div>`; break;
      case "speak": body = `<div class="sl-card"><span class="sl-new">DI LA FRASE · VOLUNTARIO</span><div class="sl-big sl-mid">${esc(step.t)} ${audioBtn(step.t)}</div><p class="sl-mean">${esc(step.es)}</p><button class="sl-secondary" data-sl="speak-try">🎤 Hablar</button><p class="sl-note" id="slSpeakStatus" role="status">${esc(ui.speech || "Escucha, repite en voz alta y, si quieres, prueba el dictado. No es una nota de pronunciación.")}</p></div><button class="sl-primary sl-wide" data-sl="next">Continuar</button>`; break;
    }
    const feedback = fb ? `<div class="sl-feedback ${fb.ok ? "good" : "bad"}" role="status"><div><b>${fb.ok ? (fb.typo ? "¡Casi! Revisa la ortografía" : pickPraise(c)) : "Respuesta correcta:"}</b>${!fb.ok || fb.typo ? `<p>${esc(fb.correct)} ${audioBtn(fb.correct, "🔉")}</p>` : ""}${!fb.ok && run.mode !== "diagnostic" ? `<small>Lo volverás a ver al final de la lección.</small>` : ""}</div><button class="sl-primary" data-sl="next">Continuar</button></div>` : "";
    return `<div class="sl sl-player">${head}${title}${body}${feedback}</div>`;
  }
  const norm = E.normalize;
  const pickPraise = c => (c === "nl" ? ["Goed zo!", "Prima!", "Heel goed!", "Top!"] : ["Great!", "Well done!", "Spot on!", "Nice!"])[Math.floor(Math.random() * 4)];

  function finishPending() { return `<div class="sl sl-player"><div class="sl-card"><p>Guardando…</p></div></div>`; }
  function summaryView() {
    const s = summary, course = E.COURSES[s.course];
    return `<div class="sl sl-player"><div class="sl-card sl-summary"><div class="sl-trophy" aria-hidden="true">${s.mode === "diagnostic" ? "🧭" : "🏆"}</div><div class="ey">${s.mode === "lesson" ? "LECCIÓN COMPLETADA" : s.mode === "review" ? "REPASO COMPLETADO" : "DIAGNÓSTICO ORIENTATIVO"}</div><h2>${esc(s.title)}</h2><div class="sl-stats"><div><strong>${s.pct}%</strong><small>aciertos a la primera</small></div><div><strong>${s.correct}/${s.total}</strong><small>ejercicios</small></div><div><strong>+${s.xp}</strong><small>XP</small></div></div>${s.mistakes?.length ? `<div class="sl-example"><b>Para repasar</b>${s.mistakes.map(w => `<p>${esc(w[0])} · <small>${esc(w[1])}</small></p>`).join("")}</div>` : ""}<p class="sl-note">${esc(s.note)} ✅ Progreso guardado.</p><button class="sl-primary sl-wide" data-sl="close-summary">${s.mode === "lesson" ? "Volver a la ruta" : "Hecho"}</button></div><p class="sl-note">${esc(course.flag)} ${esc(course.name)}</p></div>`;
  }

  // ── acciones ──
  function startLesson(unitId) {
    const c = activeCourse(), cur = activeRun();
    if (cur && cur.mode === "lesson" && cur.unitId === unitId) { ui = { ...fresh(), playing: true }; render(); return; }
    if (cur && cur.index > 0 && !confirm("Tienes otra sesión a medias en este curso. ¿Descartarla y empezar esta lección?")) return;
    const run = E.buildLesson(c, unitId, { minutes: E.courseSettings(settings(), c).sessionMinutes });
    if (!run) return;
    setRun(run); ui = { ...fresh(), playing: true }; save(true); render(); speakIfIntro(run);
  }
  function startReview() {
    const c = activeCourse(), cards = dueCards(c); if (!cards.length) return;
    const cur = activeRun(); if (cur && cur.index > 0 && !confirm("Tienes otra sesión a medias. ¿Descartarla y repasar?")) return;
    const run = E.buildReview(c, cards, { limit: E.courseSettings(settings(), c).sessionMinutes >= 20 ? 25 : 15 });
    if (!run) return; setRun(run); ui = { ...fresh(), playing: true }; save(true); render();
  }
  function startDiagnostic() {
    const cur = activeRun(); if (cur && cur.index > 0 && !confirm("Tienes otra sesión a medias. ¿Descartarla y hacer el diagnóstico?")) return;
    const run = E.buildDiagnostic(activeCourse()); setRun(run); ui = { ...fresh(), playing: true }; save(true); render();
  }
  function speakIfIntro(run) { const s = E.currentStep(run); if (s?.type === "learn") speak(s.target, E.COURSES[run.course].speech); else if (s?.type === "listen") speak(s.audio, E.COURSES[run.course].speech); }

  function grade(run, ok, correct, typo = false) {
    const step = E.currentStep(run);
    E.answer(run, ok);
    ui.feedback = { ok, typo, correct };
    if (step?.cardId) reviewCard(step.cardId, ok ? (typo ? "hard" : "good") : "again", run);
    save(false); render();
  }
  function reviewCard(id, gradeName, run) {
    const item = data().vocabulary.find(x => x.id === id); if (!item) return;
    const repeat = (run.attempts[E.currentStep(run)?.id] || 0) > 1; if (repeat) return; // solo la primera respuesta cuenta para FSRS
    const ratings = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };
    const old = item.fsrsCard, card = old ? { ...old, due: new Date(old.due), last_review: old.last_review ? new Date(old.last_review) : undefined } : createEmptyCard(new Date());
    const result = fsrs().next(card, new Date(), ratings[gradeName]);
    item.fsrsCard = result.card; item.nextReview = dateKey(new Date(result.card.due)); item.intervalDays = Number(result.card.scheduled_days) || 0;
    item.repetitions = (item.repetitions || 0) + 1; item.lastReviewed = today();
    item.reviewHistory = [...(item.reviewHistory || []), { date: today(), grade: gradeName, stability: Number(result.card.stability) || 0 }].slice(-100);
    item.updatedAt = new Date().toISOString();
  }
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function next() {
    const run = activeRun(); if (!run) return;
    const step = E.currentStep(run);
    if (step && !E.isGraded(step) && !ui.feedback) E.answer(run, true);
    E.advance(run); ui = { ...fresh(), playing: true };
    if (E.isComplete(run)) { finish(run); return; }
    save(false); render(); speakIfIntro(run);
  }

  function finish(run) {
    const d = data(), c = run.course, area = E.areaFor(c), sc = E.score(run), minutes = Math.max(1, Math.round((Date.now() - run.startedAt) / 60000));
    let xp = 0, title = "", note = "";
    if (run.mode === "lesson") {
      const unit = E.findUnit(c, run.unitId), already = E.completedUnitIds(d.entries, c).has(unit.id);
      xp = already ? 0 : sc.correct * 10;
      d.entries.push({ id: crypto.randomUUID(), kind: "learning", area, course: c, title: `${area} · ${unit.title}`, stage: "Application", practice: "Study path", courseLessonId: unit.id, level: unit.level, passed: true, score: sc.correct, totalQuestions: sc.total, xp, minutes, date: today() });
      const wrong = new Set(E.mistakeWords(run).map(w => norm(w[0])));
      for (const [front, back] of unit.words) {
        const existing = d.vocabulary.find(v => cardCourse(v) === c && norm(v.front) === norm(front));
        if (!existing) d.vocabulary.push({ id: crypto.randomUUID(), course: c, front, back, area, unitId: unit.id, date: today(), nextReview: wrong.has(norm(front)) ? today() : dateKey(new Date(Date.now() + 86400000)), intervalDays: 0, repetitions: 0 });
        else if (wrong.has(norm(front)) && existing.fsrsCard) { existing.fsrsCard = { ...existing.fsrsCard, due: new Date().toISOString() }; existing.nextReview = today(); existing.updatedAt = new Date().toISOString(); }
      }
      title = unit.title; note = already ? "Lección repasada (el XP solo se da la primera vez)." : "Las palabras nuevas se han añadido a tu repaso.";
    } else if (run.mode === "review") {
      d.entries.push({ id: crypto.randomUUID(), kind: "learning", area, course: c, title: `${area} · repaso de ${run.steps.length} palabras`, stage: "Review", practice: "Review session", score: sc.correct, totalQuestions: sc.total, minutes, date: today() });
      title = "Repaso de vocabulario"; note = "Cada palabra se ha reprogramado según tu respuesta (FSRS).";
    } else {
      const { recommended, scores } = E.recommendLevel(c, run), placement = { date: today(), scores, recommended, correct: sc.correct, total: sc.total };
      const s = settings(); if (c === "nl") { s.startingLevel = recommended; s.placement = placement; } else { s.courses = { ...(s.courses || {}), [c]: { ...(s.courses?.[c] || {}), startingLevel: recommended, placement } }; }
      d.entries.push({ id: crypto.randomUUID(), kind: "learning_assessment", area, course: c, title: `Diagnóstico orientativo ${area}: ${recommended}`, practice: "Placement", date: today(), correct: sc.correct, total: sc.total });
      title = `Te recomendamos empezar en ${recommended}`; note = "Puedes cambiar el nivel de inicio cuando quieras en «Mi ruta personalizada».";
    }
    summary = { mode: run.mode, course: c, title, note, xp, ...sc, mistakes: run.mode === "diagnostic" ? [] : E.mistakeWords(run) };
    setRun(null); ui = fresh(); save(true); render();
  }

  function dictate(statusSel, onText) {
    const Speech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition), status = root.querySelector(statusSel);
    if (!Speech) { if (status) status.textContent = "El dictado no está disponible en este navegador."; return; }
    const rec = new Speech(); rec.lang = lang(); rec.interimResults = false; rec.maxAlternatives = 1;
    if (status) status.textContent = "Escuchando… (solo si permites el micrófono)";
    rec.onresult = e => onText(e.results[0][0].transcript);
    rec.onerror = e => { if (status) status.textContent = `No se pudo transcribir (${e.error}).`; };
    try { rec.start(); } catch { if (status) status.textContent = "No se pudo iniciar el micrófono."; }
  }

  root.addEventListener("click", event => {
    const btn = event.target.closest("[data-sl]"); if (!btn || !root.contains(btn) || btn.disabled) return;
    const act = btn.dataset.sl, run = activeRun(), step = E.currentStep(run);
    if (act === "speak") { speak(btn.dataset.text, lang()); return; }
    if (act === "grammar-reset") { grammarFeedback = {}; render(); return; }
    if (act === "grammar-answer") { const drill = grammarDrills(activeCourse()).find(d=>d.id===btn.dataset.id); if(!drill || grammarFeedback[drill.id])return; const choice=drill.options[Number(btn.dataset.i)]; const ok=checkGrammar(drill,choice);grammarFeedback[drill.id]={ok};data().entries.push({id:crypto.randomUUID(),kind:"learning_assessment",area:E.areaFor(activeCourse()),course:activeCourse(),skill:"grammar",rule:drill.id,title:drill.rule,correct:ok?1:0,totalQuestions:1,date:today()});save(true);render();return; }
    if (act === "course") { settings().activeCourse = btn.dataset.course; ui = fresh(); save(true); render(); return; }
    if (act === "start") { startLesson(btn.dataset.unit); return; }
    if (act === "resume") { ui = { ...fresh(), playing: true }; render(); if (run) speakIfIntro(run); return; }
    if (act === "discard") { if (confirm("¿Descartar la sesión a medias? Lo que ya completaste no se pierde.")) { setRun(null); save(true); render(); } return; }
    if (act === "review") { startReview(); return; }
    if (act === "diagnostic") { startDiagnostic(); return; }
    if (act === "pause") { ui = fresh(); save(true); render(); return; }
    if (act === "close-summary") { summary = null; render(); return; }
    if (act === "next") { next(); return; }
    if (act === "dictate") { dictate("#slDictStatus", text => { const box = root.querySelector('textarea[name="answer"]'); if (box) box.value = text; const s = root.querySelector("#slDictStatus"); if (s) s.textContent = "Transcripción insertada. Revísala."; }); return; }
    if (!run || !step || ui.feedback) return;
    if (act === "choose") { const i = Number(btn.dataset.i), choice = step.options[i]; ui.selected = i; grade(run, norm(choice) === norm(step.answer), step.answer); if (step.type === "choice" && step.audioAnswer) speak(step.answer, lang()); return; }
    if (act === "build") { ui.built.push(Number(btn.dataset.i)); render(); return; }
    if (act === "unbuild") { ui.built.splice(Number(btn.dataset.k), 1); render(); return; }
    if (act === "check-build") { const chosen = ui.built.map(i => step.tiles[i]); grade(run, E.checkBuild(chosen, step.answer), step.full); speak(step.full, lang()); return; }
    if (act === "giveup") { grade(run, false, step.answer); return; }
    if (act === "match-left") { ui.matchLeft = btn.dataset.v; speak(btn.dataset.v, lang()); render(); return; }
    if (act === "match-right") {
      const pair = step.pairs.find(p => p[0] === ui.matchLeft);
      if (pair && pair[1] === btn.dataset.v) { ui.matchDone.push(pair); ui.matchLeft = null; } else { ui.matchErrors++; ui.matchLeft = null; }
      if (ui.matchDone.length === step.pairs.length) grade(run, ui.matchErrors === 0, step.pairs.map(p => `${p[0]} = ${p[1]}`).join(" · ")); else render();
      return;
    }
    if (act === "speak-try") { dictate("#slSpeakStatus", text => { const pct = Math.round(E.similarity(text, step.t) * 100); ui.speech = `Hemos oído: «${text}» · parecido ${pct}%${pct >= 75 ? " · ¡bien!" : " · vuelve a escuchar y repite"}`; render(); }); return; }
  });

  root.addEventListener("submit", event => {
    const form = event.target.closest("form[data-sl-form]"); if (!form) return;
    event.preventDefault();
    const kind = form.dataset.slForm, v = Object.fromEntries(new FormData(form)), c = activeCourse(), d = data(), s = settings();
    if (kind === "type") { const run = activeRun(), step = E.currentStep(run); if (!run || !step || ui.feedback) return; ui.typed = String(v.typed || ""); const r = E.checkTyped(ui.typed, step.answer, run.course); grade(run, r.ok, step.answer, r.typo); speak(step.answer, lang()); return; }
    if (kind === "settings") {
      const course = E.COURSES[c], level = course.levels.some(l => l.id === v.startingLevel) ? v.startingLevel : course.levels[0].id, focus = E.FOCUS[c].includes(v.focus) ? v.focus : "Mixto";
      s.sessionMinutes = [5, 10, 20].includes(Number(v.sessionMinutes)) ? Number(v.sessionMinutes) : 10;
      if (c === "nl") { s.startingLevel = level; s.focus = focus; } else s.courses = { ...(s.courses || {}), [c]: { ...(s.courses?.[c] || {}), startingLevel: level, focus } };
      E.savePersonalization(s,c,{priorities:Object.fromEntries(E.LEARNING_PRIORITIES.map(k=>[k,Number(v[`priority_${k}`])]))});
    } else if (kind === "practice") {
      const note = String(v.answer || "").trim(); if (!note) return;
      d.entries.push({ id: crypto.randomUUID(), kind: "learning", area: E.areaFor(c), course: c, title: `Práctica libre · ${E.COURSES[c].name}`, stage: "Application", practice: "Free practice", minutes: Math.max(1, Number(v.minutes) || 10), note, date: today() });
    } else if (kind === "card") {
      const front = String(v.front || "").trim(), back = String(v.back || "").trim(); if (!front || !back) return;
      if (!d.vocabulary.some(x => cardCourse(x) === c && norm(x.front) === norm(front))) d.vocabulary.push({ id: crypto.randomUUID(), course: c, front, back, area: E.areaFor(c), date: today(), nextReview: today(), intervalDays: 0, repetitions: 0 });
    } else if (kind === "assessment") {
      if (!d.learningSkills || typeof d.learningSkills !== "object") d.learningSkills = {};
      d.learningSkills[v.skill] = String(v.level || "").trim() || "Por determinar";
      d.entries.push({ id: crypto.randomUUID(), kind: "learning_assessment", area: E.areaFor(c), course: c, title: `${v.skill}: ${v.level}`, date: today() });
    }
    save(true); render();
  });

  return { render, reset() { ui = fresh(); summary = null; root.innerHTML = ""; } };
}
