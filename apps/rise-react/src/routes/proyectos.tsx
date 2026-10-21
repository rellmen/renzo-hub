import { createFileRoute } from "@tanstack/react-router";
import { useState, type DragEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import img from "@/assets/projects.jpg";
import { pageHead } from "@/lib/seo";
import { useLocalStorage } from "@/lib/storage";
import { PageHero } from "@/components/rise/PageHero";
import { DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { ProgressRing } from "@/components/rise/ProgressRing";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/proyectos")({
  head: () => pageHead("Proyectos", "Trabajo profundo: tablero Kanban de ejemplo con creación de tareas y resumen de progreso."),
  component: Projects,
});

type Status = "todo" | "doing" | "done";
type Prio = "Alta" | "Media" | "Baja";
type Task = { id: string; title: string; status: Status; prio: Prio; project: string };
const COLS: { id: Status; label: string }[] = [{ id: "todo", label: "Por hacer" }, { id: "doing", label: "En curso" }, { id: "done", label: "Hecho" }];
const PRIO_COLOR: Record<Prio, string> = { Alta: "var(--gym)", Media: "var(--gold)", Baja: "var(--projects)" };
const SEED: Task[] = [
  { id: "p1", title: "Definir tokens de diseño Nocturne", status: "done", prio: "Alta", project: "RISE HUB" },
  { id: "p2", title: "Prototipo del panel Ares", status: "doing", prio: "Alta", project: "RISE HUB" },
  { id: "p3", title: "Guion de vídeo de presentación", status: "todo", prio: "Media", project: "Contenido" },
  { id: "p4", title: "Revisar métricas trimestrales", status: "todo", prio: "Baja", project: "Personal" },
  { id: "p5", title: "Migrar componentes a vanilla JS", status: "todo", prio: "Media", project: "RISE HUB" },
  { id: "p6", title: "Sesión de fotos para módulos", status: "doing", prio: "Media", project: "Contenido" },
  { id: "p7", title: "Auditoría de accesibilidad", status: "done", prio: "Alta", project: "RISE HUB" },
];

function Projects() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("kanban", SEED);
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState<Status | null>(null);
  const move = (id: string, status: Status) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  const pct = tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0;

  const onDrop = (e: DragEvent, s: Status) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, s); setOver(null); };

  return (
    <div className="space-y-6">
      <PageHero image={img} eyebrow="Proyectos" title="Trabajo profundo." subtitle="Arrastra tareas entre columnas o cambia su estado." color="var(--projects)" priority>
        <div><button type="button" className="btn-gold" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva tarea</button></div>
      </PageHero>

      <section className="grid gap-4 sm:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="surface rim flex items-center gap-4 p-5">
          <ProgressRing value={pct} size={72} stroke={5} color="var(--projects)" />
          <div><div className="text-sm">Progreso global</div><DemoDataBadge className="mt-1" /></div>
        </div>
        {COLS.map((c) => (
          <div key={c.id} className="surface rim flex items-center justify-between p-5">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <span className="font-display text-4xl">{tasks.filter((t) => t.status === c.id).length}</span>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((c) => {
          const list = tasks.filter((t) => t.status === c.id);
          return (
            <section key={c.id} aria-label={c.label}
              onDragOver={(e) => { e.preventDefault(); setOver(c.id); }} onDragLeave={() => setOver(null)} onDrop={(e) => onDrop(e, c.id)}
              className={`surface min-h-64 p-4 transition ${over === c.id ? "ring-1 ring-projects/60" : ""}`}>
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="eyebrow text-projects">{c.label}</h2><span className="text-xs text-muted-foreground">{list.length}</span>
              </header>
              <ul className="space-y-2">
                {list.map((t) => (
                  <li key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                    className="group cursor-grab rounded-2xl border border-hairline bg-raised p-3.5 transition hover:border-projects/40 active:cursor-grabbing">
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground md:block" />
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>{t.title}</div>
                        <div className="mt-2 flex items-center gap-2 text-[0.68rem]">
                          <span className="rounded-full px-2 py-0.5" style={{ color: PRIO_COLOR[t.prio], background: `color-mix(in oklab, ${PRIO_COLOR[t.prio]} 14%, transparent)` }}>{t.prio}</span>
                          <span className="text-muted-foreground">{t.project}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label className="sr-only" htmlFor={`st-${t.id}`}>Estado</label>
                      <select id={`st-${t.id}`} value={t.status} onChange={(e) => move(t.id, e.target.value as Status)} className="h-10 flex-1 rounded-full border border-input bg-ink px-3 text-xs">
                        {COLS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      <button type="button" aria-label={`Eliminar ${t.title}`} onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
                {list.length === 0 && <li className="rounded-2xl border border-dashed border-input p-6 text-center text-xs text-muted-foreground">Suelta aquí una tarea</li>}
              </ul>
            </section>
          );
        })}
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} onCreate={(t) => setTasks((ts) => [{ ...t, id: crypto.randomUUID() }, ...ts])} />
    </div>
  );
}

function TaskDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (t: Omit<Task, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [prio, setPrio] = useState<Prio>("Media");
  const [project, setProject] = useState("RISE HUB");
  const [error, setError] = useState("");
  const submit = () => {
    const v = title.trim();
    if (v.length < 3) { setError("El título necesita al menos 3 caracteres."); return; }
    onCreate({ title: v.slice(0, 90), prio, project, status: "todo" });
    setTitle(""); setError(""); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-raised">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Nueva tarea</DialogTitle>
          <DialogDescription>Se guarda solo en este navegador.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
          <div>
            <label htmlFor="nt-title" className="mb-1.5 block text-xs text-muted-foreground">Título</label>
            <input id="nt-title" autoFocus value={title} maxLength={90} onChange={(e) => { setTitle(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby="nt-err"
              className="h-12 w-full rounded-xl border border-input bg-ink px-4 text-sm aria-[invalid=true]:border-destructive" placeholder="p. ej. Preparar demo del módulo Money" />
            {error && <p id="nt-err" className="mt-1.5 text-xs text-destructive">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nt-prio" className="mb-1.5 block text-xs text-muted-foreground">Prioridad</label>
              <select id="nt-prio" value={prio} onChange={(e) => setPrio(e.target.value as Prio)} className="h-12 w-full rounded-xl border border-input bg-ink px-3 text-sm">
                <option>Alta</option><option>Media</option><option>Baja</option>
              </select>
            </div>
            <div>
              <label htmlFor="nt-proj" className="mb-1.5 block text-xs text-muted-foreground">Proyecto</label>
              <select id="nt-proj" value={project} onChange={(e) => setProject(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-ink px-3 text-sm">
                <option>RISE HUB</option><option>Contenido</option><option>Personal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => onOpenChange(false)}>Cancelar</button>
            <button type="submit" className="btn-gold">Crear tarea</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}