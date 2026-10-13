import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ares-dispatch.js";

const OP = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const baseEnv = {
  VERCEL_ENV:"preview",
  SUPABASE_URL:"https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY:"public-test",
  ARES_JARVIS_DISPATCH_ENABLED:"true",
  JARVIS_WEBHOOK_URL:"https://example.invalid/jarvis",
  JARVIS_OUTBOUND_TOKEN:"test-outbound"
};
const invoke = async({status="approved",reserve=true,accepted=true,owner=USER,config=baseEnv,method="POST",access="Bearer token"}={}) => {
  const previous = Object.fromEntries(Object.keys(baseEnv).map(k=>[k,process.env[k]]));
  const oldFetch = global.fetch;
  Object.assign(process.env,config);
  for(const k of Object.keys(baseEnv))if(!(k in config))delete process.env[k];
  const calls=[];
  global.fetch=async (url,opt={})=>{
    const u=String(url),method=opt.method||"GET";
    calls.push({url:u,method,body:opt.body});
    if(u.endsWith("/auth/v1/user"))
      return Response.json({id:owner},{status:200});
    if(u.includes("/rest/v1/hub_records")&&method==="GET")
      return Response.json([{id:OP,title:"Tarea Jarvis",status,payload:{
        agent:"Jarvis",details:"Preparar resumen",executionStatus:"not_connected",executed:false
      }}]);
    if(u.includes("/rest/v1/hub_records")&&method==="PATCH")
      return Response.json(calls.filter(c=>c.method==="PATCH").length===1&&!reserve?[]:[{id:OP}]);
    if(u==="https://example.invalid/jarvis")
      return new Response(null,{status:accepted?202:500});
    throw Error("Unexpected network request: "+u);
  };
  const req={method,headers:{authorization:access,host:"staging.example",origin:"https://staging.example"},
    body:{operationId:OP}};
  const res={code:0,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},
    json(body){this.body=body;return this;}};
  try {await handler(req,res);return {res,calls};}
  finally{
    global.fetch=oldFetch;
    for(const [k,v] of Object.entries(previous))if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
};
test("ARES executor refuses production even with credentials",async()=>{
  const {res,calls}=await invoke({config:{...baseEnv,VERCEL_ENV:"production"}});
  assert.equal(res.code,403);assert.equal(calls.length,0);
});
test("ARES executor refuses missing explicit dispatch flag",async()=>{
  const env={...baseEnv};delete env.ARES_JARVIS_DISPATCH_ENABLED;
  const {res,calls}=await invoke({config:env});
  assert.equal(res.code,503);assert.equal(calls.length,0);
});
test("ARES executor refuses operation without approval",async()=>{
  const {res,calls}=await invoke({status:"pending_approval"});
  assert.equal(res.code,409);assert.equal(calls.some(c=>c.method==="POST"),false);
});
test("ARES executor sends only one previously approved task",async()=>{
  const {res,calls}=await invoke();
  assert.equal(res.code,200);assert.equal(res.body.submitted,true);assert.equal(res.body.executed,false);
  assert.equal(calls.filter(c=>c.method==="POST").length,1);
  const sent=calls.find(c=>c.method==="POST");
  const envelope=JSON.parse(sent.body);
  assert.equal(envelope.record.type,"task");assert.equal(envelope.record.eventId,OP);
  const patches=calls.filter(c=>c.method==="PATCH");
  assert.equal(patches.length,2);
  assert.equal(JSON.parse(patches[0].body).status,"dispatching");
  assert.equal(JSON.parse(patches[1].body).status,"submitted");
  assert.equal(JSON.parse(patches[1].body).payload.executed,false);
});
test("ARES executor never dispatches a second sender when atomic reservation fails",async()=>{
  const {res,calls}=await invoke({reserve:false});
  assert.equal(res.code,409);assert.equal(calls.filter(c=>c.method==="POST").length,0);
});
test("ARES executor marks failed or ambiguous delivery and does not auto-retry",async()=>{
  const {res,calls}=await invoke({accepted:false});
  assert.equal(res.code,502);assert.equal(res.body.status,"delivery_unknown");
  assert.equal(calls.filter(c=>c.method==="POST").length,1);
  assert.equal(JSON.parse(calls.filter(c=>c.method==="PATCH").at(-1).body).status,"delivery_unknown");
});
test("ARES executor rejects missing bearer session before any network call",async()=>{
  const {res,calls}=await invoke({access:""});
  assert.equal(res.code,400);assert.equal(calls.length,0);
});
