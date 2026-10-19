import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/selflearn-tutor.js";
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.body=data;return this;}};}
test("AI tutor is disabled by default outside preview",async()=>{
 const res=response();await handler({method:"POST",headers:{},body:{course:"nl",mode:"writing",answer:"Hallo",consent:true}},res);
 assert.equal(res.code,503);assert.match(res.body.error,/desactivado/);
});
test("GET reports disabled status without credentials",async()=>{
 const res=response();await handler({method:"GET",headers:{}},res);
 assert.equal(res.code,200);assert.equal(res.body.enabled,false);assert.equal(res.body.requiresConsent,true);
});
test("non-POST methods are rejected",async()=>{
 const res=response();await handler({method:"DELETE",headers:{}},res);
 assert.equal(res.code,405);
});

// 2.51.0 · interruptores de entorno y modelo configurable
const ENV=["VERCEL_ENV","SELFLEARN_AI_ENABLED","SELFLEARN_AI_RATE_LIMIT_READY","SELFLEARN_AI_LIMIT_READY","OPENROUTER_API_KEY","SELFLEARN_AI_ALLOW_PRODUCTION","SELFLEARN_AI_MODEL"];
async function info(env){
 const old=Object.fromEntries(ENV.map(k=>[k,process.env[k]]));
 for(const k of ENV)delete process.env[k];Object.assign(process.env,env);
 const mod=await import(`../api/selflearn-tutor.js?t=${Math.random()}`);let out;
 await mod.default({method:"GET",headers:{}},{setHeader(){},status(){return this;},json(b){out=b;return this;}});
 for(const k of ENV){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
 return out;
}
const ON={SELFLEARN_AI_ENABLED:"true",SELFLEARN_AI_RATE_LIMIT_READY:"true",OPENROUTER_API_KEY:"sk-test"};
test("se enciende solo con las variables de Renzo, también con el nombre SELFLEARN_AI_LIMIT_READY",async()=>{
 assert.equal((await info({VERCEL_ENV:"production",...ON})).enabled,true);
 assert.equal((await info({VERCEL_ENV:"production",SELFLEARN_AI_ENABLED:"true",SELFLEARN_AI_LIMIT_READY:"true",OPENROUTER_API_KEY:"sk-test"})).enabled,true);
 assert.equal((await info({VERCEL_ENV:"production",SELFLEARN_AI_ENABLED:"TRUE ",SELFLEARN_AI_LIMIT_READY:"1",OPENROUTER_API_KEY:"sk-test"})).enabled,true);
 assert.equal((await info({VERCEL_ENV:"production",SELFLEARN_AI_ENABLED:"true",OPENROUTER_API_KEY:"sk-test"})).enabled,false,"sin cuota no se enciende");
 assert.equal((await info({VERCEL_ENV:"production",SELFLEARN_AI_ENABLED:"false",SELFLEARN_AI_LIMIT_READY:"true",OPENROUTER_API_KEY:"sk-test"})).enabled,false);
 assert.equal((await info({VERCEL_ENV:"development",...ON})).enabled,false);
 assert.equal((await info({VERCEL_ENV:"production",...ON,OPENROUTER_API_KEY:"  "})).enabled,false,"clave vacía");
});
test("modelo: openrouter/free por defecto y configurable solo con un id válido",async()=>{
 assert.equal((await info({VERCEL_ENV:"preview",...ON})).model,"openrouter/free");
 assert.equal((await info({VERCEL_ENV:"preview",...ON,SELFLEARN_AI_MODEL:"google/gemma-4-31b-it:free"})).model,"google/gemma-4-31b-it:free");
 assert.equal((await info({VERCEL_ENV:"preview",...ON,SELFLEARN_AI_MODEL:"x; rm -rf"})).model,"openrouter/free");
});
