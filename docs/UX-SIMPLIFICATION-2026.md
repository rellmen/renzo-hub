# RISE HUB · UX simplification (draft)
Scope: Body and its microapps, Finance, Work, System. SelfLearn excluded.
Goal: reduce cognitive load, preserve functionality, data and permissions.

## Design principles
1. One primary action per screen. Put secondary metrics and maintenance tools behind clear native disclosures.
2. Show the next useful step, not every available metric. Progressive disclosure must never hide safety warnings or errors.
3. Mobile-first: minimum 44px touch targets, readable typography, one-column layout, keyboard focus and accessible summary labels.
4. Keep existing app routes, event handlers, storage keys, Supabase queries and navigation contracts.
5. Reuse existing theme variables. No new design framework or dependency required.
6. Never remove existing features or delete user data.

## Target IA
- Body: three app entry points Gym, Skin, Food; each card offers one next action; advanced tracking only after entering.
- Gym Ascend: Entrenar as default; overview (XP, rank, adherence, target) collapsible; system sync tools collapsible; existing tabs and More remain reachable.
- Finance: available balance / next payment / log transaction. Charts, detailed budgets, debt history in named secondary sections.
- Work: current priority / today's task / quick entry. Roadmap, analytics and configuration secondary.
- System: sync health and actionable alerts first. Logs, diagnostics, integrations and raw metadata under Advanced.

## Delivery gates
- Each area has mobile + desktop screenshot comparison and interaction smoke test.
- Validate keyboard, VoiceOver, contrast and persistent navigation.
- Regression: Gym active workout and autosave; Finance transactions; Work tasks; System sync.
- Tests and staging CI pass; independent review before release.
- No production deploy or merge without user approval.

## Implemented in first draft
Gym overview and sync controls moved into accessible native details while retaining their content, DOM IDs and event handlers. The rest of the areas are specified but not yet redesigned.
