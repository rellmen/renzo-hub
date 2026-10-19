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
