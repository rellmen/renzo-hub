import {verifyNocturneBackendIsolation} from './nocturne-environment.mjs';
// RISE HUB · React migration: same-origin Supabase bootstrap.
// All data must remain in the existing environment under existing RLS policies.
// No client/keys are ever copied from Lovable or hardcoded into this bundle.
let clientPromise=null;

export async function fetchSupabaseConfig({fetcher=globalThis.fetch,timeoutMs=10000}={}){
  // Vite embeds only VITE_-prefixed values. These MUST be Supabase publishable
  // credentials (never service_role or sb_secret_), subject to the same validation
  // as the legacy same-origin bootstrap. Nitro/TanStack deployments may not expose
  // Vercel /api files as standalone functions, so use a verified public config first.
  const envUrl=import.meta.env?.VITE_SUPABASE_URL;
  const envKey=import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
  if(typeof envUrl==='string'&&typeof envKey==='string'&&envUrl&&envKey)
    return validateSupabaseConfig({supabaseUrl:envUrl,publishableKey:envKey});
  if(typeof fetcher!=='function')throw new Error('Servicio de red no disponible');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetcher('/api/supabase-config',{
      method:'GET',cache:'no-store',credentials:'same-origin',signal:controller.signal,
    });
    if(!response||!response.ok)throw new Error('No se pudo obtener la configuración de acceso de este entorno');
    const data=await response.json();
    return validateSupabaseConfig(data);
  }finally{clearTimeout(timer);}
}

export function validateSupabaseConfig(data){
    if(!data||typeof data.supabaseUrl!=='string'||typeof data.publishableKey!=='string')
      throw new Error('Configuración de acceso incompleta');
    let url;
    try{url=new URL(data.supabaseUrl);}catch{throw new Error('URL de acceso inválida');}
    if(url.protocol!=='https:'||url.username||url.password||!url.hostname.endsWith('.supabase.co'))
      throw new Error('URL Supabase no permitida');
    const key=data.publishableKey.trim();
    if(!key||key.length<20||/sb_secret_|service_role/i.test(key))
      throw new Error('Clave publicable inválida');
    return Object.freeze({supabaseUrl:url.toString().replace(/\/$/,''),publishableKey:key});
}

// Inject `createClient` in tests; lazy import in the React frontend.
// SSR must never instantiate a browser session.
export async function getReactSupabaseClient({createClient}={}){
  if(typeof window==='undefined')throw new Error('Sesión privada solo disponible en el navegador');
  if(!clientPromise){
    clientPromise=(async()=>{
      const factory=createClient??(await import('@supabase/supabase-js')).createClient;
      if(typeof factory!=='function')throw new Error('Proveedor de acceso no disponible');
      const cfg=verifyNocturneBackendIsolation(await fetchSupabaseConfig(),{
        hostname:window.location.hostname,
        releaseTarget:import.meta.env?.VITE_NOCTURNE_RELEASE_TARGET||''
      });
      return factory(cfg.supabaseUrl,cfg.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
    })().catch(err=>{clientPromise=null;throw err;});
  }
  return clientPromise;
}

export function _resetForTests(){clientPromise=null;}
