import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ares-ai.js";
const KEYS=["VERCEL_ENV","ARES_AI_ENABLED","ARES_AI_SHARE_PROJECT_DATA","OPENROUTER_API_KEY","SUPABASE_URL","SUPABASE_PUBLISHABLE_KEY"];
const initial=Object.fromEntries(KEYS.map(k=>[k,process.env[k]]));
const full={VERCEL_ENV:"preview",ARES_AI_ENABLED:"true",ARES_AI_SHARE_PROJECT_DATA:"true",OPENROUTER_API_KEY:"secret-test-key",
  SUPABASE_URL:"https://example.supabase.co",SUPABASE_PUBLISHABLE_KEY:"publishable-test"};
function env(v){for(const k of KEYS)delete process.env[k];Object.assign(process.env,v);}
async function ask(method="GET",headers={},body={}){
 const res={code:0,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.code=n;return this;},json(payload){this.body=payload;return this;}};
 await handler({method,headers,body},res);return res;
}
const headers={host:"staging.local",origin:"https://staging.local",authorization:"Bearer session-token"};
test("OpenRouter trial requires both active and explicit project-sharing consent",async()=>{
 env({VERCEL_ENV:"preview",OPENROUTER_API_KEY:"secret-test-key"});
 let r=await ask();assert.equal(r.body.enabled,false);assert.equal(r.body.model,"openrouter/free");
 env({...full,ARES_AI_SHARE_PROJECT_DATA:"false"});r=await ask();assert.equal(r.body.enabled,false);
 env(full);r=await ask();assert.equal(r.body.enabled,true);
});
test("Ares never allows an external model in production",async()=>{
 env({...full,VERCEL_ENV:"production"});
 const r=await ask("POST",headers,{question:"Mis proyectos"});
 assert.equal(r.code,403);
});
test("No authorization means no provider request",async()=>{
 env(full);const r=await ask("POST",{host:"staging.local"},{question:"Mis proyectos"});
 assert.equal(r.code,400);
});
test("Financial and secret-bearing questions are blocked before external API",async()=>{
 env(full);
 for(const question of ["Cuánto hay en mis nóminas?", "Muéstrame mis gastos de octubre", "Qué contraseña uso?"]){
  const r=await ask("POST",headers,{question});
  assert.equal(r.code,422,question);
 }
});
test("Authenticated trial sends only permitted record summaries to openrouter/free",async()=>{
 env(full);
 const oldFetch=global.fetch,calls=[];
 global.fetch=async(url,options={})=>{
  const target=String(url);calls.push({target,options});
  if(target.endsWith("/auth/v1/user"))return Response.json({id:"11111111-1111-4111-8111-111111111111"});
  if(target.includes("/rest/v1/hub_records"))return Response.json([
    {record_type:"renzo_project",title:"Dutch Academy",status:"active",occurred_at:"2026-10-13",payload:{output:"B1",secret:"MUST_NOT_SEND"}},
    {record_type:"renzo_task",title:"Aprender verbos",status:"Today",payload:{project:"Dutch Academy"}},
    {record_type:"renzo_finance",title:"Nómina privada",status:"pending",payload:{net:3000}},
    {record_type:"ares_operation",title:"Preparar B1",status:"pending_approval",payload:{agent:"Hermes",details:"MUST_NOT_SEND"}}
   ]);
  if(target==="https://openrouter.ai/api/v1/chat/completions")return Response.json({choices:[{message:{content:"Hay un proyecto llamado Dutch Academy."}}]});
  throw new Error("unexpected destination: "+target);
 };
 try{
  const r=await ask("POST",headers,{question:"Cómo va mi proyecto Dutch Academy"});
  assert.equal(r.code,200);assert.equal(r.body.model,"openrouter/free");assert.match(r.body.text,/Dutch Academy/);
  const post=calls.find(x=>x.target.includes("openrouter.ai"));
  assert.ok(post,"must reach OpenRouter, never OpenAI");
  const payload=JSON.parse(post.options.body);
  assert.equal(payload.model,"openrouter/free");
  const transmitted=JSON.stringify(payload);
  assert.ok(transmitted.includes("Dutch Academy"));
  assert.ok(!transmitted.includes("MUST_NOT_SEND"));
  assert.ok(!transmitted.includes("Nómina privada"));
  assert.ok(!transmitted.includes("net"));
  assert.ok(!transmitted.includes("3000"));
  assert.equal(post.options.headers.authorization,"Bearer secret-test-key");
 } finally {global.fetch=oldFetch;}
});
test("Empty staging Project Tracker never invents missing GitHub projects or consumes free requests",async()=>{
 env(full);
 const beforeFetch=global.fetch,calls=[];
 global.fetch=async(url)=>{
   const target=String(url);calls.push(target);
   if(target.endsWith("/auth/v1/user"))return Response.json({id:"11111111-1111-4111-8111-111111111111"});
   if(target.includes("/rest/v1/hub_records"))return Response.json([]);
   throw new Error("No external model call expected for empty tracker");
 };
 try{
   const r=await ask("POST",headers,{question:"¿Qué proyectos tengo en RISE HUB?"});
   assert.equal(r.code,200);
   assert.match(r.body.text,/Project Tracker.*staging/);
   assert.match(r.body.text,/NO significa/);
   assert.match(r.body.text,/GitHub/);
   assert.equal(r.body.model,null);
   assert.match(r.body.source,/Supabase staging/);
   assert.equal(calls.some(c=>c.includes("openrouter.ai")),false);
 }finally{global.fetch=beforeFetch;}
});
test("OpenRouter rate limit is surfaced so chat can use private fallback",async()=>{
 env(full);
 const previous=global.fetch;
 global.fetch=async(url)=>{
  const target=String(url);
  if(target.endsWith("/auth/v1/user"))return Response.json({id:"11111111-1111-4111-8111-111111111111"});
  if(target.includes("/rest/v1/hub_records"))return Response.json([{record_type:"renzo_project",title:"Test sample",status:"active",payload:{}}]);
  return new Response(null,{status:429});
 };
 try{const r=await ask("POST",headers,{question:"Mis proyectos"});assert.equal(r.code,429);}
 finally{global.fetch=previous;}
});
test.after(()=>{for(const [k,value] of Object.entries(initial)){if(value===undefined)delete process.env[k];else process.env[k]=value;}});
