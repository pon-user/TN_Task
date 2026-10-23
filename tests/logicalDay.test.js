import test from 'node:test';
import assert from 'node:assert/strict';
import {LOGICAL_DAY_START_HOUR,MORNING_BATTLE_HOUR,logicalDateKey,dateKey,initialState,completeTask,dailyXP,totalXP,dashboardItems,evaluateMorning,battleWindowForDate} from '../src/domain/core.js';
import {finishOccurrence,pendingOccurrences} from '../src/domain/recurrence.js';
import {localRecordDate} from '../src/domain/uiDates.js';
const clock=(y,m,d,h,min=0,sec=0)=>new Date(y,m-1,d,h,min,sec);
const single=(id,date)=>({id,title:id,status:'open',plannedDate:date,dueDate:date,deletedAt:null,createdAt:clock(2026,10,22,10).toISOString()});
const rule=(id,date)=>({id,title:id,frequency:'daily',startDate:date,currentOccurrenceDate:date,isPaused:false,isDeleted:false,createdAt:clock(2026,10,22,10).toISOString()});
test('the achievement day flips at exactly 04:00, not at calendar midnight',()=>{
 assert.equal(LOGICAL_DAY_START_HOUR,4);assert.equal(MORNING_BATTLE_HOUR,4);
 assert.equal(logicalDateKey(clock(2026,10,23,23,59,59)),'2026-10-23');
 assert.equal(logicalDateKey(clock(2026,10,24,0,0)),'2026-10-23');
 assert.equal(logicalDateKey(clock(2026,10,24,3,59,59)),'2026-10-23');
 assert.equal(logicalDateKey(clock(2026,10,24,4,0)),'2026-10-24');
 assert.equal(dateKey(clock(2026,10,24,0,1)),'2026-10-24','physical calendar dates are not rewritten');
 assert.equal(logicalDateKey(clock(2027,1,1,1,1)),'2026-12-31');
 assert.equal(localRecordDate(clock(2026,10,24,3,10).toISOString()),'2026-10-23');
});
test('XP before 04:00 belongs to the previous logical day and 04:00 starts another 50/15 budget',()=>{
 let s=initialState();s.tasks=[single('a','2026-10-23'),single('b','2026-10-23'),single('c','2026-10-24')];
 s=completeTask(s,'a',clock(2026,10,23,23,55));
 s=completeTask(s,'b',clock(2026,10,24,3,59,59));
 const one=dailyXP(s.xpEvents,'2026-10-23');assert.equal(one.base,50);assert.equal(one.firstBonus,15);assert.equal(one.countBonus,2);assert.equal(one.total,67);
 assert.equal(dailyXP(s.xpEvents,'2026-10-24').total,0);
 s=completeTask(s,'c',clock(2026,10,24,4,0));
 const two=dailyXP(s.xpEvents,'2026-10-24');assert.equal(two.base,50);assert.equal(two.firstBonus,15);assert.equal(two.total,66);
 assert.equal(totalXP(s.xpEvents),133);
});
test('recurrence at 03:59 completes previous day; at 04:00 today occurrence is available',()=>{
 let s=initialState();s.recurrenceRules=[rule('repeat','2026-10-23')];
 const before=clock(2026,10,24,3,59,59);
 s=finishOccurrence(s,'repeat',before,false,'2026-10-23');
 assert.equal(s.xpEvents[0].earnedDate,'2026-10-23');
 assert.deepEqual(pendingOccurrences(s,'2026-10-23').map(x=>x.occurrenceDate),[]);
 assert.deepEqual(pendingOccurrences(s,'2026-10-24').map(x=>x.occurrenceDate),['2026-10-24']);
 s=finishOccurrence(s,'repeat',clock(2026,10,24,4,0),false,'2026-10-24');
 assert.equal(s.xpEvents[1].earnedDate,'2026-10-24');
});
test('after midnight before 4am, Home does not advance today tasks or mark them overdue',()=>{
 const s=initialState();s.tasks=[single('current','2026-10-23'),single('future','2026-10-24')];
 const d=dashboardItems(s,logicalDateKey(clock(2026,10,24,3,59)));
 assert.equal(d.today.length,1);assert.equal(d.future.length,1);assert.equal(d.overdue.length,0);
 const changed=dashboardItems(s,logicalDateKey(clock(2026,10,24,4,0)));
 assert.equal(changed.today.length,1);assert.equal(changed.overdue.length,1);
});
test('battle runs at 4 and summarizes the previous 4:00 to 4:00 logical day',()=>{
 let s=initialState();s.tasks=[single('a','2026-10-23'),single('b','2026-10-24')];
 s=completeTask(s,'a',clock(2026,10,24,3,59));
 s=completeTask(s,'b',clock(2026,10,24,5,0));
 assert.equal(evaluateMorning(s,clock(2026,10,24,3,59)),null);
 const b=evaluateMorning(s,clock(2026,10,24,4,0),()=>0);
 assert.equal(b.C,1);assert.equal(b.F,0);assert.equal(b.R,0);
 assert.equal(b.targetDate,'2026-10-23');
 assert.equal(b.windowStart,clock(2026,10,23,4,0).toISOString());
 assert.equal(b.windowEnd,clock(2026,10,24,4,0).toISOString());
 assert.deepEqual(Object.keys(battleWindowForDate('2026-10-24')).sort(),['end','start','targetDate']);
});
test('overdue tasks completed after 4am still count as missed at the 4am cutoff',()=>{
 let s=initialState();s.tasks=[single('late','2026-10-23')];
 s=completeTask(s,'late',clock(2026,10,24,5,25));
 const b=evaluateMorning(s,clock(2026,10,24,6,5),()=>0);
 assert.equal(b.C,0);assert.equal(b.F,0);assert.equal(b.R,1);
});
test('a repeat completed after 4am still counted pending at the 4am cutoff',()=>{
 let s=initialState();s.recurrenceRules=[rule('r','2026-10-23')];
 s=finishOccurrence(s,'r',clock(2026,10,24,5,25),false,'2026-10-23');
 const b=evaluateMorning(s,clock(2026,10,24,6,1),()=>0);
 assert.equal(b.C,0);assert.equal(b.F,0);assert.equal(b.R,1);
});
test('legacy already-saved battle is not recalculated under the new window',()=>{
 const s=initialState();s.battleRecords=[{battleDate:'2026-10-24',enemyMaxHp:1}];
 assert.equal(evaluateMorning(s,clock(2026,10,24,9,30)),null);
});
