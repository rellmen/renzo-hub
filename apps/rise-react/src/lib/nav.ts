import { BookOpen, Briefcase, Dumbbell, Home, Settings, Sparkles, Wallet, Flower2, NotebookPen, HeartPulse, UtensilsCrossed, CalendarClock, FileSpreadsheet, DatabaseBackup, LayoutGrid, Trophy, Newspaper, Bot, Receipt } from "lucide-react";

export const NAV = [
  { to: "/", label: "Centro de mando", short: "Inicio", icon: Home, accent: "var(--gold)" },
  { to: "/ares", label: "Ares AI", short: "Ares", icon: Sparkles, accent: "var(--ares)" },
  { to: "/aprender", label: "SelfLearn", short: "Aprender", icon: BookOpen, accent: "var(--learn)" },
  { to: "/gym", label: "Gym", short: "Gym", icon: Dumbbell, accent: "var(--gym)" },
  { to: "/body", label: "Body", short: "Body", icon: HeartPulse, accent: "var(--gym)" },
  { to: "/food", label: "Food", short: "Food", icon: UtensilsCrossed, accent: "var(--gold)" },
  { to: "/dinero", label: "Money", short: "Money", icon: Wallet, accent: "var(--money)" },
  { to: "/gastos", label: "Gastos", short: "Gastos", icon: Receipt, accent: "var(--money)" },
  { to: "/piel", label: "Skin Routine", short: "Skin", icon: Flower2, accent: "var(--skin)" },
  { to: "/proyectos", label: "Proyectos", short: "Proyectos", icon: Briefcase, accent: "var(--projects)" },
  { to: "/notas", label: "Notas", short: "Notas", icon: NotebookPen, accent: "var(--projects)" },
  { to: "/quest", label: "RISE Quest", short: "Quest", icon: Trophy, accent: "var(--learn)" },
  { to: "/news", label: "News", short: "News", icon: Newspaper, accent: "var(--projects)" },
  { to: "/agentes", label: "Agent Monitor", short: "Agentes", icon: Bot, accent: "var(--ares)" },
  { to: "/apps", label: "Todas las microapps", short: "Apps", icon: LayoutGrid, accent: "var(--gold)" },
  { to: "/career", label: "Career / Data Lab", short: "Career", icon: Briefcase, accent: "var(--projects)" },
  { to: "/nominas", label: "Nóminas", short: "Nóminas", icon: FileSpreadsheet, accent: "var(--money)" },
  { to: "/turnos", label: "Shift Tracker", short: "Turnos", icon: CalendarClock, accent: "var(--projects)" },
  { to: "/migracion", label: "Migración y copias", short: "Datos", icon: DatabaseBackup, accent: "var(--gold)" },
  { to: "/ajustes", label: "Ajustes", short: "Más", icon: Settings, accent: "var(--platinum)" },
] as const;

export type NavTo = (typeof NAV)[number]["to"];