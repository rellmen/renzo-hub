# Nocturne integral migration implementation plan

**Goal:** complete the F1–F5 parity and reversible migration requested by Renzo in one branch and one PR.
**Architecture:** preserve the authenticated React frontend and existing per-environment Supabase data contracts. Reuse verified domain services; no database replacement or browser-profile extraction.
**Spec:** `docs/REACT-MIGRATION-LOVABLE.md` plus the current user request.
**Execution:** inline, as explicitly requested; do not wait for another planning approval.

## Global constraints
- One feature branch from current staging; one PR targeting staging.
- Keep production functional; publish only validated commits.
- Preserve owner IDs, payloads, timestamps, files and financial review requirements.
- No destructive migrations, no credentials or personal backups in Git.
- Missing browser-local data requires an explicit export, never guessed access.

## Review focus
- Dollar-quoted SQL payloads must survive backup restoration byte-for-byte.
- Export pagination must not silently omit rows/files or another owner's data.
- Conflicting offline/browser values must not overwrite confirmed cloud records.
- Preview builds must preserve environment isolation and classic rescue access.
- Read-only coverage is not full domain parity or authenticated QA.

## Tasks
1. Audit current Git/Vercel/Supabase and create private backups. Verify bundle integrity and restore snapshots offline; record exclusions (auth, binary storage, technical quota).
2. Harden backup/restore before any data migration. Tests first for literal SQL delimiters, invalid identifiers, failed exports, missing owners, file limits and pagination. Reuse the data-only exporter from React Settings.
3. Inventory every requested domain against actual route/service/write capabilities. Add missing modules in dependency order: payroll/shift, finance/expenses, career/work, Ares/Quest/Inbox/Monitor; preserve classic fallback until parity tests pass.
4. Validate root and React suites, original assets, build, mobile/PWA and staging isolation. Store evidence per phase; never infer authenticated/iPhone success from mocks.
5. Prepare reversible release and a single PR. Cutover remains blocked until parity, authenticated staging and rollback gates pass. Record precise required user intervention only when it cannot be completed with available access.

## Progress
- Initial branch: staging `a29412fda98ed9ac898ea461fe4795683b13c5f9`.
- Supabase: both projects ACTIVE_HEALTHY; all 22 public tables RLS enabled.
- Private public-table snapshots and complete Git bundle saved outside the checkout under sibling `backups/`, mode 600 (directory 700).
- Retrieved conversation contains unresolved assistant references, so the checked-in F0–F5 migration contract is the recoverable scope source; do not claim exact recovery of the absent inventory.
