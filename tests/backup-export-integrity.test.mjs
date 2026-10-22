import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildExport,EXPORT_TABLES,MAX_FILE_BYTES} from '../apps/rise-react/src/lib/data-export.mjs';
const uid='00000000-0000-4000-8000-0000000000aa';
function dbFor({rows=0,files=0,oversized=false}={}){
 const calls=[];
 return {calls,from(table){
  const q={select(){return q;},eq(k,v){calls.push({table,k,v});return q;},order(k){calls.push({order:k});return q;},
   async range(a,b){return {data:table==='hub_records'?Array.from({length:Math.max(0,Math.min(b+1,rows)-a)},(_,i)=>({id:String(a+i),owner_id:uid})):[],error:null};}};
  return q;
 },storage:{from(bucket){return {
  async list(prefix,options){calls.push({bucket,prefix,options});return {data:bucket==='payroll'?Array.from({length:Math.max(0,Math.min(options.offset+options.limit,files)-options.offset)},(_,i)=>({id:String(options.offset+i),name:String(options.offset+i)+'.pdf',metadata:{size:oversized?0:1}})):[],error:null};},
  async download(){return {data:oversized?{size:MAX_FILE_BYTES+1}:new Blob(['x']),error:null};}
 };}}};
}
test('export reads every page of rows and storage objects, filters owner and includes balance imports',async()=>{
 const db=dbFor({rows:1001,files:1001});
 const out=await buildExport(db,uid);
 assert.equal(out.tables.hub_records.length,1001);
 assert.equal(out.files.length,1001);
 assert.equal(EXPORT_TABLES.payroll_balance_imports,'owner_id');
 assert(db.calls.filter(x=>x.k).every(x=>x.v===uid));
 assert(db.calls.filter(x=>x.options).every(x=>x.options.sortBy.column==='name'));
 assert(db.calls.some(x=>x.order==='id'));
});
test('missing identity is rejected before any export read',async()=>{
 const db=dbFor();
 await assert.rejects(()=>buildExport(db,''),/sesión/i);
 assert.equal(db.calls.length,0);
});
test('actual downloaded size enforces the file cap even with incorrect metadata',async()=>{
 const out=await buildExport(dbFor({files:1,oversized:true}),uid);
 assert.equal(out.files.length,0);
 assert(out.errors.some(x=>/límite/i.test(x)));
});
test('classic and React use identical export logic and classic precaches its dependency',()=>{
 const classic=readFileSync('microapps/backup/export-data.js','utf8');
 const react=readFileSync('apps/rise-react/src/lib/data-export.mjs','utf8');
 assert.equal(react.slice(react.indexOf('\n')+1),classic);
 assert.match(readFileSync('sw.js','utf8'),/['"]\/microapps\/backup\/export-data\.js['"]/);
});
