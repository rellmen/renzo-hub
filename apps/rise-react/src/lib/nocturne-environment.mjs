// Public project identifiers, NOT passwords or API credentials.
// This browser-side safety guard prevents a legacy production hostname or an
// explicitly flagged release build from inadvertently connecting to staging.
// It does not grant access: Supabase RLS remains authoritative.
export const SUPABASE_STAGING_URL="https://zpueziugbezqxompwsol.supabase.co";
export const SUPABASE_PRODUCTION_URL="https://mgncykyrhavpepfggmng.supabase.co";
export const LEGACY_FALLBACK_URL="https://rise-hub-classic-renzojesus99-1996.vercel.app/";

const PRODUCTION_HOSTS=new Set([
  "renzo-hub.vercel.app","rise-hub-renzojesus99-1996.vercel.app",
  "rise-hub-classic-renzojesus99-1996.vercel.app"
]);
const STAGING_HOSTS=new Set([
  "rise-hub-nocturne-qa.vercel.app",
  "renzo-hub-2-1-staging.vercel.app",
  "renzo-hub-2-1-staging-renzojesus99-1996.vercel.app",
  "renzo-hub-2-1-staging-git-staging-renzojesus99-1996.vercel.app"
]);
export function backendEnvironmentForHost(hostname){
 const host=String(hostname||"").toLowerCase().replace(/\.$/,"");
 if(PRODUCTION_HOSTS.has(host))return "production";
 if(STAGING_HOSTS.has(host)||/^renzo-hub-2-1-staging-[a-z0-9-]+\.vercel\.app$/.test(host))return "staging";
 return null;
}
export function verifyNocturneBackendIsolation(config,{hostname="",releaseTarget=""}={}){
 const fromHost=backendEnvironmentForHost(hostname);
 if(releaseTarget&&releaseTarget!=="production"&&releaseTarget!=="staging"&&releaseTarget!=="preview")
   throw Error("Entorno Nocturne desconocido.");
 const explicit=releaseTarget==="preview"?"staging":releaseTarget||null;
 if(explicit&&fromHost&&explicit!==fromHost)
   throw Error("El dominio y el entorno de Nocturne no coinciden. Acceso suspendido.");
 const target=explicit||fromHost;
 if(!target)return config; // local dev or unpromoted preview: validated publishable key + RLS
 const expected=target==="production"?SUPABASE_PRODUCTION_URL:SUPABASE_STAGING_URL;
 if(config?.supabaseUrl?.replace(/\/$/,"")!==expected)
   throw Error("Se ha bloqueado el acceso por incompatibilidad de entorno de datos.");
 return config;
}

/** Production requires an authenticated, versioned backend capability probe.
 * An inherited staging flag alone never enables writes. RPCs remain authoritative.
 */
export function officialSelfLearnAwardsEnabled(flag,{hostname="",releaseTarget="",backendReady=false}={}){
 if(flag!==true||backendReady!==true)return false;
 const hostEnvironment=backendEnvironmentForHost(hostname);
 if(releaseTarget&&!["production","staging","preview"].includes(releaseTarget))return false;
 const target=releaseTarget==="preview"?"staging":releaseTarget;
 if(target&&hostEnvironment&&target!==hostEnvironment)return false;
 return !!target||!!hostEnvironment;
}

/** El dominio QA histórico también recibe las versiones de producción del proyecto `rise-hub-nocturne-qa`.
 * Allí el bloqueo de aislamiento corta el acceso (dominio de staging + versión de producción), así que una
 * versión de producción redirige al dominio público. No relaja el bloqueo: solo cambia de dirección. */
export const PRODUCTION_PUBLIC_ORIGIN="https://renzo-hub.vercel.app";
const QA_HOSTS_SERVED_BY_PRODUCTION=new Set(["rise-hub-nocturne-qa.vercel.app"]);
export function productionRedirectUrl({hostname="",releaseTarget="",pathname="/",search="",hash=""}={}){
 const host=String(hostname||"").toLowerCase().replace(/\.$/,"");
 if(releaseTarget!=="production"||!QA_HOSTS_SERVED_BY_PRODUCTION.has(host))return null;
 const path=String(pathname||"/").startsWith("/")?String(pathname||"/"):"/";
 return PRODUCTION_PUBLIC_ORIGIN+path+String(search||"")+String(hash||"");
}
