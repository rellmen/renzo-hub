import type { LucideIcon } from "lucide-react";
import { Activity, Briefcase, GraduationCap, Home, Settings, Sparkles, Wallet } from "lucide-react";

/**
 * RISE HUB · 7 hubs (decisión de Renzo, 24-10-2026, opción B).
 * Cada microapp pertenece a UN hub y aparece como pestaña dentro de él.
 * Las rutas antiguas siguen siendo las mismas: solo cambia cómo se agrupan.
 */
export type HubId = "inicio" | "academy" | "body" | "money" | "trabajo" | "ares" | "ajustes";

export type HubSection = { appId: string; label: string };
export type Hub = {
  id: HubId;
  label: string;
  short: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  /** Orden de las pestañas; la primera es la entrada del hub. */
  sections: HubSection[];
};

export const HUBS: Hub[] = [
  { id: "inicio", label: "Inicio", short: "Inicio", blurb: "Resumen del día y XP", icon: Home, accent: "var(--gold)",
    sections: [{ appId: "inicio", label: "Hoy" }, { appId: "quests", label: "XP y Quests" }] },
  { id: "academy", label: "Academy", short: "Academy", blurb: "Todo lo que estudias", icon: GraduationCap, accent: "var(--learn)",
    sections: [
      { appId: "academy", label: "Hoy" },
      { appId: "aprender", label: "Idiomas" },
      { appId: "academia", label: "UOC +25" },
      { appId: "career", label: "Data & Carrera" },
      { appId: "news", label: "Biblioteca" },
    ] },
  { id: "body", label: "Body", short: "Body", blurb: "Gym, comida, piel y medidas", icon: Activity, accent: "var(--gym)",
    sections: [
      { appId: "gym", label: "Gym" },
      { appId: "food", label: "Food" },
      { appId: "piel", label: "Skin" },
      { appId: "body", label: "Medidas" },
    ] },
  { id: "money", label: "Money", short: "Money", blurb: "Resumen, gastos, nóminas y coche", icon: Wallet, accent: "var(--money)",
    sections: [
      { appId: "dinero", label: "Resumen" },
      { appId: "gastos", label: "Gastos" },
      { appId: "nominas", label: "Nóminas" },
      { appId: "car", label: "Car" },
    ] },
  { id: "trabajo", label: "Trabajo", short: "Trabajo", blurb: "Turnos, proyectos y notas", icon: Briefcase, accent: "var(--projects)",
    sections: [
      { appId: "turnos", label: "Turnos" },
      { appId: "proyectos", label: "Proyectos" },
      { appId: "notas", label: "Notas" },
    ] },
  { id: "ares", label: "Ares", short: "Ares", blurb: "IA, capturas y agentes", icon: Sparkles, accent: "var(--ares)",
    sections: [
      { appId: "ares", label: "Chat" },
      { appId: "ai-inbox", label: "Inbox" },
      { appId: "agentes", label: "Agentes" },
    ] },
  { id: "ajustes", label: "Ajustes", short: "Ajustes", blurb: "Preferencias, datos y catálogo", icon: Settings, accent: "var(--platinum)",
    sections: [
      { appId: "ajustes", label: "Preferencias" },
      { appId: "migracion", label: "Datos y copias" },
      { appId: "apps", label: "Todas las apps" },
    ] },
];

export const HUB_BY_ID: Record<HubId, Hub> = Object.fromEntries(HUBS.map((h) => [h.id, h])) as Record<HubId, Hub>;

/** Hub al que pertenece cada microapp (derivado: una sola fuente de verdad). */
export const HUB_OF_APP: Record<string, HubId> = Object.fromEntries(
  HUBS.flatMap((h) => h.sections.map((s) => [s.appId, h.id] as const)),
);

export function hubOfApp(appId: string | undefined): Hub | undefined {
  if (!appId) return undefined;
  const id = HUB_OF_APP[appId];
  return id ? HUB_BY_ID[id] : undefined;
}
