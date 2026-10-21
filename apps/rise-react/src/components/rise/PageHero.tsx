import type { ReactNode } from "react";
import { DemoDataBadge } from "./primitives";

export function PageHero({
  image, eyebrow, title, subtitle, color = "var(--gold)", children, tall = false, priority = false,
}: {
  image: string; eyebrow: string; title: string; subtitle?: string; color?: string; children?: ReactNode; tall?: boolean; priority?: boolean;
}) {
  return (
    <section
      className={`surface rim relative overflow-hidden ${tall ? "min-h-[440px] sm:min-h-[400px] lg:min-h-[440px]" : "min-h-[360px] sm:min-h-[300px] lg:min-h-[320px]"}`}
      style={{ background: "var(--gradient-wine)" }}
    >
      <img
        src={image} alt="" width={1600} height={900} loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover animate-pan"
      />
      <div className="absolute inset-0 bg-hero-side" />
      <div className="absolute inset-0 bg-photo-fade opacity-70 sm:opacity-40" />
      <div className="relative flex h-full flex-col justify-end gap-4 p-6 sm:p-10" style={{ minHeight: "inherit" }}>
        <div className="flex items-center gap-3">
          <span className="h-px w-8" style={{ background: color }} />
          <span className="eyebrow" style={{ color }}>{eyebrow}</span>
        </div>
        <h1 className="max-w-2xl font-display text-5xl font-medium leading-[0.95] text-foreground sm:text-6xl lg:text-7xl animate-rise">
          {title}
        </h1>
        {subtitle && <p className="max-w-md text-sm text-platinum/80 sm:text-base">{subtitle}</p>}
        {children}
        <DemoDataBadge label="CONCEPTO VISUAL" className="absolute right-4 top-4" />
      </div>
    </section>
  );
}