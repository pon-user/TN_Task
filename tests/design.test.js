import test from 'node:test';
import assert from 'node:assert/strict';
import {THEME_META,THEME_OPTIONS,normalizeTheme,levelUpEvent} from '../src/domain/designTheme.js';
import {initialState,levelFromXP,STORAGE_KEY,validateState} from '../src/domain/core.js';

test('all three palettes are distinct and have valid ids',()=>{
 assert.deepEqual(THEME_OPTIONS.map(x=>x.id),['dark','light','warm']);
 assert.equal(new Set(THEME_OPTIONS.map(x=>x.preview[2])).size,3);
 assert.ok(THEME_OPTIONS.every(x=>x.preview.length===3));
 assert.ok(THEME_OPTIONS.every(x=>/^#[0-9a-f]{6}$/i.test(THEME_META[x.id])));
});
test('theme selection handles old saves and invalid ids',()=>{
 assert.equal(normalizeTheme(undefined),'dark');
 assert.equal(normalizeTheme('any'),'dark');
 assert.equal(normalizeTheme('light'),'light');
 assert.equal(normalizeTheme('warm'),'warm');
 const old=validateState(initialState());
 assert.equal(normalizeTheme(old.settings.theme),'dark');
 const updated=validateState({...old,settings:{...old.settings,theme:'warm'}});
 assert.equal(updated.settings.theme,'warm');
 assert.equal(STORAGE_KEY,'pon_task_v1_snapshot');
});
test('level-up event is presentation-only: no toast on XP loss or same-level XP',()=>{
 assert.equal(levelUpEvent(0,66,levelFromXP),null);
 assert.deepEqual(levelUpEvent(66,101,levelFromXP),{from:1,to:2,gain:35});
 assert.equal(levelUpEvent(100,100,levelFromXP),null);
 assert.equal(levelUpEvent(100,99,levelFromXP),null);
 assert.deepEqual(levelUpEvent(390,450,levelFromXP),{from:2,to:3,gain:60});
});
