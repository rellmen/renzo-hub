import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "risehub.nocturne.";

/** localStorage-backed state. Reads after mount to stay hydration-safe. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* corrupted entry: keep defaults */
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: prototype continues in memory */
    }
  }, [key, value]);

  const update = useCallback((v: T | ((prev: T) => T)) => setValue(v), []);
  return [value, update] as const;
}

export function clearDemoStorage() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}