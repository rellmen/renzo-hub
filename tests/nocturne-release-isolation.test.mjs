import test from 'node:test';
import assert from 'node:assert/strict';
import {
 SUPABASE_STAGING_URL,SUPABASE_PRODUCTION_URL,LEGACY_FALLBACK_URL,
 backendEnvironmentForHost,verifyNocturneBackendIsolation,officialSelfLearnAwardsEnabled
} from '../apps/rise-react/src/lib/nocturne-environment.mjs';

const stage={supabaseUrl:SUPABASE_STAGING_URL,publishableKey:'sb_publishable_fake_test_value_only'};
const prod={...stage,supabaseUrl:SUPABASE_PRODUCTION_URL};
const verify=(cfg,hostname,releaseTarget='')=>verifyNocturneBackendIsolation(cfg,{hostname,releaseTarget});
test('Production host must NEVER authenticate against staging backend',()=>{
 assert.equal(backendEnvironmentForHost('renzo-hub.vercel.app'),'production');
 assert.equal(backendEnvironmentForHost('rise-hub-renzojesus99-1996.vercel.app'),'production');
 assert.equal(backendEnvironmentForHost('rise-hub-classic-renzojesus99-1996.vercel.app'),'production');
 assert.equal(verify(prod,'renzo-hub.vercel.app'),prod);
 assert.throws(()=>verify(stage,'renzo-hub.vercel.app'),/bloqueado/);
 assert.throws(()=>verify(stage,'rise-hub-renzojesus99-1996.vercel.app'),/bloqueado/);
});
test('Staging hosts must never accidentally connect to production backend',()=>{
 for(const hostname of [
  'renzo-hub-2-1-staging.vercel.app',
  'renzo-hub-2-1-staging-renzojesus99-1996.vercel.app',
  'renzo-hub-2-1-staging-abc123-renzojesus99-1996.vercel.app'
 ]){
   assert.equal(backendEnvironmentForHost(hostname),'staging');
   assert.equal(verify(stage,hostname),stage);
   assert.throws(()=>verify(prod,hostname),/bloqueado/);
 }
});
test('Explicit release target protects unique Vercel candidate URLs before alias flip',()=>{
 const candidate='rise-hub-nocturne-4g3k2-renzojesus99-1996.vercel.app';
 assert.equal(backendEnvironmentForHost(candidate),null);
 assert.equal(verify(prod,candidate,'production'),prod);
 assert.throws(()=>verify(stage,candidate,'production'),/bloqueado/);
 assert.equal(verify(stage,candidate,'staging'),stage);
 assert.throws(()=>verify(prod,'renzo-hub-2-1-staging.vercel.app','production'),/dominio/);
 assert.throws(()=>verify(stage,'renzo-hub.vercel.app','staging'),/dominio/);
 assert.throws(()=>verify(stage,candidate,'unknown'),/desconocido/);
});
test('Legacy fallback is immutable independent URL, not the primary production alias',()=>{
 const backup=new URL(LEGACY_FALLBACK_URL);
 assert.equal(backup.protocol,'https:');
 assert.equal(backup.hostname,'rise-hub-classic-renzojesus99-1996.vercel.app');
 assert.notEqual(backup.hostname,'renzo-hub.vercel.app');
});

test('XP/FSRS flag accidentally inherited by production never enables awards',()=>{
 for(const host of ['renzo-hub.vercel.app','rise-hub-renzojesus99-1996.vercel.app',
  'rise-hub-nocturne-candidate.vercel.app']){
   assert.equal(officialSelfLearnAwardsEnabled(true,{hostname:host,releaseTarget:'production'}),false);
 }
 assert.equal(officialSelfLearnAwardsEnabled(true,{
   hostname:'renzo-hub-2-1-staging.vercel.app',releaseTarget:'production'}),false);
 assert.equal(officialSelfLearnAwardsEnabled(true,{
   hostname:'renzo-hub-2-1-staging.vercel.app',releaseTarget:'staging'}),true);
 assert.equal(officialSelfLearnAwardsEnabled(false,{
   hostname:'renzo-hub-2-1-staging.vercel.app',releaseTarget:'staging'}),false);
});
