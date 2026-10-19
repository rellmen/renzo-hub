import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const view=readFileSync(new URL("../microapps/selflearn/view.js",import.meta.url),"utf8");
const world=readFileSync(new URL("../world.js",import.meta.url),"utf8");
test("AI tutor requires per-request opt-in and does not replace local mode",()=>{
 assert.match(view,/name="aiConsent"/);assert.match(view,/v\.aiConsent!=="yes"/);
 assert.match(view,/localTutorResponse/);assert.match(view,/\/api\/selflearn-tutor/);
});
test("access token comes from Supabase session and is not stored in learning records",()=>{
 assert.match(world,/supabase\.auth\.getSession\(\)/);
 assert.match(view,/Authorization:"Bearer "\+token/);
 assert.doesNotMatch(view,/note:token/);
});
