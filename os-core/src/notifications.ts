import type { Actor, InboxItem } from "./contracts.ts";
import { EventBus } from "./event-bus.ts";
import { PermissionService } from "./permissions.ts";

export interface CoreEvents {
  "notification.created": InboxItem;
  "notification.updated": InboxItem;
  "inbox.item.created": InboxItem;
}

export class NotificationsApi {
  readonly #items = new Map<string, InboxItem>();
  private readonly permissions: PermissionService;
  private readonly events: EventBus<CoreEvents>;
  private readonly now: () => string;
  constructor(permissions: PermissionService, events: EventBus<CoreEvents>, now = () => new Date().toISOString()) {
    this.permissions = permissions;
    this.events = events;
    this.now = now;
  }
  create(actor: Actor, input: Omit<InboxItem, "createdAt" | "ownerId">): InboxItem {
    this.permissions.require(actor, "notifications.create");
    const item: InboxItem = Object.freeze({ ...input, ownerId: actor.userId, createdAt: this.now() });
    this.#items.set(item.id, item);
    this.events.emit("notification.created", item);
    this.events.emit("inbox.item.created", item);
    return item;
  }
  list(ownerId: InboxItem["ownerId"]): InboxItem[] {
    return [...this.#items.values()].filter(item => item.ownerId === ownerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  markRead(actor: Actor, id: string): InboxItem {
    this.permissions.require(actor, "inbox.update");
    const current = this.#items.get(id);
    if (!current || current.ownerId !== actor.userId) throw new Error(`Inbox item not found: ${id}`);
    const updated = Object.freeze({ ...current, readAt: current.readAt ?? this.now() });
    this.#items.set(id, updated);
    this.events.emit("notification.updated", updated);
    return updated;
  }
  markCompleted(actor: Actor, id: string): InboxItem {
    this.permissions.require(actor, "inbox.update");
    const current = this.#items.get(id);
    if (!current || current.ownerId !== actor.userId) throw new Error(`Inbox item not found: ${id}`);
    const updated = Object.freeze({ ...current, completedAt: current.completedAt ?? this.now() });
    this.#items.set(id, updated);
    this.events.emit("notification.updated", updated);
    return updated;
  }
}
