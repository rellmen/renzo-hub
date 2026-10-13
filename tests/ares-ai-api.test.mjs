import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ares-ai.js";
const before=Object.fromEntries(["VERCEL_ENV","ARES_AI_ENABLED","ARES_AI_API_KEY","ARES_AI_MODEL","SUPABASE_URL","SUPABASE_PUBLISHABLE_KEY"].map(k=>[k,process.env[k]]));
const call=async(method="GET",headers={},body={})=>{
 const res={code:0,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.code=n;return this;},json(data){this.body=data;return this;}};
 await handler({method,headers,body},res);return res;
};
const env=(fields)=>{for(const k of Object.keys(before))delete process.env[k];Object.assign(process.env,fields);};
test("External model is off unless all three settings are supplied in preview",async()=>{
 env({VERCEL_ENV:"preview"});assert.deepEqual((await call()).body,{enabled:false});
 env({VERCEL_ENV:"preview",ARES_AI_ENABLED:"true",ARES_AI_API_KEY:"example",ARES_AI_MODEL:"example"});assert.deepEqual((await call()).body,{enabled:true});
});
test("AI provider is never reachable through production",async()=>{
 env({VERCEL_ENV:"production",ARES_AI_ENABLED:"true",ARES_AI_API_KEY:"example",ARES_AI_MODEL:"example"});
 const result=await call("POST",{origin:"https://renzo-hub.vercel.app",host:"renzo-hub.vercel.app",authorization:"Bearer mock"},{question:"hi"});
 assert.equal(result.code,403);
});
test("Disabled AI cannot send any user information",async()=>{
 env({VERCEL_ENV:"preview"});
 const result=await call("POST",{origin:"https://preview.vercel.app",host:"preview.vercel.app"},{question:"my projects"});
 assert.equal(result.code,503);
});
test("Missing authenticated user cannot invoke enabled model",async()=>{
 env({VERCEL_ENV:"preview",ARES_AI_ENABLED:"true",ARES_AI_API_KEY:"example",ARES_AI_MODEL:"example"});
 const result=await call("POST",{host:"preview.vercel.app"},{question:"projects"});
 assert.equal(result.code,400);
});
test.after(()=>{for(const [key,value] of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
