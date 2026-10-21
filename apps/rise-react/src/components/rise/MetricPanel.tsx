import type { LucideIcon } from "lucide-react";
import { ProgressRing, Sparkline } from "./ProgressRing";

export function MetricPanel({
  label, value, unit, delta, data, ring, color, icon: Icon,
}: {
  label: string; value: string; unit?: string; delta: string; data: number[]; ring: number; color: string; icon: LucideIcon;
}) {
  return (
    <div className="surface rim group flex min-w-0 flex-col gap-3 p-4 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-[0.6rem] font-bold tracking-[0.18em] text-gold/80">DEMO</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            {value}<span className="ml-0.5 text-sm font-medium text-muted-foreground">{unit}</span>
          </div>
          <div className="text-[0.7rem] font-medium" style={{ color }}>{delta}</div>
        </div>
        <ProgressRing value={ring} size={44} stroke={3.5} color={color}>
          <span className="text-[0.62rem] font-semibold">{ring}%</span>
        </ProgressRing>
      </div>
      <Sparkline data={data} color={color} height={30} />
    </div>
  );
}