import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import tutorApi from "../apps/rise-react/api/selflearn-tutor.js";
import tutorHandler from "../apps/rise-react/server/selflearn-tutor.mjs";
import sourcesApi from "../apps/rise-react/api/ares-sources.js";
import sourcesHandler from "../apps/rise-react/server/ares-sources.mjs";

test("Vercel file-system entries export the same guarded server handlers",()=>{
 assert.strictEqual(tutorApi,tutorHandler);
 assert.strictEqual(sourcesApi,sourcesHandler);
});
test("Tutor React accepts the server feedback contract without removing text compatibility",()=>{
 const page=readFileSync(new URL("../apps/rise-react/src/components/rise/SelfLearnTutor.tsx",import.meta.url),"utf8");
 assert.match(page,/data\?\.text\?\?data\?\.feedback/);
 const server=readFileSync(new URL("../apps/rise-react/server/selflearn-tutor.mjs",import.meta.url),"utf8");
 assert.match(server,/feedback:raw\.trim\(\)\.slice/);
});
