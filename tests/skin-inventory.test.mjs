import test from 'node:test';import assert from 'node:assert/strict';import {inventoryKey,readSkinInventory,updateSkinInventory} from '../microapps/skin/inventory.js';
test('skin inventory stays isolated by authenticated user',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 assert.deepEqual(readSkinInventory('user-b',storage),{});
 updateSkinInventory('user-a','p4','paused',storage);
 assert.equal(readSkinInventory('user-a',storage).p4,'paused');
 assert.deepEqual(readSkinInventory('user-b',storage),{});
 assert.ok(inventoryKey('user-a')!==inventoryKey('user-b'));
});
test('inventory rejects unknown states and corrupt storage',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 assert.throws(()=>updateSkinInventory('user-a','p4','unapproved',storage));
 values.set(inventoryKey('user-a'),'{invalid');
 assert.deepEqual(readSkinInventory('user-a',storage),{});
});
