export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type AppId = Brand<string, "AppId">;
export type UserId = Brand<string, "UserId">;
export type EventName = string;
export type Capability =
  | "data.read"
  | "data.write"
  | "events.publish"
  | "widgets.register"
  | "ai.invoke"
  | "commands.execute"
  | "notifications.create"
  | "inbox.update";

export const appId = (value: string): AppId => {
  if (!/^[a-z][a-z0-9-]{1,62}$/.test(value)) throw new Error(`Invalid app id: ${value}`);
  return value as AppId;
};

export const userId = (value: string): UserId => {
  if (!value.trim()) throw new Error("User id cannot be empty");
  return value as UserId;
};

export interface MicroappManifest {
  id: AppId;
  name: string;
  version: string;
  description: string;
  entry: string;
  capabilities: readonly Capability[];
  dataNamespaces?: readonly string[];
}

export interface Actor {
  userId: UserId;
  appId: AppId;
}

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  source: string;
  sourceId: string;
  ownerId: UserId;
  title: string;
  body?: string;
  href?: string;
  createdAt: string;
  readAt?: string;
  completedAt?: string;
  metadata?: Readonly<Record<string, string | number | boolean>>;
}
