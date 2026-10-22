import test from "node:test";
import assert from "node:assert/strict";
import {serveNodeHandler,DEFAULT_MAX_JSON_BYTES} from "../apps/rise-react/src/lib/server/node-handler.mjs";

const fakeHandler=(req,res)=>res.status(200).json({size:req.body?.value?.length||0});
const post=(value,headers={})=>new Request("https://qa.example/api/handler",{
  method:"POST",headers:{"content-type":"application/json",...headers},body:JSON.stringify({value})
});
test("default 16KiB remains fixed for Ares and SelfLearn",()=>{
  assert.equal(DEFAULT_MAX_JSON_BYTES,16384);
});
test("normal JSON request works",async()=>{
  const r=await serveNodeHandler(post("123"),fakeHandler);
  assert.equal(r.status,200);
  assert.equal((await r.json()).size,3);
});
test("large JSON remains rejected by default",async()=>{
  const r=await serveNodeHandler(post("x".repeat(20_000)),fakeHandler);
  assert.equal(r.status,413);
});
test("per-route opt-in accepts bounded large JSON",async()=>{
  const r=await serveNodeHandler(post("x".repeat(20_000)),fakeHandler,{maxBodyBytes:21_000});
  assert.equal(r.status,200);
});
test("per-route opt-in rejects JSON above the configured limit",async()=>{
  const r=await serveNodeHandler(post("x".repeat(21_000)),fakeHandler,{maxBodyBytes:21_000});
  assert.equal(r.status,413);
});
test("invalid JSON returns 400",async()=>{
  const r=await serveNodeHandler(new Request("https://qa.example/api/handler",{
    method:"POST",headers:{"content-type":"application/json"},body:"{bad"
  }),fakeHandler);
  assert.equal(r.status,400);
});
test("unsupported content-type returns 415",async()=>{
  const r=await serveNodeHandler(new Request("https://qa.example/api/handler",{
    method:"POST",headers:{"content-type":"text/plain"},body:"ok"
  }),fakeHandler);
  assert.equal(r.status,415);
});
test("3MiB PDF Base64 fits the future payroll-only budget",async()=>{
  const payload=Buffer.alloc(3*1024*1024,65).toString("base64");
  const r=await serveNodeHandler(new Request("https://qa.example/api/payroll-upload",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pdfBase64:payload})
  }),(req,res)=>res.status(201).json({ok:req.body.pdfBase64.length===payload.length}),
  {maxBodyBytes:Math.ceil(3*1024*1024/3)*4+65536});
  assert.equal(r.status,201);
  assert.equal((await r.json()).ok,true);
});
