import type { Actor, AppId } from "./contracts.ts";
import { PermissionService } from "./permissions.ts";

export interface WidgetDefinition {
  id: string;
  appId: AppId;
  title: string;
  kind: "metric" | "list" | "action" | "custom";
  config: Readonly<Record<string, string | number | boolean>>;
}

export class WidgetsApi {
  readonly #widgets = new Map<string, WidgetDefinition>();
  private readonly permissions: PermissionService;
  constructor(permissions: PermissionService) { this.permissions = permissions; }
  register(actor: Actor, widget: Omit<WidgetDefinition, "appId">): void {
    this.permissions.require(actor, "widgets.register");
    if (this.#widgets.has(widget.id)) throw new Error(`Widget already registered: ${widget.id}`);
    this.#widgets.set(widget.id, Object.freeze({ ...widget, appId: actor.appId, config: Object.freeze({ ...widget.config }) }));
  }
  list(appId?: AppId): WidgetDefinition[] {
    return [...this.#widgets.values()].filter(widget => !appId || widget.appId === appId);
  }
}
