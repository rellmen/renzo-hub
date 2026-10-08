import type { Actor, Capability } from "./contracts.ts";

export interface PermissionGrant {
  userId: Actor["userId"];
  appId: Actor["appId"];
  capability: Capability;
  resource?: string;
}

/** Default-deny authorization. A resource-specific grant cannot authorize another resource. */
export class PermissionService {
  readonly #grants = new Set<string>();

  grant(grant: PermissionGrant): void { this.#grants.add(this.#key(grant)); }
  revoke(grant: PermissionGrant): void { this.#grants.delete(this.#key(grant)); }

  can(actor: Actor, capability: Capability, resource?: string): boolean {
    const exact = this.#key({ ...actor, capability, resource });
    const appWide = this.#key({ ...actor, capability });
    return this.#grants.has(exact) || (resource !== undefined && this.#grants.has(appWide));
  }

  require(actor: Actor, capability: Capability, resource?: string): void {
    if (!this.can(actor, capability, resource)) {
      throw new Error(`Permission denied: ${actor.appId} requires ${capability}${resource ? ` on ${resource}` : ""}`);
    }
  }

  #key(grant: PermissionGrant): string {
    return [grant.userId, grant.appId, grant.capability, grant.resource ?? "*"].join("\u0000");
  }
}
