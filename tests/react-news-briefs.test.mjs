import test from "node:test";
import assert from "node:assert/strict";
import {filterBriefs,newBrief,saveBrief,loadBriefs,safeUrl} from "../apps/rise-react/src/lib/news-briefs.mjs";
const rows=[{id:"1",source:"Claude",title:"IA semanal",content:"modelos"},{id:"2",source:"Codex",title:"Repo",content:"PR #150"}];
test("News filters by source and text like Classic plus search",()=>{
 assert.deepEqual(filterBriefs(rows,{source:"Codex"}).map(r=>r.id),["2"]);
 assert.deepEqual(filterBriefs(rows,{text:"MODELOS"}).map(r=>r.id),["1"]);
 assert.equal(filterBriefs(rows).length,2);
});
test("New brief validation: source allowlist, date, length and https-only links",()=>{
 const v={source:"Claude",title:" T ",brief_date:"2026-10-23",content:"x",source_url:""};
 assert.deepEqual(newBrief(v),{source:"Claude",title:"T",brief_date:"2026-10-23",content:"x",source_url:null});
 assert.throws(()=>newBrief({...v,source:"Other"}),/Fuente/);
 assert.throws(()=>newBrief({...v,brief_date:"2026-02-30"}),/Fecha/);
 assert.throws(()=>newBrief({...v,source_url:"javascript:alert(1)"}),/https/);
 assert.equal(safeUrl("http://x.test"),null);
});
test("Save inserts owner-scoped row with stable id; load rejects foreign rows",async()=>{
 let inserted;const client={from:()=>({insert:async r=>{inserted=r;return {error:null};}})};
 await saveBrief(client,"u",{source:"Codex",title:"t",brief_date:"2026-10-23",content:"c"},"id-1");
 assert.equal(inserted.user_id,"u");assert.equal(inserted.id,"id-1");
 const q={select(){return q;},eq(){return q;},order(){return q;},limit:async()=>({data:[{user_id:"x"}],error:null})};
 await assert.rejects(loadBriefs({from:()=>q},"u"),/otra cuenta/);
});
