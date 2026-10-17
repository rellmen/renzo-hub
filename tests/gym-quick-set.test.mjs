import test from 'node:test';
import assert from 'node:assert/strict';
import {quickSetValues} from '../microapps/gym/quick-set.js';

test('reuses only valid weight, reps and RIR values',()=>{
 assert.deepEqual(quickSetValues({weight:'55',reps:'10',rir:'2',side:'left',completed:true}),{weight:55,reps:10,rir:2});
});
test('never silently treats empty fields as zero',()=>{
 for(const set of [{weight:'',reps:10,rir:2},{weight:30,reps:'',rir:2},{weight:30,reps:10,rir:''},null,{weight:-1,reps:10,rir:1},{weight:20,reps:2.5,rir:1}])assert.equal(quickSetValues(set),null);
});
