import { SHORTCUT_CANDIDATES } from "@/lib/apps";
import { useNavPrefs } from "@/lib/nav-prefs";

export function ShortcutSelect({ id = "dock-shortcut" }: { id?: string }) {
  const { prefs, setShortcut } = useNavPrefs();
  return (
    <div className="flex min-h-12 items-center justify-between gap-3">
      <label htmlFor={id} className="min-w-0 text-sm">
        Atajo del dock
        <span className="block text-xs text-muted-foreground">Quinto botón de la barra móvil</span>
      </label>
      <select
        id={id} value={prefs.shortcut} onChange={(e) => setShortcut(e.target.value)}
        className="h-11 min-w-0 max-w-[48%] rounded-xl border border-input bg-obsidian px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {SHORTCUT_CANDIDATES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
      </select>
    </div>
  );
}

