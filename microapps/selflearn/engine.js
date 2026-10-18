// SelfLearn · motor de lecciones al estilo Babbel (sin dependencias de DOM, testeable en Node).
// Cada unidad se convierte en una lección: presentación de palabras → ejercicios variados → los fallos
// se repiten al final hasta acertarlos. La unidad se completa al terminar la lección (no hay umbral que bloquee).
import { NL_COURSE } from "./courses/nl.js";
import { EN_COURSE } from "./courses/en.js";

export const COURSES = { nl: NL_COURSE, en: EN_COURSE };
export const COURSE_IDS = Object.keys(COURSES);
export const RUN_VERSION = 2;
export const FOCUS = {
  nl: ["Mixto", "Vida diaria", "Logística", "Analítica"],
  en: ["Mixto", "Trabajo", "Datos", "Vida diaria", "Finanzas"]
};
const AREA = { nl: "Dutch", en: "English" };
export const areaFor = courseId => AREA[courseId] || "Dutch";
const ARTICLES = { nl: ["de", "het", "een"], en: ["the", "a", "an", "to"] };

// ── utilidades ──────────────────────────────────────────────
export function seeded(seed = Date.now()) { let s = (Number(seed) >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const shuffle = (items, rng) => { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (items, n, rng) => shuffle(items, rng).slice(0, n);
const uniq = items => [...new Set(items)];

export function normalize(text) {
  return String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[’`´]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, " ").replace(/\s+/g, " ").trim();
}
function stripArticle(text, lang) { const words = normalize(text).split(" "); return words.length > 1 && (ARTICLES[lang] || []).includes(words[0]) ? words.slice(1).join(" ") : words.join(" "); }
export function distance(a, b) {
  // Distancia de edición con transposiciones (OSA): «winkle» frente a «winkel» cuenta como una sola errata.
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}
// Corrige una respuesta escrita: exacta (sin acentos ni mayúsculas, artículo opcional) o con una errata leve.
export function checkTyped(input, answer, lang = "nl") {
  const got = normalize(input), want = normalize(answer);
  if (!got) return { ok: false, typo: false };
  if (got === want || stripArticle(got, lang) === stripArticle(want, lang)) return { ok: true, typo: false };
  const a = stripArticle(got, lang), b = stripArticle(want, lang), tolerance = b.length >= 10 ? 2 : b.length >= 5 ? 1 : 0;
  if (tolerance && distance(a, b) <= tolerance) return { ok: true, typo: true };
  return { ok: false, typo: false };
}
// Similitud 0–1 para el dictado opcional (no es una nota de pronunciación).
export function similarity(a, b) { const x = normalize(a), y = normalize(b); if (!x || !y) return 0; return 1 - distance(x, y) / Math.max(x.length, y.length); }
export function tokens(sentence) { return String(sentence).trim().split(/\s+/).filter(Boolean); }
const typeable = word => !/[…?!/(]/.test(word) && tokens(word).length <= 3 && word.length <= 28;
const cleanToken = t => normalize(t);

// ── curso y progreso ───────────────────────────────────────
export function courseUnits(courseId) { return COURSES[courseId]?.units || []; }
export function findUnit(courseId, unitId) { return courseUnits(courseId).find(u => u.id === unitId) || null; }
export function courseOfUnit(unitId) { return String(unitId).startsWith("en-") ? "en" : "nl"; }

// Una unidad está hecha si existe un registro "Study path" aprobado con su ID; también reconoce las 7 lecciones antiguas por legacyDay.
export function completedUnitIds(entries, courseId) {
  const units = courseUnits(courseId), ids = new Set(units.map(u => u.id)), done = new Set();
  for (const x of entries || []) {
    if (x?.kind !== "learning" || !["Study path", "Daily lesson"].includes(x.practice)) continue;
    if (x.courseLessonId && ids.has(x.courseLessonId) && x.practice === "Study path" && x.passed !== false) done.add(x.courseLessonId);
    else if (!x.courseLessonId && courseId === "nl" && x.lessonDay != null) { const legacy = `a1-legacy-${Number(x.lessonDay)}`; if (ids.has(legacy)) done.add(legacy); }
  }
  return done;
}
export function courseSettings(settings = {}, courseId) {
  const course = COURSES[courseId], first = course.levels[0].id;
  const own = courseId === "nl" ? { startingLevel: settings.startingLevel, focus: settings.focus } : (settings.courses?.[courseId] || {});
  const startingLevel = course.levels.some(l => l.id === own.startingLevel) ? own.startingLevel : (courseId === "nl" ? "A1" : first);
  const focus = FOCUS[courseId].includes(own.focus) ? own.focus : "Mixto";
  const sessionMinutes = [5, 10, 20].includes(Number(settings.sessionMinutes)) ? Number(settings.sessionMinutes) : 10;
  return { startingLevel, focus, sessionMinutes, placement: courseId === "nl" ? settings.placement : own.placement };
}
// Siguiente unidad recomendada: primera sin completar desde el nivel elegido; con un foco, la primera de ese tema en el nivel actual.
export function nextUnit(courseId, entries, settings) {
  const units = courseUnits(courseId), done = completedUnitIds(entries, courseId), cfg = courseSettings(settings, courseId);
  const start = Math.max(0, units.findIndex(u => u.level === cfg.startingLevel));
  const pending = units.slice(start).filter(u => !done.has(u.id));
  if (!pending.length) return units.find(u => !done.has(u.id)) || units[units.length - 1];
  if (cfg.focus !== "Mixto") { const level = pending[0].level, themed = pending.find(u => u.level === level && u.topic === cfg.focus); if (themed) return themed; }
  return pending[0];
}
export function levelProgress(courseId, entries) {
  const done = completedUnitIds(entries, courseId);
  return COURSES[courseId].levels.map(level => { const units = courseUnits(courseId).filter(u => u.level === level.id); return { ...level, total: units.length, done: units.filter(u => done.has(u.id)).length }; });
}
export function streak(entries, today) {
  const dates = new Set((entries || []).filter(x => x?.kind === "learning").map(x => x.date).filter(Boolean));
  const d = new Date(`${today}T12:00:00`); if (!dates.has(today)) d.setDate(d.getDate() - 1);
  let n = 0; const key = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  while (dates.has(key(d)) && n < 3650) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// ── construcción de la lección ─────────────────────────────
function pool(courseId, unit) {
  const units = courseUnits(courseId), same = units.filter(u => u.level === unit.level && u.id !== unit.id);
  return { words: same.flatMap(u => u.words), sentences: same.flatMap(u => u.sentences), dialogue: same.flatMap(u => u.dialogue) };
}
const choiceOptions = (answer, distractors, rng, n = 3) => shuffle(uniq([answer, ...pick(uniq(distractors.filter(d => normalize(d) !== normalize(answer))), n, rng)]), rng);

export function buildLesson(courseId, unitId, { minutes = 10, seed = Date.now() } = {}) {
  const course = COURSES[courseId], unit = findUnit(courseId, unitId); if (!course || !unit) return null;
  const rng = seeded(seed), other = pool(courseId, unit), lang = courseId;
  const words = unit.words, sentences = unit.sentences;
  const compact = minutes <= 5, extended = minutes >= 20;
  const learnSet = compact ? words.slice(0, 6) : words;
  const steps = [];
  let n = 0; const id = () => `s${++n}`;
  const target = w => w[0], meaning = w => w[1];
  // 1) presentación en bloques de 2 palabras, cada bloque seguido de una comprobación rápida (como Babbel)
  for (let i = 0; i < learnSet.length; i += 2) {
    const block = learnSet.slice(i, i + 2);
    for (const w of block) {
      const example = sentences.find(s => normalize(s[0]).includes(normalize(stripArticle(w[0], lang)))) || null;
      steps.push({ id: id(), type: "learn", target: target(w), es: meaning(w), example: example ? { t: example[0], es: example[1] } : null });
    }
    for (const w of block) steps.push({ id: id(), type: "choice", prompt: `¿Cómo se dice «${meaning(w)}»?`, answer: target(w), options: choiceOptions(target(w), [...words, ...other.words].map(target), rng), audioAnswer: true, word: w });
  }
  // 2) gramática
  steps.push({ id: id(), type: "grammar", title: unit.grammar.title, text: unit.grammar.text, example: sentences[0] ? { t: sentences[0][0], es: sentences[0][1] } : null });
  // 3) emparejar
  { const pairs = pick(learnSet, 4, rng).map(w => [target(w), meaning(w)]); steps.push({ id: id(), type: "match", pairs, rights: shuffle(pairs.map(p => p[1]), rng) }); }
  // 4) escuchar
  for (const w of pick(learnSet, compact ? 1 : 2, rng)) steps.push({ id: id(), type: "listen", audio: target(w), prompt: "Escucha y elige el significado", answer: meaning(w), options: choiceOptions(meaning(w), [...words, ...other.words].map(meaning), rng), word: w });
  // 5) huecos en frases
  for (const s of pick(sentences, compact ? 1 : 2, rng)) {
    const hit = words.find(w => normalize(s[0]).split(" ").includes(normalize(stripArticle(w[0], lang)).split(" ").pop()));
    if (!hit) continue;
    const key = tokens(s[0]).find(t => cleanToken(t) === normalize(stripArticle(hit[0], lang)).split(" ").pop());
    if (!key) continue;
    const core = key.replace(/^[«"(]+|[.,!?;:»")]+$/g, ""), gap = s[0].replace(core, "____");
    const distract = uniq([...words, ...other.words].map(w => normalize(stripArticle(w[0], lang)).split(" ").pop()).filter(x => x && x !== cleanToken(core)));
    steps.push({ id: id(), type: "gap", sentence: gap, es: s[1], answer: core, options: choiceOptions(core, distract, rng), full: s[0], word: hit });
  }
  // 6) construir frases con fichas
  for (const s of pick(sentences.filter(x => tokens(x[0]).length >= 3 && tokens(x[0]).length <= 14), compact ? 1 : extended ? 3 : 2, rng)) {
    const toks = tokens(s[0]);
    const extra = pick(uniq(other.sentences.flatMap(x => tokens(x[0])).map(t => t.replace(/[.,!?;:«»"]+/g, "")).filter(t => t && t === t.toLowerCase())).filter(t => !toks.map(cleanToken).includes(cleanToken(t))), 2, rng);
    steps.push({ id: id(), type: "build", es: s[1], answer: toks, tiles: shuffle([...toks, ...extra], rng), full: s[0] });
  }
  // 7) escribir
  for (const w of pick(learnSet.filter(w => typeable(w[0])), compact ? 1 : extended ? 3 : 2, rng)) steps.push({ id: id(), type: "type", prompt: `Escribe en ${course.name}: «${meaning(w)}»`, answer: target(w), hint: `${target(w)[0]}…`, word: w });
  // 8) diálogo
  if (unit.dialogue.length >= 2 && !compact) {
    const lines = unit.dialogue, hideIndex = lines.length - 1, hidden = lines[hideIndex];
    steps.push({ id: id(), type: "dialogue", lines: lines.map(l => ({ who: l.who, t: l.t, es: l.es })), hideIndex, answer: hidden.t, options: choiceOptions(hidden.t, other.dialogue.map(l => l.t), rng, 2) });
  }
  // 9) hablar (solo en sesión extendida; voluntario y sin nota)
  if (extended) for (const s of pick(sentences, 2, rng)) steps.push({ id: id(), type: "speak", t: s[0], es: s[1] });
  return { version: RUN_VERSION, mode: "lesson", course: courseId, unitId, minutes, seed, steps, queue: steps.map(s => s.id), index: 0, firstTry: {}, attempts: {}, mistakes: [], startedAt: Date.now(), updatedAt: Date.now() };
}

// Sesión de repaso a partir de tarjetas FSRS vencidas (y palabras falladas).
export function buildReview(courseId, cards, { limit = 15, seed = Date.now() } = {}) {
  const rng = seeded(seed), course = COURSES[courseId];
  const all = courseUnits(courseId).flatMap(u => u.words);
  const steps = []; let n = 0;
  for (const card of cards.slice(0, limit)) {
    const w = [card.front, card.back], kind = n % 3, sid = `r${++n}`;
    if (kind === 1 && typeable(card.front)) steps.push({ id: sid, type: "type", prompt: `Escribe en ${course.name}: «${card.back}»`, answer: card.front, hint: `${card.front[0]}…`, cardId: card.id, word: w });
    else if (kind === 2) steps.push({ id: sid, type: "listen", audio: card.front, prompt: "Escucha y elige el significado", answer: card.back, options: choiceOptions(card.back, all.map(x => x[1]), rng), cardId: card.id, word: w });
    else steps.push({ id: sid, type: "choice", prompt: `¿Cómo se dice «${card.back}»?`, answer: card.front, options: choiceOptions(card.front, all.map(x => x[0]), rng), audioAnswer: true, cardId: card.id, word: w });
  }
  if (!steps.length) return null;
  return { version: RUN_VERSION, mode: "review", course: courseId, unitId: null, minutes: 5, seed, steps, queue: steps.map(s => s.id), index: 0, firstTry: {}, attempts: {}, mistakes: [], startedAt: Date.now(), updatedAt: Date.now() };
}

// Diagnóstico orientativo: 3 palabras por nivel.
export function buildDiagnostic(courseId, { seed = Date.now() } = {}) {
  const rng = seeded(seed), course = COURSES[courseId], steps = []; let n = 0;
  for (const level of course.levels) {
    const bank = courseUnits(courseId).filter(u => u.level === level.id).flatMap(u => u.words);
    for (const w of pick(bank, 3, rng)) steps.push({ id: `d${++n}`, type: "choice", prompt: `¿Cómo se dice «${w[1]}»?`, answer: w[0], options: choiceOptions(w[0], bank.map(x => x[0]), rng), level: level.id });
  }
  return { version: RUN_VERSION, mode: "diagnostic", course: courseId, unitId: null, minutes: 5, seed, steps, queue: steps.map(s => s.id), index: 0, firstTry: {}, attempts: {}, mistakes: [], startedAt: Date.now(), updatedAt: Date.now(), noRepeat: true };
}
export function recommendLevel(courseId, run) {
  const levels = COURSES[courseId].levels; let recommended = levels[0].id;
  const scores = Object.fromEntries(levels.map(l => [l.id, run.steps.filter(s => s.level === l.id && run.firstTry[s.id] === true).length]));
  for (let i = 0; i < levels.length; i++) { if (scores[levels[i].id] >= 2) recommended = levels[Math.min(i + 1, levels.length - 1)].id; else break; }
  return { recommended, scores };
}

// ── avance de la lección ───────────────────────────────────
export const isGraded = step => ["choice", "listen", "gap", "build", "type", "dialogue", "match"].includes(step?.type);
export function currentStep(run) { return run ? run.steps.find(s => s.id === run.queue[run.index]) || null : null; }
export function isComplete(run) { return !!run && run.index >= run.queue.length; }
// Registra la respuesta. Un fallo vuelve a poner el ejercicio al final (máximo 2 repeticiones), como en Babbel.
export function answer(run, ok) {
  const step = currentStep(run); if (!step) return run;
  run.attempts[step.id] = (run.attempts[step.id] || 0) + 1;
  if (isGraded(step)) {
    if (!(step.id in run.firstTry)) run.firstTry[step.id] = !!ok;
    if (!ok) {
      if (!run.mistakes.includes(step.id)) run.mistakes.push(step.id);
      const repeats = run.queue.filter(x => x === step.id).length;
      if (!run.noRepeat && repeats < 3) run.queue.push(step.id);
    }
  }
  run.updatedAt = Date.now();
  return run;
}
export function advance(run) { run.index = Math.min(run.queue.length, run.index + 1); run.updatedAt = Date.now(); return run; }
export function score(run) {
  const graded = run.steps.filter(isGraded), correct = graded.filter(s => run.firstTry[s.id] === true).length;
  return { correct, total: graded.length, pct: graded.length ? Math.round(correct / graded.length * 100) : 100 };
}
export function progressPct(run) { return run && run.queue.length ? Math.round(run.index / run.queue.length * 100) : 0; }
export function mistakeWords(run) { return uniq(run.mistakes.map(id => run.steps.find(s => s.id === id)?.word).filter(Boolean).map(w => JSON.stringify(w))).map(x => JSON.parse(x)); }
// Comprueba una frase construida con fichas, sin importar mayúsculas ni puntuación.
export function checkBuild(chosen, answerTokens) { return normalize(chosen.join(" ")) === normalize(answerTokens.join(" ")); }
// Valida que un run guardado sigue siendo utilizable (versión, curso, unidad y pasos).
export function validRun(run) {
  if (!run || typeof run !== "object" || run.version !== RUN_VERSION || !COURSES[run.course] || !Array.isArray(run.steps) || !Array.isArray(run.queue)) return false;
  if (run.mode === "lesson" && !findUnit(run.course, run.unitId)) return false;
  return run.queue.every(id => run.steps.some(s => s.id === id)) && Number.isInteger(run.index) && run.index >= 0;
}
// Fusiona el progreso del run guardado en dos dispositivos: gana el más reciente.
export function newerRun(a, b) { if (!validRun(a)) return validRun(b) ? b : null; if (!validRun(b)) return a; return (Number(b.updatedAt) || 0) > (Number(a.updatedAt) || 0) ? b : a; }
