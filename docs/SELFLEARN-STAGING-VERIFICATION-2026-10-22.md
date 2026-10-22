# SelfLearn official awards — staging verification log (2026-10-22)

**Scope:** Supabase staging project `zpueziugbezqxompwsol` only. Production `mgncykyrhavpepfggmng` remains unchanged.

## Applied and checked

- The SQL previously reviewed in `supabase/pending/20261022090000_selflearn_transactions.sql` was applied to staging using Supabase migration `20261022022652` with explicit user authorization.
- On staging, `selflearn_finalize_lesson(uuid,jsonb,jsonb)` and `selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text)` exist and are **SECURITY INVOKER**; `authenticated` has EXECUTE, `anon` does not.
- The `selflearn_guard_records` trigger exists and is enabled on `hub_records` and table RLS remains enabled.
- Read-only SQL smoke test passed: study-path unit `nl-a1-01` resolved unchanged, English course resolved `en`, word normalization transformed `Café` to `cafe`. No user data were read or written by that smoke test.
- PR #141 GitHub tests and authentic-image React build completed successfully for commit `b7d8c39c53c23c6d0b3ba4602165cc53d0f0cac9`.

## Pending gates (not claimed to pass)

1. Real authenticated E2E using two intentionally separate staging test identities: user A cannot see or alter B's checkpoints, XP, or FSRS cards.
2. Lesson completion twice/retry/concurrent calls must produce one award and one set of vocabulary; old classic course awards must not be credited again.
3. FSRS review with stale `updated_at`, repeated `reviewId` and concurrent attempts must not lose scheduled due dates.
4. Classic SelfLearn and Nocturne used sequentially and concurrently to verify conflict handling; local/offline and PWA restarts must recover the same checkpoints.
5. Back up affected staging tables and rehearse the documented rollback before enabling `VITE_ENABLE_SELFLEARN_AWARDS`. Keep the switch disabled until gates pass.
6. Independently review the trust boundary: user-owned checkpoint payloads are not proof of a cheat-resistant score; rewards are a personal habit feature, not certification.
7. Final rollout requires parity with the other existing microapps, staging React deployment, mobile validation, branch reconciliation and a verified rollback.

**No production deployment or automatic feature flag activation is authorized by these checks alone.**

The SQL source remains at `supabase/pending/` as a record of the exact approved file; do not reapply it to staging or apply it to production just because it appears in Git. The live staging migration registry records the applied version.
