import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, logicalDateKey, dateKey, completeTask, dailyXP, evaluateMorning} from '../src/domain/core.js';
import {finishOccurrence, pendingOccurrences} from '../src/domain/recurrence.js';
import {localRecordDate} from '../src/domain/uiDates.js';
const local=(y,m,d,h,min=0,sec=0)=>new Date(y,m-1,d,h,min,sec);
const task=id=>({id,title:id,status:'open',plannedDate:'2026-10-23',dueDate:'2026-10-23',deletedAt:null});
test('business/achievement date switches at 04:00, not midnight',()=>{
 assert.equal(logicalDateKey(local(2026,10,23,23,59)),'2026-10-23');
 assert.equal(logicalDateKey(local(2026,10,24,0,0)),'2026-10-23');
 assert.equal(logicalDateKey(local(2026,10,24,3,59,59)),'2026-10-23');
 assert.equal(logicalDateKey(local(2026,10,24,4)),'2026-10-24');
 assert.equal(dateKey(local(2026,10,24,3,59)),'2026-10-24');
});
test('3:59 completion gets previous day XP, 4:00 gets new day XP',()=>{
 let s=initialState();s.tasks=[task('a'),task('b')];
 s=completeTask(s,'a',local(2026,10,24,3,59,59));
 assert.equal(s.xpEvents[0].earnedDate,'2026-10-23');
 assert.equal(dailyXP(s.xpEvents,'2026-10-23').total,41);
 s=completeTask(s,'b',local(2026,10,24,4,0,0));
 assert.equal(s.xpEvents[1].earnedDate,'2026-10-24');
 assert.equal(dailyXP(s.xpEvents,'2026-10-24').total,66);
 assert.equal(localRecordDate(s.xpEvents[0].completedAt),'2026-10-23');
 assert.equal(localRecordDate(s.xpEvents[1].completedAt),'2026-10-24');
});
test('one repeating task completed at 03:59 stays in prior logical day',()=>{
 const rule={id:'r',title:'run',frequency:'daily',startDate:'2026-10-23',currentOccurrenceDate:'2026-10-23',isPaused:false,isDeleted:false};
 let s={...initialState(),recurrenceRules:[rule]};
 s=finishOccurrence(s,'r',local(2026,10,24,3,59),false,'2026-10-23');
 assert.equal(s.xpEvents[0].earnedDate,'2026-10-23');
 assert.equal(s.occurrenceEvents[0].occurrenceDate,'2026-10-23');
 assert.deepEqual(pendingOccurrences(s,'2026-10-24').map(x=>x.occurrenceDate),['2026-10-24']);
});
test('battle does not start at 03:59, starts at 04:00 and only once',()=>{
 let s=initialState();s.tasks=[task('a')];
 assert.equal(evaluateMorning(s,local(2026,10,24,3,59)),null);
 const res=evaluateMorning(s,local(2026,10,24,4),()=>0);
 assert.equal(res.battleDate,'2026-10-24');
 assert.equal(res.targetDate,'2026-10-23');
 assert.equal(new Date(res.windowStart).getTime(),local(2026,10,23,4).getTime());
 assert.equal(new Date(res.windowEnd).getTime(),local(2026,10,24,4).getTime());
 assert.equal(res.R,1);
 assert.equal(evaluateMorning({...s,battleRecords:[res]},local(2026,10,24,5)),null);
});
test('midnight completions are counted in same day 04:00 battle; after 04:00 excluded',()=>{
 let s=initialState();s.tasks=[task('a'),task('b')];
 s=completeTask(s,'a',local(2026,10,24,2));
 s=completeTask(s,'b',local(2026,10,24,4,1));
 const battle=evaluateMorning(s,local(2026,10,24,4,30),()=>0);
 assert.equal(battle.C,1);
 assert.equal(battle.rawDamage,1);
 assert.equal(battle.targetDate,'2026-10-23');
});
test('migration from old 06:00 cutoff does not count overlapping completions twice',()=>{
 let s=initialState();s.tasks=[task('old'),task('fresh')];
 s=completeTask(s,'old',local(2026,10,23,5));
 s=completeTask(s,'fresh',local(2026,10,23,7));
 const old={battleDate:'2026-10-23',windowEnd:local(2026,10,23,6).toISOString(),enemyMaxHp:1,rawDamage:1};
 const cur=evaluateMorning({...s,battleRecords:[old]},local(2026,10,24,4,1),()=>0);
 assert.equal(new Date(cur.windowStart).getTime(),local(2026,10,23,6).getTime());
 assert.equal(cur.C,1); // only 07:00 task, not the prior day's 05:00 task
});
test('migration keeps already finalized battle for that day, no duplicate',()=>{
 const s={...initialState(),battleRecords:[{battleDate:'2026-10-24',windowEnd:local(2026,10,24,6).toISOString()}]};
 assert.equal(evaluateMorning(s,local(2026,10,24,8)),null);
});

test('repeat skip persists logical day while older saved entries remain compatible',()=>{
 const rule={id:'r',title:'run',frequency:'daily',startDate:'2026-10-23',currentOccurrenceDate:'2026-10-23',isPaused:false,isDeleted:false};
 let s={...initialState(),recurrenceRules:[rule]};
 s=finishOccurrence(s,'r',local(2026,10,24,3,59),true,'2026-10-23');
 assert.equal(s.occurrenceEvents[0].recordedDay,'2026-10-23');
 assert.equal(s.xpEvents.length,0);
});
