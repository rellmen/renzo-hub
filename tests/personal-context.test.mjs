import test from 'node:test';import assert from 'node:assert/strict';import {PERSONAL_CONTEXT_SUGGESTIONS,sanitizePersonalContext} from '../microapps/personal-context.js';
test('unconfirmed historical profile is never saved',()=>{
 assert.deepEqual(sanitizePersonalContext({residence:{value:'Leende',confirmed:false}}),{});
 assert.equal(PERSONAL_CONTEXT_SUGGESTIONS.residence.value,'Leende, Países Bajos');
});
test('confirmed profile retains provenance, avoids unknown fields',()=>{
 const out=sanitizePersonalContext({career:{value:'Logistics Data Analyst',confirmed:true,source:'Confirmado por el usuario',confirmedAt:'2026-10-17'},privatePassword:{value:'secret',confirmed:true}});
 assert.equal(out.career.confirmed,true);
 assert.equal(out.career.confirmedAt,'2026-10-17');
 assert.equal(out.privatePassword,undefined);
});
