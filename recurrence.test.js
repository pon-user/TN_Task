import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,completeTask,dailyXP} from '../src/domain/core.js';
import {nextOccurrence,finishOccurrence,undoOccurrence,activeRules} from '../src/domain/recurrence.js';
const rule={id:'r1',title:'水やり',frequency:'daily',currentOccurrenceDate:'2026-10-20',isPaused:false,isDeleted:false};
test('daily, weekly, month end, leap day',()=>{
 assert.equal(nextOccurrence(rule,'2026-10-20'),'2026-10-21');
 assert.equal(nextOccurrence({...rule,frequency:'weekly',weekdays:[1,3]},'2026-10-21'),'2026-10-26');
 assert.equal(nextOccurrence({...rule,frequency:'monthly',dayOfMonth:31},'2026-01-31'),'2026-02-28');
 assert.equal(nextOccurrence({...rule,frequency:'monthly',dayOfMonth:31},'2028-01-31'),'2028-02-29');
});
test('one outstanding occurrence, completion and undo',()=>{
 const s={...initialState(),recurrenceRules:[rule]};const d=new Date('2026-10-21T10:00:00');const done=finishOccurrence(s,'r1',d);
 assert.equal(done.recurrenceRules[0].currentOccurrenceDate,'2026-10-22');assert.equal(done.xpEvents.length,1);assert.equal(dailyXP(done.xpEvents,'2026-10-21').total,66);
 assert.equal(activeRules(done,'2026-10-21').length,0);
 const back=undoOccurrence(done,'repeat:r1@2026-10-20');assert.equal(back.recurrenceRules[0].currentOccurrenceDate,'2026-10-20');assert.equal(dailyXP(back.xpEvents,'2026-10-21').total,0);
});
test('skip does not grant XP',()=>{const s={...initialState(),recurrenceRules:[rule]};const v=finishOccurrence(s,'r1',new Date('2026-10-21T10:00:00'),true);assert.equal(v.xpEvents.length,0);assert.equal(v.occurrenceEvents[0].eventType,'skipped')});
test('single task XP shares remaining recurring count',()=>{const s={...initialState(),recurrenceRules:[rule],tasks:[{id:'t1',title:'a',plannedDate:'2026-10-21',status:'open'}]};const d=completeTask(s,'t1',new Date('2026-10-21T10:00:00'));assert.equal(d.xpEvents[0].basePaid,25)});

test('every N weeks uses scheduled anchor, even when completed late',()=>{
 const r={...rule,frequency:'interval_weekly',interval:2,currentOccurrenceDate:'2026-10-01'};
 assert.equal(nextOccurrence(r,'2026-10-01'),'2026-10-15');
 const done=finishOccurrence({...initialState(),recurrenceRules:[r]},'r1',new Date('2026-10-21T10:00:00'));
 assert.equal(done.recurrenceRules[0].currentOccurrenceDate,'2026-10-15');
 assert.equal(activeRules(done,'2026-10-21').length,1);
 assert.equal(undoOccurrence(done,'repeat:r1@2026-10-01').recurrenceRules[0].currentOccurrenceDate,'2026-10-01');
});
test('N months preserves original 31st anchor through February',()=>{
 const r={...rule,frequency:'interval_monthly',interval:1,anchorDay:31};
 assert.equal(nextOccurrence(r,'2027-01-31'),'2027-02-28');
 assert.equal(nextOccurrence(r,'2027-02-28'),'2027-03-31');
 assert.equal(nextOccurrence(r,'2028-01-31'),'2028-02-29');
 assert.equal(nextOccurrence({...r,interval:2},'2028-01-31'),'2028-03-31');
});
test('invalid N is rejected',()=>{
 assert.throws(()=>nextOccurrence({...rule,frequency:'interval_weekly',interval:0},'2026-10-21'));
 assert.throws(()=>nextOccurrence({...rule,frequency:'interval_monthly',interval:121},'2026-10-21'));
});
