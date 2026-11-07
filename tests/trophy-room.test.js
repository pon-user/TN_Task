import test from 'node:test';
import assert from 'node:assert/strict';
import {titleCatalog,trophyTiers,titleProgress} from '../src/domain/titleShelf.js';
import {WIN_TIERS,DAMAGE_TIERS,unlockedTitles} from '../src/domain/core.js';

test('trophy room has exactly 37 stable title IDs',()=>{
  const items=titleCatalog();
  assert.equal(items.length,37);
  assert.equal(new Set(items.map(x=>x.id)).size,37);
  assert.equal(WIN_TIERS.length,14);
  assert.equal(DAMAGE_TIERS.length,19);
  assert.deepEqual(trophyTiers.map(t=>t.id),['legend','gold','silver','bronze']);
  for(const item of items){
    assert.ok(['win','damage','streak','average'].includes(item.kind));
    assert.ok(trophyTiers.some(t=>t.id===item.tier));
  }
});
test('trophy room pages are within two pages per tier',()=>{
  const items=titleCatalog();
  for(const tier of trophyTiers){
    const n=items.filter(item=>item.tier===tier.id).length;
    assert.ok(n>=1&&n<=18,tier.id+' has '+n);
  }
});
test('catalog IDs agree with earned-title logic',()=>{
  const all=unlockedTitles({wins:1000,damage:10000,longestStreak:7,battles:30,averageRate:1});
  assert.deepEqual(new Set(all.map(x=>x.id)),new Set(titleCatalog().map(x=>x.id)));
});
test('average-rate titles require minimum battle counts',()=>{
  const score={wins:0,damage:0,longestStreak:0,battles:6,averageRate:1};
  const a=titleCatalog().find(x=>x.id==='A-80');
  assert.equal(titleProgress(a,score).eligible,false);
  assert.equal(titleProgress(a,{...score,battles:7}).eligible,true);
});
