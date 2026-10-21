import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DemoDataBadge({ label = "DEMO", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.18em] text-gold",
        className,
      )}
      title="Datos de ejemplo, no reales"
    >
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  eyebrow,
  action,
  children,
  className,
  accent,
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <section className={cn("surface rim min-w-0 p-5 sm:p-6", className)}>
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-8 h-px w-24"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      {(title || action || eyebrow) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
            {title && <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="font-display text-4xl font-medium text-foreground sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-input px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">{icon}</div>
      <div className="font-display text-xl text-foreground">{title}</div>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.min(100, value)}%`, background: `linear-gradient(90deg, color-mix(in oklab, ${color} 50%, transparent), ${color})`, boxShadow: `0 0 12px ${color}` }}
      />
    </div>
  );
}