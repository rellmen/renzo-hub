import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";
import { DemoDataBadge, EmptyState } from "./primitives";

type Task = { id: string; time: string; title: string; tag: string; done: boolean };

const SEED: Task[] = [
  { id: "t1", time: "07:00", title: "Entrenamiento de fuerza", tag: "Gym", done: true },
  { id: "t2", time: "09:30", title: "Bloque de trabajo profundo", tag: "Proyectos", done: false },
  { id: "t3", time: "13:00", title: "Lección de neerlandés B2", tag: "Aprender", done: false },
  { id: "t4", time: "18:30", title: "Revisión semanal de gastos", tag: "Money", done: false },
  { id: "t5", time: "22:00", title: "Rutina PM de cuidado", tag: "Skin", done: false },
];

const TAG_COLOR: Record<string, string> = {
  Gym: "var(--gym)", Proyectos: "var(--projects)", Aprender: "var(--learn)", Money: "var(--money)", Skin: "var(--skin)", General: "var(--gold)",
};

export function TaskTimeline() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("timeline", SEED);
  const [draft, setDraft] = useState("");
  const [time, setTime] = useState("20:00");
  const done = tasks.filter((t) => t.done).length;

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((ts) => [...ts, { id: crypto.randomUUID(), time, title, tag: "General", done: false }].sort((a, b) => a.time.localeCompare(b.time)));
    setDraft("");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{done} de {tasks.length} completadas</span>
        <DemoDataBadge />
      </div>
      {tasks.length === 0 ? (
        <EmptyState icon={<Check className="h-5 w-5" />} title="Día despejado" text="Añade una tarea de ejemplo para empezar tu línea de tiempo." />
      ) : (
        <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[3.85rem] before:top-3 before:w-px before:bg-hairline">
          {tasks.map((t) => {
            const c = TAG_COLOR[t.tag] ?? "var(--gold)";
            return (
              <li key={t.id} className="group relative flex items-center gap-3 rounded-xl px-1 py-1.5 hover:bg-foreground/[0.03]">
                <span className="w-11 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{t.time}</span>
                <button
                  type="button"
                  onClick={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                  aria-pressed={t.done}
                  aria-label={`Marcar ${t.title}`}
                  className="relative z-10 grid h-11 w-11 shrink-0 place-items-center"
                >
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full border transition-all"
                    style={{ borderColor: c, background: t.done ? c : "var(--ink)", boxShadow: t.done ? `0 0 10px ${c}` : "none" }}
                  >
                    {t.done && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</div>
                  <div className="text-[0.68rem]" style={{ color: c }}>{t.tag}</div>
                </div>
                <button
                  type="button" aria-label={`Eliminar ${t.title}`}
                  onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))}
                  className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground opacity-60 transition hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <label className="sr-only" htmlFor="tl-time">Hora</label>
        <input id="tl-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 w-24 rounded-full border border-input bg-ink px-3 text-sm" />
        <label className="sr-only" htmlFor="tl-title">Nueva tarea</label>
        <input id="tl-title" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nueva tarea de ejemplo…" maxLength={80} className="h-11 min-w-0 flex-1 rounded-full border border-input bg-ink px-4 text-sm placeholder:text-muted-foreground/70" />
        <button type="submit" className="icon-btn shrink-0 text-gold" aria-label="Añadir tarea" disabled={!draft.trim()}>
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}