import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

export function useCountdown(total: number) {
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { setRunning(false); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running]);
  return {
    left, running,
    toggle: () => { if (left === 0) setLeft(total); setRunning((r) => !r); },
    reset: () => { setRunning(false); setLeft(total); },
  };
}

export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function FocusTimer({ seconds = 25 * 60, label = "Sesión de foco", color = "var(--ares)", size = 168 }: { seconds?: number; label?: string; color?: string; size?: number }) {
  const { left, running, toggle, reset } = useCountdown(seconds);
  const pct = ((seconds - left) / seconds) * 100;
  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressRing value={pct} size={size} stroke={6} color={color}>
        <div>
          <div className="font-display text-4xl font-medium tabular-nums text-foreground" aria-live="polite">{fmt(left)}</div>
          <div className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {left === 0 ? "Completado" : running ? "En curso" : label}
          </div>
        </div>
      </ProgressRing>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggle} className="btn-gold min-w-28">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pausar" : left === 0 ? "Reiniciar" : "Iniciar"}
        </button>
        <button type="button" onClick={reset} className="icon-btn" aria-label="Restablecer temporizador">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}