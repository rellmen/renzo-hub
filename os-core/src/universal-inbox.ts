import type { InboxItem, UserId } from "./contracts.ts";
import type { CoreEvents } from "./notifications.ts";
import { EventBus } from "./event-bus.ts";

/** Read model for hub-wide tasks and notifications; source+sourceId makes ingestion idempotent. */
export class UniversalInbox {
  readonly #items = new Map<string, InboxItem>();
  readonly #unsubscribers: Array<() => void>;
  constructor(events: EventBus<CoreEvents>) {
    this.#unsubscribers = [events.on("inbox.item.created", item => {
      const key = this.#key(item.source, item.sourceId);
      if (!this.#items.has(key)) this.#items.set(key, item);
    }), events.on("notification.updated", item => {
      const key = this.#key(item.source, item.sourceId);
      if (this.#items.has(key)) this.#items.set(key, item);
    })];
  }
  list(ownerId: UserId, filter: "all" | "unread" | "open" = "all"): InboxItem[] {
    return [...this.#items.values()].filter(item => item.ownerId === ownerId)
      .filter(item => filter === "all" || (filter === "unread" ? !item.readAt : !item.completedAt))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  close(): void { for (const unsubscribe of this.#unsubscribers) unsubscribe(); }
  #key(source: string, sourceId: string): string { return `${source}\u0000${sourceId}`; }
}
