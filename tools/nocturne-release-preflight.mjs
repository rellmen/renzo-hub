// Read-only HTTP preflight for a reversible RISE HUB Nocturne release candidate.
// Does not mutate Vercel aliases or databases. Use --strict to fail a release gate.
import {pathToFileURL} from 'node:url';
import {LEGACY_FALLBACK_URL,SUPABASE_PRODUCTION_URL,SUPABASE_STAGING_URL}
 from '../apps/rise-react/src/lib/nocturne-environment.mjs';

const ROUTES=['/','/ajustes','/aprender','/gym','/dinero','/piel','/proyectos','/notas','/body','/food','/ares','/nominas','/turnos','/migracion','/apps','/quest','/news','/agentes'];
const PUBLIC_HOST='renzo-hub.vercel.app';
function validCandidate(raw){
 try{
  const url=new URL(raw);
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||
     !url.hostname.endsWith('.vercel.app'))return null;
  if(url.hostname===PUBLIC_HOST||url.hostname===new URL(LEGACY_FALLBACK_URL).hostname||
     url.hostname.startsWith('renzo-hub-2-1-staging'))return null;
  return url.origin;
 }catch{return null;}
}
async function probe(fetcher,url,{json=false}={}){
 try{
  const res=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!res?.ok)return {ok:false,status:res?.status||null};
  const body=json?await res.json():await res.text();
  return {ok:true,body};
 }catch{return {ok:false,status:null};}
}
export async function inspectNocturneProductionCandidate(candidate,{fetcher=fetch}={}){
 const checks=[];
 const record=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const origin=validCandidate(candidate);
 record('Production candidate has independent allowed Vercel URL',!!origin);
 if(!origin)return {infrastructureReady:false,checks,releaseReady:false};
 const fallback=new URL(LEGACY_FALLBACK_URL).origin;
 const [oldPage,oldConfig,candidatePage,candidateConfig]=await Promise.all([
  probe(fetcher,fallback+'/'),probe(fetcher,fallback+'/api/supabase-config',{json:true}),
  probe(fetcher,origin+'/'),probe(fetcher,origin+'/api/supabase-config',{json:true})
 ]);
 record('Classic fallback serves its original app',oldPage.ok&&oldPage.body.includes('RISE HUB'));
 record('Classic fallback uses production Supabase',oldConfig.ok&&oldConfig.body?.supabaseUrl===SUPABASE_PRODUCTION_URL);
 record('Nocturne candidate serves React HTML',candidatePage.ok&&candidatePage.body.includes('NOCTURNE'));
 record('Nocturne candidate uses production Supabase',candidateConfig.ok&&
  candidateConfig.body?.supabaseUrl===SUPABASE_PRODUCTION_URL&&
  candidateConfig.body.supabaseUrl!==SUPABASE_STAGING_URL);
 const results=await Promise.all(ROUTES.map(async path=>[path,await probe(fetcher,origin+path)]));
 for(const [path,status] of results)record('Nocturne route '+path,status.ok);
 record('Nocturne PWA manifest', (await probe(fetcher,origin+'/manifest.webmanifest')).ok);
 // Deliberately not inferred from HTTP 200: signed-in CRUD, production RPC parity,
 // production build env and rollback rehearsal are independent release gates.
 return {infrastructureReady:checks.every(c=>c.ok),checks,releaseReady:false,
  outstanding:['Production SelfLearn migration and legacy-data regression',
   'Actual production-account CRUD/parity acceptance, or explicit read-only rollout',
   'Verified production build-time Supabase URL and VITE_NOCTURNE_RELEASE_TARGET',
   'Controlled alias-switch rollback rehearsal and Vercel SSO/domain access']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const idx=process.argv.findIndex(a=>a==='--candidate');
 const candidate=idx>=0?process.argv[idx+1]:null;
 const report=await inspectNocturneProductionCandidate(candidate);
 console.log(JSON.stringify(report,null,2));
 if(process.argv.includes('--strict')&&!report.releaseReady)process.exitCode=1;
}
