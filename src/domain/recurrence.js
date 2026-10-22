import {addDays,dateKey} from './core.js';
export const occurrenceId=(rule,date=rule.currentOccurrenceDate)=>`repeat:${rule.id}@${date}`;
export const localDay=(key)=>{const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d);};
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
    if(!Number.isInteger(anchor)||anchor<1||anchor>31)throw Error('基準日は1〜31日です');
    const month=new Date(y,m-1+n,1),last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    return dateKey(new Date(month.getFullYear(),month.getMonth(),Math.min(anchor,last)));
  }
  if(rule.frequency==='weekly'){
    if(!Array.isArray(rule.weekdays)||!rule.weekdays.length)throw Error('曜日が未指定です');
    for(let n=1;n<=7;n++){
      const k=addDays(after,n);
      if(rule.weekdays.includes(localDay(k).getDay()))return k;
    }
  }
  if(rule.frequency==='monthly'){
    const anchor=Number(rule.dayOfMonth);
    if(!Number.isInteger(anchor)||anchor<1||anchor>31)throw Error('日付は1〜31日です');
    for(let offset=0;offset<3;offset++){
      const month=new Date(y,m-1+offset,1),last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
      const k=dateKey(new Date(month.getFullYear(),month.getMonth(),Math.min(last,anchor)));
      if(k>after)return k;
    }
  }
  throw Error('繰り返し設定が不正です');
}
export function ruleStart(rule){
  // Legacy data has only currentOccurrenceDate, which already points to its next instance.
  if(!rule.startDate)return rule.currentOccurrenceDate;
  let start=rule.startDate;
  if(rule.frequency==='weekly'&&Array.isArray(rule.weekdays)&&rule.weekdays.length){
    if(!rule.weekdays.includes(localDay(start).getDay())){
      const prev=addDays(start,-1);
      start=nextOccurrence(rule,prev);
    }
  }else if(rule.frequency==='monthly'){
    const [y,m]=start.split('-').map(Number),anchor=Number(rule.dayOfMonth||1);
    const end=new Date(y,m,0).getDate();
    const first=dateKey(new Date(y,m-1,Math.min(anchor,end)));
    if(first<start)start=nextOccurrence(rule,first);
    else start=first;
  }
  return start;
}
function pausedForDate(rule,date){
  // Legacy saves could have isPaused=true without pausedAt. They must not
  // generate new missed occurrences while paused; retain the old pending day.
  if(rule.isPaused&&!rule.pausedAt&&date>(rule.currentOccurrenceDate||ruleStart(rule)))return true;
  if(rule.isPaused&&rule.pausedAt&&date>rule.pausedAt)return true;
  return (rule.pausedRanges||[]).some(range=>date>range.from&&date<range.to);
}
const closedSources=(state)=>new Set((state.occurrenceEvents||[]).filter(e=>!e.reverted).map(e=>e.sourceId));
/** Generate every open scheduled occurrence; no '1 overdue per rule' collapsing. */
export function pendingOccurrences(state,through){
  const closed=closedSources(state),out=[];
  for(const rule of (state.recurrenceRules||[])){
    if(rule.isDeleted)continue;
    let day=ruleStart(rule);if(!day)continue;
    let iterations=0;
    while(day<=through){
      const sourceId=occurrenceId(rule,day);
      if(!pausedForDate(rule,day)&&!closed.has(sourceId))out.push({...rule,sourceId,occurrenceDate:day,kind:'repeat'});
      const next=nextOccurrence(rule,day);
      if(next<=day)throw Error('繰り返し日付を前進できません');
      day=next;
      if(++iterations>100000)throw Error('繰り返しの生成上限を超えました');
    }
  }
  return out.sort((a,b)=>a.occurrenceDate.localeCompare(b.occurrenceDate)||a.title.localeCompare(b.title));
}
export const activeRules=(state,key)=>pendingOccurrences(state,key); // legacy public API
export function nextFutureDate(rule,today){
  if(rule.isPaused||rule.isDeleted)return null;
  let date=ruleStart(rule);
  if(!date)return null;
  let steps=0;
  while(date<=today||pausedForDate(rule,date)){
    date=nextOccurrence(rule,date);
    if(++steps>100000)throw Error('繰り返しの生成上限を超えました');
  }
  return date;
}
function basePaidFor(state,key,sourceId){
  const paid=state.xpEvents.filter(e=>!e.reverted&&e.earnedDate===key).reduce((a,e)=>a+e.basePaid,0);
  const pending=state.tasks.filter(t=>!t.deletedAt&&t.status==='open'&&[t.plannedDate,t.dueDate].some(d=>d&&d<=key)).map(t=>t.id);
  const repeats=pendingOccurrences(state,key).map(x=>x.sourceId);
  const count=new Set([...pending,...repeats,sourceId]).size;
  const left=Math.max(0,50-paid);
  return Math.min(left,Math.ceil(left/Math.max(1,count)));
}
export function finishOccurrence(state,id,now=new Date(),skip=false,occurrenceDate=null){
  const rule=(state.recurrenceRules||[]).find(r=>r.id===id&&!r.isDeleted);
  if(!rule)throw Error('繰り返しが見つかりません');
  const key=dateKey(now);
  const pending=pendingOccurrences(state,key).filter(r=>r.id===id);
  const selected=occurrenceDate?pending.find(r=>r.occurrenceDate===occurrenceDate):pending[0];
  if(!selected)throw Error('この回は未完了ではありません');
  const sourceId=selected.sourceId,stamp=now.toISOString();
  const event={sourceId,ruleId:id,occurrenceDate:selected.occurrenceDate,eventType:skip?'skipped':'completed',occurredAt:stamp,reverted:false};
  const previous=state.xpEvents.find(e=>e.sourceId===sourceId);
  let xpEvents=state.xpEvents;
  if(!skip&&!previous){
    xpEvents=[...xpEvents,{sourceId,earnedDate:key,completedAt:stamp,basePaid:basePaidFor(state,key,sourceId),plannedDateAtCompletion:selected.occurrenceDate,dueDateAtCompletion:selected.occurrenceDate,reverted:false}];
  }else if(!skip&&previous?.earnedDate===key&&previous.reverted){
    xpEvents=xpEvents.map(e=>e.sourceId===sourceId?{...e,reverted:false}:e);
  }
  return {...state,revision:state.revision+1,occurrenceEvents:[...(state.occurrenceEvents||[]),event],xpEvents};
}
export function undoOccurrence(state,sourceId){
  const completed=(state.occurrenceEvents||[]).filter(e=>e.sourceId===sourceId&&!e.reverted);
  if(!completed.length)throw Error('取消対象がありません');
  const latest=completed.at(-1);
  return {...state,revision:state.revision+1,occurrenceEvents:state.occurrenceEvents.map(e=>e===latest?{...e,reverted:true}:e),xpEvents:state.xpEvents.map(x=>x.sourceId===sourceId&&!x.reverted?{...x,reverted:true}:x)};
}
export function pauseRule(state,id,key){
  return {...state,revision:state.revision+1,recurrenceRules:state.recurrenceRules.map(r=>{
    if(r.id!==id)return r;
    if(!r.isPaused)return {...r,isPaused:true,pausedAt:key,pausedRanges:r.pausedRanges||[]};
    // Legacy paused rules did not store pausedAt. The last scheduled date
    // remains pending, but the unknown paused interval is not backfilled.
    const from=r.pausedAt||r.currentOccurrenceDate||key;
    return {...r,isPaused:false,pausedAt:null,pausedRanges:[...(r.pausedRanges||[]),{from,to:key}]};
  })};
}
export const frequencyLabel=r=>({daily:'毎日',weekly:'曜日指定',monthly:'毎月',interval_weekly:`${r.interval}週間に1回`,interval_monthly:`${r.interval}か月に1回`}[r.frequency]||'繰り返し');
