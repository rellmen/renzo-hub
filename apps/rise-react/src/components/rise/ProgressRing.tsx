import { useId, type ReactNode } from "react";

export function ProgressRing({
  value,
  size = 64,
  stroke = 5,
  color = "var(--gold)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`g${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} opacity={0.6} filter={`url(#g${id})`}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)" }}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children ?? <span className="text-sm font-semibold">{Math.round(pct)}%</span>}</div>
    </div>
  );
}

export function Sparkline({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
  const id = useId();
  const w = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, height - 4 - ((d - min) / (max - min || 1)) * (height - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${(p[0] ?? 0).toFixed(1)},${(p[1] ?? 0).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${height} L0,${height} Z`} fill={`url(#s${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}