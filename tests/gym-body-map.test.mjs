import test from 'node:test';
import assert from 'node:assert/strict';
import {bodyMapSvg,bodyMapExplanation,intensity} from '../microapps/gym/body-map.js';

test('front and rear body map expose actual muscle sets to assistive technologies',()=>{
 const counts={Pecho:8,Espalda:10,Tríceps:4};
 const front=bodyMapSvg(counts,'front'),back=bodyMapSvg(counts,'back');
 assert.match(front,/Pecho: 8 series/);
 assert.match(back,/Espalda: 10 series/);
 assert.match(back,/Tríceps: 4 series/);
 assert.doesNotMatch(front,/Espalda: 10 series/);
});
test('no data yields inactive map and avoids anatomical claims',()=>{
 assert.match(bodyMapSvg({},'front'),/gym-body-level-0/);
 assert.match(bodyMapExplanation({}),/Aún no hay series/);
 assert.match(bodyMapExplanation({Pecho:3}),/No mide tamaño muscular/);
 assert.equal(intensity(0,10),0);
 assert.equal(intensity(10,10),4);
});
