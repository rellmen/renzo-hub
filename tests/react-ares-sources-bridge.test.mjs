import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import sourcesHandler,{simplifyGitHub} from "../apps/rise-react/server/ares-sources.mjs";

function reply(){
 let code=200,payload={};
 const x={setHeader(){return x;},status(n){code=n;return x;},json(v){payload=v;return x;},
  result(){return {code,payload}}};return x;
}
test("Nocturne mounts sources behind the legacy read-only authenticated handler",()=>{
 const code=readFileSync("apps/rise-react/src/server.ts","utf8");
 assert.match(code,/server\/ares-sources\.mjs/);
 assert.match(code,/\/api\/ares-sources/);
});
test("Source endpoint rejects missing authorization and never reads GitHub anonymously",async()=>{
 const env=process.env.VERCEL_ENV;
 try{
  process.env.VERCEL_ENV="preview";
  const x=reply();
  await sourcesHandler({method:"GET",headers:{host:"example.test"}},x);
  assert.equal(x.result().code,401);
  const forbidden=reply();
  await sourcesHandler({method:"POST",headers:{host:"example.test",authorization:"Bearer test"}},forbidden);
  assert.equal(forbidden.result().code,405);
 }finally{
  if(env===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=env;
 }
});
test("Source summaries exclude private titles and remain view-only",()=>{
 const data=simplifyGitHub({commits:[{sha:"abc",commit:{message:"API key was rotated",committer:{date:"2026-10-22"}}},{sha:"def",commit:{message:"Clean read-only status",committer:{date:"2026-10-22"}}}],issues:[{number:1,title:"Salary private"},{number:2,title:"UI status view"}]});
 assert.equal(data.commits.length,1);
 assert.equal(data.issues.length,1);
 assert.equal(data.commits[0].title,"Clean read-only status");
 assert.equal(data.issues[0].title,"UI status view");
});
