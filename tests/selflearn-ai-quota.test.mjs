import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const api=readFileSync(new URL("../api/selflearn-tutor.js",import.meta.url),"utf8");
const sql=readFileSync(new URL("../supabase/pending/20261019030000_selflearn_tutor_quota.sql",import.meta.url),"utf8");
test("external AI requests need explicit variables (enabled, limit ready, key) in preview or production",()=>{
 assert.match(api,/\["preview","production"\]\.includes\(process\.env\.VERCEL_ENV\)/);
 assert.match(api,/SELFLEARN_AI_RATE_LIMIT_READY/);
 assert.match(api,/SELFLEARN_AI_LIMIT_READY/);
 assert.match(api,/on\(process\.env\.SELFLEARN_AI_ENABLED\)/);
});
test("authenticated quota is consumed before contacting OpenRouter",()=>{
 assert.match(api,/rpc\/selflearn_tutor_take_quota/);
 assert(api.indexOf("rpc/selflearn_tutor_take_quota")<api.indexOf("https://openrouter.ai/api/v1/chat/completions"));
 assert.match(api,/if\(!quota\.ok\)return send\(res,503/);
});
test("quota SQL uses auth.uid, atomic conflict update and denies table access",()=>{
 assert.match(sql,/auth\.uid\(\)/);
 assert.match(sql,/on conflict\(owner_id,quota_day\) do update/);
 assert.match(sql,/requests < 12/);
 assert.match(sql,/enable row level security/);
 assert.match(sql,/revoke all on public\.selflearn_tutor_quota from anon, authenticated/);
 assert.match(sql,/grant execute on function public\.selflearn_tutor_take_quota\(\) to authenticated/);
});
