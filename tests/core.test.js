import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBattle,guardMax,WIN_TIERS,DAMAGE_TIERS,initialState,completeTask,undoTask,deleteTask,dailyXP,totalXP,stats,evaluateMorning,unlockedTitles,dashboardItems,taskBucket} from '../src/domain/core.js';
const at=(day,hour=10)=>new Date(`${day}T${String(hour).padStart(2,'0')}:00:00`);
const single=(id,date,due=date)=>({id,title:id,category:'健康',plannedDate:date,dueDate:due,status:'open',deletedAt:null});
test('guard, damage, advanced battle classification',()=>{
 for(const [level,hp] of [[1,1],[4,1],[5,2],[14,2],[15,3],[29,3],[30,4],[49,4],[50,5]])assert.equal(guardMax(level),hp);
 const b=buildBattle(2,1,1,15);assert.equal(b.outcome,'win');assert.equal(b.allClear,false);assert.equal(b.clearRate,2/3);
 assert.equal(buildBattle(0,2,0,50).outcome,'loss');assert.equal(buildBattle(0,0,1,1).outcome,'no_battle');
 const o=buildBattle(2,1,3,5);assert.equal(o.overkill,2);assert.equal(o.rawDamage,5);
});
test('37 title target definitions and unlock',()=>{
 assert.equal(WIN_TIERS.length+DAMAGE_TIERS.length+4,37);
 assert.equal(unlockedTitles({wins:1000,damage:10000,longestStreak:7,battles:30,averageRate:.95}).length,37);
});
test('single task dashboard due vs planned precedence and no dates',()=>{
 const s=initialState();s.tasks=[single('today','2026-10-22'),single('late','2026-10-21'),single('future','2026-10-27'),single('waiting','2026-10-20','2026-10-28'),single('undated',null,null)];
 const d=dashboardItems(s,'2026-10-22');
 assert.deepEqual(d.overdue.map(x=>x.id),['late']);assert.deepEqual(d.today.map(x=>x.id),['today','waiting']);assert.deepEqual(d.future.map(x=>x.id),['future']);assert.deepEqual(d.undated.map(x=>x.id),['undated']);
 assert.equal(taskBucket(single('x','2026-10-10','2026-10-23'),'2026-10-22'),'today');
});
test('single completion earns XP once, done cannot be deleted; undo/redone is idempotent',()=>{
 let s=initialState();s.tasks=[single('a','2026-10-22'),single('b','2026-10-22')];
 s=completeTask(s,'a',at('2026-10-22'));assert.equal(dailyXP(s.xpEvents,'2026-10-22').total,41);
 assert.throws(()=>deleteTask(s,'a'),/削除できません/);
 s=undoTask(s,'a');assert.equal(totalXP(s.xpEvents),0);
 assert.throws(()=>deleteTask(s,'a'),/削除できません/);
 s=completeTask(s,'a',at('2026-10-22',11));assert.equal(s.xpEvents.length,1);assert.equal(totalXP(s.xpEvents),41);
 s=undoTask(s,'a');s=completeTask(s,'a',at('2026-10-23'));assert.equal(s.xpEvents.length,1);assert.equal(totalXP(s.xpEvents),0);
});
test('daily XP share and morning battle counts every overdue repeat occurrence',()=>{
 let s=initialState();s.tasks=[single('a','2026-10-19'),single('b','2026-11-10')];
 s.recurrenceRules=[{id:'r',title:'毎日',frequency:'daily',startDate:'2026-10-18',isPaused:false,isDeleted:false}];
 s=completeTask(s,'b',at('2026-10-20'));
 const battle=evaluateMorning(s,at('2026-10-21',6));
 assert.equal(battle.F,1);assert.equal(battle.R,4); // single a + Oct 18,19,20
 assert.equal(battle.enemyMaxHp,4);assert.equal(battle.rawDamage,1);
 assert.equal(evaluateMorning({...s,battleRecords:[battle]},at('2026-10-21',7)),null);
});
test('stats distinguish all-clear and longest run',()=>{
 const b=[{...buildBattle(2,1,1,5),battleDate:'2026-10-20'},{...buildBattle(3,0,0,5),battleDate:'2026-10-21'}];
 const result=stats(b);assert.equal(result.wins,2);assert.equal(result.allClear,1);assert.equal(result.damage,6);assert.equal(result.longestStreak,2);
});
