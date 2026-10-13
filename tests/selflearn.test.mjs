import test from "node:test";
import assert from "node:assert/strict";
import {foundationLessons, expansionLessons, DUTCH_LEVELS} from "../microapps/selflearn/catalog.js";
import {fsrs, createEmptyCard, Rating} from "../microapps/selflearn/fsrs-bundle.js";

test("SelfLearn: itinerario A0–B2 con unidades completas y vocabulario usable",()=>{
 const legacyCount=7;
 const units=[...foundationLessons,...expansionLessons];
 assert.equal(DUTCH_LEVELS.map(x=>x.id).join(","),"A0,A1,A2,B1,B2");
 assert.equal(new Set(units.map(x=>x.id)).size,units.length);
 assert.equal(units.length+legacyCount,33);
 for(const level of DUTCH_LEVELS)assert.ok(units.some(x=>x.level===level.id)||level.id==="A1");
 for(const item of units){
  assert.equal(item.words.length,4,item.id);
  assert.ok(item.words.every(pair=>pair.length===2&&pair.every(Boolean)));
  for(const key of ["title","focus","phrase","translation","grammar","challenge"])assert.ok(item[key],item.id+" missing "+key);
 }
});

test("SelfLearn: FSRS permite ratings y serialización para sincronizar vocabulario",()=>{
 const card=createEmptyCard(new Date("2026-10-13T10:00:00.000Z"));
 const f=fsrs();
 const result=f.next(card,new Date("2026-10-13T10:00:00.000Z"),Rating.Good);
 assert.ok(result.card.due instanceof Date);
 assert.ok(Number.isFinite(result.card.stability));
 const saved=JSON.parse(JSON.stringify(result.card));
 const revived={...saved,due:new Date(saved.due),last_review:saved.last_review?new Date(saved.last_review):undefined};
 const second=f.next(revived,new Date("2026-10-15T10:00:00.000Z"),Rating.Easy);
 assert.ok(second.card.reps>result.card.reps);
});
