import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,TANU,enemyArt,tanuArt,pickEnemy,battlePoses} from '../src/domain/assets.js';
import {buildBattle,evaluateMorning,initialState} from '../src/domain/core.js';
test('eight distinct enemies and three valid poses',()=>{assert.equal(ENEMIES.length,8);assert.equal(new Set(ENEMIES.map(x=>x.id)).size,8);for(const e of ENEMIES){for(const pose of ['normal','victory','defeat'])assert.match(enemyArt(e.id,pose),new RegExp(`${e.stem}_${pose}\\.png$`));}});
test('tanuki animations use approved sprite files',()=>{assert.match(tanuArt('attack'),/09_sword_attack\.svg$/);assert.match(tanuArt('proud'),/13_proud\.svg$/);assert.match(tanuArt('panic'),/14_panicked\.svg$/);assert.equal(Object.keys(TANU).length,12)});
test('random enemy picks every slot and is persisted in battle record',()=>{ENEMIES.forEach((e,i)=>assert.equal(pickEnemy(()=>(i+.2)/8),e.id));const now=new Date(2026,9,22,8);const state=initialState();state.tasks=[{id:'x',status:'open',plannedDate:'2026-10-21',dueDate:null,deletedAt:null}];const b=evaluateMorning(state,now,()=>.999);assert.equal(b.enemyId,ENEMIES[7].id);});
test('enemy outcome images invert tanuki win and enemy win',()=>{const win=buildBattle(1,0,0,5),loss=buildBattle(0,1,0,5);assert.deepEqual(battlePoses(win,'result'),{tanu:'proud',enemy:'defeat'});assert.equal(battlePoses(loss,'result').enemy,'victory');assert.equal(battlePoses(loss,'counter').tanu,'hit');});
