# Renzo Microapp OS Core v1

Renzo Hub already has a working vanilla JavaScript shell, Supabase authentication and storage, PWA support, and the Study, Dutch, Gym, Food, Skin, Work, Car, News, and System areas. This core is an additive TypeScript foundation. The current UI and its persistence remain the runtime source of truth until each adapter is migrated and verified in a later release.

## Modules

- **App Registry:** validated, duplicate-safe manifests describe app identity, entry point, version, capabilities, and data namespaces.
- **Microapp SDK / contracts:** branded IDs, app manifests, actors, entity shape, and the public exports in `os-core/src/index.ts` are the initial SDK boundary.
- **Data architecture:** `DataStore` scopes reads and writes to named namespaces and a `DataAdapter`; `MemoryDataAdapter` supports tests/local prototypes. A production Supabase adapter should map each namespace to existing tables and retain existing row-level security. This v1 does not connect to or alter Supabase.
- **Typed Event Bus:** event names and payloads are checked by TypeScript; consumers receive explicit unsubscribe functions.
- **Permissions:** grants are default-deny and can be scoped to a namespace or individual tool/command.
- **Widgets API:** apps register immutable widget descriptors under their own app identity.
- **AI Tools API:** tools have explicit input parsers and executors; invocation requires a per-tool permission. Registration does not add a model provider or external service.
- **Command System:** commands are searchable by title, ID, and keywords; execution is permission checked. A visual command bar can be layered on this API later.
- **Notifications and Universal Inbox:** notifications emit typed events and flow into a hub-wide read model, with per-owner filtering and idempotent source keys.

## Safe integration sequence

1. Keep the existing Hub shell, authentication, PWA, and microapp pages intact.
2. Add a JavaScript bridge only after the host build pipeline is selected; call the TS core from one feature at a time.
3. Implement a Supabase adapter against the existing schema and RLS policies; do not create new services or copy environment credentials.
4. Add migration mapping for existing Study/Dutch and other app data before switching reads or writes.
5. Put command palette, widgets, inbox, and notifications behind existing authenticated UI entry points.
6. Verify on an isolated preview before considering any deployment; production and `main` are outside this work copy.

## Development checks

Requires Node.js 24 or another runtime with TypeScript type stripping enabled:

```sh
npm test
npm run build
```

The checked-in `tsconfig.json` defines strict TypeScript settings for a future `tsc --noEmit` check when a TypeScript compiler is available. The current build script parses the entry module and runs the test suite without installing dependencies or contacting services.

## v1 boundaries

The storage adapter and event bus are in-process interfaces, not distributed infrastructure. AI tools are callable handlers, not an LLM integration. Widgets and commands are headless APIs, not UI components. Persistence, cross-tab delivery, background notifications, schema migrations, and host-shell wiring are staged follow-up work so the existing product continues to operate during adoption.
