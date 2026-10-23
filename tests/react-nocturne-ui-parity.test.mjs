import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  officialSelfLearnAwardsEnabled,
  backendEnvironmentForHost,
} from "../apps/rise-react/src/lib/nocturne-environment.mjs";

const read=path=>readFileSync(new URL("../apps/rise-react/src/"+path,import.meta.url),"utf8");

test("SelfLearn page status uses the same authenticated backend capability as lesson awards",()=>{
  const page=read("routes/aprender.tsx");
  const checkpoint=read("components/rise/SelfLearnCheckpointPractice.tsx");
  assert.match(page,/useSelfLearnCapabilities\(client,uid\)/);
  assert.match(page,/officialSelfLearnAwardsEnabled\([\s\S]*?backendReady/);
  assert.match(page,/\{awardsAvailable\?/);
  assert.doesNotMatch(page,/awardsInStaging\(/);
  assert.match(checkpoint,/useSelfLearnCapabilities\(client,uid\)/);
  assert.match(checkpoint,/officialSelfLearnAwardsEnabled\([\s\S]*?backendReady/);
});

test("Production SelfLearn award flag fails closed until backend capability is verified",()=>{
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:"renzo-hub.vercel.app",releaseTarget:"production",backendReady:false}),false);
  assert.equal(officialSelfLearnAwardsEnabled(false,{hostname:"renzo-hub.vercel.app",releaseTarget:"production",backendReady:true}),false);
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:"renzo-hub.vercel.app",releaseTarget:"production",backendReady:true}),true);
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:"rise-hub-nocturne-qa.vercel.app",releaseTarget:"preview",backendReady:true}),true);
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:"rise-hub-nocturne-qa.vercel.app",releaseTarget:"preview",backendReady:false}),false);
  assert.equal(backendEnvironmentForHost("rise-hub-nocturne-qa.vercel.app"),"staging");
});

test("Mobile More indicates all grouped finance and wellness routes as active",()=>{
  const shell=read("components/rise/AppShell.tsx");
  const nav=shell.match(/const moreActive\s*=\s*\[([^\]]+)\]/);
  assert.ok(nav,"More route group must exist");
  for(const route of ["/gastos","/dinero","/nominas","/turnos","/body","/food","/piel"]){
    assert.match(nav[1],new RegExp('"'+route+'"'),route+" is missing from More active routes");
  }
});
