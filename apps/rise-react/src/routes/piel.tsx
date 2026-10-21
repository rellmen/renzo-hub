import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import img from "@/assets/skin.jpg";
import { pageHead } from "@/lib/seo";
import { useLocalStorage } from "@/lib/storage";
import { PageHero } from "@/components/rise/PageHero";
import { Bar, DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { ProgressRing } from "@/components/rise/ProgressRing";
import { WeeklyBars } from "@/components/rise/charts";

export const Route = createFileRoute("/piel")({
  head: () => pageHead("Skin Routine", "Ritual de cuidado: rutinas AM/PM con pasos marcables, inventario de ejemplo y constancia semanal."),
  component: Skin,
});

const ROUTINES = {
  am: [
    { id: "am1", name: "Limpiador suave", note: "60 s, agua tibia" },
    { id: "am2", name: "Sérum antioxidante", note: "3–4 gotas" },
    { id: "am3", name: "Hidratante ligera", note: "Capa fina" },
    { id: "am4", name: "Protector solar", note: "Dos dedos de producto" },
  ],
  pm: [
    { id: "pm1", name: "Desmaquillante en aceite", note: "Masaje 1 min" },
    { id: "pm2", name: "Limpiador suave", note: "Doble limpieza" },
    { id: "pm3", name: "Tónico calmante", note: "Con las manos" },
    { id: "pm4", name: "Sérum de noche", note: "Según tolerancia" },
    { id: "pm5", name: "Crema reparadora", note: "Sellar hidratación" },
  ],
};
const INVENTORY = [
  { name: "Limpiador suave", left: 70 }, { name: "Sérum antioxidante", left: 35 }, { name: "Protector solar", left: 15 }, { name: "Crema reparadora", left: 60 },
];

function Skin() {
  const [mode, setMode] = useState<"am" | "pm">("pm");
  const [done, setDone] = useLocalStorage<string[]>("skin", ["am1", "am2"]);
  const steps = ROUTINES[mode];
  const pct = Math.round((steps.filter((s) => done.includes(s.id)).length / steps.length) * 100);
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <div className="space-y-6">
      <PageHero image={img} eyebrow="Skin Routine" title="Tu ritual, cada día." subtitle="Constancia antes que intensidad. Ejemplo orientativo, no consejo médico." color="var(--skin)" priority />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <SectionCard eyebrow={<span className="text-skin">Rutina de hoy</span>} title={mode === "am" ? "Mañana" : "Noche"} accent="var(--skin)"
          action={
            <div role="tablist" className="inline-flex rounded-full border border-hairline p-1">
              {(["am", "pm"] as const).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => setMode(m)} className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${mode === m ? "bg-skin/20 text-foreground ring-1 ring-skin/50" : "text-muted-foreground"}`}>
                  {m === "am" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}{m.toUpperCase()}
                </button>
              ))}
            </div>
          }>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <ProgressRing value={pct} size={120} stroke={6} color="var(--skin)">
              <div><div className="font-display text-3xl">{pct}%</div><div className="text-[0.6rem] tracking-widest text-muted-foreground">{mode.toUpperCase()}</div></div>
            </ProgressRing>
            <ol className="flex-1 space-y-2">
              {steps.map((s, i) => {
                const on = done.includes(s.id);
                return (
                  <li key={s.id}>
                    <button type="button" aria-pressed={on} onClick={() => toggle(s.id)}
                      className={`flex min-h-14 w-full items-center gap-4 rounded-2xl border px-4 text-left transition ${on ? "border-skin/40 bg-skin/[0.08]" : "border-hairline hover:border-skin/40"}`}>
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${on ? "border-skin bg-skin text-ink" : "border-input text-muted-foreground"}`}>
                        {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="flex-1"><span className={`block text-sm ${on ? "text-muted-foreground line-through" : ""}`}>{s.name}</span><span className="text-xs text-muted-foreground">{s.note}</span></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard eyebrow="Constancia" title="Últimos 7 días" action={<DemoDataBadge />}>
            <WeeklyBars data={[{ d: "L", v: 100 }, { d: "M", v: 80 }, { d: "X", v: 100 }, { d: "J", v: 60 }, { d: "V", v: 100 }, { d: "S", v: 40 }, { d: "D", v: 90 }]} color="var(--skin)" height={150} unit="%" />
          </SectionCard>
          <SectionCard eyebrow="Inventario" title="Productos de ejemplo">
            <ul className="space-y-4">
              {INVENTORY.map((p) => (
                <li key={p.name}>
                  <div className="mb-1.5 flex justify-between text-sm"><span>{p.name}</span><span className={p.left < 20 ? "text-gym" : "text-muted-foreground"}>{p.left}%{p.left < 20 && " · reponer"}</span></div>
                  <Bar value={p.left} color={p.left < 20 ? "var(--gym)" : "var(--skin)"} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}