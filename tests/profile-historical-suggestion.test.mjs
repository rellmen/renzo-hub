import test from 'node:test';import assert from 'node:assert/strict';import {HISTORICAL_BODY_SUGGESTION,sanitizeBodyProfile} from '../profile.js';
test('historical body suggestion is opt-in and distinct from a new measurement',()=>{
 assert.equal(HISTORICAL_BODY_SUGGESTION.height,1.70);
 assert.equal(HISTORICAL_BODY_SUGGESTION.startWeight,84);
 assert.deepEqual(sanitizeBodyProfile(HISTORICAL_BODY_SUGGESTION),{startWeight:84,height:1.7,phases:['78','74.5']});
});
