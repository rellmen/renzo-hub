import test from "node:test";
import assert from "node:assert/strict";
import {mergeLearningEntries,mergeLearningRuns,reconcileLearningSnapshots,SYNC_REQUIREMENTS} from "../microapps/selflearn/sync.js";
test("keeps distinct history from both devices",()=>{
 const a={id:"a",course:"nl",kind:"learning"},b={id:"b",course:"en",kind:"learning"};
 const rows=mergeLearningEntries([a],[b]);assert.deepEqual(new Set(rows.map(x=>x.id)),new Set(["a","b"]));
});
test("same ID uses newer timestamp without mutating sources",()=>{
 const old={id:"a",date:"2026-10-18",note:"old"},recent={id:"a",date:"2026-10-19",note:"new"};
 const merged=mergeLearningEntries([old],[recent]);
 assert.equal(merged.length,1);assert.equal(merged[0].note,"new");assert.equal(old.note,"old");
});
test("legacy rows without IDs are never silently deleted",()=>{
 const rows=mergeLearningEntries([{lessonDay:1}],[{lessonDay:2}]);assert.equal(rows.length,2);
});
test("malformed run snapshots are rejected without losing valid entries",()=>{
 const result=reconcileLearningSnapshots({entries:[{id:"saved"}],learningRuns:{nl:{version:-1}}},{entries:[],learningRuns:{}});
 assert.equal(result.entries.length,1);assert.deepEqual(result.learningRuns,{});
});
test("sync helper does not claim remote writes or ownership verification",()=>{
 assert.equal(SYNC_REQUIREMENTS.remoteWritePerformed,false);assert.equal(SYNC_REQUIREMENTS.sameAuthenticatedUser,true);
 assert.equal(SYNC_REQUIREMENTS.atomicWriteRequired,true);
});
