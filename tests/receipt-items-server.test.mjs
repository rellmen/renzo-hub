import test from "node:test";
import assert from "node:assert/strict";
import handler,{parseModelItems} from "../apps/rise-react/server/receipt-items.mjs";

const IMG="data:image/jpeg;base64,"+"A".repeat(400);
const OWNER="11111111-1111-4111-8111-111111111111";
function res(){const r={code:0,body:null,headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(b){this.body=b;return this;}};return r;}
const req=(body,extra={})=>({method:"POST",headers:{host:"x.vercel.app",authorization:"Bearer t",...extra},body});
function setEnv(over={}){Object.assign(process.env,{VERCEL_ENV:"preview",RECEIPT_AI_ENABLED:"true",OPENROUTER_API_KEY:"k",
 SUPABASE_URL:"https://abc.supabase.co",SUPABASE_PUBLISHABLE_KEY:"pk",RECEIPT_AI_ALLOW_PRODUCTION:""},over);}
function stub({quota=true,providers=[]}={}){
 const calls=[];
 globalThis.fetch=async(url,opts={})=>{
  calls.push({url:String(url),body:opts.body?JSON.parse(opts.body):null});
  if(String(url).endsWith("/auth/v1/user"))return new Response(JSON.stringify({id:OWNER}),{status:200});
  if(String(url).includes("take_quota"))return new Response(JSON.stringify(quota),{status:200});
  const next=providers.shift();
  return new Response(JSON.stringify(next.body||{}),{status:next.status});
 };
 return calls;
}
const ok={status:200,body:{model:"vendor/free-vision",choices:[{message:{content:'Aquí tienes: {"items":[{"name":"Melk","qty":"1","price":"1,29"},{"name":"Korting","price":-0.5},{"name":"","price":2}],"total":"0,79"}'}}]}};

test("respuesta del modelo: JSON dentro de texto, limpiado; basura → null",()=>{
 assert.deepEqual(parseModelItems(ok.body.choices[0].message.content),{items:[{name:"Melk",qty:1,price:1.29},{name:"Korting",qty:1,price:-0.5}],total:0.79});
 assert.equal(parseModelItems("no hay json"),null);
 assert.equal(parseModelItems('{"items":"x"}'),null);
});

test("apagado por defecto y nunca en producción sin su propio permiso",async()=>{
 setEnv({RECEIPT_AI_ENABLED:""});
 let r=res();await handler({method:"GET",headers:{}},r);assert.equal(r.body.enabled,false);
 r=res();await handler(req({image:IMG}),r);assert.equal(r.code,503);
 setEnv({VERCEL_ENV:"production"});
 r=res();await handler(req({image:IMG}),r);assert.equal(r.code,503);
});

test("rechaza sin sesión, foto no JPEG o demasiado grande, y otro origen",async()=>{
 setEnv();stub();
 let r=res();await handler({method:"POST",headers:{host:"x"},body:{image:IMG}},r);assert.equal(r.code,401);
 r=res();await handler(req({image:"data:image/png;base64,AAAA"}),r);assert.equal(r.code,400);
 r=res();await handler(req({image:"data:image/jpeg;base64,"+"A".repeat(2_900_000)}),r);assert.equal(r.code,400);
 r=res();await handler(req({image:IMG},{origin:"https://evil.example"}),r);assert.equal(r.code,403);
});

test("límite diario agotado: no llama al modelo",async()=>{
 setEnv();const calls=stub({quota:false});
 const r=res();await handler(req({image:IMG}),r);
 assert.equal(r.code,429);assert.ok(!calls.some(c=>c.url.includes("openrouter")));
});

test("primero pide proveedores que no guardan datos; con éxito devuelve productos",async()=>{
 setEnv();const calls=stub({providers:[ok]});
 const r=res();await handler(req({image:IMG}),r);
 assert.equal(r.code,200);assert.equal(r.body.privacy,"deny");assert.equal(r.body.items.length,2);assert.equal(r.body.model,"vendor/free-vision");
 const or=calls.filter(c=>c.url.includes("openrouter"));
 assert.equal(or.length,1);assert.equal(or[0].body.model,"openrouter/free");assert.deepEqual(or[0].body.provider,{data_collection:"deny"});
 assert.equal(or[0].body.messages[0].content[1].image_url.url,IMG);
});

test("sin proveedor privado: pide consentimiento; con consentimiento reintenta y lo indica",async()=>{
 setEnv();stub({providers:[{status:404}]});
 let r=res();await handler(req({image:IMG}),r);
 assert.equal(r.code,409);assert.equal(r.body.needsConsent,true);
 const calls=stub({providers:[{status:404},ok]});
 r=res();await handler(req({image:IMG,allowCollection:true}),r);
 assert.equal(r.code,200);assert.equal(r.body.privacy,"allow");
 assert.equal(calls.filter(c=>c.url.includes("openrouter"))[1].body.provider,undefined);
});

test("modelo sin productos legibles → 422, nada inventado",async()=>{
 setEnv();stub({providers:[{status:200,body:{choices:[{message:{content:'{"items":[]}'}}]}}]});
 const r=res();await handler(req({image:IMG}),r);assert.equal(r.code,422);
});
