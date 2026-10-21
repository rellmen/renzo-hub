import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = {
  background: "var(--raised)",
  border: "1px solid var(--hairline)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--platinum)",
};

export function WeeklyBars({ data, color, height = 180, unit = "" }: { data: { d: string; v: number }[]; color: string; height?: number; unit?: string }) {
  const max = Math.max(...data.map((x) => x.v));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={`wb-${color.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={1} />
              <stop offset="1" stopColor={color} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={[0, Math.ceil(max * 1.15)]} />
          <Tooltip cursor={{ fill: "oklch(1 0 0 / 4%)" }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v}${unit}`, "Valor demo"]} />
          <Bar dataKey="v" radius={[6, 6, 2, 2]} fill={`url(#wb-${color.replace(/\W/g, "")})`} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DuoArea({ data, height = 240 }: { data: { l: string; in: number; out: number }[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="da-in" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--money)" stopOpacity={0.45} />
              <stop offset="1" stopColor="var(--money)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="da-out" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--gym)" stopOpacity={0.3} />
              <stop offset="1" stopColor="var(--gym)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis dataKey="l" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, k: string) => [`€${v.toLocaleString("es-ES")}`, k === "in" ? "Ingresos demo" : "Gastos demo"]} />
          <Area type="monotone" dataKey="in" stroke="var(--money)" strokeWidth={2} fill="url(#da-in)" animationDuration={700} />
          <Area type="monotone" dataKey="out" stroke="var(--gym)" strokeWidth={1.6} fill="url(#da-out)" animationDuration={700} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}