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
