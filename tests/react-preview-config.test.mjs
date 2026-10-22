import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../apps/rise-react/api/supabase-config.js';
function mock(method='GET'){
 const headers={};let status=200;let body=null;
 const response={
   setHeader(k,v){headers[k]=v;},
   status(x){status=x;return response;},
   json(data){body=data;return response;}
 };
 return {request:{method},response,result:()=>({headers,status,body})};
}
function env(temp,fn){
 const oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_PUBLISHABLE_KEY;
 try{
   if(temp.url===null)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=temp.url;
   if(temp.key===null)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=temp.key;
   fn();
 }finally{
   if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;
   if(oldKey===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=oldKey;
 }
}
test('QA config route refuses missing values and secret/service-role keys',()=>{
 for(const v of [
   {url:null,key:null},
   {url:'http://example.com',key:'sb_publishable_example_longer_than_20'},
   {url:'https://qa.supabase.co',key:'sb_secret_this_must_not_leak_under_any_circumstances'},
   {url:'https://qa.supabase.co',key:'service_role_long_value'}
 ]){
   env(v,()=>{
     const {request,response,result}=mock();
     handler(request,response);
     assert.equal(result().status,503);
     assert(!('publishableKey' in result().body));
     assert.match(result().headers['Cache-Control'],/no-store/);
   });
 }
});
test('QA endpoint exports only publishable config and rejects POST',()=>{
 env({url:'https://qa.supabase.co/',key:'sb_publishable_test_long_public_key'},()=>{
   const ok=mock();handler(ok.request,ok.response);
   assert.equal(ok.result().status,200);
   assert.deepEqual(ok.result().body,{supabaseUrl:'https://qa.supabase.co',publishableKey:'sb_publishable_test_long_public_key'});
   const post=mock('POST');handler(post.request,post.response);
   assert.equal(post.result().status,405);
   assert(!('publishableKey' in post.result().body));
 });
});
test('React-only Vercel noindex policy never modifies classic root vercel config',()=>{
 const cfg=JSON.parse(readFileSync(new URL('../apps/rise-react/vercel.json',import.meta.url),'utf8'));
 assert(cfg.headers.some(x=>x.headers.some(y=>y.key==='X-Robots-Tag'&&y.value.includes('noindex'))));
 const root=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(root.outputDirectory,'.');
});
