import test from 'node:test';
import assert from 'node:assert/strict';
import {RISE4_PHASES,RISE4_GATES,roadmapStats,riseRoadmapHTML} from '../microapps/work/roadmap.js';
test('roadmap: 11 ordered phases, phase 0 closed and phase 1 active, accurate 382–626h estimate',()=>{
 const x=roadmapStats();assert.equal(x.total,11);assert.equal(x.closed,1);assert.equal(x.active.id,1);assert.deepEqual(x.hours,[382,626]);assert.equal(RISE4_GATES.length,6);
});
test('roadmap: cannot open two phases at once',()=>{
 const bad=RISE4_PHASES.map(p=>({...p}));bad[2].status='active';assert.throws(()=>roadmapStats(bad),/Solo puede existir una fase/);
});
test('roadmap: cannot close a later phase before the earlier ones',()=>{
 const bad=RISE4_PHASES.map(p=>({...p}));bad[3].status='closed';assert.throws(()=>roadmapStats(bad),/fuera de orden/);
});
test('roadmap: rendered as accessible detail and HTML is escaped',()=>{
 const s=riseRoadmapHTML();assert.match(s,/aria-label="RISE HUB 4.0/);assert.match(s,/Fase actual:/);assert.match(s,/382–626/);assert.match(s,/Entregable:/);assert.match(s,/No representa un compromiso/);
 const one=[{...RISE4_PHASES[0],title:'<script>bad</script>'}];const h=riseRoadmapHTML(one);assert.doesNotMatch(h,/<script>/);assert.match(h,/&lt;script&gt;/);
});
