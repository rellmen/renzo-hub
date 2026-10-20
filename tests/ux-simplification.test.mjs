import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const world=readFileSync(new URL('../world.js',import.meta.url),'utf8');
const gym=readFileSync(new URL('../gym.js',import.meta.url),'utf8');
const section=id=>{const start=html.indexOf('<section id="'+id+'"');assert.ok(start>=0,id+' missing');return html.slice(start,html.indexOf('</section>',start));};
test('Skin and Food disclosures remain balanced and retain interactive controls',()=>{
  for(const id of ['skin','food']){const s=section(id);assert.equal((s.match(/<details\\b/g)||[]).length,(s.match(/<\\/details>/g)||[]).length,id);}
  const skin=section('skin');
  for(const id of ['steps','completeBtn','clearBtn','note','skinPhotoUpload','productList'])assert.ok(skin.includes('id="'+id+'"'),id);
  const food=section('food');for(const id of ['foodToday','p1Food','bpKcal','bpProtein','bpBudget'])assert.ok(food.includes('id="'+id+'"'),id);
});
test('World keeps existing forms and progressively reveals secondary sections',()=>{
 for(const form of ['body','task','project','idea','sprint','capture','profile','shift','shift-pattern','feedback'])assert.ok(world.includes('data-form="'+form+'"'),form);
 assert.ok(world.includes('class="body-history"'));
 assert.ok(world.includes('class="world-advanced"'));
 assert.ok(world.includes('data-action="export"'));
});
test('Gym keeps the current workout renderer and the advanced views',()=>{
 for(const token of ['data-view','workoutForm','data-more-open','data-more-go','gym-overview','gym-technical'])assert.ok(gym.includes(token),token);
 assert.ok(gym.includes("['train','Entrenar']"));
 assert.ok(gym.includes("['progress','Progreso']"));
 assert.ok(gym.includes("['plan','Rutinas']"));
});
