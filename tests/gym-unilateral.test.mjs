import test from 'node:test';
import assert from 'node:assert/strict';
import {unilateralSummary} from '../microapps/gym/unilateral.js';

const row=(sets,completed=true)=>({completed_at:completed?'2026-10-16T12:00:00Z':null,exercises:[{name:'One Arm Row',sets}]});
test('sums sides separately from completed unilateral sets',()=>{
 const data=unilateralSummary([
  row([{side:'left',completed:true,weight:20,reps:10},{side:'right',completed:true,weight:22,reps:10},{side:'right',completed:false,weight:30,reps:10},{side:null,completed:true,weight:50,reps:10}]),
  row([{side:'left',completed:true,weight:20,reps:10}],false)
 ]);
 assert.equal(data.length,1);assert.equal(data[0].left.tonnage,200);assert.equal(data[0].right.tonnage,220);
 assert.equal(data[0].differencePercent,9.1);assert.equal(data[0].comparable,true);
});
test('does not manufacture comparison from one side or invalid sets',()=>{
 const data=unilateralSummary([row([{side:'left',completed:true,weight:12,reps:8},{side:'right',completed:true,weight:12,reps:0}])]);
 assert.equal(data[0].right.sets,0);assert.equal(data[0].differencePercent,null);
 assert.equal(unilateralSummary([]).length,0);
});
