import { Link, useRouterState } from "@tanstack/react-router";
import { appForPath, requireApp } from "@/lib/apps";
import { hubOfApp } from "@/lib/hubs";

/**
 * Pestañas del hub actual (Academy, Body, Money…). Se pinta una sola vez desde el AppShell,
 * así ninguna pantalla tiene que acordarse de añadirlas. Sustituye a FinanceSections.
 */
export function HubSections() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = appForPath(pathname);
  const hub = hubOfApp(current?.id);
  if (!hub || hub.sections.length < 2) return null;
  return (
    <nav aria-label={`Secciones de ${hub.label}`} className="mb-5 overflow-x-auto rounded-2xl border border-hairline bg-raised p-2 [scrollbar-width:none]">
      <ul className="flex min-w-max items-center gap-2">
        {hub.sections.map(({ appId, label }) => {
          const app = requireApp(appId);
          if (app.kind !== "live") return null;
          const selected = current?.id === appId;
          const Icon = app.icon;
          return (
            <li key={appId}>
              <Link
                to={app.to}
                aria-current={selected ? "page" : undefined}
                className={"inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors " +
                  (selected ? "border text-foreground" : "text-platinum/75 hover:bg-foreground/[0.05] hover:text-foreground")}
                style={selected ? { borderColor: `color-mix(in oklab, ${hub.accent} 40%, transparent)`, background: `color-mix(in oklab, ${hub.accent} 15%, transparent)` } : undefined}
              >
                <Icon className="h-4 w-4" />{label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
