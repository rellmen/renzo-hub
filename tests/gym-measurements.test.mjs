import test from 'node:test';import assert from 'node:assert/strict';import {validateBodyMeasurement,mergeBodyMeasurements} from '../microapps/gym/measurements.js';
test('measurement history contains only explicitly recorded figures',()=>{
 const entry=validateBodyMeasurement({date:'2026-10-17',weightKg:'83,5',waistCm:'',note:'Mañana'});
 assert.equal(entry.weightKg,83.5);assert.equal(entry.waistCm,null);
 assert.equal(mergeBodyMeasurements([],entry).length,1);
 assert.throws(()=>validateBodyMeasurement({date:'2026-10-17',weightKg:'',waistCm:''}));
});
test('same-day measurement is replaced, different dates preserved',()=>{
 const first={date:'2026-10-15',weightKg:84,waistCm:null,note:''};
 const second={date:'2026-10-17',weightKg:83.5,waistCm:84,note:''};
 const a=mergeBodyMeasurements([first],second);
 assert.equal(a.length,2);assert.equal(a[0].date,'2026-10-17');
 assert.equal(mergeBodyMeasurements(a,{...second,weightKg:83.1}).length,2);
});
