import type { NAV } from "./nav";
import type { LucideIcon } from "lucide-react";
import {
  Activity, Apple, BookOpen, Bot, GraduationCap, Briefcase, CalendarClock, Car, DatabaseBackup, Dumbbell, FileText, Flower2, Home,
  Inbox, LayoutGrid, LineChart, Newspaper, NotebookPen, Receipt, Settings, Sparkles, Target, Wallet,
} from "lucide-react";
import { HUBS, HUB_OF_APP, type HubId } from "./hubs";

/** La categoría de cada app es su hub (ver lib/hubs.ts). */
export type AppCategory = HubId;

export const CATEGORIES: { id: "todos" | AppCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  ...HUBS.map((h) => ({ id: h.id, label: h.label })),
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

type Entry = Omit<Base, "category"> & { kind: "live"; to: LiveRoute };
const hubFor = (id: string): AppCategory => {
  const hub = HUB_OF_APP[id];
  if (!hub) throw new Error(`App sin hub: ${id}`);
  return hub;
};
const ENTRIES: Entry[] = [
  { id: "inicio", kind: "live", to: "/", label: "Centro de mando", short: "Inicio", blurb: "Resumen del día", icon: Home, accent: "var(--gold)", aliases: ["home", "dashboard", "inicio", "hoy"] },
  { id: "quests", kind: "live", to: "/quest", label: "XP y Quests", short: "Quests", blurb: "Tu experiencia y progreso guardados", icon: Target, accent: "var(--gold)", aliases: ["misiones", "retos", "objetivos", "goals", "xp", "nivel"] },
  { id: "academy", kind: "live", to: "/academy", label: "Academy", short: "Academy", blurb: "Hoy: repasos y siguiente lección", icon: GraduationCap, accent: "var(--learn)", aliases: ["academia", "estudiar", "estudios", "study", "selflearn", "aprender"] },
  { id: "aprender", kind: "live", to: "/aprender", label: "Idiomas", short: "Idiomas", blurb: "Neerlandés B2 · Inglés C1", icon: BookOpen, accent: "var(--learn)", aliases: ["selflearn", "learn", "idiomas", "neerlandes", "dutch", "ingles", "english", "lecciones"] },
  { id: "academia", kind: "live", to: "/academia", label: "UOC +25", short: "UOC +25", blurb: "Prueba de acceso +25 · UOC", icon: GraduationCap, accent: "var(--learn)", aliases: ["uoc", "academia +25", "universidad", "acceso", "mayores de 25", "matematicas", "fisica", "economia", "examen", "simulacros"] },
  { id: "career", kind: "live", to: "/career", label: "Data & Carrera", short: "Data", blurb: "Power BI, SQL, Python y certificados", icon: LineChart, accent: "var(--learn)", aliases: ["career", "data lab", "power bi", "sql", "python", "certificados", "carrera", "cv"] },
  { id: "news", kind: "live", to: "/news", label: "Biblioteca", short: "Biblioteca", blurb: "News y lecturas", icon: Newspaper, accent: "var(--learn)", aliases: ["news", "noticias", "lectura", "articulos"] },
  { id: "gym", kind: "live", to: "/gym", label: "Gym", short: "Gym", blurb: "Entrenos y descansos", icon: Dumbbell, accent: "var(--gym)", aliases: ["gimnasio", "entreno", "workout", "fitness"] },
  { id: "food", kind: "live", to: "/food", label: "Food", short: "Food", blurb: "Comidas y nutrición", icon: Apple, accent: "var(--skin)", aliases: ["comida", "nutricion", "dieta", "recetas"] },
  { id: "piel", kind: "live", to: "/piel", label: "Skin Routine", short: "Skin", blurb: "Rutina mañana y noche", icon: Flower2, accent: "var(--skin)", aliases: ["piel", "skincare", "rutina", "cuidado"] },
  { id: "body", kind: "live", to: "/body", label: "Medidas", short: "Medidas", blurb: "Peso, medidas y progreso", icon: Activity, accent: "var(--gym)", aliases: ["body", "cuerpo", "peso", "medidas"] },
  { id: "dinero", kind: "live", to: "/dinero", label: "Money", short: "Money", blurb: "Resumen: sueldo del mes y patrimonio", icon: Wallet, accent: "var(--money)", aliases: ["dinero", "presupuesto", "budget", "my finance", "finanzas", "ahorro", "inversion", "savings", "patrimonio", "resumen"] },
  { id: "gastos", kind: "live", to: "/gastos", label: "Gastos", short: "Gastos", blurb: "Categorías y reglas por comercio", icon: Receipt, accent: "var(--money)", aliases: ["expenses", "compras", "pagos", "categorias", "movimientos"] },
  { id: "nominas", kind: "live", to: "/nominas", label: "Nóminas", short: "Nóminas", blurb: "Recibos de sueldo", icon: FileText, accent: "var(--money)", aliases: ["payroll", "sueldo", "salario", "nomina", "sd worx"] },
  { id: "car", kind: "live", to: "/car", label: "Coche", short: "Coche", blurb: "Gastos fijos del coche, dentro de Gastos", icon: Car, accent: "var(--money)", aliases: ["coche", "auto", "vehiculo", "carro"] },
  { id: "turnos", kind: "live", to: "/turnos", label: "Turnos", short: "Turnos", blurb: "Horarios de trabajo", icon: CalendarClock, accent: "var(--projects)", aliases: ["shifts", "shift tracker", "horario", "calendario"] },
  { id: "proyectos", kind: "live", to: "/proyectos", label: "Proyectos", short: "Proyectos", blurb: "Tareas, tablero e ideas", icon: Briefcase, accent: "var(--projects)", aliases: ["projects", "tareas", "tasks", "kanban", "ideas", "sprint"] },
  { id: "notas", kind: "live", to: "/notas", label: "Notas", short: "Notas", blurb: "Apuntes rápidos", icon: NotebookPen, accent: "var(--projects)", aliases: ["notes", "apuntes"] },
  { id: "ares", kind: "live", to: "/ares", label: "Ares AI", short: "Ares", blurb: "Consultas privadas y asistencia autorizada", icon: Sparkles, accent: "var(--ares)", aliases: ["ia", "ai", "asistente", "chat"] },
  { id: "ai-inbox", kind: "live", to: "/inbox", label: "AI Inbox", short: "Inbox", blurb: "Capturas y revisiones privadas", icon: Inbox, accent: "var(--ares)", aliases: ["aprobaciones", "bandeja", "inbox", "capturas"] },
  { id: "agentes", kind: "live", to: "/agentes", label: "Agentes", short: "Agentes", blurb: "Agent Monitor: eventos reales", icon: Bot, accent: "var(--ares)", aliases: ["agent monitor", "agents", "monitor", "jarvis"] },
  { id: "ajustes", kind: "live", to: "/ajustes", label: "Ajustes", short: "Ajustes", blurb: "Preferencias y privacidad", icon: Settings, accent: "var(--platinum)", aliases: ["settings", "configuracion", "preferencias", "perfil"] },
  { id: "migracion", kind: "live", to: "/migracion", label: "Datos y copias", short: "Datos", blurb: "Migración, copias y auditoría", icon: DatabaseBackup, accent: "var(--gold)", aliases: ["migracion", "backup", "copias", "exportar", "datos"] },
  { id: "apps", kind: "live", to: "/apps", label: "Todas las apps", short: "Apps", blurb: "Catálogo por hubs", icon: LayoutGrid, accent: "var(--gold)", aliases: ["catalogo", "microapps", "todas"] },
];
export const APPS: AppEntry[] = ENTRIES.map((e) => ({ ...e, category: hubFor(e.id) }));

export const APP_BY_ID: Record<string, AppEntry> = Object.fromEntries(APPS.map((a) => [a.id, a]));

/** Required registry entries fail explicitly rather than leaking undefined into navigation. */
export function requireApp(id: string): AppEntry {
  const app = APP_BY_ID[id];
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}

/** Apps para el hueco libre del dock (Inicio, Academy, Money y Ares ya son fijos). */
export const SHORTCUT_CANDIDATES = APPS.filter((a) => !["inicio", "academy", "dinero", "ares"].includes(a.id));

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

