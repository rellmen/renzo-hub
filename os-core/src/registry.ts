import type { AppId, MicroappManifest } from "./contracts.ts";

export class AppRegistry {
  readonly #apps = new Map<AppId, MicroappManifest>();

  register(manifest: MicroappManifest): void {
    if (this.#apps.has(manifest.id)) throw new Error(`Microapp already registered: ${manifest.id}`);
    if (!manifest.name.trim() || !manifest.entry.trim()) throw new Error("Manifest requires a name and entry point");
    this.#apps.set(manifest.id, Object.freeze({ ...manifest, capabilities: Object.freeze([...manifest.capabilities]) }));
  }

  get(id: AppId): MicroappManifest | undefined { return this.#apps.get(id); }
  list(): MicroappManifest[] { return [...this.#apps.values()].sort((a, b) => a.name.localeCompare(b.name)); }
  has(id: AppId): boolean { return this.#apps.has(id); }
}
