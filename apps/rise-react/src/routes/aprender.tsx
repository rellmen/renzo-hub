import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Headphones, Lock, PenLine, Play, X } from "lucide-react";
import img from "@/assets/learn.jpg";
import { pageHead } from "@/lib/seo";
import { useLocalStorage } from "@/lib/storage";
import { PageHero } from "@/components/rise/PageHero";
import { Bar, DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { ProgressRing } from "@/components/rise/ProgressRing";
import { WeeklyBars } from "@/components/rise/charts";

export const Route = createFileRoute("/aprender")({
  head: () => pageHead("SelfLearn", "Aprende sin límites: cursos de neerlandés B2 e inglés C1 con lección interactiva de ejemplo."),
  component: Learn,
});

type CourseId = "nl" | "en";
const COURSES: Record<CourseId, { name: string; target: string; lessons: { id: string; title: string; kind: string; min: number }[]; q: { prompt: string; sentence: string; options: string[]; answer: number; tip: string } }> = {
  nl: {
    name: "Neerlandés", target: "B2",
    lessons: [
      { id: "nl1", title: "Lección 1 · Conectores formales", kind: "Gramática", min: 12 },
      { id: "nl2", title: "Lección 2 · Escucha: noticias", kind: "Escucha", min: 15 },
      { id: "nl3", title: "Lección 3 · Debate y opinión", kind: "Expresión", min: 18 },
      { id: "nl4", title: "Lección 4 · Correo profesional", kind: "Escritura", min: 20 },
    ],
    q: { prompt: "Elige el conector correcto", sentence: "Ik blijf thuis, ___ het regent.", options: ["omdat", "maar", "dus", "toch"], answer: 0, tip: "«omdat» introduce una causa y envía el verbo al final." },
  },
  en: {
    name: "Inglés", target: "C1",
    lessons: [
      { id: "en1", title: "Lesson 1 · Inversion for emphasis", kind: "Grammar", min: 10 },
      { id: "en2", title: "Lesson 2 · Academic listening", kind: "Listening", min: 16 },
      { id: "en3", title: "Lesson 3 · Nuanced vocabulary", kind: "Vocabulary", min: 14 },
      { id: "en4", title: "Lesson 4 · Persuasive essay", kind: "Writing", min: 22 },
    ],
    q: { prompt: "Choose the correct form", sentence: "Never ___ such a remarkable view.", options: ["I have seen", "have I seen", "I saw", "did I saw"], answer: 1, tip: "Tras «Never» al inicio, se invierte sujeto y auxiliar." },
  },
};

function Learn() {
  const [course, setCourse] = useState<CourseId>("nl");
  const [done, setDone] = useLocalStorage<string[]>("lessons", []);
  const [open, setOpen] = useState<string | null>(null);
  const c = COURSES[course];
  const pct = (id: CourseId) => Math.round((COURSES[id].lessons.filter((l) => done.includes(l.id)).length / COURSES[id].lessons.length) * 100);

  if (open) return <Lesson course={course} lessonId={open} onBack={() => setOpen(null)} onDone={() => { setDone((d) => (d.includes(open) ? d : [...d, open])); }} completed={done.includes(open)} />;

  return (
    <div className="space-y-6">
      <PageHero image={img} eyebrow="SelfLearn" title="Aprende sin límites." subtitle="Idiomas con método: sesiones cortas, constancia larga." color="var(--learn)" priority>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-gold" onClick={() => setOpen(c.lessons[0]!.id)}><Play className="h-4 w-4" />Continuar lección 1</button>
        </div>
      </PageHero>

      <div role="tablist" aria-label="Cursos" className="inline-flex rounded-full border border-hairline bg-obsidian p-1">
        {(Object.keys(COURSES) as CourseId[]).map((id) => (
          <button key={id} role="tab" aria-selected={course === id} type="button" onClick={() => setCourse(id)}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${course === id ? "bg-learn/20 text-foreground ring-1 ring-learn/50" : "text-muted-foreground hover:text-foreground"}`}>
            {COURSES[id].name} · <span className="text-learn">{COURSES[id].target}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard eyebrow={`${c.name} · objetivo ${c.target}`} title="Lecciones" accent="var(--learn)" action={<DemoDataBadge />}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.lessons.map((l, i) => {
              const isDone = done.includes(l.id);
              const locked = i > 1 && !done.includes(c.lessons[i - 1]!.id);
              return (
                <li key={l.id}>
                  <button type="button" disabled={locked} onClick={() => setOpen(l.id)}
                    className="group flex h-full w-full flex-col rounded-2xl border border-hairline bg-foreground/[0.02] p-4 text-left transition hover:-translate-y-0.5 hover:border-learn/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] font-bold tracking-[0.18em] text-learn">{l.kind.toUpperCase()}</span>
                      {isDone ? <span className="grid h-6 w-6 place-items-center rounded-full bg-learn text-ink"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span> : locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Play className="h-4 w-4 text-muted-foreground group-hover:text-learn" />}
                    </div>
                    <div className="mt-3 font-display text-xl leading-tight">{l.title}</div>
                    <div className="mt-auto pt-3 text-xs text-muted-foreground">{l.min} min</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard eyebrow="Progreso" title="Visión general" accent="var(--learn)">
            <div className="flex items-center gap-5">
              <ProgressRing value={pct(course)} size={104} stroke={6} color="var(--learn)">
                <div><div className="font-display text-3xl">{pct(course)}%</div><div className="text-[0.6rem] tracking-widest text-muted-foreground">{c.target}</div></div>
              </ProgressRing>
              <div className="flex-1 space-y-4">
                {(Object.keys(COURSES) as CourseId[]).map((id) => (
                  <div key={id}>
                    <div className="mb-1.5 flex justify-between text-xs"><span>{COURSES[id].name} {COURSES[id].target}</span><span className="text-muted-foreground">{pct(id)}%</span></div>
                    <Bar value={pct(id)} color={id === "nl" ? "var(--learn)" : "var(--ares)"} />
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Progreso guardado solo en este navegador.</p>
          </SectionCard>
          <SectionCard eyebrow="Esta semana" title="Minutos de estudio" action={<DemoDataBadge />}>
            <WeeklyBars data={[{ d: "L", v: 25 }, { d: "M", v: 40 }, { d: "X", v: 15 }, { d: "J", v: 35 }, { d: "V", v: 50 }, { d: "S", v: 20 }, { d: "D", v: 30 }]} color="var(--learn)" height={150} unit=" min" />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Lesson({ course, lessonId, onBack, onDone, completed }: { course: CourseId; lessonId: string; onBack: () => void; onDone: () => void; completed: boolean }) {
  const c = COURSES[course];
  const lesson = c.lessons.find((l) => l.id === lessonId)!;
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = pick === c.q.answer;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-rise">
      <button type="button" onClick={onBack} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Volver a lecciones</button>
      <div className="surface rim overflow-hidden p-0">
        <div className="relative h-36 sm:h-44">
          <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" width={1600} height={912} />
          <div className="absolute inset-0 bg-photo-fade" />
          <div className="absolute bottom-4 left-6">
            <div className="eyebrow text-learn">{c.name} {c.target} · {lesson.kind}</div>
            <h1 className="font-display text-3xl sm:text-4xl">{lesson.title}</h1>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><PenLine className="h-4 w-4 text-learn" />Ejercicio 1 de 1 · {c.q.prompt}<Headphones className="ml-auto h-4 w-4" /></div>
          <p className="font-display text-3xl leading-snug sm:text-4xl">{c.q.sentence}</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Opciones">
            {c.q.options.map((o, i) => {
              const state = checked ? (i === c.q.answer ? "ok" : i === pick ? "bad" : "") : pick === i ? "sel" : "";
              return (
                <button key={o} type="button" role="radio" aria-checked={pick === i} disabled={checked && correct}
                  onClick={() => { setPick(i); setChecked(false); }}
                  className={`flex min-h-14 items-center justify-between rounded-2xl border px-5 text-left text-base transition ${state === "ok" ? "border-learn bg-learn/15" : state === "bad" ? "border-destructive bg-destructive/10" : state === "sel" ? "border-gold bg-gold/10" : "border-hairline hover:border-learn/50"}`}>
                  {o}
                  {state === "ok" && <Check className="h-4 w-4 text-learn" />}
                  {state === "bad" && <X className="h-4 w-4 text-destructive" />}
                </button>
              );
            })}
          </div>
          {checked && (
            <div className={`rounded-2xl border p-4 text-sm ${correct ? "border-learn/40 bg-learn/10" : "border-destructive/40 bg-destructive/10"}`} role="status">
              {correct ? "¡Correcto! " : "Casi. Inténtalo de nuevo. "}<span className="text-muted-foreground">{c.q.tip}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {!(checked && correct) ? (
              <button type="button" className="btn-gold" disabled={pick === null} onClick={() => { setChecked(true); if (pick === c.q.answer) onDone(); }}>Comprobar</button>
            ) : (
              <button type="button" className="btn-gold" onClick={onBack}><Check className="h-4 w-4" />Lección completada · volver</button>
            )}
            {completed && !checked && <span className="self-center text-xs text-learn">Ya completaste esta lección</span>}
          </div>
        </div>
      </div>
    </div>
  );
}