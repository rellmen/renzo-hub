# SelfLearn finalization implementation plan

Goal: continue PR #141 from staging #140, retaining existing records and default-off security gates.

1. Add regression tests for canonical lesson validation, old Daily lesson completion, stale remote legacy runs and retry outcomes.
2. Move official writes to an authenticated, invoker RPC transaction, checking the saved checkpoint and current legacy run. Prepare a pending migration and non-destructive rollback; protect concurrent classic/React awards at the shared table boundary.
3. Port legacy FSRS scheduling using the existing bundled engine. Persist review/card/event atomically with revision comparison and retry ID; expose a gated React vocabulary review panel.
4. Test real PostgreSQL behavior with PGlite: owner isolation, replay, stale revisions, atomic rollback, classic graduation and migration rollback. CI must also run browser regressions and the authentic React build.
5. Bump release/cache, record staging schema evidence and remaining approval gates, push the existing branch, verify final SHA CI. Never apply staging DDL or enable awards without Renzo approval.

Security limits: checkpoints/answers remain user-authored; this personal learning tracker does not certify achievement or provide tamper-proof grading. No production changes. No historical deletions or rewrites.
