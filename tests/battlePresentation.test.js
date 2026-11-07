import test from 'node:test';
import assert from 'node:assert/strict';
import {BATTLE_STAGE_DURATION_MS,battleMood,battlePlaybackDuration,battleSequence} from '../src/domain/battlePresentation.js';
test('win animation ~6s with a persistent result',()=>{
 const record={exterminated:true,allClear:false,enemyRemainHp:0,guardRemain:2};
 assert.deepEqual(battleSequence(record),['ready','attack','summary','result']);
 assert.equal(battlePlaybackDuration(record),5900);
 assert.match(battleMood(record).action,/今日のタスクへ向かう/);
});
test('loss animation ~8s and a lower-energy message',()=>{
 const record={exterminated:false,allClear:false,enemyRemainHp:3,guardRemain:0};
 assert.deepEqual(battleSequence(record),['ready','attack','counter','summary','result']);
 assert.equal(battlePlaybackDuration(record),7700);
 assert.equal(battleMood(record).kind,'exhausted');
 assert.match(battleMood(record).action,/ゆっくり/);
});
test('full-clear receives stronger encouragement',()=>{
 assert.equal(battleMood({exterminated:true,allClear:true}).kind,'perfect');
 assert.match(battleMood({exterminated:true,allClear:true}).action,/勢いそのまま/);
});
test('durations are bounded and no interactive timing affects battle arithmetic',()=>{
 for(const record of [{enemyRemainHp:0},{enemyRemainHp:1}])assert.ok(battlePlaybackDuration(record)>=5000&&battlePlaybackDuration(record)<=10000);
 assert.deepEqual(Object.keys(BATTLE_STAGE_DURATION_MS),['ready','attack','counter','summary']);
});
