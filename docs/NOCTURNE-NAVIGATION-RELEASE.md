# Nocturne navigation release — 2026-10-23

Adapts the approved Lovable navigation (5fe3d2aa87451733b9f6983fc94e2c057e46c31c) to real routes on staging 68c59df. Mobile dock: Inicio, Quests (/quest, existing verified XP), Apps launcher, Ares, configurable shortcut. Desktop categories, search (Ctrl/Cmd+K), favorites and recent apps. Preferences are browser-local and scoped to the signed-in account; they do not change private records or sync across devices.

No prototype missions or generated XP are imported. Classic-only advanced finance, expenses, Car and AI Inbox remain explicit external links to the existing backup. Account menu/sign-out and existing auth/backend contracts remain intact. No database migration, secret rotation or Classic code change. PR #150 is outside this release.

Validation: 504 repository tests, 22 React tests, TypeScript after route generation and Vercel-preset build passed locally. Browser validation runs in CI with synthetic intercepted authentication and data; it does not claim verification of personal records or real RLS. Local browser download is blocked/truncated in this runtime; CI must pass before public alias promotion.

Rollback: assign renzo-hub.vercel.app back to deployment dpl_J2eYcpZGUjaawQfwpYhA637QXKwm in team team_O49izvhMSwZ4B3jpbkQ8sVMH using Vercel assign_alias. This restores the pre-navigation React release without changing database records. Emergency Classic backup remains https://rise-hub-classic-renzojesus99-1996.vercel.app/ (dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr). UI preferences may remain in localStorage after rollback; no XP/progress is reverted.

Production target: rise-hub-nocturne-qa (prj_32rPUdYicngL3YfAPKPWecBGXsNw), despite its historical name. Verify production Supabase mgncykyrhavpepfggmng and /api/ares-ai before alias promotion. Exact deployment, commit and CI evidence are recorded in the release PR and issue #143.
