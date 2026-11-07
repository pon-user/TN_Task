import test from 'node:test';
import assert from 'node:assert/strict';
import {isJapaneseHoliday} from '../src/domain/japaneseHolidays.js';
import {pendingOccurrences,nextFutureDate} from '../src/domain/recurrence.js';
import {initialState} from '../src/domain/core.js';

test('Japanese holidays include substitute, citizens, equinox and Olympic shifts',()=>{
 for(const day of ['2026-01-01','2026-05-06','2026-09-22','2026-09-23','2026-11-23','2027-03-22','2020-07-23','2021-07-22'])assert.equal(isJapaneseHoliday(day),true,day);
 for(const day of ['2026-11-02','2026-05-07','2020-07-20','2021-07-19'])assert.equal(isJapaneseHoliday(day),false,day);
});
test('weekday recurrence skips holidays and does not accumulate missed tasks',()=>{
 const s=initialState();
 const rule={id:'weekdays',title:'出勤',frequency:'weekly',weekdays:[1,2,3,4,5],startDate:'2026-11-01',excludeJapaneseHolidays:true,holidayExclusionFrom:'2026-11-01',isPaused:false,isDeleted:false};
 s.recurrenceRules=[rule];
 assert.deepEqual(pendingOccurrences(s,'2026-11-04').map(x=>x.occurrenceDate),['2026-11-02','2026-11-04']);
 assert.equal(nextFutureDate(rule,'2026-11-02'),'2026-11-04');
});
test('holiday exclusion enabled later keeps earlier occurrences intact',()=>{
 const s=initialState();
 s.recurrenceRules=[{id:'r',title:'平日',frequency:'weekly',weekdays:[1,2,3,4,5],startDate:'2026-11-01',excludeJapaneseHolidays:true,holidayExclusionFrom:'2026-11-04'}];
 assert.deepEqual(pendingOccurrences(s,'2026-11-04').map(x=>x.occurrenceDate),['2026-11-02','2026-11-03','2026-11-04']);
});
