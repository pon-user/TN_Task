import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,dailyXP,dashboardItems} from '../src/domain/core.js';
import {nextOccurrence,pendingOccurrences,finishOccurrence,undoOccurrence,pauseRule,nextFutureDate,ruleStart} from '../src/domain/recurrence.js';
const today=d=>new Date(`${d}T10:00:00`);
const recurring=(rest={})=>({id:'r1',title:'毎日',frequency:'daily',startDate:'2026-10-20',currentOccurrenceDate:'2026-10-20',isPaused:false,isDeleted:false,pausedRanges:[],...rest});
test('daily, weekday, month-end leap day and n-week n-month',()=>{
 const r=recurring();assert.equal(nextOccurrence(r,'2026-10-20'),'2026-10-21');
 assert.equal(nextOccurrence({...r,frequency:'weekly',weekdays:[1,3]},'2026-10-21'),'2026-10-26');
 assert.equal(nextOccurrence({...r,frequency:'monthly',dayOfMonth:31},'2026-01-31'),'2026-02-28');
 assert.equal(nextOccurrence({...r,frequency:'monthly',dayOfMonth:31},'2028-01-31'),'2028-02-29');
 assert.equal(nextOccurrence({...r,frequency:'interval_weekly',interval:2},'2026-10-01'),'2026-10-15');
 assert.equal(nextOccurrence({...r,frequency:'interval_monthly',interval:1,anchorDay:31},'2027-02-28'),'2027-03-31');
 assert.equal(nextOccurrence({...r,frequency:'interval_monthly',interval:2,anchorDay:31},'2028-01-31'),'2028-03-31');
});
test('selected start date is used for n weeks and n months',()=>{
 let r=recurring({startDate:'2026-11-05',currentOccurrenceDate:'2026-11-05',frequency:'interval_weekly',interval:2});
 let s={...initialState(),recurrenceRules:[r]};
 assert.equal(pendingOccurrences(s,'2026-11-18').length,1);
 assert.equal(pendingOccurrences(s,'2026-11-19').length,2);
 r=recurring({startDate:'2026-01-31',frequency:'interval_monthly',anchorDay:31,interval:1});s={...initialState(),recurrenceRules:[r]};
 assert.deepEqual(pendingOccurrences(s,'2026-03-31').map(x=>x.occurrenceDate),['2026-01-31','2026-02-28','2026-03-31']);
});
test('weekday and monthly schedules do not generate on an arbitrary non-matching first day',()=>{
 const monday=recurring({frequency:'weekly',weekdays:[1],startDate:'2026-10-22'});
 assert.equal(ruleStart(monday),'2026-10-26');
 const month=recurring({frequency:'monthly',dayOfMonth:15,startDate:'2026-10-22'});
 assert.equal(ruleStart(month),'2026-11-15');
});
test('uncompleted recurring occurrences accumulate, skip only one instance and keep others',()=>{
 let s={...initialState(),recurrenceRules:[recurring()]};
 assert.deepEqual(pendingOccurrences(s,'2026-10-22').map(x=>x.occurrenceDate),['2026-10-20','2026-10-21','2026-10-22']);
 s=finishOccurrence(s,'r1',today('2026-10-22'),true,'2026-10-21');
 assert.deepEqual(pendingOccurrences(s,'2026-10-22').map(x=>x.occurrenceDate),['2026-10-20','2026-10-22']);
 s=finishOccurrence(s,'r1',today('2026-10-22'),false,'2026-10-22');
 assert.equal(s.xpEvents.length,1);
 assert.deepEqual(pendingOccurrences(s,'2026-10-22').map(x=>x.occurrenceDate),['2026-10-20']);
 s=undoOccurrence(s,'repeat:r1@2026-10-22');
 assert.equal(dailyXP(s.xpEvents,'2026-10-22').total,0);
 assert.deepEqual(pendingOccurrences(s,'2026-10-22').map(x=>x.occurrenceDate),['2026-10-20','2026-10-22']);
 s=finishOccurrence(s,'r1',today('2026-10-23'),false,'2026-10-22');
 assert.equal(s.xpEvents.length,1,'same occurrence must not mint new XP');
 assert.equal(dailyXP(s.xpEvents,'2026-10-23').total,0);
});
test('recurring missed item moves into overdue bucket, future schedule count excludes paused rule',()=>{
 let s={...initialState(),recurrenceRules:[recurring({frequency:'interval_weekly',interval:2})]};
 let items=dashboardItems(s,'2026-11-05');assert.equal(items.overdue.length,2);assert.equal(items.today.length,0);
 assert.equal(nextFutureDate(s.recurrenceRules[0],'2026-11-05'),'2026-11-17');
 s=pauseRule(s,'r1','2026-11-05');assert.equal(pendingOccurrences(s,'2026-11-20').length,2);assert.equal(nextFutureDate(s.recurrenceRules[0],'2026-11-20'),null);
 s=pauseRule(s,'r1','2026-11-20');assert.deepEqual(pendingOccurrences(s,'2026-11-21').map(x=>x.occurrenceDate),['2026-10-20','2026-11-03']);
});
test('invalid interval rejected',()=>{
 assert.throws(()=>nextOccurrence(recurring({frequency:'interval_weekly',interval:0}),'2026-10-22'));
 assert.throws(()=>nextOccurrence(recurring({frequency:'interval_monthly',interval:121,anchorDay:22}),'2026-10-22'));
});
