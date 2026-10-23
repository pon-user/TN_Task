from pathlib import Path
p=Path('/mnt/data/tanu_v081_work')
core=p/'src/domain/core.js';s=core.read_text()
a=s.index('export function evaluateMorning(');b=s.index('\nexport function stats(',a)
s=s[:a]+'''// The previous achievement day closes at 04:00. The battle is presented from
// 06:00 onward so the morning display stays familiar, but no 04:00-06:00 action
// is mixed into the previous day's results.
export const MORNING_BATTLE_HOUR=6;
export function battleWindowForDate(battleDate){
 const [year,month,day]=battleDate.split('-').map(Number);
 return {
  targetDate:addDays(battleDate,-1),
  start:new Date(year,month-1,day-1,LOGICAL_DAY_START_HOUR),
  end:new Date(year,month-1,day,LOGICAL_DAY_START_HOUR),
 };
}
export function evaluateMorning(state,now=new Date(),random=Math.random){
 const battleDate=dateKey(now);
 if(now.getHours()<MORNING_BATTLE_HOUR||state.battleRecords.some(b=>b.battleDate===battleDate))return null;
 const {targetDate,start,end}=battleWindowForDate(battleDate);
 const active=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)>=start&&new Date(e.completedAt)<end);
 const unique=[...new Map(active.map(e=>[e.sourceId,e])).values()];
 const F=unique.filter(e=>isAdvance({plannedDate:e.plannedDateAtCompletion,dueDate:e.dueDateAtCompletion},targetDate)).length,C=unique.length-F;
 // Recover the 04:00 snapshot as closely as stored timestamps allow, even if
 // the user completes an overdue task between 04:00 and the 06:00 reveal.
 const openAtCutoff=state.tasks.filter(t=>!t.deletedAt&&(!t.createdAt||new Date(t.createdAt)<end)&&isDue(t,targetDate)&&
   (t.status==='open'||(t.status==='done'&&t.completedAt&&new Date(t.completedAt)>=end))).length;
 const atCutoff={...state,
   recurrenceRules:(state.recurrenceRules||[]).filter(r=>!r.createdAt||new Date(r.createdAt)<end),
   occurrenceEvents:(state.occurrenceEvents||[]).filter(e=>!e.occurredAt||new Date(e.occurredAt)<end),
 };
 const R=openAtCutoff+pendingOccurrences(atCutoff,targetDate).length;
 const eligibleXP=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)<end);
 const level=levelFromXP(totalXP(eligibleXP));
 return {battleDate,targetDate,windowStart:start.toISOString(),windowEnd:end.toISOString(),...buildBattle(C,R,F,level),enemyId:pickEnemy(random),levelAtBattle:level,createdAt:stampNow(now)};
}
''' + s[b:]
core.write_text(s)
main=p/'src/main.jsx';s=main.read_text()
s=s.replace('午前6時に確定した戦闘結果だよ','朝4時に締め切った実績を、朝6時に表示した結果だよ')
s=s.replace('前日6時〜当日6時の行動が、朝6時以降の最初の起動で戦闘になるよ。','前日4時〜当日4時の実績を締め切り、朝6時以降に戦闘で振り返るよ。')
s=s.replace('午前6時以降の初回起動時に、前日6時〜当日6時の実績を1回だけ確定。','午前4時に前日の実績を締め切り、午前6時以降の初回起動時に前日4時〜当日4時の実績を1回だけ評価。')
s=s.replace('午前6時の戦闘は1日1回。','実績は朝4時締め、戦闘は朝6時以降に1日1回。')
main.write_text(s)
package=p/'package.json';s=package.read_text().replace('"version": "0.8.0"','"version": "0.8.1"');package.write_text(s)
print('battle 4am cut-off / 6am reveal aligned')
