import test from 'node:test';
import assert from 'node:assert/strict';
import {planVocabularyReview,saveVocabularyReview} from '../apps/rise-react/src/lib/selflearn-review.mjs';
import {fsrs,createEmptyCard,Rating} from '../microapps/selflearn/fsrs-bundle.js';
const uid='22222222-2222-4222-8222-222222222222',id='33333333-3333-4333-8333-333333333333';
const at=new Date('2026-10-22T12:00:00Z');
const card={id,course:'nl',front:'de winkel',back:'la tienda',area:'Dutch',nextReview:'2026-10-22',repetitions:2,reviewHistory:[{date:'2026-10-20',grade:'good',stability:1}]};
test('FSRS starts a legacy card without replacing its old identity or history',()=>{
 const old=structuredClone(card),p=planVocabularyReview(card,'good',{at});
 const expected=fsrs().next(createEmptyCard(at),at,Rating.Good).card;
 assert.deepEqual(p.fsrsCard,JSON.parse(JSON.stringify(expected)));
 assert.equal(p.repetitions,3);assert.equal(p.reviewHistory.length,2);
 assert.equal(p.id,id);assert.equal(p.front,'de winkel');assert.deepEqual(card,old);
});
test('Existing serialized FSRS cards are hydrated and scheduled exactly like classic',()=>{
 const initial=planVocabularyReview(card,'again',{at});
 const later=new Date('2026-10-23T12:00:00Z');
 const p=planVocabularyReview(initial,'hard',{at:later});
 const expected=fsrs().next({...initial.fsrsCard,due:new Date(initial.fsrsCard.due),last_review:new Date(initial.fsrsCard.last_review)},later,Rating.Hard).card;
 assert.deepEqual(p.fsrsCard,JSON.parse(JSON.stringify(expected)));assert.equal(p.repetitions,4);
 assert.throws(()=>planVocabularyReview(card,'perfect',{at}),/calificación/);
 assert.throws(()=>planVocabularyReview({...card,fsrsCard:{due:'broken'}},'good',{at}),/FSRS/);
});
test('Review persistence requires an authenticated revision and never falls back to overwriting records',async()=>{
 const seen=[];
 const db={rpc:async(name,args)=>{seen.push([name,args]);return {data:{id,reviewId:id,repetitions:3},error:null};}};
 await assert.rejects(saveVocabularyReview(db,'',card,'good',{at,reviewId:id}),/sesión/);
 await assert.rejects(saveVocabularyReview(db,uid,card,'good',{at,reviewId:id}),/versión/);
 await saveVocabularyReview(db,uid,{...card,updatedAt:at.toISOString()},'good',{at,reviewId:id});
 assert.equal(seen.length,1);assert.equal(seen[0][0],'selflearn_review_vocabulary');
 assert.equal(seen[0][1].p_card,id);assert.equal(seen[0][1].p_expected_updated_at,at.toISOString());
 assert.equal(seen[0][1].p_payload.repetitions,3);
 const unavailable={rpc:async()=>({error:{message:'not configured'}})};
 await assert.rejects(saveVocabularyReview(unavailable,uid,{...card,updatedAt:at.toISOString()},'good',{at,reviewId:id}),/not configured/);
});
