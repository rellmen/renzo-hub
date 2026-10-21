import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Pause, Play, Plus, RotateCcw, Timer } from "lucide-react";
import img from "@/assets/gym.jpg";
import { pageHead } from "@/lib/seo";
import { PageHero } from "@/components/rise/PageHero";
import { DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { ProgressRing } from "@/components/rise/ProgressRing";
import { fmt, useCountdown } from "@/components/rise/FocusTimer";
import { WeeklyBars } from "@/components/rise/charts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/gym")({
  head: () => pageHead("Gym", "Más fuerte cada día: entrenamiento actual, series, temporizador de descanso y actividad semanal de ejemplo."),
  component: Gym,
});

type SetRow = { id: number; kg: number; reps: number; done: boolean };
const EXERCISES = [
  { name: "Press banca", sets: "4 × 6–8", muscle: "Pecho" },
  { name: "Press militar", sets: "3 × 8", muscle: "Hombro" },
  { name: "Fondos en paralelas", sets: "3 × 10", muscle: "Tríceps" },
  { name: "Elevaciones laterales", sets: "3 × 12–15", muscle: "Hombro" },
  { name: "Extensión en polea", sets: "3 × 12", muscle: "Tríceps" },
];
const PROGRAM = [
  { d: "Lunes", t: "Empuje" }, { d: "Martes", t: "Tirón" }, { d: "Miércoles", t: "Pierna" }, { d: "Jueves", t: "Descanso activo" }, { d: "Viernes", t: "Torso completo" }, { d: "Sábado", t: "Cardio zona 2" }, { d: "Domingo", t: "Descanso" },
];

function Stepper({ value, onChange, step, label }: { value: number; onChange: (v: number) => void; step: number; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-hairline hover:border-gym/60" aria-label={`Restar ${label}`} onClick={() => onChange(Math.max(0, value - step))}><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-12 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-hairline hover:border-gym/60" aria-label={`Sumar ${label}`} onClick={() => onChange(value + step)}><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function Gym() {
  const [sets, setSets] = useState<SetRow[]>([
    { id: 1, kg: 60, reps: 8, done: true }, { id: 2, kg: 65, reps: 8, done: false }, { id: 3, kg: 70, reps: 6, done: false }, { id: 4, kg: 70, reps: 6, done: false },
  ]);
  const rest = useCountdown(90);
  const doneCount = sets.filter((s) => s.done).length;
  const upd = (id: number, p: Partial<SetRow>) => setSets((ss) => ss.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const volume = sets.filter((s) => s.done).reduce((a, s) => a + s.kg * s.reps, 0);

  return (
    <div className="space-y-6">
      <PageHero image={img} eyebrow="Gym" title="Más fuerte cada día." subtitle="Hoy: Empuje · 5 ejercicios · ~55 min" color="var(--gym)" priority>
        <div className="flex flex-wrap gap-3">
          <ProgramDialog />
        </div>
      </PageHero>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard eyebrow={<span className="text-gym">Entrenamiento actual</span>} title="Press banca" accent="var(--gym)" action={<DemoDataBadge />}>
          <div className="mb-3 hidden grid-cols-[3rem_1fr_1fr_3rem] gap-3 px-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground sm:grid">
            <span>SERIE</span><span>KG</span><span>REPS</span><span className="text-right">OK</span>
          </div>
          <ul className="space-y-2">
            {sets.map((s, i) => (
              <li key={s.id} className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-2xl border p-2 transition sm:grid-cols-[3rem_1fr_1fr_3rem] sm:gap-3 ${s.done ? "border-gym/40 bg-gym/[0.07]" : "border-hairline"}`}>
                <span className="text-center font-display text-2xl text-muted-foreground">{i + 1}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 sm:contents">
                  <Stepper label="kilos" value={s.kg} step={2.5} onChange={(v) => upd(s.id, { kg: v })} />
                  <Stepper label="repeticiones" value={s.reps} step={1} onChange={(v) => upd(s.id, { reps: v })} />
                </div>
                <button type="button" aria-pressed={s.done} aria-label={`Completar serie ${i + 1}`}
                  onClick={() => { upd(s.id, { done: !s.done }); if (!s.done) { rest.reset(); window.setTimeout(rest.toggle, 0); } }}
                  className={`grid h-11 w-11 place-items-center justify-self-end rounded-full border transition ${s.done ? "border-gym bg-gym text-ink shadow-[0_0_14px_var(--gym)]" : "border-input hover:border-gym"}`}>
                  <Check className="h-4 w-4" strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={() => setSets((ss) => [...ss, { id: Date.now(), kg: ss.at(-1)?.kg ?? 60, reps: ss.at(-1)?.reps ?? 8, done: false }])}><Plus className="h-4 w-4" />Añadir serie</button>
            <span className="text-sm text-muted-foreground">{doneCount}/{sets.length} series · volumen <span className="text-foreground">{volume.toLocaleString("es-ES")} kg</span></span>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Descanso" title="Temporizador" accent="var(--gym)">
          <div className="flex flex-col items-center gap-4 py-2">
            <ProgressRing value={((90 - rest.left) / 90) * 100} size={160} stroke={6} color="var(--gym)">
              <div><Timer className="mx-auto mb-1 h-4 w-4 text-gym" /><div className="font-display text-4xl tabular-nums" aria-live="polite">{fmt(rest.left)}</div></div>
            </ProgressRing>
            <div className="flex gap-2">
              <button type="button" className="btn-gold min-w-28" onClick={rest.toggle}>{rest.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{rest.running ? "Pausar" : "Iniciar"}</button>
              <button type="button" className="icon-btn" onClick={rest.reset} aria-label="Restablecer descanso"><RotateCcw className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground">Se inicia al completar una serie.</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Actividad" title="Minutos por día" action={<DemoDataBadge />}>
          <WeeklyBars data={[{ d: "L", v: 58 }, { d: "M", v: 45 }, { d: "X", v: 62 }, { d: "J", v: 0 }, { d: "V", v: 54 }, { d: "S", v: 35 }, { d: "D", v: 0 }]} color="var(--gym)" height={180} unit=" min" />
        </SectionCard>
        <SectionCard eyebrow="Sesión" title="Ejercicios de hoy">
          <ul className="divide-y divide-hairline">
            {EXERCISES.map((e, i) => (
              <li key={e.name} className="flex min-h-14 items-center gap-4 py-2">
                <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-gym text-ink" : "border border-hairline text-muted-foreground"}`}>{i + 1}</span>
                <div className="flex-1"><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.muscle}</div></div>
                <span className="text-sm tabular-nums text-gym">{e.sets}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function ProgramDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><button type="button" className="btn-gold">Ver programa</button></DialogTrigger>
      <DialogContent className="border-hairline bg-raised">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Programa semanal</DialogTitle>
          <DialogDescription>Plan de ejemplo en división empuje / tirón / pierna.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-hairline">
          {PROGRAM.map((p) => (
            <li key={p.d} className="flex min-h-12 items-center justify-between text-sm"><span className="text-muted-foreground">{p.d}</span><span className={p.t.includes("Descanso") ? "text-muted-foreground" : "text-gym"}>{p.t}</span></li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}