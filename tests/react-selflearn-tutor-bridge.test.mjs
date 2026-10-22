import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import handler from "../apps/rise-react/server/selflearn-tutor.mjs";
function res(){
 const headers={};let status=200,body=null;
 const sink={setHeader(k,v){headers[k]=v;return sink;},status(n){status=n;return sink;},
  json(x){body=x;return sink;},get(){return{headers,status,body};}};
 return sink;
}
test("Nocturne API router mounts the same authenticated tutor handler as classic",()=>{
 const source=readFileSync("apps/rise-react/src/server.ts","utf8");
 assert.match(source,/server\/selflearn-tutor\.mjs/);
 assert.match(source,/\/api\/selflearn-tutor/);
});
test("SelfLearn tutor is disabled by default and does not disclose provider credentials",async()=>{
 const keep={VERCEL_ENV:process.env.VERCEL_ENV,SELFLEARN_AI_ENABLED:process.env.SELFLEARN_AI_ENABLED,
  SELFLEARN_AI_LIMIT_READY:process.env.SELFLEARN_AI_LIMIT_READY,SELFLEARN_AI_RATE_LIMIT_READY:process.env.SELFLEARN_AI_RATE_LIMIT_READY,
  OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY};
 try{
  process.env.VERCEL_ENV="preview";process.env.SELFLEARN_AI_ENABLED="false";
  process.env.SELFLEARN_AI_LIMIT_READY="false";process.env.SELFLEARN_AI_RATE_LIMIT_READY="false";
  delete process.env.OPENROUTER_API_KEY;
  const get=res();await handler({method:"GET",headers:{}},get);
  assert.equal(get.get().status,200);assert.equal(get.get().body.enabled,false);
  const post=res();await handler({method:"POST",headers:{},body:{course:"nl",mode:"writing",answer:"Hallo",consent:true}},post);
  assert.equal(post.get().status,503);
  assert.equal(post.get().body.error.includes("desactivado"),true);
  assert(!JSON.stringify(get.get()).includes("OPENROUTER_API_KEY"));
 }finally{for(const[k,v]of Object.entries(keep)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
