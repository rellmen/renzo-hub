# SelfLearn PR #94 — release gates (19 October 2026)

**Status: NOT READY TO MERGE.** Draft PR only. No production changes or database migrations executed.

## Implemented on feature branch
- NL A1–B2 and EN B1–C1 study paths; diagnostic and grammar drills; spaced repetition.
- Local tutor, opt-in speech transcription and preview-only AI tutor.
- AI tutor sends only the explicitly submitted answer after checkbox consent and Supabase session verification. The remote controls are hidden unless the preview capability endpoint confirms availability.
- Preview-only AI endpoint is disabled unless `SELFLEARN_AI_ENABLED=true`, `SELFLEARN_AI_RATE_LIMIT_READY=true` and a provider key exist.
- Atomic 12 requests/user/UTC day quota SQL supplied but **not applied**. The endpoint fails closed when quota RPC is absent.
- Authenticated cloud reconciliation and local save; repeat legacy merges deduplicated; PWA cache v56.

## Blocking release verification
1. Run `npm test`, `npm run check`, `npm run build:selflearn` and rerun `npm test` on the final branch. Fix all failures. CI results are currently not confirmed.
2. Verify database RLS for `hub_user_state`, `hub_records` and `renzo_vocabulary` with two separate test accounts, including denied cross-user reads/writes.
3. Validate on two authenticated browsers: complete lesson, review FSRS card, refresh, switch device, finish lesson, go offline and reconnect. Verify no duplicate history, no lost run and preserved due dates.
4. Test two devices editing concurrently. Current last-writer-wins state upsert is **not atomic cross-device reconciliation**; do not claim conflict-free sync.
5. Verify privacy and deletion behavior for local tutor answers and diagnostic writing; no external submission without explicit per-request consent.
6. Review the SQL migration in staging before enabling any AI flag. Confirm quota and response on 12th/13th request; verify no paid model is selected. Keep disabled in production.
7. Inspect accessibility and microphone permissions on mobile, ensure tap targets and focus visibility.
8. Reconcile `main` (branch currently diverged), resolve `sw.js` and tests carefully, rerun CI and request Claude review. No merge without explicit user approval.

## Rollback
Disable `SELFLEARN_AI_ENABLED` immediately if the provider, quota or privacy checks fail. Keep local tutor usable. Revert preview feature branch changes rather than editing production data.

## Current limitations
No successful end-to-end test, CI pass, staging migration, two-device verification or independent Claude review has been evidenced. Do not mark the phase completed until these gates pass.
