import type { Actor, Entity } from "./contracts.ts";
import { PermissionService } from "./permissions.ts";

export type DataSchema = Record<string, Entity>;
export interface DataAdapter<S extends DataSchema> {
  get<K extends keyof S>(namespace: K, id: string): Promise<S[K] | undefined>;
  list<K extends keyof S>(namespace: K): Promise<S[K][]>;
  put<K extends keyof S>(namespace: K, value: S[K]): Promise<void>;
  delete<K extends keyof S>(namespace: K, id: string): Promise<void>;
}

/** Small persistence boundary. The included adapter is for local development and tests only. */
export class MemoryDataAdapter<S extends DataSchema> implements DataAdapter<S> {
  readonly #tables = new Map<keyof S, Map<string, Entity>>();
  async get<K extends keyof S>(namespace: K, id: string): Promise<S[K] | undefined> {
    const value = this.#tables.get(namespace)?.get(id);
    return value ? structuredClone(value) as S[K] : undefined;
  }
  async list<K extends keyof S>(namespace: K): Promise<S[K][]> {
    return [...(this.#tables.get(namespace)?.values() ?? [])].map(value => structuredClone(value) as S[K]);
  }
  async put<K extends keyof S>(namespace: K, value: S[K]): Promise<void> {
    const table = this.#tables.get(namespace) ?? new Map<string, Entity>();
    table.set(value.id, structuredClone(value));
    this.#tables.set(namespace, table);
  }
  async delete<K extends keyof S>(namespace: K, id: string): Promise<void> { this.#tables.get(namespace)?.delete(id); }
}

export class DataStore<S extends DataSchema> {
  private readonly adapter: DataAdapter<S>;
  private readonly permissions: PermissionService;
  constructor(adapter: DataAdapter<S>, permissions: PermissionService) {
    this.adapter = adapter;
    this.permissions = permissions;
  }
  async get<K extends keyof S>(actor: Actor, namespace: K, id: string): Promise<S[K] | undefined> {
    this.permissions.require(actor, "data.read", String(namespace));
    return this.adapter.get(namespace, id);
  }
  async list<K extends keyof S>(actor: Actor, namespace: K): Promise<S[K][]> {
    this.permissions.require(actor, "data.read", String(namespace));
    return this.adapter.list(namespace);
  }
  async put<K extends keyof S>(actor: Actor, namespace: K, value: S[K]): Promise<void> {
    this.permissions.require(actor, "data.write", String(namespace));
    await this.adapter.put(namespace, value);
  }
  async delete<K extends keyof S>(actor: Actor, namespace: K, id: string): Promise<void> {
    this.permissions.require(actor, "data.write", String(namespace));
    await this.adapter.delete(namespace, id);
  }
}
