import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/lib/seo";
import { NAV } from "@/lib/nav";
import { clearDemoStorage, useLocalStorage } from "@/lib/storage";
import { PageHeader, SectionCard } from "@/components/rise/primitives";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/ajustes")({
  head: () => pageHead("Ajustes", "Estado del prototipo, privacidad y paleta de tokens del concepto RISE HUB Nocturne."),
  component: Settings,
});

const TOKENS = [
  ["Ink", "var(--ink)", "#0C0A10"], ["Obsidian", "var(--obsidian)", "#111016"], ["Raised", "var(--raised)", "#1A1520"],
  ["Burgundy", "var(--burgundy)", "#512037"], ["Wine", "var(--wine)", "#722440"], ["Violet", "var(--violet)", "#8B5AC6"],
  ["Gold", "var(--gold)", "#C5A072"], ["Platinum", "var(--platinum)", "#D8D2DB"],
  ["Gym", "var(--gym)", "#D95C75"], ["Learn", "var(--learn)", "#AC78DE"], ["Money", "var(--money)", "#DFAD69"],
  ["Skin", "var(--skin)", "#CFA9B3"], ["Projects", "var(--projects)", "#8D81E2"], ["Ares", "var(--ares)", "#CC76A5"],
];

function Settings() {
  const [s, setS] = useLocalStorage("settings", { reduceMotion: false });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Más" title="Ajustes y módulos" subtitle="Todo lo que necesitas para revisar este concepto." />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Módulos" title="Navegar" className="lg:hidden">
          <ul className="divide-y divide-hairline">
            {NAV.filter((n) => n.to !== "/ajustes").map((n) => (
              <li key={n.to}><Link to={n.to} className="flex min-h-14 items-center gap-3 text-sm"><n.icon className="h-4 w-4" style={{ color: n.accent }} /><span className="flex-1">{n.label}</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link></li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard eyebrow="Estado" title="Prototipo de diseño" accent="var(--gold)">
          <div className="flex gap-4 rounded-2xl border border-gold/20 bg-wine-gradient p-5">
            <ShieldCheck className="h-6 w-6 shrink-0 text-gold" />
            <div className="space-y-2 text-sm leading-relaxed text-platinum/85">
              <p><strong className="text-foreground">Concepto visual · datos de ejemplo.</strong> RISE HUB Nocturne es una propuesta de diseño para aprobación, no la aplicación real.</p>
              <p>No hay cuentas, servidores, IA conectada ni enlaces bancarios. Las respuestas de Ares son guiones locales y todas las cifras son ficticias.</p>
              <p>Tus tareas, lecciones y rutinas de prueba se guardan solo en el almacenamiento local de este navegador.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Preferencias" title="Experiencia">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <label htmlFor="rm" className="text-sm">Reducir animaciones<span className="block text-xs text-muted-foreground">Además respeta la preferencia del sistema.</span></label>
            <Switch id="rm" checked={s.reduceMotion} onCheckedChange={(v) => setS({ ...s, reduceMotion: v })} />
          </div>
          <div className="mt-4 border-t border-hairline pt-4">
            <button type="button" className="btn-ghost" onClick={() => { clearDemoStorage(); toast("Datos de ejemplo restablecidos"); window.setTimeout(() => window.location.reload(), 500); }}>
              <RotateCcw className="h-4 w-4" />Restablecer datos de ejemplo
            </button>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Tokens" title="Paleta Nocturne" className="lg:col-span-2">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {TOKENS.map(([name, v, hex]) => (
              <li key={name} className="overflow-hidden rounded-2xl border border-hairline">
                <div className="h-16" style={{ background: v }} />
                <div className="p-3"><div className="text-xs font-semibold">{name}</div><div className="font-mono text-[0.68rem] text-muted-foreground">{hex}</div></div>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline p-4"><div className="eyebrow mb-1">Display</div><div className="font-display text-4xl">Cormorant Garamond</div></div>
            <div className="rounded-2xl border border-hairline p-4"><div className="eyebrow mb-1">Texto</div><div className="text-2xl font-semibold">Manrope</div></div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}