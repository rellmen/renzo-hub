import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createRecords} from '../apps/rise-react/src/lib/legacy-records.mjs';

const uid='22222222-2222-4222-8222-222222222222';
function fakeDb(){
 const log=[];
 const fake=(verb,fields)=>{
   const opts={filters:[]};
   const q={
    select(){return q},
    eq(k,v){opts.filters.push([k,v]);return q},
    order(){return q},
    limit(){log.push({verb,fields,...opts});return Promise.resolve({data:[],error:null})},
    single(){log.push({verb,fields,...opts});return Promise.resolve({data:{id:'note1',...fields},error:null})},
    then(done){log.push({verb,fields,...opts});return Promise.resolve(done({data:null,error:null}))}
   };
   return q;
 };
 return {log,db:{from(table){
   assert.equal(table,'hub_records');
   return {select:()=>fake('list',null),insert:fields=>fake('insert',fields),
     update:fields=>fake('update',fields),delete:()=>fake('delete',null)};
 }}};
}
test('Notes route and TanStack tree are registered and compile as TSX',()=>{
 const root=new URL('../apps/rise-react/src/',import.meta.url);
 const source=readFileSync(new URL('routes/notas.tsx',root),'utf8');
 const tree=readFileSync(new URL('routeTree.gen.ts',root),'utf8');
 const nav=readFileSync(new URL('lib/nav.ts',root),'utf8');
 assert(transformSync(source,{loader:'tsx',format:'esm',jsx:'automatic',target:'es2022'}).code.length>200);
 assert.match(tree,/NotasRouteImport/);
 assert.match(tree,/['"]\/notas['"]/);
 assert.match(nav,/to: "\/notas"/);
 assert.match(source,/createRecords\(/);
 assert.doesNotMatch(source,/useLocalStorage|DemoDataBadge/);
});
test('Notes uses same owner/domain/type filters for reads and writes',async()=>{
 const {db,log}=fakeDb();
 const notes=createRecords(db,()=>({id:uid}),{domain:'personal',type:'note'});
 assert.deepEqual(await notes.list(),[]);
 await notes.add({title:'Análisis de carrera',payload:{body:'Idea personal'}});
 await notes.update('note1',{title:'Revisado',payload:{body:'Texto actualizado'}});
 await notes.remove('note1');
 assert.equal(log.length,4);
 for(const record of log){
   if(record.verb==='insert'){
     assert.equal(record.fields.owner_id,uid);
     assert.equal(record.fields.domain,'personal');
     assert.equal(record.fields.record_type,'note');
   }else{
     assert(record.filters.some(([k,v])=>k==='owner_id'&&v===uid));
     assert(record.filters.some(([k,v])=>k==='domain'&&v==='personal'));
     assert(record.filters.some(([k,v])=>k==='record_type'&&v==='note'));
   }
 }
});
test('Notes are never queried without authentication',async()=>{
 const {db}=fakeDb();
 const notes=createRecords(db,()=>null,{domain:'personal',type:'note'});
 await assert.rejects(notes.list(),/Inicia sesión/);
 await assert.rejects(notes.add({title:'X',payload:{body:'private'}}),/Inicia sesión/);
});
