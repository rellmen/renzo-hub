import { NAV } from "./nav";
import { LEGACY_FALLBACK_URL } from "./nocturne-environment.mjs";
import type { LucideIcon } from "lucide-react";
import {
  Activity, Apple, BookOpen, Briefcase, CalendarClock, Car, Dumbbell, FileText, Flower2, Home,
  Newspaper, NotebookPen, PiggyBank, Receipt, Settings, Sparkles, Target, Wallet,
} from "lucide-react";

export type AppCategory = "bienestar" | "aprendizaje" | "productividad" | "finanzas" | "sistema";

export const CATEGORIES: { id: "todos" | AppCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "bienestar", label: "Bienestar" },
  { id: "aprendizaje", label: "Aprendizaje" },
  { id: "productividad", label: "Productividad" },
  { id: "finanzas", label: "Finanzas" },
  { id: "sistema", label: "Sistema" },
];

/** Routes implemented by the real application. */
export type LiveRoute = (typeof NAV)[number]["to"];

type Base = {
  id: string;
  label: string;
  short: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  category: AppCategory;
  aliases: string[];
};
export type AppEntry = (Base & { kind: "live"; to: LiveRoute }) | (Base & { kind: "classic"; href: string });

export const APPS: AppEntry[] = [
  { id: "inicio", kind: "live", to: "/", label: "Centro de mando", short: "Inicio", blurb: "Resumen del día", icon: Home, accent: "var(--gold)", category: "sistema", aliases: ["home", "dashboard", "inicio", "hoy"] },
  { id: "quests", kind: "live", to: "/quest", label: "Quests", short: "Quests", blurb: "Tu experiencia y progreso guardados", icon: Target, accent: "var(--gold)", category: "productividad", aliases: ["misiones", "retos", "objetivos", "goals"] },
  { id: "ares", kind: "live", to: "/ares", label: "Ares AI", short: "Ares", blurb: "Consultas privadas y asistencia autorizada", icon: Sparkles, accent: "var(--ares)", category: "sistema", aliases: ["ia", "ai", "asistente", "chat"] },
  { id: "aprender", kind: "live", to: "/aprender", label: "SelfLearn", short: "Aprender", blurb: "Neerlandés B2 · Inglés C1", icon: BookOpen, accent: "var(--learn)", category: "aprendizaje", aliases: ["learn", "idiomas", "neerlandes", "dutch", "ingles", "english", "lecciones"] },
  { id: "gym", kind: "live", to: "/gym", label: "Gym", short: "Gym", blurb: "Entrenos y descansos", icon: Dumbbell, accent: "var(--gym)", category: "bienestar", aliases: ["gimnasio", "entreno", "workout", "fitness"] },
  { id: "dinero", kind: "live", to: "/dinero", label: "Money", short: "Money", blurb: "Bancos, gastos y presupuesto", icon: Wallet, accent: "var(--money)", category: "finanzas", aliases: ["dinero", "presupuesto", "budget"] },
  { id: "piel", kind: "live", to: "/piel", label: "Skin Routine", short: "Skin", blurb: "Rutina mañana y noche", icon: Flower2, accent: "var(--skin)", category: "bienestar", aliases: ["piel", "skincare", "rutina", "cuidado"] },
  { id: "proyectos", kind: "live", to: "/proyectos", label: "Proyectos", short: "Proyectos", blurb: "Tareas y tablero", icon: Briefcase, accent: "var(--projects)", category: "productividad", aliases: ["projects", "tareas", "tasks", "kanban"] },
  { id: "ajustes", kind: "live", to: "/ajustes", label: "Ajustes", short: "Ajustes", blurb: "Preferencias y privacidad", icon: Settings, accent: "var(--platinum)", category: "sistema", aliases: ["settings", "configuracion", "preferencias", "perfil"] },
  { id: "notas", kind: "live", to: "/notas", label: "Notas", short: "Notas", blurb: "Apuntes rápidos", icon: NotebookPen, accent: "var(--projects)", category: "productividad", aliases: ["notes", "apuntes", "ideas"] },
  { id: "body", kind: "live", to: "/body", label: "Body", short: "Body", blurb: "Medidas y progreso", icon: Activity, accent: "var(--gym)", category: "bienestar", aliases: ["cuerpo", "peso", "medidas"] },
  { id: "food", kind: "live", to: "/food", label: "Food", short: "Food", blurb: "Comidas y nutrición", icon: Apple, accent: "var(--skin)", category: "bienestar", aliases: ["comida", "nutricion", "dieta", "recetas"] },
  { id: "nominas", kind: "live", to: "/nominas", label: "Nóminas", short: "Nóminas", blurb: "Recibos de sueldo", icon: FileText, accent: "var(--money)", category: "finanzas", aliases: ["payroll", "sueldo", "salario", "nomina"] },
  { id: "gastos", kind: "classic", href: LEGACY_FALLBACK_URL + "?app=gastos", label: "Gastos avanzados", short: "Gastos", blurb: "Abrir módulo clásico", icon: Receipt, accent: "var(--money)", category: "finanzas", aliases: ["expenses", "compras", "pagos"] },
  { id: "turnos", kind: "live", to: "/turnos", label: "Turnos", short: "Turnos", blurb: "Horarios de trabajo", icon: CalendarClock, accent: "var(--projects)", category: "productividad", aliases: ["shifts", "horario", "calendario"] },
  { id: "my-finance", kind: "classic", href: LEGACY_FALLBACK_URL + "?app=money", label: "My Finance", short: "Finance", blurb: "Finanzas avanzadas · módulo clásico", icon: PiggyBank, accent: "var(--money)", category: "finanzas", aliases: ["finanzas", "ahorro", "inversion", "savings"] },
  { id: "news", kind: "live", to: "/news", label: "News", short: "News", blurb: "Lecturas seleccionadas", icon: Newspaper, accent: "var(--learn)", category: "aprendizaje", aliases: ["noticias", "lectura", "articulos"] },
  { id: "car", kind: "classic", href: LEGACY_FALLBACK_URL + "?app=car", label: "Car", short: "Car", blurb: "Mantenimiento · módulo clásico", icon: Car, accent: "var(--platinum)", category: "sistema", aliases: ["coche", "auto", "vehiculo", "carro"] },
  ...NAV.filter(n => !["/","/quest","/ares","/aprender","/gym","/dinero","/piel","/proyectos","/ajustes","/notas","/body","/food","/nominas","/turnos","/news"].includes(n.to)).map(n => ({
    ...n, id: n.to.slice(1), kind: "live" as const, blurb: "Abrir " + n.label,
    category: "productividad" as const, aliases: [n.label,n.short]
  })),
  {id:"ai-inbox",kind:"classic",href:LEGACY_FALLBACK_URL+"?app=ares-center",label:"AI Inbox",short:"Inbox",blurb:"Bandeja de solicitudes · clásico",icon:Sparkles,accent:"var(--ares)",category:"sistema",aliases:["aprobaciones","bandeja"]},
];

export const APP_BY_ID: Record<string, AppEntry> = Object.fromEntries(APPS.map((a) => [a.id, a]));

/** Required registry entries fail explicitly rather than leaking undefined into navigation. */
export function requireApp(id: string): AppEntry {
  const app = APP_BY_ID[id];
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}

/** Apps eligible for the 5th dock slot (Inicio/Quests/Ares already have fixed slots). */
export const SHORTCUT_CANDIDATES = APPS.filter((a) => !["inicio", "quests", "ares"].includes(a.id));

export function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function searchApps(query: string, category: "todos" | AppCategory = "todos", apps: AppEntry[] = APPS) {
  const q = normalize(query);
  return apps.filter((a) => {
    if (category !== "todos" && a.category !== category) return false;
    if (!q) return true;
    return [a.label, a.short, a.blurb, a.id, ...a.aliases].some((t) => normalize(t).includes(q));
  });
}

export function appPath(a: AppEntry) {
  return a.kind === "live" ? a.to : a.href;
}

/** Which app owns the current pathname. */
export function appForPath(path: string): AppEntry | undefined {
  if (path === "/") return APP_BY_ID["inicio"];
  return APPS.find((a) => a.id !== "inicio" && (path === appPath(a) || path.startsWith(appPath(a) + "/")));
}

