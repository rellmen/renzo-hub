import type { Actor, AppId } from "./contracts.ts";
import { PermissionService } from "./permissions.ts";

export interface HubCommand {
  id: string;
  appId: AppId;
  title: string;
  keywords: readonly string[];
  run(actor: Actor): Promise<void> | void;
}

export class CommandSystem {
  readonly #commands = new Map<string, HubCommand>();
  private readonly permissions: PermissionService;
  constructor(permissions: PermissionService) { this.permissions = permissions; }
  register(actor: Actor, command: Omit<HubCommand, "appId">): void {
    if (this.#commands.has(command.id)) throw new Error(`Command already registered: ${command.id}`);
    this.#commands.set(command.id, Object.freeze({ ...command, appId: actor.appId, keywords: Object.freeze([...command.keywords]) }));
  }
  search(query: string): HubCommand[] {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return [...this.#commands.values()].map(command => {
      const haystack = [command.title, command.id, ...command.keywords].join(" ").toLocaleLowerCase();
      return { command, score: terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0) };
    }).filter(result => terms.length === 0 || result.score > 0)
      .sort((a, b) => b.score - a.score || a.command.title.localeCompare(b.command.title)).map(result => result.command);
  }
  async execute(actor: Actor, id: string): Promise<void> {
    this.permissions.require(actor, "commands.execute", id);
    const command = this.#commands.get(id);
    if (!command) throw new Error(`Unknown command: ${id}`);
    await command.run(actor);
  }
}
