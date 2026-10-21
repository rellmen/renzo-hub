import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { NavTo } from "@/lib/nav";

export function PhotoModuleCard({
  to, image, eyebrow, title, meta, color, progress,
}: {
  to: NavTo; image: string; eyebrow: string; title: string; meta: string; color: string; progress?: number;
}) {
  return (
    <Link
      to={to}
      className="group surface rim relative block aspect-[4/5] overflow-hidden p-0 sm:aspect-[3/4]"
      style={{ background: "var(--gradient-wine)" }}
    >
      <img
        src={image} alt="" loading="lazy" width={1600} height={912}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-photo-fade" />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="absolute right-3 top-3 icon-btn h-9 w-9 bg-ink/40 backdrop-blur-sm">
        <ArrowUpRight className="h-4 w-4" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-[0.62rem] font-bold tracking-[0.22em]" style={{ color }}>{eyebrow}</div>
        <div className="mt-1 font-display text-2xl leading-tight text-foreground">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
        {typeof progress === "number" && Number.isFinite(progress) ? (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/10" aria-label={"Progreso confirmado: " + progress + "%"}>
            <div className="h-full rounded-full" style={{ width: Math.max(0,Math.min(100,progress)) + "%", background: color }} />
          </div>
        ) : <div className="mt-3 text-[0.65rem] text-platinum/70">Actividad disponible al conectar el módulo</div>}
      </div>
    </Link>
  );
}