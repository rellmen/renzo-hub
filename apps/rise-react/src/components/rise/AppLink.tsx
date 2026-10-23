import { Link } from "@tanstack/react-router";
import type { ReactNode, CSSProperties } from "react";
import type { AppEntry } from "@/lib/apps";

/** Type-safe link to any registry app (real page or honest concept view). */
export function AppLink({ app, className, style, children, onClick, current }: {
  app: AppEntry; className?: string; style?: CSSProperties; children: ReactNode; onClick?: () => void; current?: boolean;
}) {
  const common = { className, style, onClick, "aria-current": current ? ("page" as const) : undefined };
  return app.kind === "live"
    ? <Link to={app.to} {...common}>{children}</Link>
    : <a href={app.href} target="_blank" rel="noopener noreferrer" {...common}>{children}</a>;
}

