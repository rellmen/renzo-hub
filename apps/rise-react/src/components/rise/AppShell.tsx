import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Command, LayoutGrid, Search, Star, LogOut, UserRound } from "lucide-react";
import { APPS, APP_BY_ID, CATEGORIES, appForPath, requireApp, type AppEntry } from "@/lib/apps";
import { NavPrefsProvider, useNavPrefs } from "@/lib/nav-prefs";
import { Brand, BrandMark } from "./Brand";
import { AppLink } from "./AppLink";
import { AppLauncher } from "./AppLauncher";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/lib/storage";

function useCurrentApp() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return appForPath(path);
}

function SideItem({ app, active, compact }: { app: AppEntry; active: boolean; compact?: boolean }) {
  return (
    <AppLink
      app={app} current={active}
      className={`group relative flex items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${compact ? "min-h-9" : "min-h-10"} ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"}`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full" style={{ background: app.accent }} />}
      <app.icon className="h-[17px] w-[17px] shrink-0" style={{ color: active ? app.accent : undefined }} />
      <span className="truncate font-medium">{app.label}</span>
      {app.kind === "classic" && <span className="ml-auto text-[0.6rem] uppercase tracking-wider text-muted-foreground/60">clásico ↗</span>}
    </AppLink>
  );
}

function DesktopSidebar() {
  const current = useCurrentApp();
  const { prefs, launcherOpen, setLauncherOpen } = useNavPrefs();
  const [openCats, setOpenCats] = useState<string[]>([]);
  const curCat = current?.category;
  useEffect(() => { if (curCat) setOpenCats((o) => (o.includes(curCat) ? o : [...o, curCat])); }, [curCat]);
  const isActive = (a: AppEntry) => !launcherOpen && current?.id === a.id;
  const favs = prefs.favorites.map((id) => APP_BY_ID[id]).filter((a) => a !== undefined).filter((a) => !["inicio", "quests"].includes(a.id));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-6 pb-6 pt-7"><Brand /></div>
      <nav aria-label="Principal" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
        <div className="space-y-0.5">
          <SideItem app={requireApp("inicio")} active={isActive(requireApp("inicio"))} />
          <SideItem app={requireApp("quests")} active={isActive(requireApp("quests"))} />
          <button
            type="button" onClick={() => setLauncherOpen(true)} aria-haspopup="dialog" aria-expanded={launcherOpen}
            className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${launcherOpen ? "bg-gold/10 text-gold" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"}`}
          >
            <LayoutGrid className="h-[17px] w-[17px]" />Todas las apps
            <kbd className="ml-auto inline-flex items-center gap-0.5 rounded-md border border-input px-1.5 py-0.5 text-[0.6rem]"><Command className="h-2.5 w-2.5" />K</kbd>
          </button>
        </div>

        {favs.length > 0 && (
          <div>
            <div className="eyebrow flex items-center gap-1.5 px-3 pb-1.5 text-muted-foreground/70"><Star className="h-3 w-3" />Favoritos</div>
            <div className="space-y-0.5">{favs.map((a) => <SideItem key={a.id} app={a} active={isActive(a)} />)}</div>
          </div>
        )}

        <div>
          <div className="eyebrow px-3 pb-1.5 text-muted-foreground/70">Categorías</div>
          {CATEGORIES.filter((c) => c.id !== "todos").map((c) => {
            const open = openCats.includes(c.id);
            const apps = APPS.filter((a) => a.category === c.id && a.id !== "inicio" && a.id !== "quests");
            return (
              <div key={c.id}>
                <button
                  type="button" aria-expanded={open} onClick={() => setOpenCats((o) => (open ? o.filter((x) => x !== c.id) : [...o, c.id]))}
                  className="flex min-h-9 w-full items-center justify-between rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  {c.label}<span className="flex items-center gap-1.5 font-normal text-muted-foreground/60">{apps.length}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} /></span>
                </button>
                {open && <div className="space-y-0.5 pb-1.5">{apps.map((a) => <SideItem key={a.id} app={a} active={isActive(a)} compact />)}</div>}
              </div>
            );
          })}
        </div>
      </nav>
      <div className="m-3 rounded-2xl border border-gold/20 bg-wine-gradient px-4 py-3">
        <div className="eyebrow mb-0.5">Acceso privado</div>
        <p className="text-[0.7rem] leading-relaxed text-platinum/80">Tus microapps y accesos favoritos en un solo lugar.</p>
      </div>
    </aside>
  );
}

function DockLink({ app, active, label }: { app: AppEntry; active: boolean; label?: string }) {
  return (
    <AppLink
      app={app} current={active}
      className="relative flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      style={{ color: active ? app.accent : "var(--muted-foreground)" }}
    >
      {active && <span aria-hidden className="absolute top-0 h-[2px] w-6 rounded-full" style={{ background: app.accent }} />}
      <app.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
      <span className="max-w-full truncate px-0.5">{label ?? app.short}</span>
    </AppLink>
  );
}

function MobileDock() {
  const current = useCurrentApp();
  const { prefs, launcherOpen, setLauncherOpen } = useNavPrefs();
  const shortcut = APP_BY_ID[prefs.shortcut] ?? requireApp("gym");
  const act = (a: AppEntry) => !launcherOpen && current?.id === a.id;
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1">
        <li><DockLink app={requireApp("inicio")} active={act(requireApp("inicio"))} /></li>
        <li><DockLink app={requireApp("quests")} active={act(requireApp("quests"))} /></li>
        <li>
          <button
            type="button" onClick={() => setLauncherOpen(true)} aria-haspopup="dialog" aria-expanded={launcherOpen} aria-label="Apps: abrir lanzador"
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.68rem] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            style={{ color: launcherOpen ? "var(--gold)" : "var(--platinum)" }}
          >
            <span className={`grid h-8 w-11 place-items-center rounded-xl border transition-colors ${launcherOpen ? "border-gold/60 bg-gold/15" : "border-gold/25 bg-gold/[0.06]"}`}>
              <LayoutGrid className="h-[20px] w-[20px]" />
            </span>
            Apps
          </button>
        </li>
        <li><DockLink app={requireApp("ares")} active={act(requireApp("ares"))} /></li>
        <li><DockLink app={shortcut} active={act(shortcut)} /></li>
      </ul>
    </nav>
  );
}

function TopBar() {
  const auth = useAuth();
  const exit = async () => { try { await auth.signOut(); } catch(err) { toast.error(err instanceof Error ? err.message : "No se pudo cerrar sesión."); } };
  const { setLauncherOpen } = useNavPrefs();
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-ink/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="shrink-0 lg:hidden" aria-label="Inicio"><BrandMark size={30} /></Link>
        <button
          type="button" onClick={() => setLauncherOpen(true)} aria-haspopup="dialog"
          className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-input bg-obsidian px-4 text-left text-sm text-muted-foreground transition hover:border-gold/40 lg:max-w-xl"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar apps…</span>
          <kbd className="ml-auto hidden items-center gap-1 rounded-md border border-input px-1.5 py-0.5 text-[0.65rem] sm:inline-flex"><Command className="h-3 w-3" />K</kbd>
        </button>
        <div role="status" className="hidden items-center gap-2 rounded-full border border-gold/20 px-3 py-1.5 text-[0.7rem] text-gold md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />RISE HUB · espacio privado
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Cuenta y cerrar sesión" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wine-gradient font-display text-base text-gold ring-1 ring-gold/30 transition hover:ring-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
              {(auth.user?.email||"R").slice(0,1).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 border-hairline bg-raised text-foreground">
            <DropdownMenuLabel className="min-w-0">
              <span className="mb-1 flex items-center gap-2 text-sm"><UserRound className="h-4 w-4"/> Cuenta privada</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{auth.user?.email||"Sesión iniciada"}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-sm" onSelect={() => void exit()}>
              <LogOut className="h-4 w-4"/> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div role="status" className="border-t border-hairline px-4 py-1 text-center text-[0.62rem] tracking-wide text-gold/80 md:hidden">
        RISE HUB · espacio privado
      </div>
    </header>
  );
}

/** Single place for Cmd/Ctrl+K, recents tracking and closing the launcher on navigation. */
function NavEffects() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setLauncherOpen, addRecent, launcherOpen } = useNavPrefs();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setLauncherOpen(!launcherOpen); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launcherOpen, setLauncherOpen]);
  useEffect(() => {
    setLauncherOpen(false);
    const a = appForPath(path);
    if (a && a.id !== "inicio") addRecent(a.id);
  }, [path, addRecent, setLauncherOpen]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [settings] = useLocalStorage("settings", { reduceMotion: false });
  const {user}=useAuth();
  return (
    <NavPrefsProvider key={user?.id||"signed-out"} userKey={user?.id||"signed-out"}>
      <div className={`min-h-screen w-full ${settings?.reduceMotion ? "reduce-motion" : ""}`}>
        <NavEffects />
        <DesktopSidebar />
        <div className="min-w-0 overflow-x-clip lg:pl-[248px]">
          <TopBar />
          <main className="mx-auto w-full max-w-[1320px] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">{children}</main>
        </div>
        <MobileDock />
        <AppLauncher />
      </div>
    </NavPrefsProvider>
  );
}

