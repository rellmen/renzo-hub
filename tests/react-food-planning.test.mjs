import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as fp from '../apps/rise-react/src/lib/food-planning.mjs';
const U='22222222-2222-4222-8222-222222222222';
test('Shopping base list matches the Classic markup exactly',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const items=[...html.matchAll(/<div><dt>([^<]+)<\/dt><dd>([^<]+)<\/dd><\/div>/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(fp.SHOPPING_BASE.map(x=>[...x]),items);
});
test('Bought marks are per account and month, unknown items rejected, storage failures tolerated',()=>{
 const mem=new Map();const st={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
 assert.deepEqual(fp.toggleShop(U,'2026-10','Avena',true,st),['Avena']);
 assert.deepEqual(fp.readShop(U,'2026-11',st),[]);
 assert.deepEqual(fp.readShop('other',  '2026-10',st),[]);
 assert.throws(()=>fp.toggleShop(U,'2026-10','Caviar',true,st),/desconocido/);
 assert.deepEqual(fp.toggleShop(U,'2026-10','Arroz',true,{getItem(){throw Error('x');},setItem(){throw Error('x');}}),['Arroz']);
});
function c(result,calls=[]){const ch={from(){return ch;},eq(k,v){calls.push(['eq',k,v]);return ch;},update(v){calls.push(['update',v]);return ch;},delete(){calls.push(['delete']);return ch;},select(){return ch;},maybeSingle:async()=>result,then(r,j){return Promise.resolve(result).then(r,j);}};return ch;}
test('Meal edits/deletes are CAS-scoped and keep payload fields',async()=>{
 const row={id:'m',updated_at:'v',payload:{date:'2026-10-23',meal:'Pollo',kcal:500,protein:40,src:'x'}};
 const calls=[];await fp.updateMeal(c({data:{id:'m'},error:null},calls),U,row,{meal:'Pollo y arroz',kcal:'650',protein:''});
 const p=calls.find(x=>x[0]==='update')[1].payload;
 assert.equal(p.kcal,650);assert.equal(p.protein,null);assert.equal(p.src,'x');assert.equal(p.date,'2026-10-23');
 assert.ok(calls.some(x=>x[1]==='updated_at'&&x[2]==='v'));
 await assert.rejects(fp.updateMeal(c({data:{},error:null}),U,row,{meal:'x',kcal:'',protein:''}),/al menos/);
 await assert.rejects(fp.updateMeal(c({data:null,error:null}),U,row,{meal:'x',kcal:'1',protein:''}),/otro dispositivo/);
 await assert.rejects(fp.deleteMeal(c({data:[],error:null}),U,row),/cambió/);
});
