import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../apps/rise-react/src/lib/career-records.mjs";
const U="22222222-2222-4222-8222-222222222222";
test("Career payload validation per kind; nothing invented",()=>{
 assert.throws(()=>c.careerPayload("x",{title:"a"}),/Tipo/);
 assert.throws(()=>c.careerPayload("course",{title:""}),/título/);
 assert.throws(()=>c.careerPayload("course",{title:"PL-300",status:"completed"}),/fecha/);
 const done=c.careerPayload("course",{title:"PL-300",status:"completed",completedOn:"2026-10-01",provider:"Microsoft"});
 assert.equal(done.completedOn,"2026-10-01");
 assert.equal(c.careerPayload("course",{title:"PL-300",status:"planned",completedOn:"2026-10-01"}).completedOn,null);
 assert.throws(()=>c.careerPayload("skill",{title:"SQL",level:"7"}),/Nivel/);
 assert.equal(c.careerPayload("skill",{title:"SQL",level:"3",area:"Hack"}).area,"Otro");
 assert.throws(()=>c.careerPayload("project",{title:"Dashboard",url:"http://x"}),/https/);
 const prev={evidence:[{path:"p"}]};
 assert.deepEqual(c.careerPayload("project",{title:"Dashboard"},prev).evidence,prev.evidence,"edits keep evidence");
});
test("Summary and ordering exclude archived from counts",()=>{
 const rows=[{status:"completed",payload:{kind:"course"}},{status:"archived",payload:{kind:"skill"}},{status:"in_progress",payload:{kind:"course"}}];
 const s=c.careerSummary(rows);assert.equal(s.courses.length,2);assert.equal(s.completed,1);assert.equal(s.archived,1);
 assert.equal(c.sortCareer(rows)[0].status,"in_progress");
});
test("Evidence paths are confined to the owner's career folder",()=>{
 assert.equal(c.evidencePath(U,`${U}/career/x/h-a.pdf`),`${U}/career/x/h-a.pdf`);
 for(const bad of [`other/career/a.pdf`,`${U}/career/../x.pdf`,`${U}/payroll/a.pdf`,`${U}/career/a%2f.pdf`])assert.throws(()=>c.evidencePath(U,bad),/carpeta/);
});
function client(result,calls=[]){const ch={from(t){calls.push(["from",t]);return ch;},insert(r){calls.push(["insert",r]);return ch;},update(r){calls.push(["update",r]);return ch;},
 eq(k,v){calls.push(["eq",k,v]);return ch;},select(){return ch;},single:async()=>result,maybeSingle:async()=>result,
 storage:{from(b){calls.push(["bucket",b]);return {upload:async(p,f,o)=>{calls.push(["upload",p,o]);return {error:null};}};}}};return ch;}
test("Writes: owner-scoped insert with stable id; CAS update; archive keeps the row",async()=>{
 const calls=[];await c.addCareerItem(client({data:{id:"n"},error:null},calls),U,"skill",{title:"SQL",level:"2"},"id-1");
 const ins=calls.find(x=>x[0]==="insert")[1];
 assert.equal(ins.id,"id-1");assert.equal(ins.owner_id,U);assert.equal(ins.domain,"work");assert.equal(ins.record_type,"career_item");
 const row={id:"r",owner_id:U,updated_at:"2026-10-23T10:00:00Z",status:"active",payload:{kind:"skill",title:"SQL",level:2}};
 const up=[];await c.archiveCareerItem(client({data:{id:"r"},error:null},up),U,row);
 assert.ok(up.some(x=>x[0]==="eq"&&x[1]==="updated_at"));assert.deepEqual(up.find(x=>x[0]==="update")[1],{status:"archived"});
 assert.ok(!up.some(x=>x[0]==="delete"));
 await assert.rejects(c.updateCareerItem(client({data:null,error:null}),U,row,{title:"SQL",level:"3"}),/otro dispositivo/);
 await assert.rejects(c.updateCareerItem(client({data:{},error:null}),U,{...row,owner_id:"x"},{title:"a",level:"1"}),/Actualiza/);
});
test("Evidence upload: type/size checks, private bucket, hash path, no overwrite",async()=>{
 const row={id:"33333333-3333-4333-8333-333333333333",owner_id:U,updated_at:"t",payload:{kind:"project",title:"x"}};
 await assert.rejects(c.attachEvidence(client({}),U,row,new File(["x"],"a.exe",{type:"application/x-msdownload"})),/PDF/);
 const calls=[];const out=client({data:{id:row.id},error:null},calls);
 await c.attachEvidence(out,U,row,new File(["%PDF-1.4"],"cert final.pdf",{type:"application/pdf"}));
 const up=calls.find(x=>x[0]==="upload");
 assert.ok(calls.some(x=>x[0]==="bucket"&&x[1]==="portfolio-files"));
 assert.match(up[1],new RegExp(`^${U}/career/${row.id}/[0-9a-f]{64}-cert_final\\.pdf$`));
 assert.equal(up[2].upsert,false);
 const ev=calls.find(x=>x[0]==="update")[1].payload.evidence[0];
 await assert.rejects(c.attachEvidence(client({}),U,{...row,payload:{...row.payload,evidence:[ev]}},new File(["%PDF-1.4"],"again.pdf",{type:"application/pdf"})),/ya está adjunta/);
});
