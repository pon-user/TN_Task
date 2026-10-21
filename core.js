import {pickEnemy} from './assets.js';
export const WIN_TIERS=[1,5,10,20,30,50,100,150,200,300,400,500,750,1000];
export const DAMAGE_TIERS=[1,5,10,20,30,50,100,200,300,500,750,1000,1500,2000,3000,4000,5000,7500,10000];
export const STORAGE_KEY='pon_task_v1_snapshot';
export const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const addDays=(key,n)=>{const [y,m,d]=key.split('-').map(Number);return dateKey(new Date(y,m-1,d+n));};
export const guardMax=(lv)=>{if(!Number.isInteger(lv)||lv<1)throw Error('invalid level');return 1+[5,15,30,50].filter(x=>lv>=x).length;};
export const isDue=(t,key)=>[t.plannedDate,t.dueDate].some(x=>x&&x<=key);
export const isAdvance=(t,key)=>{const dates=[t.plannedDate,t.dueDate].filter(Boolean);return !dates.length||dates.every(x=>x>key);};
export function buildBattle(C,R,F,level=1){if(![C,R,F,level].every(Number.isInteger)||C<0||R<0||F<0||level<1)throw Error('invalid battle');const enemyMaxHp=C+R,rawDamage=C+F,enemyRemainHp=Math.max(0,R-F),exterminated=enemyMaxHp>0&&enemyRemainHp===0;const hp=guardMax(level);return {C,R,F,enemyMaxHp,rawDamage,appliedDamage:Math.min(enemyMaxHp,rawDamage),overkill:Math.max(0,rawDamage-enemyMaxHp),enemyRemainHp,exterminated,allClear:enemyMaxHp>0&&R===0,clearRate:enemyMaxHp?C/enemyMaxHp:null,guardMax:hp,guardRemain:Math.max(0,hp-enemyRemainHp),outcome:enemyMaxHp===0?'no_battle':exterminated?'win':'loss'};}
export const initialState=()=>({schemaVersion:1,revision:0,tasks:[],recurrenceRules:[],occurrenceEvents:[],xpEvents:[],battleRecords:[],settings:{selectedTitleId:null}});
export function validateState(s){if(!s||s.schemaVersion!==1||!Array.isArray(s.tasks)||!Array.isArray(s.xpEvents)||!Array.isArray(s.battleRecords))throw Error('保存データの形式が不正です');if(s.recurrenceRules!==undefined&&!Array.isArray(s.recurrenceRules))throw Error('繰り返し形式が不正です');if(s.occurrenceEvents!==undefined&&!Array.isArray(s.occurrenceEvents))throw Error('実施履歴形式が不正です');if(new Set(s.tasks.map(t=>t.id)).size!==s.tasks.length)throw Error('タスクIDが重複しています');if(new Set(s.battleRecords.map(b=>b.battleDate)).size!==s.battleRecords.length)throw Error('戦闘日が重複しています');return s;}
export function dailyXP(events,key){const e=events.filter(x=>!x.reverted&&x.earnedDate===key);const base=e.reduce((a,x)=>a+x.basePaid,0);return {base,firstBonus:e.length?15:0,countBonus:e.length,total:base+(e.length?15:0)+e.length};}
export function totalXP(events){const dates=[...new Set(events.filter(e=>!e.reverted).map(e=>e.earnedDate))];return dates.reduce((sum,d)=>sum+dailyXP(events,d).total,0);}
// Provisional level curve. The XP-to-level threshold remains a design item to align with the habit app.
export const levelFromXP=(xp)=>1+Math.floor(Math.sqrt(Math.max(0,xp)/100));
export function completeTask(state,id,now=new Date()){const t=state.tasks.find(x=>x.id===id);if(!t||t.status==='done'||t.deletedAt)throw Error('完了できないタスクです');const key=dateKey(now),active=state.xpEvents.filter(x=>!x.reverted&&x.earnedDate===key),spent=active.reduce((sum,e)=>sum+e.basePaid,0);const open=state.tasks.filter(x=>x.status==='open'&&!x.deletedAt&&isDue(x,key)).map(x=>x.id);for(const r of (state.recurrenceRules||[])){if(!r.isDeleted&&!r.isPaused&&r.currentOccurrenceDate<=key)open.push(`repeat:${r.id}@${r.currentOccurrenceDate}`);}const remaining=new Set([...open,id]).size;const basePaid=Math.min(Math.max(0,50-spent),Math.ceil(Math.max(0,50-spent)/remaining));const stamp=now.toISOString();return {...state,revision:state.revision+1,tasks:state.tasks.map(x=>x.id===id?{...x,status:'done',completedAt:stamp}:x),xpEvents:[...state.xpEvents,{sourceId:id,earnedDate:key,completedAt:stamp,basePaid,plannedDateAtCompletion:t.plannedDate,dueDateAtCompletion:t.dueDate,reverted:false}]};}
export function undoTask(state,id){const t=state.tasks.find(x=>x.id===id);if(!t||t.status!=='done')throw Error('完了済みではありません');return {...state,revision:state.revision+1,tasks:state.tasks.map(x=>x.id===id?{...x,status:'open',completedAt:null}:x),xpEvents:state.xpEvents.map(e=>e.sourceId===id&&!e.reverted?{...e,reverted:true}:e)};}
export function evaluateMorning(state,now=new Date(),random=Math.random){const battleDate=dateKey(now);if(now.getHours()<6||state.battleRecords.some(b=>b.battleDate===battleDate))return null;const targetDate=addDays(battleDate,-1),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1,6),end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),6);const active=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)>=start&&new Date(e.completedAt)<end);const unique=[...new Map(active.map(e=>[e.sourceId,e])).values()];const F=unique.filter(e=>isAdvance({plannedDate:e.plannedDateAtCompletion,dueDate:e.dueDateAtCompletion},targetDate)).length,C=unique.length-F;const R=state.tasks.filter(t=>!t.deletedAt&&t.status==='open'&&isDue(t,targetDate)).length+(state.recurrenceRules||[]).filter(r=>!r.isDeleted&&!r.isPaused&&r.currentOccurrenceDate<=targetDate).length;const eligibleXP=state.xpEvents.filter(e=>!e.reverted&&new Date(e.completedAt)<end);const level=levelFromXP(totalXP(eligibleXP));return {battleDate,targetDate,windowStart:start.toISOString(),windowEnd:end.toISOString(),...buildBattle(C,R,F,level),enemyId:pickEnemy(random),levelAtBattle:level,createdAt:now.toISOString()};}
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
 return {wins,losses:battles.length-wins,allClear:battles.filter(b=>b.allClear).length,
   damage:ordered.reduce((sum,b)=>sum+b.rawDamage,0),averageRate,battles:battles.length,
   longestStreak,currentStreak:run};
}
export function unlockedTitles(s){
 const result=[];
 WIN_TIERS.forEach(threshold=>{if(s.wins>=threshold)result.push({id:`W-${threshold}`,label:threshold===1000?'千勝のたぬ王':`${threshold}勝のたぬ`,threshold,kind:'win'});});
 DAMAGE_TIERS.forEach(threshold=>{if(s.damage>=threshold)result.push({id:`D-${threshold}`,label:threshold===10000?'万撃のたぬ神':`${threshold}撃のたぬ`,threshold,kind:'damage'});});
 if(s.longestStreak>=3)result.push({id:'S-3',label:'三連勝のたぬ',kind:'streak',threshold:3});
 if(s.longestStreak>=7)result.push({id:'S-7',label:'七連勝のたぬ',kind:'streak',threshold:7});
 if(s.battles>=7&&s.averageRate>=.8)result.push({id:'A-80',label:'堅実なたぬ',kind:'average',threshold:80});
 if(s.battles>=20&&s.averageRate>=.9)result.push({id:'A-90',label:'達人たぬ',kind:'average',threshold:90});
 return result;
}
