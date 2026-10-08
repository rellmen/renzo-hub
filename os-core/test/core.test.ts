import assert from "node:assert/strict";
import test from "node:test";
import {
  AiToolsApi, AppRegistry, CommandSystem, DataStore, EventBus, MemoryDataAdapter,
  NotificationsApi, PermissionService, UniversalInbox, WidgetsApi, appId, userId,
  type CoreEvents, type Entity,
} from "../src/index.ts";

const actor = { userId: userId("renzo"), appId: appId("study") };

test("registry rejects duplicate apps and exposes a stable catalog", () => {
  const registry = new AppRegistry();
  const manifest = { id: actor.appId, name: "Study", version: "1.0.0", description: "Study", entry: "study", capabilities: ["data.read"] as const };
  registry.register(manifest);
  assert.equal(registry.get(actor.appId)?.name, "Study");
  assert.throws(() => registry.register(manifest), /already registered/);
});

test("event bus is typed at its boundary and unsubscribes", () => {
  const bus = new EventBus<{ "study.completed": { lessonId: string } }>();
  let received = "";
  const unsubscribe = bus.on("study.completed", payload => { received = payload.lessonId; });
  bus.emit("study.completed", { lessonId: "unit-1" });
  unsubscribe();
  bus.emit("study.completed", { lessonId: "unit-2" });
  assert.equal(received, "unit-1");
});

test("permissions default-deny and namespace data access is scoped", async () => {
  interface Schema extends Record<string, Entity> { notes: Entity & { text: string } }
  const permissions = new PermissionService();
  const store = new DataStore<Schema>(new MemoryDataAdapter<Schema>(), permissions);
  const note = { id: "n1", createdAt: "2026-01-01", updatedAt: "2026-01-01", text: "hello" };
  await assert.rejects(store.put(actor, "notes", note), /Permission denied/);
  permissions.grant({ ...actor, capability: "data.write", resource: "notes" });
  permissions.grant({ ...actor, capability: "data.read", resource: "notes" });
  await store.put(actor, "notes", note);
  assert.deepEqual(await store.get(actor, "notes", "n1"), note);
  assert.equal(await store.get(actor, "notes", "missing"), undefined);
});

test("widgets and commands use per-app ownership and command grants", async () => {
  const permissions = new PermissionService();
  const widgets = new WidgetsApi(permissions);
  permissions.grant({ ...actor, capability: "widgets.register" });
  widgets.register(actor, { id: "study-streak", title: "Streak", kind: "metric", config: { metric: "streak" } });
  assert.equal(widgets.list(actor.appId).length, 1);
  const commands = new CommandSystem(permissions);
  let opened = false;
  commands.register(actor, { id: "study.open", title: "Open Study", keywords: ["learn"], run: () => { opened = true; } });
  assert.equal(commands.search("learn")[0]?.id, "study.open");
  await assert.rejects(commands.execute(actor, "study.open"), /Permission denied/);
  permissions.grant({ ...actor, capability: "commands.execute", resource: "study.open" });
  await commands.execute(actor, "study.open");
  assert.equal(opened, true);
});

test("AI tools are explicit, validated, and require a capability grant", async () => {
  const permissions = new PermissionService();
  const tools = new AiToolsApi(permissions);
  tools.register({ id: "study.suggest", description: "Suggest a lesson", parseInput(value) {
    if (!value || typeof value !== "object" || !("topic" in value) || typeof value.topic !== "string") throw new Error("Invalid input");
    return value.topic;
  }, execute: topic => ({ suggestion: `Learn ${topic}` }) });
  await assert.rejects(tools.invoke(actor, "study.suggest", { topic: "Dutch" }), /Permission denied/);
  permissions.grant({ ...actor, capability: "ai.invoke", resource: "study.suggest" });
  assert.deepEqual(await tools.invoke(actor, "study.suggest", { topic: "Dutch" }), { suggestion: "Learn Dutch" });
  await assert.rejects(tools.invoke(actor, "study.suggest", { topic: 4 }), /Invalid input/);
});

test("notifications flow into the universal inbox and owner updates remain synchronized", () => {
  const permissions = new PermissionService();
  const events = new EventBus<CoreEvents>();
  const inbox = new UniversalInbox(events);
  const notifications = new NotificationsApi(permissions, events, () => "2026-10-08T00:00:00.000Z");
  permissions.grant({ ...actor, capability: "notifications.create" });
  permissions.grant({ ...actor, capability: "inbox.update" });
  notifications.create(actor, { id: "n-1", source: "study", sourceId: "lesson-1", title: "Lesson ready" });
  assert.equal(inbox.list(actor.userId, "unread").length, 1);
  notifications.markRead(actor, "n-1");
  assert.equal(inbox.list(actor.userId, "unread").length, 0);
  notifications.markCompleted(actor, "n-1");
  assert.equal(inbox.list(actor.userId, "open").length, 0);
  assert.equal(inbox.list(userId("other")).length, 0);
  inbox.close();
});
