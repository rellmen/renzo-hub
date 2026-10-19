import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mergeLearningEntries} from "../microapps/selflearn/sync.js";
const world=readFileSync(new URL("../world.js",import.meta.url),"utf8");
test("authenticated load reconciles learning entries with cloud records",()=>{
 assert.match(world,/\.eq\("owner_id",owner\)/);
 assert.match(world,/k==="entries"\?mergeLearningEntries\(data\[k\],cloud\[k\]\)/);
});
test("learning merge retains remote and local completion records",()=>{
 const local=[{id:"a",kind:"learning",practice:"Study path",courseLessonId:"a1-legacy-1"}];
 const remote=[{id:"b",kind:"learning",practice:"Study path",courseLessonId:"a1-legacy-2"}];
 assert.deepEqual(new Set(mergeLearningEntries(local,remote).map(x=>x.id)),new Set(["a","b"]));
});
test("local-only records are marked for upload instead of treated as synced",()=>{
 assert.match(world,/else hasLocalOnlyRows=true/);
 assert.match(world,/if\(\(!stateRow&&local\)\|\|hasLocalOnlyRows\|\|stateNeedsSync\)/);
});
