import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {GYM_USER_REFERENCE,GYM_GOALS_DEFAULT,getGymGoals} from '../microapps/gym/goals.js';
const skin=readFileSync(new URL('../microapps/skin/skin.js',import.meta.url),'utf8');
test('photographed inventory includes newly identified distinct products',()=>{
 for(const name of ['celimax Retinal Shot Tightening Booster','Differin 0.1%','Isntree Hyaluronic Acid Toner Plus','Ondo Beauty 36.5 Dark Spot Treatment','AXIS-Y Vegan Collagen Eye Serum','Aceite de ricino Deliplus','Heliocare 360 Pigment Solution','Arencia']) assert.ok(skin.includes(name),name);
});
test('gym default references are reported estimates, not fictitious history',()=>{
 assert.equal(GYM_USER_REFERENCE.heightCm,170);assert.equal(GYM_USER_REFERENCE.lastReportedWeightKg,84);
 assert.equal(GYM_GOALS_DEFAULT.targetWeight,78);
 const metadata={gym_goals:{priority:'Fuerza',sessionsPerWeek:3,targetWeight:80}};
 assert.equal(getGymGoals('user',metadata).targetWeight,80);
});
