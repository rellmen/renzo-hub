import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyRunInfo,adoptLegacyRun,discardLegacyRun} from '../apps/rise-react/src/lib/selflearn-legacy.mjs';
import {makePractice} from '../apps/rise-react/src/lib/selflearn-practice.mjs';
import {COURSES} from '../apps/rise-react/src/lib/legacy-selflearn/engine.js';

const uid='22222222-2222-4222-8222-222222222222';
const unit=COURSES.nl.units[0].id;

function fakeClient(state,{updatedAt='2026-10-24T10:00:00Z',raceOnUpdate=false}={}){
  const db={row:{owner_id:uid,state,updated_at:updatedAt},inserted:[],updates:0};
  const q=(table)=>{
    const f={op:'select',eqs:{},payload:null};
    const api={
      select(){return api;},eq(k,v){f.eqs[k]=v;return api;},order(){return api;},limit(){return api;},
      insert(p){f.op='insert';f.payload=p;return api;},update(p){f.op='update';f.payload=p;return api;},
      async maybeSingle(){
        if(table==='hub_user_state'&&f.op==='select')return {data:db.row,error:null};
        if(table==='hub_user_state'&&f.op==='update'){
          db.updates++;
          if(raceOnUpdate||f.eqs.updated_at!==db.row.updated_at)return {data:null,error:null};
          db.row={...db.row,...f.payload};return {data:{owner_id:uid,updated_at:db.row.updated_at},error:null};
        }
        return {data:null,error:null};
      },
      async single(){db.inserted.push(f.payload);return {data:{id:'cp-'+db.inserted.length,payload:f.payload.payload},error:null};},
      then(res){return Promise.resolve({data:table==='hub_records'?[]:null,error:null}).then(res);},
    };
    return api;
  };
  return {db,client:{from:q}};
}

test('legacyRunInfo distingue sesión a medias, terminada y rota',()=>{
  const run=makePractice('nl',unit,{minutes:5,seed:1});
  assert.equal(legacyRunInfo(null),null);
  const info=legacyRunInfo({...run,index:2});
  assert.equal(info.resumable,true);assert.equal(info.step,3);assert.equal(info.unitId,unit);
  assert.equal(legacyRunInfo({...run,index:run.queue.length}).complete,true);
  assert.equal(legacyRunInfo({foo:1}).valid,false);
});

test('Continuar aquí: copia la sesión a un checkpoint y después la quita del estado clásico',async()=>{
  const run={...makePractice('nl',unit,{minutes:5,seed:2}),index:1};
  const {db,client}=fakeClient({shifts:{'2026-10-26':'Morning Shift'},learningRuns:{nl:run,en:null}});
  const r=await adoptLegacyRun(client,uid,'nl');
  assert.equal(db.inserted.length,1,'primero se guarda el checkpoint');
  assert.equal(db.inserted[0].payload.run.index,1);assert.equal(db.inserted[0].record_type,'learning_run');
  assert.ok(r.adopted&&r.adopted.run.index===1);
  assert.equal(r.cleared,true);
  assert.equal('nl' in db.row.state.learningRuns,false);
  assert.deepEqual(db.row.state.shifts,{'2026-10-26':'Morning Shift'},'no toca el resto del estado');
});

test('Si otro dispositivo cambió el estado, no se borra nada y avisa',async()=>{
  const run={...makePractice('nl',unit,{minutes:5,seed:3}),index:1};
  const {db,client}=fakeClient({learningRuns:{nl:run}},{raceOnUpdate:true});
  await assert.rejects(adoptLegacyRun(client,uid,'nl'),/otro dispositivo/);
  assert.ok(db.row.state.learningRuns.nl,'la sesión sigue ahí');
  assert.equal(db.inserted.length,1,'el progreso quedó copiado igualmente');
});

test('Descartar cierra la sesión sin copiarla',async()=>{
  const run={...makePractice('en',COURSES.en.units[0].id,{minutes:5,seed:4}),index:1};
  const {db,client}=fakeClient({learningRuns:{en:run}});
  const r=await discardLegacyRun(client,uid,'en');
  assert.equal(r.cleared,true);assert.equal(db.inserted.length,0);
  assert.equal('en' in db.row.state.learningRuns,false);
});
