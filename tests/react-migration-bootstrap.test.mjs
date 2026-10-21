import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fetchSupabaseConfig,getReactSupabaseClient} from '../apps/rise-react/src/lib/supabase-adapter.mjs';

const valid={supabaseUrl:'https://staging-example.supabase.co',publishableKey:'sb_publishable_'+ 'a'.repeat(48)};
const response=(value=valid,ok=true)=>({ok,json:async()=>value});

test('React bootstrap obtains environment auth config from SAME ORIGIN, never from Lovable',async()=>{
 let request;
 const data=await fetchSupabaseConfig({fetcher:async(url,options)=>{request={url,options};return response();}});
 assert.equal(request.url,'/api/supabase-config');
 assert.equal(request.options.cache,'no-store');
 assert.equal(request.options.credentials,'same-origin');
 assert.equal(request.options.method,'GET');
 assert.equal(data.supabaseUrl,valid.supabaseUrl);
 assert.equal(data.publishableKey,valid.publishableKey);
 assert.ok(Object.isFrozen(data));
});

test('React bootstrap fails closed when Supabase config service is unavailable',async()=>{
 await assert.rejects(fetchSupabaseConfig({fetcher:async()=>response({},false)}),/No se pudo obtener/);
 await assert.rejects(fetchSupabaseConfig({fetcher:async()=>response({})}),/incompleta/);
});

test('React bootstrap rejects secret keys, non-HTTPS and foreign backends',async()=>{
 for(const c of [
   {...valid,supabaseUrl:'http://staging-example.supabase.co'},
   {...valid,supabaseUrl:'https://malicious.example.com'},
   {...valid,publishableKey:'sb_secret_'+ 'x'.repeat(40)},
   {...valid,publishableKey:'service_role_'+ 'x'.repeat(40)}
 ])await assert.rejects(fetchSupabaseConfig({fetcher:async()=>response(c)}));
});

test('React bootstrap does not instantiate private session on the server',async()=>{
 await assert.rejects(getReactSupabaseClient({createClient:()=>({})}),/solo disponible en el navegador/);
});

test('Existing app and prototype remain isolated during React migration',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.ok(!pkg.scripts.build || !pkg.scripts.build.includes('react'),'Do not overwrite static production build');
 const source=readFileSync(new URL('../apps/rise-react/src/lib/supabase-adapter.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/(?:mgncykyrhavpepfggmng|zpueziugbezqxompwsol|lovable\.app)/);
});
