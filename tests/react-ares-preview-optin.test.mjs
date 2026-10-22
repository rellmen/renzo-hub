import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {aresPreviewStatus,askAresPreview,isPrivateAresPrompt}
  from '../apps/rise-react/src/lib/ares-preview-client.mjs';

test('Remote Ares is disabled unless server expressly confirms preview readiness',async()=>{
 assert.equal((await aresPreviewStatus({fetcher:async()=>({ok:true,json:async()=>({enabled:false})})})).enabled,false);
 assert.equal((await aresPreviewStatus({fetcher:async()=>({ok:false})})).enabled,false);
 assert.equal((await aresPreviewStatus({fetcher:async()=>{throw Error('offline')}})).enabled,false);
 const r=await aresPreviewStatus({fetcher:async()=>({ok:true,json:async()=>({enabled:true})})});
 assert.equal(r.enabled,true);
 assert.equal(r.model,'openrouter/free');
});
test('Remote sends the user question with Bearer session, never raw hub records or service keys',async()=>{
 const received=[];
 const fetcher=async(url,options)=>{
   received.push({url,options});
   return {ok:true,json:async()=>({text:'Tienes dos tareas registradas.',source:'OpenRouter'})};
 };
 const r=await askAresPreview('¿Qué tareas tengo?','valid_access_token',{fetcher});
 assert.equal(r.text,'Tienes dos tareas registradas.');
 assert.equal(received.length,1);
 assert.equal(received[0].url,'/api/ares-ai');
 assert.equal(received[0].options.method,'POST');
 assert.equal(received[0].options.headers.Authorization,'Bearer valid_access_token');
 assert.deepEqual(JSON.parse(received[0].options.body),{question:'¿Qué tareas tengo?'});
 assert(!received[0].options.body.includes('owner_id'));
 assert(!received[0].options.body.includes('hub_records'));
});
test('Rejects financial, password, identity, email and salary sensitive prompts BEFORE fetch',async()=>{
 const blocked=['¿Cuánto fue mi salario?','Revisa mi IBAN','Mi correo es person@example.com',
   'Mi password es 1234567','Tengo 1400€ de gastos','Dime la nómina de octubre'];
 for(const q of blocked){
   assert.equal(isPrivateAresPrompt(q),true,q);
   let called=0;
   await assert.rejects(askAresPreview(q,'access',{fetcher:async()=>{called++;}}),/sensible/);
   assert.equal(called,0);
 }
});
test('Fails closed on missing JWT, disabled endpoint, invalid response or provider errors',async()=>{
 let calls=0;
 await assert.rejects(askAresPreview('¿Qué proyectos?','',{fetcher:async()=>{calls++;}}),/sesión/);
 assert.equal(calls,0);
 await assert.rejects(askAresPreview('Proyectos','abc',{fetcher:async()=>({ok:false,json:async()=>({error:'Servicio desactivado'})})}),/Servicio desactivado/);
 await assert.rejects(askAresPreview('Proyectos','abc',{fetcher:async()=>({ok:true,json:async()=>({text:''})})}),/no devolvió/);
});
test('React Ares chat retains optional opt-in, reset on user changes and default private answers',()=>{
 const src=readFileSync(new URL('../apps/rise-react/src/routes/ares.tsx',import.meta.url),'utf8');
 const output=transformSync(src,{loader:'tsx',format:'esm',jsx:'automatic',target:'es2022'});
 assert(output.code.length>400);
 assert.match(src,/checked=\{externalConsent\}/);
 assert.match(src,/externalConsent&&preview\.data\?\.enabled/);
 assert.match(src,/answerAresFromRecords/);
 assert.match(src,/setMessages\(\[\]\)/);
 assert.match(src,/userId\.current!==owner/);
 assert.doesNotMatch(src,/OPENROUTER_API_KEY|service_role|sb_secret_/);
});
