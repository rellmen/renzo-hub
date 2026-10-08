export type EventMap = { [Name in string]: unknown };
export type EventHandler<T> = (payload: T) => void;

/** In-process typed event transport. Consumers own unsubscribe functions; handlers run in registration order. */
export class EventBus<Events extends EventMap> {
  readonly #handlers = new Map<keyof Events, Set<EventHandler<never>>>();

  on<Name extends keyof Events>(name: Name, handler: EventHandler<Events[Name]>): () => void {
    const handlers = this.#handlers.get(name) ?? new Set<EventHandler<never>>();
    handlers.add(handler as EventHandler<never>);
    this.#handlers.set(name, handlers);
    return () => {
      handlers.delete(handler as EventHandler<never>);
      if (handlers.size === 0) this.#handlers.delete(name);
    };
  }

  emit<Name extends keyof Events>(name: Name, payload: Events[Name]): void {
    for (const handler of [...(this.#handlers.get(name) ?? [])]) handler(payload as never);
  }
}
