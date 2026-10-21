import {addDays,dateKey} from './core.js';
export const occurrenceId=(rule)=>`repeat:${rule.id}@${rule.currentOccurrenceDate}`;
export function nextOccurrence(rule,after){
  const [y,m,d]=after.split('-').map(Number);
  if(rule.frequency==='daily')return addDays(after,1);
  if(rule.frequency==='interval_weekly'){
    const n=Number(rule.interval);
    if(!Number.isInteger(n)||n<1||n>999)throw Error('週の間隔は1〜999で指定してください');
    return addDays(after,n*7);
  }
  if(rule.frequency==='interval_monthly'){
    const n=Number(rule.interval);
    if(!Number.isInteger(n)||n<1||n>120)throw Error('月の間隔は1〜120で指定してください');
    const anchor=Number(rule.anchorDay??rule.dayOfMonth??d);
    if(!Number.isInteger(anchor)||anchor<1||anchor>31)throw Error('基準日が不正です');
    const month=new Date(y,m-1+n,1),last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    return dateKey(new Date(month.getFullYear(),month.getMonth(),Math.min(anchor,last)));
  }
  if(rule.frequency==='weekly'){
    if(!Array.isArray(rule.weekdays)||!rule.weekdays.length)throw Error('曜日が未指定です');
    for(let n=1;n<=7;n++){const k=addDays(after,n),[yy,mm,dd]=k.split('-').map(Number);if(rule.weekdays.includes(new Date(yy,mm-1,dd).getDay()))return k;}
  }
  if(rule.frequency==='monthly'){
    if(!Number.isInteger(rule.dayOfMonth)||rule.dayOfMonth<1||rule.dayOfMonth>31)throw Error('日付が不正です');
    for(let offset=0;offset<3;offset++){
      const month=new Date(y,m-1+offset,1),last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
      const k=dateKey(new Date(month.getFullYear(),month.getMonth(),Math.min(last,rule.dayOfMonth)));
      if(k>after)return k;
    }
  }
  throw Error('繰り返し設定が不正です');
}
export const activeRules=(state,key)=> (state.recurrenceRules||[]).filter(r=>!r.isDeleted&&!r.isPaused&&r.currentOccurrenceDate<=key);
export function finishOccurrence(state,id,now=new Date(),skip=false){
  const rule=(state.recurrenceRules||[]).find(r=>r.id===id&&!r.isDeleted&&!r.isPaused);
  if(!rule)throw Error('繰り返しが見つかりません');
  const key=dateKey(now);if(rule.currentOccurrenceDate>key)throw Error('未来の繰り返しは処理できません');
  const sourceId=occurrenceId(rule),stamp=now.toISOString();
  if((state.occurrenceEvents||[]).some(e=>e.sourceId===sourceId&&!e.reverted))throw Error('処理済みです');
  const event={sourceId,ruleId:id,occurrenceDate:rule.currentOccurrenceDate,eventType:skip?'skipped':'completed',occurredAt:stamp,reverted:false};
  let xpEvents=state.xpEvents;
  if(!skip){
    const active=state.xpEvents.filter(e=>!e.reverted&&e.earnedDate===key);
    const spent=active.reduce((n,e)=>n+e.basePaid,0);
    const open=state.tasks.filter(t=>!t.deletedAt&&t.status==='open'&&[t.plannedDate,t.dueDate].some(d=>d&&d<=key)).map(t=>t.id);
    const repeats=activeRules(state,key).map(occurrenceId);
    const count=new Set([...open,...repeats,sourceId]).size;
    const remaining=Math.max(0,50-spent);
    xpEvents=[...state.xpEvents,{sourceId,earnedDate:key,completedAt:stamp,basePaid:Math.min(remaining,Math.ceil(remaining/count)),plannedDateAtCompletion:rule.currentOccurrenceDate,dueDateAtCompletion:null,reverted:false}];
  }
  return {...state,revision:state.revision+1,recurrenceRules:state.recurrenceRules.map(r=>r.id===id?{...r,currentOccurrenceDate:nextOccurrence(r,['interval_weekly','interval_monthly'].includes(r.frequency)?r.currentOccurrenceDate:key)}:r),occurrenceEvents:[...(state.occurrenceEvents||[]),event],xpEvents};
}
export function undoOccurrence(state,sourceId){
  const e=(state.occurrenceEvents||[]).find(e=>e.sourceId===sourceId&&!e.reverted);
  if(!e)throw Error('取消対象がありません');
  const rule=state.recurrenceRules.find(r=>r.id===e.ruleId);
  if(!rule)throw Error('ルールがありません');
  const history=state.occurrenceEvents.filter(x=>x.ruleId===e.ruleId&&!x.reverted);
  if(history.at(-1)?.sourceId!==sourceId)throw Error('最新の実施回だけ取り消せます');
  return {...state,revision:state.revision+1,recurrenceRules:state.recurrenceRules.map(r=>r.id===e.ruleId?{...r,currentOccurrenceDate:e.occurrenceDate}:r),occurrenceEvents:state.occurrenceEvents.map(x=>x.sourceId===sourceId?{...x,reverted:true}:x),xpEvents:state.xpEvents.map(x=>x.sourceId===sourceId&&!x.reverted?{...x,reverted:true}:x)};
}
