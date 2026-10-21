import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Briefcase, Dumbbell, Flower2, Sparkles, Wallet } from "lucide-react";
import hero from "@/assets/hero-eclipse.jpg";
import learn from "@/assets/learn.jpg";
import gym from "@/assets/gym.jpg";
import money from "@/assets/money.jpg";
import skin from "@/assets/skin.jpg";
import projects from "@/assets/projects.jpg";
import { pageHead } from "@/lib/seo";
import { MetricPanel } from "@/components/rise/MetricPanel";
import { PhotoModuleCard } from "@/components/rise/PhotoModuleCard";
import { AresDemoPanel } from "@/components/rise/AresDemoPanel";
import { FocusTimer } from "@/components/rise/FocusTimer";
import { TaskTimeline } from "@/components/rise/TaskTimeline";
import { WeeklyBars } from "@/components/rise/charts";
import { DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { ProgressRing } from "@/components/rise/ProgressRing";

export const Route = createFileRoute("/")({
  head: () => pageHead("Centro de mando", "Tu próxima evolución: panel de mando conceptual con módulos de aprendizaje, gym, finanzas, piel y proyectos."),
  component: Home,
});

const KPIS = [
  { label: "Productividad", value: "84", unit: "%", delta: "+6 vs. semana demo", data: [4, 6, 5, 7, 6, 8, 9], ring: 84, color: "var(--projects)", icon: Briefcase },
  { label: "Aprendizaje", value: "5,2", unit: "h", delta: "+1,1 h", data: [2, 3, 3, 4, 3, 5, 6], ring: 68, color: "var(--learn)", icon: BookOpen },
  { label: "Gym", value: "4", unit: "/5", delta: "Racha de ejemplo", data: [3, 5, 4, 6, 5, 7, 7], ring: 80, color: "var(--gym)", icon: Dumbbell },
  { label: "Finanzas", value: "18", unit: "%", delta: "Tasa de ahorro", data: [5, 4, 6, 5, 7, 7, 8], ring: 72, color: "var(--money)", icon: Wallet },
  { label: "Skincare", value: "12", unit: "d", delta: "Constancia", data: [3, 4, 4, 5, 6, 6, 7], ring: 90, color: "var(--skin)", icon: Flower2 },
];

const MODULES = [
  { to: "/aprender" as const, image: learn, eyebrow: "SELFLEARN", title: "Aprende sin límites", meta: "Neerlandés B2 · Inglés C1", color: "var(--learn)", progress: 42 },
  { to: "/gym" as const, image: gym, eyebrow: "GYM", title: "Más fuerte cada día", meta: "Empuje · 5 ejercicios", color: "var(--gym)", progress: 64 },
  { to: "/dinero" as const, image: money, eyebrow: "MONEY", title: "Capital con intención", meta: "4 metas de ejemplo", color: "var(--money)", progress: 58 },
  { to: "/piel" as const, image: skin, eyebrow: "SKIN ROUTINE", title: "Ritual nocturno", meta: "AM 4 pasos · PM 5 pasos", color: "var(--skin)", progress: 75 },
  { to: "/proyectos" as const, image: projects, eyebrow: "PROYECTOS", title: "Trabajo profundo", meta: "7 tareas en tablero", color: "var(--projects)", progress: 36 },
];

const WEEK = [
  { d: "L", v: 62 }, { d: "M", v: 74 }, { d: "X", v: 58 }, { d: "J", v: 81 }, { d: "V", v: 88 }, { d: "S", v: 46 }, { d: "D", v: 70 },
];

function Home() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Panoramic hero */}
      <section className="surface rim relative min-h-[460px] overflow-hidden lg:min-h-[420px]" style={{ background: "var(--gradient-wine)" }}>
        <img src={hero} alt="" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-[60%_center] animate-pan" />
        <div className="absolute inset-0 bg-hero-side" />
        <div className="absolute inset-0 bg-photo-fade opacity-80 lg:opacity-30" />
        <div className="relative flex min-h-[inherit] flex-col justify-end gap-5 p-6 sm:p-10 lg:justify-center lg:p-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow">Centro de mando</span>
          </div>
          <h1 className="max-w-xl font-display text-[3.4rem] font-medium leading-[0.92] text-foreground sm:text-7xl lg:text-[5.5rem] animate-rise">
            Tu próxima <em className="text-gold-gradient">evolución.</em>
          </h1>
          <p className="max-w-sm text-base text-platinum/80">Disciplina hoy. Libertad mañana.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/ares" className="btn-gold">Abrir Ares <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/proyectos" className="btn-ghost">Ver plan de hoy</Link>
          </div>
        </div>
        <div className="absolute right-5 top-5 flex items-center gap-3 rounded-full border border-gold/30 bg-ink/50 py-1.5 pl-1.5 pr-4 backdrop-blur-md sm:right-8 sm:top-8">
          <ProgressRing value={62} size={38} stroke={3} color="var(--gold)"><span className="text-[0.6rem] font-bold text-gold">12</span></ProgressRing>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-gold">Nivel 12 · DEMO</div>
            <div className="text-[0.65rem] text-muted-foreground">62 % al siguiente</div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="Indicadores de ejemplo" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {KPIS.map((k, i) => (
          <div key={k.label} className={i === 4 ? "col-span-2 md:col-span-1" : ""}><MetricPanel {...k} /></div>
        ))}
      </section>

      {/* Modules */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="eyebrow mb-1">Microapps</div>
            <h2 className="font-display text-3xl text-foreground">Tus disciplinas</h2>
          </div>
          <DemoDataBadge />
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-5">
          {MODULES.map((m) => (
            <div key={m.to} className="w-[72%] shrink-0 snap-start sm:w-auto"><PhotoModuleCard {...m} /></div>
          ))}
        </div>
      </section>

      {/* Ares + timer */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          eyebrow={<span className="text-ares">Ares AI · Vista conceptual</span>}
          title="¿En qué avanzamos hoy?"
          accent="var(--ares)"
          action={<span className="rounded-full border border-hairline px-2.5 py-1 text-[0.62rem] tracking-wider text-muted-foreground">SIMULACIÓN LOCAL</span>}
          className="min-h-[420px]"
        >
          <AresDemoPanel />
        </SectionCard>
        <SectionCard eyebrow="Foco" title="Temporizador Pomodoro" accent="var(--ares)" className="flex flex-col">
          <div className="flex flex-1 items-center justify-center py-4"><FocusTimer /></div>
          <p className="text-center text-xs text-muted-foreground">25 minutos de atención plena. Sin notificaciones.</p>
        </SectionCard>
      </div>

      {/* Weekly + timeline */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard eyebrow="Rendimiento" title="Puntuación semanal" action={<DemoDataBadge />} accent="var(--gold)">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-5xl text-foreground">68,4</span>
            <span className="text-sm text-gold">+4,2 % vs. semana anterior</span>
          </div>
          <WeeklyBars data={WEEK} color="var(--gold)" height={200} />
        </SectionCard>
        <SectionCard eyebrow="Hoy" title="Línea de tiempo" accent="var(--projects)" action={<Sparkles className="h-4 w-4 text-gold" />}>
          <TaskTimeline />
        </SectionCard>
      </div>
    </div>
  );
}