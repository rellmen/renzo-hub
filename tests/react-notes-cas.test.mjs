import test from 'node:test';
import assert from 'node:assert/strict';
import * as n from '../apps/rise-react/src/lib/notes-records.mjs';
const U='22222222-2222-4222-8222-222222222222';
test('Notes load every page and reject foreign rows',async()=>{
 const pages=[Array.from({length:500},(_,i)=>({id:'a'+i,owner_id:U})),[{id:'b',owner_id:U}]];let k=0;
 const q={select(){return q;},eq(){return q;},order(){return q;},range:async()=>({data:pages[k++],error:null})};
 const r=await n.loadAllNotes({from:()=>q},U);assert.equal(r.rows.length,501);assert.equal(r.partial,false);
 const bad={select(){return bad;},eq(){return bad;},order(){return bad;},range:async()=>({data:[{owner_id:'x'}],error:null})};
 await assert.rejects(n.loadAllNotes({from:()=>bad},U),/otra cuenta/);
});
test('Search covers title and body',()=>{
 const rows=[{title:'Gym',payload:{body:'press banca'}},{title:'Idea',payload:{body:'Nocturne'}}];
 assert.equal(n.searchNotes(rows,'BANCA').length,1);assert.equal(n.searchNotes(rows,'').length,2);
});
function c(result,calls=[]){const ch={from(){return ch;},eq(k,v){calls.push(['eq',k,v]);return ch;},update(v){calls.push(['update',v]);return ch;},delete(){calls.push(['delete']);return ch;},select(){return ch;},maybeSingle:async()=>result,then(r,j){return Promise.resolve(result).then(r,j);}};return ch;}
test('Edits keep extra payload and are version-gated; stale edit/delete rejected',async()=>{
 const note={id:'1',updated_at:'v',title:'a',payload:{body:'x',tag:'keep'}};
 const calls=[];await n.updateNote(c({data:{id:'1'},error:null},calls),U,note,{title:'b',body:'y'});
 assert.deepEqual(calls.find(x=>x[0]==='update')[1],{title:'b',payload:{body:'y',tag:'keep'}});
 assert.ok(calls.some(x=>x[1]==='updated_at'&&x[2]==='v'));
 await assert.rejects(n.updateNote(c({data:null,error:null}),U,note,{title:'b',body:''}),/otro dispositivo/);
 await assert.rejects(n.removeNote(c({data:[],error:null}),U,note),/otro dispositivo/);
});
