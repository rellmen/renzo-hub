import test from "node:test";
import assert from "node:assert/strict";
import {verifiedLevelFor,summarizeVerifiedXP} from "../apps/rise-react/src/lib/xp-overview.mjs";

test("Quest levels preserve the exact original quadratic XP thresholds",()=>{
 assert.deepEqual(verifiedLevelFor(0),{level:1,next:50,toNext:50,rank:"E",percent:0});
 assert.deepEqual(verifiedLevelFor(49),{level:1,next:50,toNext:1,rank:"E",percent:98});
 assert.deepEqual(verifiedLevelFor(50),{level:2,next:200,toNext:150,rank:"E",percent:0});
 assert.equal(verifiedLevelFor(50*4*4).level,5);
 assert.equal(verifiedLevelFor(50*9*9).rank,"C");
 assert.throws(()=>verifiedLevelFor(Number.NaN),/finito/);
});
test("Quest progress only uses unique persisted XP events",()=>{
 const event=(id,points)=>({id,record_type:"xp_event",payload:{sourceId:id,points,date:"2026-10-22"}});
 const result=summarizeVerifiedXP([event("a",20),event("b",30),event("a",999),{id:"other",record_type:"renzo_event",payload:{points:9000}}]);
 assert.equal(result.points,50);
 assert.equal(result.duplicates,1);
 assert.equal(result.progress.level,2);
 assert.equal(result.events.length,2);
});
