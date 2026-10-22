import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectNocturneProductionCandidate} from '../tools/nocturne-release-preflight.mjs';
import {LEGACY_FALLBACK_URL,SUPABASE_PRODUCTION_URL,SUPABASE_STAGING_URL}
 from '../apps/rise-react/src/lib/nocturne-environment.mjs';

const candidate='https://rise-hub-nocturne-candidate-qa.vercel.app';
const oldOrigin=new URL(LEGACY_FALLBACK_URL).origin;
function makeFetch({candidateBackend=SUPABASE_PRODUCTION_URL,classicBackend=SUPABASE_PRODUCTION_URL,broken=new Set()}={}){
 const requests=[];
 const fake=async uri=>{
  requests.push(uri);
  const url=new URL(uri);
  if(broken.has(url.pathname))return new Response('missing',{status:404});
  if(url.pathname==='/api/supabase-config'){
   return Response.json({supabaseUrl:uri.startsWith(oldOrigin)?classicBackend:candidateBackend,
     publishableKey:'sb_publishable_fake_long_example'});
  }
  if(uri.startsWith(oldOrigin))return new Response('<html><title>RISE HUB</title>legacy</html>');
  if(url.pathname==='/')return new Response('<html><title>RISE HUB — NOCTURNE</title></html>');
  return new Response('ok');
 };
 return {fake,requests};
}
test('Isolated production candidate must have real production backend, legacy fallback and routes',async()=>{
 const {fake,requests}=makeFetch();
 const x=await inspectNocturneProductionCandidate(candidate,{fetcher:fake});
 assert.equal(x.infrastructureReady,true);
 assert.equal(x.checks.every(c=>c.ok),true);
 assert.equal(x.releaseReady,false,'HTTP alone must NEVER authorise production cutover');
 assert(requests.some(u=>u===candidate+'/api/supabase-config'));
 assert(requests.some(u=>u===oldOrigin+'/api/supabase-config'));
 assert(x.outstanding.length>=3);
});
test('Stage-bound candidate and disappeared fallback must block readiness',async()=>{
 const stage=await inspectNocturneProductionCandidate(candidate,
  {fetcher:makeFetch({candidateBackend:SUPABASE_STAGING_URL}).fake});
 assert.equal(stage.infrastructureReady,false);
 assert(stage.checks.some(c=>c.name.includes('uses production Supabase')&&!c.ok));
 const broken=await inspectNocturneProductionCandidate(candidate,
  {fetcher:makeFetch({broken:new Set(['/manifest.webmanifest'])}).fake});
 assert.equal(broken.infrastructureReady,false);
});
test('Primary, fallback and staging origin can never masquerade as independent candidate',async()=>{
 for(const url of [
  'https://renzo-hub.vercel.app/','https://rise-hub-classic-renzojesus99-1996.vercel.app/',
  'https://renzo-hub-2-1-staging.vercel.app/','http://rise-hub-nocturne-candidate-qa.vercel.app/',
  'https://rise-hub-nocturne-candidate-qa.vercel.app/redirect','https://evil.example.com/'
 ]){
  let count=0;
  const x=await inspectNocturneProductionCandidate(url,{fetcher:async()=>{count++;throw Error('unexpected fetch');}});
  assert.equal(x.infrastructureReady,false,url);
  assert.equal(count,0);
 }
});
