import test from "node:test";
import assert from "node:assert/strict";
import handler,{simplifyGitHub} from "../api/ares-sources.js";
import {isDevelopmentQuestion,formatDevelopmentSources} from "../microapps/ares-development.js";

test("development-status queries select read-only GitHub/Vercel connector",()=>{
  assert.equal(isDevelopmentQuestion("¿En qué fase del proyecto RISE HUB estamos?"),true);
  assert.equal(isDevelopmentQuestion("¿Qué PRs quedan por revisar?"),true);
  assert.equal(isDevelopmentQuestion("¿Cuál fue el último despliegue de staging?"),true);
  assert.equal(isDevelopmentQuestion("¿Cómo van mis proyectos de Work?"),false);
  assert.equal(isDevelopmentQuestion("Pide a Claude que prepare algo"),false);
});
test("sources format includes evidence and does not invent completion percentage",()=>{
 const out=formatDevelopmentSources({
 github:{repository:"rellmen/renzo-hub",commits:[{sha:"abc1234567",title:"fix staging"}],pullRequests:[{number:51,title:"fix",base:"staging"}],issues:[],available:{commits:true,pullRequests:true,issues:true}},
 vercel:{project:"renzo-hub-2-1-staging",environment:"preview",deploymentBranch:"staging",deploymentCommit:"abc1234567"}
 });
 assert.match(out,/abc1234/);
 assert.match(out,/PRs?/);
 assert.match(out,/fase o un porcentaje/);
 assert.match(out,/Claude y Hermes/);
});
test("GitHub results filter corporate and sensitive issue titles",()=>{
 const o=simplifyGitHub({commits:[{sha:"1234567890",commit:{message:"Routine update"}},{sha:"1111111111",commit:{message:"Nodalys contract"}}],
 pulls:[{number:1,title:"RISE HUB UI",base:{ref:"staging"}},{number:2,title:"payroll private details"}],
 issues:[{number:3,title:"Ares doesn't answer questions"},{number:4,title:"Jarvis token secret"}]});
 assert.equal(o.commits.length,1);assert.equal(o.pullRequests.length,1);assert.equal(o.issues.length,1);
});
const keys=["VERCEL_ENV","VERCEL_PROJECT_NAME","VERCEL_GIT_COMMIT_SHA","VERCEL_GIT_COMMIT_REF","SUPABASE_URL","SUPABASE_PUBLISHABLE_KEY"];
const prev=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const config=()=>{
 Object.assign(process.env,{VERCEL_ENV:"preview",VERCEL_PROJECT_NAME:"renzo-hub-2-1-staging",VERCEL_GIT_COMMIT_SHA:"beefabcdef",VERCEL_GIT_COMMIT_REF:"staging",SUPABASE_URL:"https://example.supabase.co",SUPABASE_PUBLISHABLE_KEY:"test-public"});
};
const call=async(method="GET",headers={})=>{
 const res={code:null,setHeader(){return this},status(n){this.code=n;return this},json(data){this.data=data;return this;}};
 await handler({method,headers},res);return res;
};
test("sources reject production and unauthenticated requests",async()=>{
 config();process.env.VERCEL_ENV="production";
 let r=await call("GET",{authorization:"Bearer demo"});assert.equal(r.code,403);
 process.env.VERCEL_ENV="preview";r=await call();assert.equal(r.code,401);
 r=await call("POST");assert.equal(r.code,405);
});
test("authenticated read-only connector returns real-source structures without keys",async()=>{
 config();
 const oldFetch=global.fetch,calls=[];
 global.fetch=async(url)=>{
  const target=String(url);calls.push(target);
  if(target.endsWith("/auth/v1/user"))return Response.json({id:"11111111-1111-4111-8111-111111111111"});
  if(target.includes("/commits?"))return Response.json([{sha:"aabbccddeeff00112233",commit:{message:"Improve Ares",committer:{date:"2026-10-13T17:00:00Z"}},html_url:"https://github.com/rellmen/renzo-hub/commit/aabbcc"}]);
  if(target.includes("/pulls?"))return Response.json([{number:73,title:"Ares sources",base:{ref:"staging"},head:{ref:"feature/ares"},html_url:"https://github.com/rellmen/renzo-hub/pull/73"}]);
  if(target.includes("/issues?"))return Response.json([{number:75,title:"Add issue tracker",html_url:"https://github.com/rellmen/renzo-hub/issues/75"}]);
  throw Error("Unexpected URL "+target);
 };
 try{
  const r=await call("GET",{host:"staging.local",origin:"https://staging.local",authorization:"Bearer demo"});
  assert.equal(r.code,200);
  assert.equal(r.data.github.commits.length,1);
  assert.equal(r.data.github.pullRequests[0].number,73);
  assert.equal(r.data.github.issues[0].number,75);
  assert.equal(r.data.vercel.deploymentBranch,"staging");
  assert.equal(r.data.vercel.deploymentCommit,"beefabcdef");
  assert.equal(calls.filter(x=>x.includes("api.github.com")).length,3);
  assert.equal(calls.some(x=>x.includes("openrouter")),false);
  assert.equal(calls.some(x=>/rest\/v1\//.test(x)),false);
 }finally{global.fetch=oldFetch;}
});
test.after(()=>{
 for(const [k,v] of Object.entries(prev)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
