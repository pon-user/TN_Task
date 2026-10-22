import {pickEnemy} from './assets.js';
import {pendingOccurrences} from './recurrence.js';
export const WIN_TIERS=[1,5,10,20,30,50,100,150,200,300,400,500,750,1000];
export const DAMAGE_TIERS=[1,5,10,20,30,50,100,200,300,500,750,1000,1500,2000,3000,4000,5000,7500,10000];
export const STORAGE_KEY='pon_task_v1_snapshot';
export const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const addDays=(key,n)=>{const [y,m,d]=key.split('-').map(Number);return dateKey(new Date(y,m-1,d+n));};
export const guardMax=(lv)=>{if(!Number.isInteger(lv)||lv<1)throw Error('invalid level');return 1+[5,15,30,50].filter(x=>lv>=x).length;};
export const isDue=(t,key)=>[t.plannedDate,t.dueDate].some(x=>x&&x<=key);
export const isAdvance=(t,key)=>{const dates=[t.plannedDate,t.dueDate].filter(Boolean);return !dates.length||dates.every(x=>x>key);};
export const taskEffectiveDue=t=>t.dueDate||t.plannedDate||null;
export function taskBucket(t,today){
  if(t.status==='done'||t.deletedAt)return 'closed';
  const effective=taskEffectiveDue(t);
  if(effective&&effective<today)return 'overdue';
  if((t.plannedDate&&t.plannedDate<=today)||(t.dueDate&&t.dueDate<=today))return 'today';
  return effective?'future':'undated';
}
export function dashboardItems(state,today){
  const active=state.tasks.filter(t=>!t.deletedAt&&t.status==='open').map(t=>({...t,kind:'single',sourceId:t.id,date:taskEffectiveDue(t),bucket:taskBucket(t,today)}));
  const repeats=pendingOccurrences(state,today).map(r=>({...r,sourceId:r.sourceId,date:r.occurrenceDate,bucket:r.occurrenceDate<today?'overdue':'today'}));
  const all=[...active,...repeats];
  const compare=(a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.title.localeCompare(b.title);
  return {today:all.filter(i=>i.bucket==='today').sort(compare),overdue:all.filter(i=>i.bucket==='overdue').sort(compare),future:all.filter(i=>i.bucket==='future').sort(compare),undated:all.filter(i=>i.bucket==='undated').sort(compare)};
}
export function buildBattle(C,R,F,level=1){
 if(![C,R,F,level].every(Number.isInteger)||C<0||R<0||F<0||level<1)throw Error('invalid battle');
 const enemyMaxHp=C+R,rawDamage=C+F,enemyRemainHp=Math.max(0,R-F),exterminated=enemyMaxHp>0&&enemyRemainHp===0,hp=guardMax(level);
 return {C,R,F,enemyMaxHp,rawDamage,appliedDamage:Math.min(enemyMaxHp,rawDamage),overkill:Math.max(0,rawDamage-enemyMaxHp),enemyRemainHp,exterminated,allClear:enemyMaxHp>0&&R===0,clearRate:enemyMaxHp?C/enemyMaxHp:null,guardMax:hp,guardRemain:Math.max(0,hp-enemyRemainHp),outcome:enemyMaxHp===0?'no_battle':exterminated?'win':'loss'};
}
export const initialState=()=>({schemaVersion:1,revision:0,tasks:[],recurrenceRules:[],occurrenceEvents:[],xpEvents:[],battleRecords:[],settings:{selectedTitleId:null}});
export function validateState(s){
 if(!s||s.schemaVersion!==1||!Array.isArray(s.tasks)||!Array.isArray(s.xpEvents)||!Array.isArray(s.battleRecords))throw Error('保存データの形式が不正です');
 if(s.recurrenceRules!==undefined&&!Array.isArray(s.recurrenceRules))throw Error('繰り返し形式が不正です');
 if(s.occurrenceEvents!==undefined&&!Array.isArray(s.occurrenceEvents))throw Error('実施履歴形式が不正です');
 if(new Set(s.tasks.map(t=>t.id)).size!==s.tasks.length)throw Error('タスクIDが重複しています');
 if(new Set(s.battleRecords.map(b=>b.battleDate)).size!==s.battleRecords.length)throw Error('戦闘日が重複しています');
 return {...s,recurrenceRules:s.recurrenceRules||[],occurrenceEvents:s.occurrenceEvents||[],settings:s.settings||{selectedTitleId:null}};
}
export function dailyXP(events,key){
  const e=events.filter(x=>!x.reverted&&x.earnedDate===key);
  const base=e.reduce((a,x)=>a+x.basePaid,0);
  return {base,firstBonus:e.length?15:0,countBonus:e.length,total:base+(e.length?15:0)+e.length};
}
export function totalXP(events){return [...new Set(events.filter(e=>!e.reverted).map(e=>e.earnedDate))].reduce((sum,d)=>sum+dailyXP(events,d).total,0);}
// Provisional curve until final approved game tuning.
export const levelFromXP=xp=>1+Math.floor(Math.sqrt(Math.max(0,xp)/100));
export const nextLevelAt=lv=>100*lv*lv;
const stampNow=now=>now.toISOString();
function baseReward(state,key,id){
 const active=state.xpEvents.filter(x=>!x.reverted&&x.earnedDate===key);
 const spent=active.reduce((s,e)=>s+e.basePaid,0);
 const open=state.tasks.filter(x=>x.status==='open'&&!x.deletedAt&&isDue(x,key)).map(x=>x.id);
 const repeat=pendingOccurrences(state,key).map(x=>x.sourceId);
 const remaining=Math.max(1,new Set([...open,...repeat,id]).size);
 return Math.min(Math.max(0,50-spent),Math.ceil(Math.max(0,50-spent)/remaining));
}
export function completeTask(state,id,now=new Date()){
 const task=state.tasks.find(x=>x.id===id);
 if(!task||task.status==='done'||task.deletedAt)throw Error('完了できないタスクです');
 const key=dateKey(now),stamp=stampNow(now),past=state.xpEvents.find(e=>e.sourceId===id);
 let xpEvents=state.xpEvents;
 if(!past)xpEvents=[...xpEvents,{sourceId:id,earnedDate:key,completedAt:stamp,basePaid:baseReward(state,key,id),plannedDateAtCompletion:task.plannedDate,dueDateAtCompletion:task.dueDate,reverted:false}];
 else if(past.reverted&&past.earnedDate===key)xpEvents=xpEvents.map(e=>e.sourceId===id?{...e,reverted:false}:e);
 // A previously rewarded source never receives a second XP event, even across days.
 return {...state,revision:state.revision+1,tasks:state.tasks.map(t=>t.id===id?{...t,status:'done',completedAt:stamp}:t),xpEvents};
}
export function undoTask(state,id){
 const t=state.tasks.find(x=>x.id===id);
 if(!t||t.status!=='done')throw Error('完了済みではありません');
 return {...state,revision:state.revision+1,tasks:state.tasks.map(x=>x.id===id?{...x,status:'open',completedAt:null}:x),xpEvents:state.xpEvents.map(e=>e.sourceId===id&&!e.reverted?{...e,reverted:true}:e)};
}
export function deleteTask(state,id){
 const t=state.tasks.find(x=>x.id===id);
 if(!t||t.deletedAt)throw Error('タスクがありません');
 if(t.status==='done'||state.xpEvents.some(e=>e.sourceId===id))throw Error('一度完了したタスクは削除できません');
 return {...state,revision:state.revision+1,tasks:state.tasks.map(x=>x.id===id?{...x,deletedAt:new Date().toISOString()}:x)};
}
export function evaluateMorning(state,now=new Date(),random=Math.random){
 const battleDate=dateKey(now);
 if(now.getHours()<6||state.battleRecords.some(b=>b.battleDate===battleDate))return null;
 const targetDate=addDays(battleDate,-1),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1,6),end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),6);
 const active=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)>=start&&new Date(e.completedAt)<end);
 const unique=[...new Map(active.map(e=>[e.sourceId,e])).values()];
 const F=unique.filter(e=>isAdvance({plannedDate:e.plannedDateAtCompletion,dueDate:e.dueDateAtCompletion},targetDate)).length,C=unique.length-F;
 const R=state.tasks.filter(t=>!t.deletedAt&&t.status==='open'&&isDue(t,targetDate)).length+pendingOccurrences(state,targetDate).length;
 const eligibleXP=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)<end);
 const level=levelFromXP(totalXP(eligibleXP));
 return {battleDate,targetDate,windowStart:start.toISOString(),windowEnd:end.toISOString(),...buildBattle(C,R,F,level),enemyId:pickEnemy(random),levelAtBattle:level,createdAt:stampNow(now)};
}
export function stats(records){
 const ordered=[...records].sort((a,b)=>a.battleDate.localeCompare(b.battleDate));
 const battles=ordered.filter(b=>b.enemyMaxHp>0),wins=battles.filter(b=>b.exterminated).length;
 let run=0,longestStreak=0,lastDate=null;
 for(const b of ordered){
   if(b.enemyMaxHp===0||!b.exterminated){run=0;lastDate=b.battleDate;continue;}
   run=lastDate&&addDays(lastDate,1)===b.battleDate?run+1:1;
   longestStreak=Math.max(longestStreak,run);lastDate=b.battleDate;
 }
 const averageRate=battles.length?battles.reduce((sum,b)=>sum+(b.clearRate??0),0)/battles.length:null;
 return {wins,losses:battles.length-wins,allClear:battles.filter(b=>b.allClear).length,damage:ordered.reduce((sum,b)=>sum+b.rawDamage,0),averageRate,battles:battles.length,longestStreak,currentStreak:run};
}
export function unlockedTitles(s){
 const result=[];
 WIN_TIERS.forEach(n=>{if(s.wins>=n)result.push({id:`W-${n}`,label:n===1000?'千勝のたぬ王':`${n}勝のたぬ`,threshold:n,kind:'win'});});
 DAMAGE_TIERS.forEach(n=>{if(s.damage>=n)result.push({id:`D-${n}`,label:n===10000?'万撃のたぬ神':`${n}撃のたぬ`,threshold:n,kind:'damage'});});
 if(s.longestStreak>=3)result.push({id:'S-3',label:'三連勝のたぬ',kind:'streak',threshold:3});
 if(s.longestStreak>=7)result.push({id:'S-7',label:'七連勝のたぬ',kind:'streak',threshold:7});
 if(s.battles>=7&&s.averageRate>=.8)result.push({id:'A-80',label:'堅実なたぬ',kind:'average',threshold:80});
 if(s.battles>=20&&s.averageRate>=.9)result.push({id:'A-90',label:'達人たぬ',kind:'average',threshold:90});
 return result;
}
