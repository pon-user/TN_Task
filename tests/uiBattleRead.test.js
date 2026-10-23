import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingAutoBattle} from '../src/domain/battlePresentation.js';
const date='2026-10-23';
const good={battleDate:date,enemyMaxHp:3,C:1,R:2,F:0};
test('a real encounter from first daily evaluation is presented until dismissed',()=>{
 const initial={battleRecords:[good],settings:{}};
 assert.deepEqual(pendingAutoBattle(initial,date),good);
 assert.equal(pendingAutoBattle({...initial,settings:{lastBattleAcknowledgedDate:date}},date),null);
 assert.deepEqual(pendingAutoBattle(initial,'2026-10-22'),null);
});
test('a no-battle result with future task damage must not open a battle popup',()=>{
 assert.equal(pendingAutoBattle({battleRecords:[{battleDate:date,enemyMaxHp:0,rawDamage:1,F:1}],settings:{}},date),null);
});
