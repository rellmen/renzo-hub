import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Clock, Search, Settings, Star, X } from "lucide-react";
import { APP_BY_ID, CATEGORIES, appForPath, requireApp, searchApps, type AppCategory, type AppEntry } from "@/lib/apps";
import { useNavPrefs } from "@/lib/nav-prefs";
import { AppLink } from "./AppLink";
import { ShortcutSelect } from "./ShortcutSelect";

function Tile({ app, current, onGo }: { app: AppEntry; current: boolean; onGo: () => void }) {
  const { prefs, toggleFavorite } = useNavPrefs();
  const fav = prefs.favorites.includes(app.id);
  return (
    <li className="relative">
      <AppLink
        app={app} onClick={onGo} current={current}
        className={`flex h-full min-h-[92px] flex-col gap-2 rounded-2xl border p-3 pr-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${current ? "border-gold/40 bg-gold/[0.07]" : "border-hairline bg-foreground/[0.025] hover:border-gold/30 hover:bg-foreground/[0.05]"}`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground/[0.05]" style={{ color: app.accent }}>
          <app.icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            <span className="block break-words">{app.label}</span>
            {app.kind === "classic" && <span className="mt-1 inline-block rounded-full border border-hairline px-1.5 text-[0.58rem] font-medium uppercase tracking-wider text-muted-foreground">Clásico ↗</span>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{app.blurb}</span>
        </span>
      </AppLink>
      <button
        type="button" onClick={() => toggleFavorite(app.id)} aria-pressed={fav}
        aria-label={fav ? `Quitar ${app.label} de favoritos` : `Añadir ${app.label} a favoritos`}
        className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        <Star className={`h-4 w-4 ${fav ? "fill-gold text-gold" : ""}`} />
      </button>
    </li>
  );
}

function Chips({ title, icon, ids, currentId, onGo }: { title: string; icon: ReactNode; ids: string[]; currentId: string | undefined; onGo: () => void }) {
  const apps = ids.map((id) => APP_BY_ID[id]).filter((app) => app !== undefined);
  if (!apps.length) return null;
  return (
    <section aria-label={title}>
      <h3 className="eyebrow mb-2 flex items-center gap-1.5">{icon}{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {apps.map((a) => (
          <li key={a.id}>
            <AppLink app={a} onClick={onGo} current={a.id === currentId}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-foreground/[0.03] px-3.5 text-sm text-foreground hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 aria-[current=page]:border-gold/50">
              <a.icon className="h-4 w-4" style={{ color: a.accent }} />{a.short}
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AppLauncher() {
  const { launcherOpen, setLauncherOpen, prefs } = useNavPrefs();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const currentId = appForPath(path)?.id;
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"todos" | AppCategory>("todos");
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Reset filters each time the launcher opens.
  useEffect(() => { if (launcherOpen) { setQ(""); setCat("todos"); } }, [launcherOpen]);

  const results = useMemo(() => searchApps(q, q ? "todos" : cat), [q, cat]);
  const close = () => setLauncherOpen(false);

  return (
    <DialogPrimitive.Root open={launcherOpen} onOpenChange={setLauncherOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            e.preventDefault();
            // Touch devices: don't pop the keyboard over the grid; focus the sheet itself.
            if (window.matchMedia("(pointer: coarse)").matches) contentRef.current?.focus();
            else inputRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
          }}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl border border-b-0 border-gold/15 bg-obsidian shadow-elegant outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-[8vh] sm:max-h-[84vh] sm:w-[min(720px,calc(100vw-3rem))] sm:-translate-x-1/2 sm:rounded-3xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-foreground/15 sm:hidden" />
          <header className="flex items-center gap-3 px-5 pb-3 pt-3 sm:pt-5">
            <div className="min-w-0 flex-1">
              <div className="eyebrow">Lanzador</div>
              <DialogPrimitive.Title className="font-display text-2xl text-foreground">Todas las apps</DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="icon-btn shrink-0" aria-label="Cerrar lanzador"><X className="h-4 w-4" /></DialogPrimitive.Close>
          </header>
          <div className="px-5 pb-3">
            <label className="flex h-11 items-center gap-2 rounded-full border border-input bg-ink px-4 focus-within:border-gold/50">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Buscar apps</span>
              <input
                ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Buscar: gastos, dutch, piel…"
                 onKeyDown={(e) => {
                   const app = results[0];
                   if (e.key !== "Enter" || e.nativeEvent.isComposing || !app) return;
                   e.preventDefault();
                   close();
                   if (app.kind === "live") void navigate({ to: app.to });
                   else window.open(app.href, "_blank", "noopener,noreferrer");
                 }}
                className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {!q && (
              <>
                <Chips title="Favoritos" icon={<Star className="h-3 w-3" />} ids={prefs.favorites} currentId={currentId} onGo={close} />
                <Chips title="Recientes" icon={<Clock className="h-3 w-3" />} ids={prefs.recents.filter((r) => !prefs.favorites.includes(r)).slice(0, 4)} currentId={currentId} onGo={close} />
                <div role="group" aria-label="Categorías" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}
                      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${cat === c.id ? "border-gold/60 bg-gold/15 text-gold" : "border-hairline text-muted-foreground hover:text-foreground"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div aria-live="polite" className="sr-only">{q ? `${results.length} resultados` : ""}</div>
            {results.length ? (
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {results.map((a) => <Tile key={a.id} app={a} current={a.id === currentId} onGo={close} />)}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-input px-5 py-8 text-center">
                <p className="font-display text-xl text-foreground">Sin resultados para “{q}”</p>
                <p className="mt-1 text-sm text-muted-foreground">Prueba con otro nombre, por ejemplo “finanzas”, “idiomas” o “rutina”.</p>
                <button type="button" className="btn-ghost mt-4" onClick={() => { setQ(""); inputRef.current?.focus(); }}>Ver todas las apps</button>
              </div>
            )}
            <div className="rounded-2xl border border-hairline p-4">
              <ShortcutSelect />
              <AppLink app={requireApp("ajustes")} onClick={close} className="mt-2 flex min-h-11 items-center gap-2 border-t border-hairline pt-3 text-sm text-foreground hover:text-gold">
                <Settings className="h-4 w-4" />Ajustes y perfil
              </AppLink>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

