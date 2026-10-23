import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {questsForDay,summarizeQuests,loadDailyQuests,shiftDay} from "../apps/rise-react/src/lib/quest-missions.mjs";
const ev=(date,p)=>({payload:{date,...p}});
test("Daily quests use the Classic rules on real records only",()=>{
 const d="2026-10-23";
 const events=[ev(d,{kind:"body"}),ev(d,{kind:"learning",stage:"Lesson"}),ev("2026-10-22",{kind:"output"})];
 let r=questsForDay(d,events,[]);
 assert.deepEqual(r.items.map(i=>i.done),[true,false,false,false]);
 r=questsForDay(d,[...events,ev(d,{kind:"learning",stage:"Review"}),ev(d,{kind:"project_done"})],[{payload:{date:d,reviewed:false}}]);
 assert.deepEqual(r.items.map(i=>i.done),[true,true,true,false]);
 r=questsForDay(d,events,[{payload:{date:d,reviewed:true}}]);
 assert.equal(r.items.find(i=>i.id==="money").done,true);
});
test("Streak counts consecutive complete days; incomplete today does not break it",()=>{
 const full=day=>[ev(day,{kind:"body"}),ev(day,{kind:"learning",stage:"Application"}),ev(day,{kind:"output"})];
 const money=day=>({payload:{date:day,reviewed:true}});
 const t="2026-10-23",y=shiftDay(t,-1),y2=shiftDay(t,-2),y4=shiftDay(t,-4);
 const s=summarizeQuests(t,[...full(y),...full(y2),...full(y4)],[money(y),money(y2),money(y4)]);
 assert.equal(s.week.length,7);assert.equal(s.streak,2);assert.equal(s.today.done,0);
});
test("Loader is owner-scoped, filtered by date and rejects foreign rows",async()=>{
 const seen=[];
 const client=rows=>({from(){const c={select(){return c;},eq(k,v){seen.push([k,v]);return c;},gte(k,v){seen.push([k,v]);return c;},order(){return c;},async range(){return {data:rows,error:null};}};return c;}});
 const r=await loadDailyQuests(client([{owner_id:"u",payload:{date:"2026-10-23",kind:"body"}}]),"u","2026-10-23");
 assert.equal(r.today.done,1);
 assert.ok(seen.some(([k,v])=>k==="owner_id"&&v==="u"));assert.ok(seen.some(([k,v])=>k==="payload->>date"&&v==="2026-10-17"));
 await assert.rejects(loadDailyQuests(client([{owner_id:"x",payload:{}}]),"u","2026-10-23"),/otra cuenta/);
});
test("Quest page never awards XP from render",()=>{
 const page=readFileSync(new URL("../apps/rise-react/src/routes/quest.tsx",import.meta.url),"utf8");
 assert.match(page,/loadDailyQuests/);assert.doesNotMatch(page,/\.insert\(|\.upsert\(/);
});
