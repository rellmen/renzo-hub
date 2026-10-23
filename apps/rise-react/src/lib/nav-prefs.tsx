import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { APP_BY_ID, SHORTCUT_CANDIDATES } from "./apps";


export const MAX_RECENTS = 6;
export type NavPrefs = { favorites: string[]; shortcut: string; recents: string[] };
export const DEFAULT_PREFS: NavPrefs = { favorites: ["aprender", "gym", "proyectos"], shortcut: "gym", recents: [] };

/** Drop unknown ids / wrong shapes so corrupted storage never breaks navigation. */
export function sanitizePrefs(raw: unknown): NavPrefs {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const ids = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && Object.hasOwn(APP_BY_ID, x)))] : null);
  const storedShortcut = r["shortcut"];
  const shortcut = typeof storedShortcut === "string" && SHORTCUT_CANDIDATES.some((a) => a.id === storedShortcut) ? storedShortcut : DEFAULT_PREFS.shortcut;
  return {
    favorites: ids(r["favorites"]) ?? DEFAULT_PREFS.favorites,
    shortcut,
    recents: (ids(r["recents"]) ?? []).slice(0, MAX_RECENTS),
  };
}

export function pushRecent(recents: string[], id: string) {
  return [id, ...recents.filter((r) => r !== id)].slice(0, MAX_RECENTS);
}

type Ctx = {
  prefs: NavPrefs;
  toggleFavorite: (id: string) => void;
  setShortcut: (id: string) => void;
  addRecent: (id: string) => void;
  launcherOpen: boolean;
  setLauncherOpen: (o: boolean) => void;
};
const NavCtx = createContext<Ctx | null>(null);

export function NavPrefsProvider({ children, userKey }: { children: ReactNode; userKey: string }) {
  const [stored,setStored]=useState<unknown>(DEFAULT_PREFS);
  const [ready,setReady]=useState(false);
  const storageKey="risehub.nocturne.nav."+userKey;
  useEffect(()=>{
    try { const raw=window.localStorage.getItem(storageKey);setStored(raw?sanitizePrefs(JSON.parse(raw)):DEFAULT_PREFS); }
    catch { setStored(DEFAULT_PREFS); }
    setReady(true);
  },[storageKey]);
  useEffect(()=>{if(ready)try{window.localStorage.setItem(storageKey,JSON.stringify(sanitizePrefs(stored)));}catch{/* browser storage is optional */}},[storageKey,stored,ready]);
  const prefs = useMemo(() => sanitizePrefs(stored), [stored]);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const update = useCallback((fn: (p: NavPrefs) => NavPrefs) => { if(ready)setStored((prev: unknown) => fn(sanitizePrefs(prev))); }, [ready]);
  const toggleFavorite = useCallback((id: string) => update((p) => ({ ...p, favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [...p.favorites, id] })), [update]);
  const setShortcut = useCallback((id: string) => update((p) => ({ ...p, shortcut: id })), [update]);
  const addRecent = useCallback((id: string) => update((p) => (p.recents[0] === id ? p : { ...p, recents: pushRecent(p.recents, id) })), [update]);
  const value = useMemo<Ctx>(() => ({
    prefs,
    launcherOpen,
    setLauncherOpen,
    toggleFavorite,
    setShortcut,
    addRecent,
  }), [prefs, launcherOpen, toggleFavorite, setShortcut, addRecent]);
  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}

export function useNavPrefs() {
  const c = useContext(NavCtx);
  if (!c) throw new Error("useNavPrefs must be used inside NavPrefsProvider");
  return c;
}

