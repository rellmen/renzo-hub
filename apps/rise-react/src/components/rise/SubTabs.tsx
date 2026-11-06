import { useEffect, useState, type ReactNode } from "react";

/**
 * Pestañas internas de una pantalla (Mes · Patrimonio · Presupuesto…).
 * Una sola idea por pestaña: así ninguna pantalla enseña todo a la vez.
 * La pestaña elegida se guarda en el #hash para poder enlazarla y volver con «atrás».
 */
export type SubTab<T extends string> = { id: T; label: string; badge?: ReactNode };

export function useSubTab<T extends string>(tabs: readonly SubTab<T>[], fallback: T) {
  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    const h = window.location.hash.slice(1);
    return tabs.find((t) => t.id === h)?.id ?? fallback;
  };
  const [tab, setTab] = useState<T>(fallback);
  useEffect(() => {
    setTab(read());
    const onHash = () => setTab(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = (t: T) => {
    setTab(t);
    if (typeof window !== "undefined") window.history.replaceState(null, "", t === fallback ? window.location.pathname : "#" + t);
  };
  return [tab, go] as const;
}

export function SubTabs<T extends string>({
  tabs, value, onChange, label, accent = "var(--gold)",
}: { tabs: readonly SubTab<T>[]; value: T; onChange: (t: T) => void; label: string; accent?: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-obsidian p-1 [scrollbar-width:none]">
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id} type="button" role="tab" aria-selected={on} onClick={() => onChange(t.id)}
            className={"min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold transition-colors sm:px-4 " + (on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            style={on ? { background: `color-mix(in oklab, ${accent} 20%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 50%, transparent)` } : undefined}
          >
            {t.label}{t.badge}
          </button>
        );
      })}
    </div>
  );
}
