import type { Actor } from "./contracts.ts";
import { PermissionService } from "./permissions.ts";

export interface AiTool<I = unknown, O = unknown> {
  id: string;
  description: string;
  parseInput(value: unknown): I;
  execute(input: I, actor: Actor): Promise<O> | O;
}

/** Explicit allowlist only: registering a tool never grants access to external services by itself. */
export class AiToolsApi {
  readonly #tools = new Map<string, AiTool<unknown, unknown>>();
  private readonly permissions: PermissionService;
  constructor(permissions: PermissionService) { this.permissions = permissions; }
  register<I, O>(tool: AiTool<I, O>): void {
    if (this.#tools.has(tool.id)) throw new Error(`AI tool already registered: ${tool.id}`);
    this.#tools.set(tool.id, tool as AiTool<unknown, unknown>);
  }
  list(): Array<Pick<AiTool, "id" | "description">> {
    return [...this.#tools.values()].map(({ id, description }) => ({ id, description }));
  }
  async invoke<O = unknown>(actor: Actor, id: string, rawInput: unknown): Promise<O> {
    this.permissions.require(actor, "ai.invoke", id);
    const tool = this.#tools.get(id);
    if (!tool) throw new Error(`Unknown AI tool: ${id}`);
    return await tool.execute(tool.parseInput(rawInput), actor) as O;
  }
}
