import { BookOpen, Briefcase, Dumbbell, Home, Settings, Sparkles, Wallet, Flower2 } from "lucide-react";

export const NAV = [
  { to: "/", label: "Centro de mando", short: "Inicio", icon: Home, accent: "var(--gold)" },
  { to: "/ares", label: "Ares AI", short: "Ares", icon: Sparkles, accent: "var(--ares)" },
  { to: "/aprender", label: "SelfLearn", short: "Aprender", icon: BookOpen, accent: "var(--learn)" },
  { to: "/gym", label: "Gym", short: "Gym", icon: Dumbbell, accent: "var(--gym)" },
  { to: "/dinero", label: "Money", short: "Money", icon: Wallet, accent: "var(--money)" },
  { to: "/piel", label: "Skin Routine", short: "Skin", icon: Flower2, accent: "var(--skin)" },
  { to: "/proyectos", label: "Proyectos", short: "Proyectos", icon: Briefcase, accent: "var(--projects)" },
  { to: "/ajustes", label: "Ajustes", short: "Más", icon: Settings, accent: "var(--platinum)" },
] as const;

export type NavTo = (typeof NAV)[number]["to"];