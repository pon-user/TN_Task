import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, validateState, isAdvance, completeTask, evaluateMorning, totalXP, dashboardItems, addDays, dateKey} from '../src/domain/core.js';
import {pendingOccurrences, pauseRule, finishOccurrence, undoOccurrence} from '../src/domain/recurrence.js';
import {localRecordDate} from '../src/domain/uiDates.js';
import {normalizeTheme} from '../src/domain/designTheme.js';

const legacyRule={id:'old-pause',title:'レガシー停止',frequency:'daily',currentOccurrenceDate:'2026-10-20',isPaused:true,isDeleted:false};

test('legacy paused recurrence never creates new obligations while paused, and resumes without backfill',()=>{
  const state={...initialState(),recurrenceRules:[legacyRule]};
  assert.deepEqual(pendingOccurrences(state,'2026-10-22').map(x=>x.occurrenceDate),['2026-10-20']);
  const resumed=pauseRule(state,'old-pause','2026-10-23');
  assert.deepEqual(pendingOccurrences(resumed,'2026-10-23').map(x=>x.occurrenceDate),['2026-10-20','2026-10-23']);
});

test('modern paused recurrence keeps old pending but skips future paused dates',()=>{
 const state={...initialState(),recurrenceRules:[{...legacyRule,id:'new',isPaused:false,startDate:'2026-10-20'}]};
 const stopped=pauseRule(state,'new','2026-10-21');
 assert.deepEqual(pendingOccurrences(stopped,'2026-10-23').map(x=>x.occurrenceDate),['2026-10-20','2026-10-21']);
 const resumed=pauseRule(stopped,'new','2026-10-24');
 assert.deepEqual(pendingOccurrences(resumed,'2026-10-24').map(x=>x.occurrenceDate),['2026-10-20','2026-10-21','2026-10-24']);
});

test('undated completion remains auxiliary/advance attack as specified in Obsidian design',()=>{
 assert.equal(isAdvance({plannedDate:null,dueDate:null},'2026-10-22'),true);
 assert.equal(isAdvance({plannedDate:'2026-10-23',dueDate:'2026-10-24'},'2026-10-22'),true);
 const s={...initialState(),tasks:[{id:'u',title:'undated',status:'open',plannedDate:null,dueDate:null}]};
 const done=completeTask(s,'u',new Date(2026,9,22,9));
 const battle=evaluateMorning(done,new Date(2026,9,23,6,1),()=>0);
 assert.equal(battle.C,0);assert.equal(battle.F,1);
});

test('timestamp display is local and supports cross-midnight without slicing UTC date',()=>{
 const stamp=new Date(2026,9,23,0,30).toISOString();
 assert.equal(localRecordDate(stamp),dateKey(new Date(new Date(stamp).getFullYear(), new Date(stamp).getMonth(), new Date(stamp).getDate()-1)));
 assert.equal(localRecordDate(null),'—');
});

test('migration preserves tasks, XP, battle and theme; recurring history remains idempotent',()=>{
 let old=initialState();old.tasks=[{id:'a',title:'task',status:'open',plannedDate:'2026-10-22'}];
 old.recurrenceRules=[{id:'r',title:'daily',frequency:'daily',startDate:'2026-10-22',currentOccurrenceDate:'2026-10-22',isPaused:false,isDeleted:false}];
 old.settings={selectedTitleId:null,theme:'warm'};
 const original=JSON.stringify(old);
 let state=validateState(JSON.parse(original));
 assert.equal(normalizeTheme(state.settings.theme),'warm');
 state=completeTask(state,'a',new Date(2026,9,22,10));
 state=finishOccurrence(state,'r',new Date(2026,9,22,11),false,'2026-10-22');
 const xp=totalXP(state.xpEvents);
 const undone=undoOccurrence(state,'repeat:r@2026-10-22');
 const redone=finishOccurrence(undone,'r',new Date(2026,9,22,12),false,'2026-10-22');
 assert.equal(totalXP(redone.xpEvents),xp);
 assert.equal(redone.xpEvents.length,2);
 assert.equal(dashboardItems(redone,'2026-10-22').today.length,0);
 assert.equal(original.includes('warm'),true);
});
