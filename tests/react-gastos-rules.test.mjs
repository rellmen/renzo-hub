import test from 'node:test';
import assert from 'node:assert/strict';
import {saveMerchantRule,deleteMerchantRule} from '../apps/rise-react/src/lib/gastos-editor.mjs';
import {categorize} from '../microapps/gastos/categories.js';
const U='22222222-2222-4222-8222-222222222222';
function c(results,calls=[]){let n=0;const ch={from(){return ch;},select(){return ch;},eq(k,v){calls.push(['eq',k,v]);return ch;},update(v){calls.push(['update',v]);return ch;},insert(v){calls.push(['insert',v]);return ch;},delete(){calls.push(['delete']);return ch;},
 maybeSingle:async()=>results.maybe?.[n++]??{data:{id:'x'},error:null},single:async()=>results.single||{data:{id:'x'},error:null},then(r,j){return Promise.resolve(results.list||{data:[{id:'x'}],error:null}).then(r,j);}};return ch;}
test('New merchant rule: Classic payload shape, stable id, owner and type scoped; Classic categorize honours it',async()=>{
 const calls=[];const key=await saveMerchantRule(c({},calls),U,{merchant:'Albert Heijn'},'supermercado',[],{id:'r1'});
 const ins=calls.find(x=>x[0]==='insert')[1];
 assert.equal(key,'albert heijn');assert.equal(ins.id,'r1');assert.equal(ins.owner_id,U);assert.equal(ins.record_type,'money_rule');
 assert.deepEqual(ins.payload,{merchant:'albert heijn',category:'supermercado'});
 assert.equal(categorize({payload:{name:'Albert Heijn 1234',amount:-5}},[{payload:ins.payload}]).source,'rule');
});
test('Existing rule updated with CAS; manual override on the tx is cleared like Classic',async()=>{
 const rule={id:'r',updated_at:'v1',payload:{merchant:'jumbo',category:'otros',note:'keep'}};
 const tx={id:'t',updated_at:'tv',payload:{name:'Jumbo',amount:-3,category:'ocio'}};
 const calls=[];
 const client=c({maybe:[{data:{id:'r'},error:null},{data:{id:'t',updated_at:'tv',payload:tx.payload},error:null},{data:{id:'t'},error:null}]},calls);
 await saveMerchantRule(client,U,{merchant:'Jumbo',txRow:tx},'supermercado',[rule]);
 const ups=calls.filter(x=>x[0]==='update');
 assert.deepEqual(ups[0][1].payload,{merchant:'jumbo',category:'supermercado',note:'keep'});
 assert.ok(calls.some(x=>x[1]==='updated_at'&&x[2]==='v1'));
 assert.equal('category' in ups[1][1].payload,false,'manual override removed');
 await assert.rejects(saveMerchantRule(c({maybe:[{data:null,error:null}]}),U,{merchant:'Jumbo'},'supermercado',[rule]),/otro dispositivo/);
 await assert.rejects(saveMerchantRule(c({}),U,{merchant:''},'supermercado'),/comercio/);
 await assert.rejects(saveMerchantRule(c({}),U,{merchant:'x'},'nope'),/Categoría/);
});
test('Rule delete is CAS-scoped',async()=>{
 const calls=[];await deleteMerchantRule(c({},calls),U,{id:'r',updated_at:'v'});
 assert.ok(calls.some(x=>x[1]==='record_type'&&x[2]==='money_rule')&&calls.some(x=>x[1]==='updated_at'));
 await assert.rejects(deleteMerchantRule(c({list:{data:[],error:null}}),U,{id:'r',updated_at:'v'}),/cambió/);
});
