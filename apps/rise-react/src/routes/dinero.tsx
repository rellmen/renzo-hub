import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Landmark, PiggyBank, ShoppingBag, TrendingUp } from "lucide-react";
import img from "@/assets/money.jpg";
import { pageHead } from "@/lib/seo";
import { PageHero } from "@/components/rise/PageHero";
import { Bar, DemoDataBadge, SectionCard } from "@/components/rise/primitives";
import { DuoArea } from "@/components/rise/charts";

export const Route = createFileRoute("/dinero")({
  head: () => pageHead("Money", "Capital con intención: balance de ejemplo, ingresos y gastos, categorías y metas de ahorro."),
  component: Money,
});

const PERIODS = {
  "1S": { label: "1S", data: [["L", 120, 80], ["M", 0, 64], ["X", 340, 110], ["J", 0, 45], ["V", 90, 150], ["S", 0, 120], ["D", 0, 38]] },
  "1M": { label: "1M", data: [["S1", 1150, 820], ["S2", 680, 910], ["S3", 1240, 760], ["S4", 720, 690]] },
  "3M": { label: "3M", data: [["Ago", 3600, 2950], ["Sep", 3800, 3120], ["Oct", 3790, 3180]] },
} as const;
type P = keyof typeof PERIODS;

const CATS = [
  { name: "Inversión", amount: 640, pct: 22, icon: TrendingUp, color: "var(--money)" },
  { name: "Vivienda", amount: 1100, pct: 38, icon: Landmark, color: "var(--gold)" },
  { name: "Estilo de vida", amount: 520, pct: 18, icon: ShoppingBag, color: "var(--gym)" },
  { name: "Ahorro", amount: 380, pct: 13, icon: PiggyBank, color: "var(--ares)" },
];
const GOALS = [
  { name: "Fondo de emergencia", cur: 4200, goal: 6000 },
  { name: "Viaje formativo", cur: 900, goal: 2500 },
  { name: "Equipo de trabajo", cur: 1350, goal: 1800 },
];
const eur = (n: number) => `€${n.toLocaleString("es-ES")}`;

function Money() {
  const [p, setP] = useState<P>("1M");
  const data = PERIODS[p].data.map(([l, i, o]) => ({ l, in: i, out: o }));
  const tin = data.reduce((a, d) => a + d.in, 0);
  const tout = data.reduce((a, d) => a + d.out, 0);

  return (
    <div className="space-y-6">
      <PageHero image={img} eyebrow="Money" title="Capital con intención." subtitle="Datos de muestra para explorar el diseño. Sin conexión bancaria." color="var(--money)" priority>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">Balance de ejemplo <DemoDataBadge /></div>
            <div className="font-display text-5xl text-gold-gradient sm:text-6xl">€24.580</div>
          </div>
        </div>
      </PageHero>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <SectionCard eyebrow={<span className="text-money">Flujo</span>} title="Ingresos vs. gastos" accent="var(--money)"
          action={
            <div role="tablist" aria-label="Periodo" className="inline-flex rounded-full border border-hairline p-1">
              {(Object.keys(PERIODS) as P[]).map((k) => (
                <button key={k} role="tab" aria-selected={p === k} type="button" onClick={() => setP(k)} className={`h-9 min-w-11 rounded-full px-3 text-xs font-bold transition ${p === k ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
              ))}
            </div>
          }>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div><div className="text-xs text-muted-foreground">Ingresos</div><div className="text-xl font-semibold text-money">{eur(tin)}</div></div>
            <div><div className="text-xs text-muted-foreground">Gastos</div><div className="text-xl font-semibold text-gym">{eur(tout)}</div></div>
            <div><div className="text-xs text-muted-foreground">Neto</div><div className="text-xl font-semibold">{eur(tin - tout)}</div></div>
          </div>
          <DuoArea key={p} data={data} height={240} />
        </SectionCard>

        <SectionCard eyebrow="Metas" title="Objetivos de ahorro" action={<DemoDataBadge />}>
          <ul className="space-y-5">
            {GOALS.map((g) => {
              const pct = Math.round((g.cur / g.goal) * 100);
              return (
                <li key={g.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-2"><span className="text-sm">{g.name}</span><span className="text-xs text-muted-foreground">{eur(g.cur)} / {eur(g.goal)}</span></div>
                  <Bar value={pct} color="var(--money)" />
                  <div className="mt-1 text-right text-[0.68rem] text-money">{pct}%</div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CATS.map((c) => (
          <div key={c.name} className="surface rim p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${c.color} 15%, transparent)`, color: c.color }}><c.icon className="h-4 w-4" /></span>
              <span className="text-xs text-muted-foreground">{c.pct}%</span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{c.name}</div>
            <div className="font-display text-3xl">{eur(c.amount)}</div>
            <div className="mt-3"><Bar value={c.pct * 2.5} color={c.color} /></div>
          </div>
        ))}
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5" />Cifras ficticias. Este prototipo no se conecta a bancos ni muestra datos reales.</p>
    </div>
  );
}