import test from 'node:test';
import assert from 'node:assert/strict';
import {completedWorkout,workoutVolume,workoutSetCount,summariseGymRecords,loadGymRecords}
 from '../apps/rise-react/src/lib/gym-records.mjs';
const uid="22222222-2222-4222-8222-222222222222";
const completed={id:"a",user_id:uid,workout_date:"2026-10-21",title:"Espalda y bíceps",started_at:"2026-10-21T15:00:00.000Z",completed_at:"2026-10-21T16:00:00.000Z",exercises:[
 {name:"Lat Pulldown",sets:[{weight:40,reps:10,completed:true},{weight:60,reps:15,completed:false},{weight:null,reps:10,completed:true}]},
 {name:"Curl",sets:[{weight:10,reps:12,completed:true}]}
]};
const partial={...completed,id:"b",workout_date:"2026-10-22",completed_at:null,exercises:[]};
function mock(rows=[partial,completed],plan=[["Espalda","20",[['Lat Pulldown',4,8,12,'Espalda']]]],error=null){
 const calls=[];
 const db={from(table){
  let type=table;const q={select(fields){calls.push(["select",type,fields]);return q;},
  eq(k,v){calls.push(["eq",type,k,v]);return q;},
  order(k,v){calls.push(["order",type,k,v]);return q;},
  limit(n){calls.push(["limit",type,n]);return Promise.resolve({data:rows,error});},
  maybeSingle(){return Promise.resolve({data:{plan},error});}
  };return q;
 }};return {db,calls};
}
test("Gym never counts unfinished sets or pending sessions as accomplished workouts",()=>{
 assert.equal(completedWorkout(completed),true);
 assert.equal(completedWorkout(partial),false);
 assert.equal(workoutSetCount(completed),3);
 assert.equal(workoutVolume(completed),40*10+10*12);
 const s=summariseGymRecords([partial,completed],null,new Date(2026,9,22,12));
 assert.equal(s.completedCount,1);
 assert.equal(s.current.id,"b");
 assert.equal(s.weekCount,1);
 assert.equal(s.totalVolume,520);
});
test("Gym reads real RLS-filtered sessions and plan without inserting fictitious exercises",async()=>{
 const {db,calls}=mock();
 const s=await loadGymRecords(db,uid);
 assert.equal(s.completedCount,1);
 assert.equal(s.plan[0][0],"Espalda");
 assert.equal(s.current.title,"Espalda y bíceps");
 assert(calls.some(x=>x[0]==="eq"&&x[1]==="gym_sessions"&&x[2]==="user_id"&&x[3]===uid));
 assert(calls.some(x=>x[0]==="eq"&&x[1]==="gym_plans"&&x[2]==="user_id"&&x[3]===uid));
});
test("Gym errors do not produce demo fallbacks",async()=>{
 await assert.rejects(loadGymRecords(mock().db,""),/Inicia sesión/);
 await assert.rejects(loadGymRecords(mock([],null,{message:"RLS denied"}).db,uid),/RLS denied/);
 const empty=await loadGymRecords(mock([],null).db,uid);
 assert.equal(empty.completedCount,0);
 assert.equal(empty.plan.length,0);
 assert.equal(empty.current,null);
});
