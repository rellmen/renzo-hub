import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Command, Search, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAV } from "@/lib/nav";
import { Brand, BrandMark } from "./Brand";
import { useLocalStorage } from "@/lib/storage";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

function useActive() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
}

export function DesktopSidebar() {
  const isActive = useActive();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-6 pb-8 pt-7"><Brand /></div>
      <nav aria-label="Principal" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
        <div className="eyebrow px-3 pb-2 text-muted-foreground/70">Módulos</div>
        {NAV.map((n) => {
          const active = isActive(n.to);
          return (
            <Link
              key={n.to} to={n.to}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"}`}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full" style={{ background: n.accent, boxShadow: `0 0 10px ${n.accent}` }} />}
              <n.icon className="h-[18px] w-[18px]" style={{ color: active ? n.accent : undefined }} />
              <span className="font-medium">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl border border-gold/20 bg-wine-gradient p-4">
        <div className="eyebrow mb-1">Acceso privado · React</div>
        <p className="text-xs leading-relaxed text-platinum/80">Proyectos ya utiliza tus registros reales. El catálogo muestra todas las microapps disponibles y los accesos a los módulos clásicos todavía pendientes.</p>
      </div>
    </aside>
  );
}

export function MobileDock() {
  const isActive = useActive();
  const items = NAV.filter((n) => ["/", "/aprender", "/gym", "/ares", "/ajustes"].includes(n.to));
  const order = ["/", "/aprender", "/gym", "/ares", "/ajustes"];
  items.sort((a, b) => order.indexOf(a.to) - order.indexOf(b.to));
  const moreActive = ["/apps", "/dinero", "/piel", "/proyectos", "/nominas", "/turnos", "/migracion", "/ajustes"].some((p) => isActive(p));
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((n) => {
          const active = n.to === "/ajustes" ? moreActive : isActive(n.to);
          const center = n.to === "/gym";
          return (
            <li key={n.to}>
              <Link to={n.to} className="flex min-h-[60px] flex-col items-center justify-center gap-1 text-[0.65rem] font-medium" style={{ color: active ? n.accent : "var(--muted-foreground)" }}>
                <span className={`grid place-items-center rounded-full transition-all ${center ? "h-9 w-9" : "h-7 w-7"} ${active ? "bg-foreground/[0.06]" : ""}`}>
                  <n.icon className="h-[19px] w-[19px]" />
                </span>
                {n.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopBar() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const exit = async () => {
    try { await auth.signOut(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "No se pudo cerrar sesión."); }
  };
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-ink/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="lg:hidden" aria-label="Inicio"><BrandMark size={30} /></Link>
        <button
          type="button" onClick={() => setOpen(true)}
          className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-input bg-obsidian px-4 text-left text-sm text-muted-foreground transition hover:border-gold/40 lg:max-w-xl"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar módulos o acciones…</span>
          <kbd className="ml-auto hidden items-center gap-1 rounded-md border border-input px-1.5 py-0.5 text-[0.65rem] sm:inline-flex"><Command className="h-3 w-3" />K</kbd>
        </button>
        <div role="status" className="hidden items-center gap-2 rounded-full border border-gold/20 px-3 py-1.5 text-[0.7rem] text-gold md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />Migración React · entorno de pruebas
        </div>
        <button type="button" className="icon-btn relative opacity-60" aria-label="Notificaciones no disponibles en esta versión" disabled>
          <Bell className="h-4 w-4" />
        </button>
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
        Migración React · varios módulos en revisión
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Ir a…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Módulos">
            {NAV.map((n) => (
              <CommandItem key={n.to} onSelect={() => { setOpen(false); navigate({ to: n.to }); }}>
                <n.icon className="mr-2 h-4 w-4" style={{ color: n.accent }} />{n.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [settings] = useLocalStorage("settings", { reduceMotion: false });
  return (
    <div className={`min-h-screen w-full ${settings.reduceMotion ? "reduce-motion" : ""}`}>
      <DesktopSidebar />
      <div className="min-w-0 overflow-x-clip lg:pl-[248px]">
        <TopBar />
        <main className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">{children}</main>
      </div>
      <MobileDock />
    </div>
  );
}