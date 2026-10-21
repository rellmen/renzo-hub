// RISE HUB React — auditable cutover readiness gate.
// Run: node tools/react-cutover-audit.mjs [--strict]
// Audit mode exits 0 and reports blockers; --strict exits 1 until release-ready.
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=p=>resolve(root,p);
const read=p=>existsSync(file(p))?readFileSync(file(p),'utf8'):'';
const images=['ares','gym','hero-eclipse','learn','money','projects','skin'].map(n=>'apps/rise-react/src/assets/'+n+'.jpg');
const missingAssets=images.filter(p=>!existsSync(file(p)));
const expectedAssets=JSON.parse(read('apps/rise-react/lovable-asset-expected.json')||'{"files":[]}').files;
const mismatchedAssets=expectedAssets.filter(x=>{
 const p='apps/rise-react/src/assets/'+x.name;
 if(!existsSync(file(p)))return false;
 const b=readFileSync(file(p));
 return b.length!==x.bytes||createHash('sha256').update(b).digest('hex')!==x.sha256;
}).map(x=>x.name);
const pages=['index','ares','aprender','gym','dinero','piel','proyectos','ajustes'];
const demoRoutes=pages.filter(p=>{
  const s=read('apps/rise-react/src/routes/'+p+'.tsx');
  return /\buseLocalStorage\b|\bDemoDataBadge\b|\buseAresChat\b|\bconst\s+(?:KPIS|SEED|PERIODS|ROUTINES|INVENTORY)\s*=/.test(s);
});
const rootPackage=JSON.parse(read('package.json')||'{}');
const reactPackage=JSON.parse(read('apps/rise-react/package.json')||'{}');
const vercel=JSON.parse(read('vercel.json')||'{}');
const report={
  project:'RISE HUB React Nocturne',
  originalDesignPreserved:existsSync(file('apps/rise-react/src/styles.css'))&&existsSync(file('apps/rise-react/src/components/rise/AppShell.tsx')),
  privateAuthGuard:read('apps/rise-react/src/routes/__root.tsx').includes('<AuthGate>'),
  sameOriginSupabase:read('apps/rise-react/src/lib/supabase-adapter.mjs').includes('/api/supabase-config'),
  originalAssetCount:images.length-missingAssets.length,
  missingAssets,mismatchedAssets,unmigratedDemoRoutes:demoRoutes,
  rootFrontendStillLegacy:!rootPackage.scripts?.build&&vercel.buildCommand===null&&vercel.outputDirectory==='.',
  reactExcludedFromDeploy:read('.vercelignore').split('\n').some(s=>s.trim()==='apps/'),
  reactBuildCommand:reactPackage.scripts?.build||null,
  productionMigrationVerified:false,
  stagingAuthenticatedE2eVerified:false,
  iphonePwaVerified:false
};
const blockers=[];
if(missingAssets.length)blockers.push('Missing original Lovable images');
if(mismatchedAssets.length)blockers.push('Original Lovable image hashes do not match uploaded ZIP');
if(demoRoutes.length)blockers.push('Routes with demo-only state');
if(report.rootFrontendStillLegacy||report.reactExcludedFromDeploy)blockers.push('React not yet wired to a protected staging build');
if(!report.privateAuthGuard||!report.sameOriginSupabase)blockers.push('Authentication/configuration contract incomplete');
if(!report.stagingAuthenticatedE2eVerified||!report.iphonePwaVerified)blockers.push('Authenticated staging/iPhone QA not yet evidenced');
report.ready=blockers.length===0;
report.blockers=blockers;
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&!report.ready)process.exitCode=1;
