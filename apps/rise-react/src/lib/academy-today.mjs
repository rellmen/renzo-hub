// Academy · "Hoy": une Idiomas (SelfLearn) y UOC +25 (Academia) en una sola lista de trabajo.
// Solo lectura y sin inventar: si una fuente no se pudo cargar, su bloque queda como null,
// nunca como 0 (0 significaría "no tienes nada pendiente", que no sabemos).

/**
 * @param {{learning?: {reviewDue:{nl:number,en:number},completed:{nl:string[],en:string[]}}|null,
 *          uoc?: {due:Array<unknown>,next:Array<{course:string,lesson:{id:string,title:string,estimated_minutes?:number},inProgress:boolean}>}|null}} src
 */
export function academyToday(src = {}) {
  const learning = src.learning ?? null;
  const uoc = src.uoc ?? null;
  const languages = learning ? {
    nlDue: count(learning.reviewDue?.nl),
    enDue: count(learning.reviewDue?.en),
    nlDone: learning.completed?.nl?.length ?? 0,
    enDone: learning.completed?.en?.length ?? 0,
  } : null;
  const exam = uoc ? { due: uoc.due?.length ?? 0, next: (uoc.next ?? []).slice(0, 3) } : null;
  const parts = [languages && languages.nlDue + languages.enDue, exam && exam.due].filter((n) => n !== null);
  return {
    languages,
    exam,
    // Total solo si TODAS las fuentes respondieron; si falta una, el total sería engañoso.
    totalDue: languages && exam ? parts.reduce((a, b) => a + b, 0) : null,
    partial: !languages || !exam,
  };
}

function count(n) {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// ───────────────────────── Repasos de hoy · Esta semana · Siguiente paso ─────────────────────────
// Funciones puras (sin red): la pantalla les pasa lo que ya cargó. null = fuente caída; undefined = fuente apagada.

/** Fecha local YYYY-MM-DD (la del teléfono de Renzo, no UTC). */
export function localDay(d = new Date()) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

/** Semana de lunes a domingo que contiene `now`. */
export function weekRange(now = new Date()) {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const back = (base.getDay() + 6) % 7;
  const start = new Date(base); start.setDate(base.getDate() - back);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return { start: localDay(start), end: localDay(end) };
}

const inWeek = (day, w) => typeof day === "string" && day >= w.start && day <= w.end;

/**
 * Una sola cola de repasos: vocabulario de SelfLearn (por idioma) + repasos espaciados de UOC (por lección).
 * @param {{learning?: {reviewDue:{nl:number,en:number}}|null, uocDue?: Array<{lesson_id:string,due_on:string,step:number}>|null,
 *          lessonInfo?: (id:string)=>({title:string,course_title?:string}|null)}} src
 */
export function reviewQueue({ learning, uocDue, lessonInfo = () => null } = {}) {
  const items = [];
  if (Array.isArray(uocDue)) {
    for (const r of uocDue) {
      const meta = lessonInfo(r.lesson_id);
      items.push({ id: "uoc-" + r.lesson_id, source: "uoc", label: meta?.title || r.lesson_id,
        detail: `${meta?.course_title ? meta.course_title + " · " : ""}repaso ${Number(r.step) || 1} · desde ${r.due_on}`,
        count: 1, minutes: 10, due_on: r.due_on, to: "/academia", search: { leccion: r.lesson_id } });
    }
  }
  if (learning) {
    for (const [c, name] of [["nl", "neerlandés"], ["en", "inglés"]]) {
      const n = count(learning.reviewDue?.[c]);
      if (n > 0) items.push({ id: "vocab-" + c, source: c, label: `Vocabulario de ${name}`, detail: `${n} tarjeta${n === 1 ? "" : "s"}`,
        count: n, minutes: vocabMinutes(n), to: "/aprender", search: { idioma: c } });
    }
  }
  // UOC vencido primero (el más antiguo arriba); luego vocabulario, el idioma con más tarjetas primero.
  items.sort((a, b) => (a.source === "uoc" ? 0 : 1) - (b.source === "uoc" ? 0 : 1)
    || String(a.due_on || "").localeCompare(String(b.due_on || "")) || b.count - a.count);
  const uocKnown = uocDue !== null; // undefined = UOC apagado en este entorno: no falta, no cuenta.
  return { items, total: learning && uocKnown ? items.reduce((a, i) => a + i.count, 0) : null, partial: !learning || !uocKnown };
}

function vocabMinutes(n) { return Math.max(5, Math.min(20, Math.round(n * 0.5))); }

/**
 * Minutos de estudio de la semana (lunes-domingo).
 * Reales: SelfLearn (`minutes` de cada evento de aprendizaje) y simulacros/exámenes entregados (entrega − inicio, tope su duración).
 * Estimados: lecciones UOC completadas esta semana × su duración prevista (la app no mide el tiempo de lectura).
 */
export function weeklyMinutes({ entries, mocks, exams, progress, lessonMinutes = () => 0, goal = null, now = new Date() } = {}) {
  const w = weekRange(now);
  const selflearn = Array.isArray(entries) ? entries.reduce((a, e) => {
    if (e?.kind !== "learning" || !inWeek(e.date, w)) return a;
    const m = Number(e.minutes); return a + (Number.isFinite(m) && m > 0 ? Math.min(m, 1440) : 0);
  }, 0) : null;
  const timed = (rows) => rows.reduce((a, s) => {
    if (!s?.submitted_at || !s.started_at || !inWeek(localDay(new Date(s.submitted_at)), w)) return a;
    const m = (Date.parse(s.submitted_at) - Date.parse(s.started_at)) / 60000;
    const cap = Number(s.duration_minutes) > 0 ? Number(s.duration_minutes) : 240;
    return a + (Number.isFinite(m) && m > 0 ? Math.min(Math.round(m), cap) : 0);
  }, 0);
  const uocReady = Array.isArray(mocks) && Array.isArray(progress);
  const uocTimed = uocReady ? timed(mocks) + timed(Array.isArray(exams) ? exams : []) : null;
  const uocLessonsEstimate = uocReady ? progress.reduce((a, p) => {
    if (!p?.completed_at || !(p.status === "completed" || p.status === "mastered")) return a;
    if (!inWeek(localDay(new Date(p.completed_at)), w)) return a;
    const m = Number(lessonMinutes(p.lesson_id)); return a + (Number.isFinite(m) && m > 0 ? m : 0);
  }, 0) : null;
  const parts = [selflearn, uocTimed, uocLessonsEstimate];
  const total = parts.every((p) => p === null) ? null : parts.reduce((a, p) => a + (p ?? 0), 0);
  const g = Number(goal) > 0 ? Math.round(Number(goal)) : null;
  return { ...w, selflearn, uocTimed, uocLessonsEstimate, total, goal: g,
    pct: g && total !== null ? Math.min(100, Math.round((total / g) * 100)) : null,
    partial: parts.some((p) => p === null) };
}

const SHIFT = {
  "Morning Shift": { work: true, moment: "estudia por la tarde" },
  "Evening Shift": { work: true, moment: "estudia por la mañana" },
  "Vacation": { work: false, moment: "buen día para una sesión larga" },
};

/** Ventana de estudio del día según el turno de DHL guardado en Turnos. */
export function studySlot(shift, sessionMinutes) {
  const base = Number(sessionMinutes) > 0 ? Math.round(Number(sessionMinutes)) : 45;
  const s = SHIFT[shift];
  if (!s) return { shift: shift || "", work: null, moment: shift === undefined ? "Turno no disponible" : "Sin turno registrado hoy", budget: base };
  return { shift, work: s.work, moment: s.moment, budget: s.work ? Math.min(base, 30) : Math.max(base, 60) };
}

/**
 * UN siguiente paso para hoy.
 * Prioridad hasta el examen UOC (abril): 1) repaso UOC vencido · 2) lección UOC que cabe en el hueco del turno
 * · 3) vocabulario pendiente · 4) lección UOC aunque no quepa (se puede dejar a medias) · 5) idiomas.
 * Si el objetivo semanal ya está cumplido, solo propone repasos.
 */
export function nextStep({ queue, uocNext, slot, weekly, uocOn = true } = {}) {
  const items = queue?.items ?? [];
  const goalMet = !!(weekly && weekly.goal && weekly.total !== null && weekly.total >= weekly.goal);
  const fromItem = (i, reason) => ({ kind: i.source === "uoc" ? "uoc-review" : "vocab", title: i.source === "uoc" ? "Repasa: " + i.label : i.label,
    detail: i.detail, minutes: i.minutes, to: i.to, search: i.search, reason });
  const uocReview = items.find((i) => i.source === "uoc");
  if (uocReview) return fromItem(uocReview, "Repaso espaciado de UOC vencido: va primero para no perder lo ya estudiado.");
  const vocab = items.find((i) => i.source !== "uoc");
  const lesson = Array.isArray(uocNext) ? uocNext[0] : null;
  const fromLesson = (reason) => ({ kind: "uoc-lesson", title: lesson.lesson.title,
    detail: `${lesson.courseTitle || lesson.course} · ${lesson.inProgress ? "continúa" : "empieza"}`,
    minutes: Number(lesson.lesson.estimated_minutes) || null, to: "/academia", search: { leccion: lesson.lesson.id }, reason });
  if (goalMet) {
    if (vocab) return fromItem(vocab, "Objetivo semanal cumplido: hoy basta con el repaso.");
    return { kind: "done", title: "Objetivo semanal cumplido", detail: "No hay repasos pendientes.", minutes: null,
      to: lesson ? "/academia" : "/aprender", search: lesson ? { leccion: lesson.lesson.id } : { idioma: "nl" },
      reason: "Si te apetece, adelanta la siguiente lección; si no, descansa." };
  }
  const fits = lesson && (!slot || !lesson.lesson.estimated_minutes || lesson.lesson.estimated_minutes <= slot.budget);
  if (lesson && fits) return fromLesson(slot?.work ? "Cabe en el hueco de hoy y es lo que más pesa en el plan semanal UOC." : "Es lo que más pesa en el plan semanal UOC.");
  if (vocab) return fromItem(vocab, "La lección UOC no cabe en el hueco de hoy: el repaso de vocabulario sí.");
  if (lesson) return fromLesson("No cabe entera en el hueco de hoy: empiézala y continúa otro día, el avance se guarda.");
  return { kind: "idioma", title: "Siguiente unidad de neerlandés", detail: uocOn ? "UOC +25 no tiene lecciones listas ahora." : "UOC +25 no está activo aquí.",
    minutes: null, to: "/aprender", search: { idioma: "nl" }, reason: "Sin repasos ni lecciones UOC pendientes: avanza en idiomas." };
}
