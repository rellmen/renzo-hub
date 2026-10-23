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
  for(const hostname of ['rise-hub-nocturne-qa.vercel.app','renzo-hub-2-1-staging.vercel.app','renzo-hub-2-1-staging-candidate.vercel.app']){
    for(const releaseTarget of ['', 'staging', 'preview']){
      assert.equal(officialSelfLearnAwardsEnabled(true,{hostname,releaseTarget,backendReady:false}),false);
      assert.equal(officialSelfLearnAwardsEnabled(true,{hostname,releaseTarget,backendReady:true}),true);
    }
    assert.equal(officialSelfLearnAwardsEnabled(true,{hostname,releaseTarget:'production',backendReady:true}),false);
  }
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:'renzo-hub.vercel.app',releaseTarget:'preview',backendReady:true}),false);
  assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:'localhost',releaseTarget:'typo',backendReady:true}),false);
});

test("Approved launcher (#152) reaches all grouped finance and wellness routes natively",()=>{
  // The old mobile "Más" group was replaced by the approved app launcher; every route must be a live entry.
  const shell=read("components/rise/AppShell.tsx");
  assert.match(shell,/<AppLauncher\s*\/>/,"Shell must mount the app launcher");
  const apps=read("lib/apps.ts");
  for(const route of ["/gastos","/dinero","/nominas","/turnos","/body","/food","/piel","/car","/inbox"]){
    assert.match(apps,new RegExp('kind: "live", to: "'+route+'"'),route+" must open natively from the launcher");
  }
});
