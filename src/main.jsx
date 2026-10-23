import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {addDays,buildBattle,completeTask,dailyXP,dateKey,logicalDateKey,deleteTask,evaluateMorning,guardMax,initialState,levelFromXP,nextLevelAt,STORAGE_KEY,stats,totalXP,undoTask,unlockedTitles,validateState,dashboardItems,WIN_TIERS,DAMAGE_TIERS} from './domain/core.js';
import {finishOccurrence,frequencyLabel,nextFutureDate,pauseRule,pendingOccurrences,undoOccurrence} from './domain/recurrence.js';
import {battlePoses,ENEMIES,enemyArt,enemyName,tanuArt,pickEnemy} from './domain/assets.js';
import {BATTLE_STAGE_DURATION_MS,battleSequence,battleMood,pendingAutoBattle} from './domain/battlePresentation.js';
import {THEME_OPTIONS,THEME_META,normalizeTheme,levelUpEvent} from './domain/designTheme.js';
import './style.css';
import './design.css';
import './v08.css';

const NAV=[['home','home','ホーム'],['manage','list-checks','タスク管理'],['achievements','trophy','実績'],['history','clock','履歴'],['settings','settings','設定']];
const POSITIVE=['今日も少しずつ進めるたぬ！','積み重ねは力になるたぬ！','一個ずつ片づけるたぬ！','完璧じゃなくても前進たぬ！'];
const formatDate=s=>s?s.replace(/^(\d{4})-(\d\d)-(\d\d)$/,'$2/$3'):'—';
const pct=(a,b)=>b?Math.max(0,Math.min(100,Math.round(a/b*100))):0;
const makeId=()=>crypto.randomUUID?.()||`t${Date.now()}${Math.random().toString(36).slice(2)}`;
const defaultSingle=()=>({kind:'single',title:'',plannedDate:logicalDateKey(),dueDate:logicalDateKey()});
const defaultRepeat=()=>{const day=logicalDateKey(),[y,m,d]=day.split('-').map(Number);return {kind:'repeat',title:'',frequency:'daily',startDate:day,weekdays:[new Date(y,m-1,d).getDay()],dayOfMonth:d,interval:''}};
function Icon({name,size=20,stroke=1.9}){
 const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
 const path={
 home:<><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/></>,
 'list-checks':<><path d="m3 6 2 2 3-4"/><path d="M11 6h10"/><path d="m3 15 2 2 3-4"/><path d="M11 15h10"/></>,
 trophy:<><path d="M8 3h8v7a4 4 0 0 1-8 0z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 14v5m-4 2h8m-7-2h6"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M10 2h4l.5 2.2 2 1.1 2.1-.8 2 3.5-1.6 1.5V12l1.6 1.5-2 3.5-2.1-.8-2 1.1L14 20h-4l-.5-2.7-2-1.1-2.1.8-2-3.5L5 12v-2.5L3.4 8l2-3.5 2.1.8 2-1.1z"/></>,
 flame:<><path d="M12 22a8 8 0 0 0 8-8c0-3-1.5-5.5-4-8-.4 3-2 4-2 4C14 6.5 12 4 9 2c0 3.5-.5 5-3 7A8 8 0 0 0 12 22Z"/><path d="M10 21c-2-3 0-6 2-8 0 3 2 3 2 5a4 4 0 0 1-4 3"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
 plus:<path d="M12 5v14M5 12h14"/>,
 repeat:<><path d="M17 2l4 4-4 4"/><path d="M3 11V8a2 2 0 0 1 2-2h16"/><path d="m7 22-4-4 4-4"/><path d="M21 13v3a2 2 0 0 1-2 2H3"/></>,
 check:<path d="m5 12 5 5L20 7"/>,
 'chevron-right':<path d="m9 5 7 7-7 7"/>,
 x:<path d="M6 6l12 12M18 6 6 18"/>,
 edit:<><path d="m4 20 4-.8L20 7l-3-3L5 16z"/><path d="m14 7 3 3"/></>,
 sparkle:<><path d="m12 2 1.5 7.5L21 12l-7.5 2.5L12 22l-1.5-7.5L3 12l7.5-2.5z"/></>,
 shield:<><path d="m12 2 8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z"/></>,
 play:<path d="m8 5 11 7-11 7z"/>,
 download:<><path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/></>,
 upload:<><path d="M12 17V4m-5 5 5-5 5 5M4 18v3h16v-3"/></>,
 pause:<path d="M8 5v14m8-14v14"/>,
 alert:<><path d="m12 3 10 18H2z"/><path d="M12 9v5m0 4v.2"/></>,
 filter:<><path d="M4 7h16M7 12h10m-7 5h4"/></>,
 target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
 undo:<path d="M9 10 4 15l5 5M4 15h10a6 6 0 0 0 0-12h-3"/>,
 sword:<><path d="m14 3 7 7-11 11-7-7zM13 10l3 3M2 22l5-5"/></>,
 };
 return <svg {...common}>{path[name]||path.sparkle}</svg>;
}
// Local, publishable sprites are the only runtime source. Private Obsidian URLs
// cannot be fetched by anonymous GitHub Pages visitors.
function Tanu({pose='idle',className='',size=64}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[pose]);
 return failed?<div className={'sprite-unavailable '+className} style={{width:size,height:size}} role="img" aria-label="たぬのドット絵を準備中"><Icon name="sparkle" size={26}/><small>たぬ</small></div>:<img className={'tanu-image '+className} width={size} height={size} src={tanuArt(pose)} onError={()=>setFailed(true)} alt="たぬ"/>;
}
function EnemySprite({id,pose}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[id,pose]);
 return failed?<div className="arena-enemy enemy-fallback"><Icon name="flame" size={40}/><span>{enemyName(id)}</span></div>:<img className="arena-enemy" src={enemyArt(id,pose)} alt={enemyName(id)} onError={()=>setFailed(true)}/>;
}
function Toggle({checked=false,onClick,label}){return <button type="button" className={'task-toggle '+(checked?'is-done':'')} aria-label={label} aria-pressed={checked} onClick={onClick}><span className="toggle-ring">{checked&&<Icon name="check" size={22} stroke={3}/>}</span></button>}
function Badge({type,children}){return <span className={`pill pill-${type}`}>{children}</span>}
function TaskRow({item,now,onDone,onSkip,onEdit,done=false,onUndo}){
 const repeat=item.kind==='repeat',overdue=!done&&item.bucket==='overdue';
 const due=repeat?item.occurrenceDate:item.dueDate;
 const planned=repeat?item.occurrenceDate:item.plannedDate;
 return <div className={'task-row '+(overdue?'task-late ':'')+(done?'task-completed':'')}>
   <Toggle checked={done} label={done?`${item.title}の完了を取り消す`:`${item.title}を完了する`} onClick={()=>done?onUndo?.(item):onDone(item)}/>
   <div className="task-content"><div className="task-row-head"><strong className={done?'line-through':''}>{item.title}</strong>{overdue&&<Badge type="urgent"><Icon name="flame" size={12}/> {formatDate(due||planned)}超過</Badge>}</div>
     <div className="task-meta">{repeat&&<Badge type="repeat"><Icon name="repeat" size={12}/> 繰り返し</Badge>}{!overdue&&<span>{planned?`予定 ${formatDate(planned)}`:'日付未設定'}{due&&due!==planned?` · 期限 ${formatDate(due)}`:''}</span>}</div>
   </div>
   <div className="row-actions">{repeat?(!done&&<button className="text-action" onClick={()=>onSkip(item)} aria-label={`${item.title}の${formatDate(planned)}分を見送る`}>見送る</button>):<button className="icon-action" onClick={()=>onEdit(item)} aria-label={`${item.title}を編集`}><Icon name="edit" size={19}/></button>}</div>
 </div>;
}
function NoTasks({title,detail}){return <div className="zero"><Icon name="check" size={23}/><strong>{title}</strong><span>{detail}</span></div>}
function FormFields({draft,setDraft,isEdit=false}){
 const patch=p=>setDraft(v=>({...v,...p}));const repeat=draft.kind==='repeat';
 return <>
 <div className="field"><label htmlFor="taskname">タスク名 <span className="req">必須</span></label><input id="taskname" autoFocus maxLength={100} placeholder="例：30分ウォーキング" value={draft.title} onChange={e=>patch({title:e.target.value})}/></div>
  {!isEdit&&<div className="field"><label>種類</label><div className="segment"><button type="button" className={!repeat?'selected':''} onClick={()=>setDraft(v=>({...defaultSingle(),title:v.title}))}>単発</button><button type="button" className={repeat?'selected':''} onClick={()=>setDraft(v=>({...defaultRepeat(),title:v.title}))}>繰り返し</button></div></div>}
 {!repeat?<div className="date-fields"><div className="field"><label htmlFor="planned">予定日</label><input id="planned" type="date" value={draft.plannedDate||''} onChange={e=>setDraft(v=>{const next=e.target.value||null;return {...v,plannedDate:next,dueDate:v.dueDate===v.plannedDate?next:v.dueDate}})}/></div><div className="field"><label htmlFor="due">期限日</label><input id="due" type="date" value={draft.dueDate||''} onChange={e=>patch({dueDate:e.target.value||null})}/></div><p className="field-note">予定日は取り組み始める日、期限日は完了したい最終日だよ。期限日を過ぎたらホームの超過欄に移動するよ。</p></div>:
 <><div className="field"><label htmlFor="start">初回実施日・繰り返しの基準日</label><input id="start" type="date" disabled={isEdit} value={draft.startDate||''} onChange={e=>patch({startDate:e.target.value,dayOfMonth:Number(e.target.value.slice(-2))||1})}/></div><div className="field"><label htmlFor="freq">繰り返し頻度</label><select id="freq" disabled={isEdit} value={draft.frequency} onChange={e=>patch({frequency:e.target.value,interval:['interval_weekly','interval_monthly'].includes(e.target.value)?'':draft.interval})}><option value="daily">毎日</option><option value="weekly">曜日を指定</option><option value="monthly">毎月</option><option value="interval_weekly">N週間に1回</option><option value="interval_monthly">Nか月に1回</option></select></div>
 {['interval_weekly','interval_monthly'].includes(draft.frequency)&&<div className="field"><label htmlFor="gap">実施間隔</label><div className="number-group"><input id="gap" type="number" min="1" max={draft.frequency==='interval_weekly'?'999':'120'} disabled={isEdit} value={draft.interval} onChange={e=>patch({interval:e.target.value})}/><span>{draft.frequency==='interval_weekly'?'週間':'か月'}に1回</span></div></div>}
 {draft.frequency==='weekly'&&<div className="field"><label>対象の曜日</label><div className="weekday-selector">{['日','月','火','水','木','金','土'].map((label,index)=><button type="button" key={index} disabled={isEdit} aria-pressed={(draft.weekdays||[]).includes(index)} className={(draft.weekdays||[]).includes(index)?'selected':''} onClick={()=>patch({weekdays:(draft.weekdays||[]).includes(index)?draft.weekdays.filter(n=>n!==index):[...draft.weekdays,index]})}>{label}</button>)}</div></div>}
 {draft.frequency==='monthly'&&<div className="field"><label htmlFor="monthday">毎月の日付（末日補正あり）</label><input id="monthday" type="number" min="1" max="31" disabled={isEdit} value={draft.dayOfMonth} onChange={e=>patch({dayOfMonth:e.target.value})}/></div>}
 <p className="field-note">実施日に遅れても繰り返しの日付はずれないよ。未実施の回は翌日以降も残り続けるよ。{isEdit?' 実施履歴を守るため、繰り返し条件の変更は停止→新規登録で対応してね。':''}</p></>}
 </>;
}
function Modal({heading,onClose,children,actions,className=''}){
 const [viewport,setViewport]=useState(null);
 useEffect(()=>{
   const escape=e=>{if(e.key==='Escape')onClose()};
   const vv=window.visualViewport;
   const refresh=()=>setViewport(vv?{top:vv.offsetTop,height:vv.height}:null);
   document.addEventListener('keydown',escape);
   document.body.classList.add('modal-open');
   refresh();vv?.addEventListener('resize',refresh);vv?.addEventListener('scroll',refresh);
   return()=>{document.removeEventListener('keydown',escape);vv?.removeEventListener('resize',refresh);vv?.removeEventListener('scroll',refresh);document.body.classList.remove('modal-open')};
 },[onClose]);
 const style=viewport?{top:viewport.top,height:viewport.height,bottom:'auto'}:undefined;
 return <div className="modal-scrim" style={style} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className={'modal '+className} role="dialog" aria-modal="true" aria-label={heading}><div className="modal-head"><h2>{heading}</h2><button className="icon-action" onClick={onClose} aria-label="閉じる"><Icon name="x"/></button></div><div className="modal-body">{children}</div>{actions&&<div className="modal-footer">{actions}</div>}</section></div>;
}
function ValidationDialog({message,onClose}){
 useEffect(()=>{if(!message)return;const onKey=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[message,onClose]);
 if(!message)return null;
 return <div className="validation-scrim" role="presentation"><section className="validation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="validation-title" aria-describedby="validation-description"><div className="validation-sign"><Icon name="alert" size={24}/></div><h2 id="validation-title">入力内容を確認してね</h2><p id="validation-description">{message}</p><button className="primary wide" autoFocus onClick={onClose}>入力画面に戻る</button></section></div>;
}

// The habit companion's XP bar is reused as a quiet, always-visible progress signal.
function MiniLevelProgress({level,progress,total,next}){
 return <div className="mini-level-progress" aria-label={`レベル${level}、次のレベルまで${Math.max(0,next-total)}XP`}>
   <div className="mini-progress-copy"><span>LEVEL PROGRESS</span><span>Lv {level} <span aria-hidden="true">→</span> {level+1}</span></div>
   <div className="mini-progress-track"><div style={{width:`${progress}%`}}/></div>
 </div>;
}
function LevelCelebration({info,onDone}){
 useEffect(()=>{const timer=setTimeout(onDone,3800);return()=>clearTimeout(timer)},[info.id,onDone]);
 return <div className="level-celebration" role="status" aria-live="polite" aria-label={`レベルアップ、レベル${info.to}`}>
   <div className="level-burst" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{'--ray':`${i*45}deg`,'--delay':`${i*42}ms`}}/>)}</div>
   <div className="level-celebration-panel">
     <span className="level-celebration-eyebrow">LEVEL UP</span>
     <div className="level-celebration-number"><span>Lv {info.from}</span><Icon name="chevron-right" size={22}/><strong>Lv {info.to}</strong></div>
     <div className="level-celebration-progress"><i/></div>
     <p>たぬも強くなったたぬ！ <span>+{info.gain} XP</span></p>
   </div>
 </div>;
}

function Battle({record,onClose,onGoHome,demo=false}){
 const [phase,setPhase]=useState('ready');
 useEffect(()=>{setPhase('ready')},[record]);
 useEffect(()=>{
   const stages=battleSequence(record),i=stages.indexOf(phase);
   if(i<0||i>=stages.length-1)return;
   const timer=setTimeout(()=>setPhase(stages[i+1]),BATTLE_STAGE_DURATION_MS[phase]);
   return()=>clearTimeout(timer);
 },[record,phase]);
 const pose=battlePoses(record,phase),isWin=record.exterminated,mood=battleMood(record);
 const hpEnemy=phase==='ready'?record.enemyMaxHp:record.enemyRemainHp;
 const hpTanu=['ready','attack'].includes(phase)?record.guardMax:record.guardRemain;
 const status=phase==='ready'?'敵が現れた！':phase==='attack'?'たぬの攻撃！':phase==='counter'?'敵の反撃！':isWin?'討伐成功！':'討伐失敗…';
 const message=phase==='ready'?'昨日の取り組みが今日の戦いになるたぬ！':phase==='attack'?`完了 ${record.C}件＋先取り ${record.F}件で ${record.rawDamage}ダメージ！`:phase==='counter'?`敵HPが ${record.enemyRemainHp} 残った！ たぬの踏ん張りHPは ${record.guardRemain} たぬ…`:phase==='summary'?isWin?'昨日の積み重ねが、勝利につながったたぬ！':'昨日の積み残しが敵として残ったたぬ…':mood.subtitle;
 return <Modal heading={demo?'戦闘の体験デモ':`戦闘記録 · ${formatDate(record.battleDate)}`} onClose={onClose} className={'battle-modal mood-'+mood.kind}>
  <div className="battle-caption">{demo?'※ デモでは経験値・戦績は変わらないよ':'朝4時に確定した前日の実績だよ'}</div>
  <div className="battle-progress" aria-label={phase==='result'?'戦闘結果':`戦闘演出中：${status}`}>
    {battleSequence(record).slice(0,-1).map((stage,i)=><span key={stage} className={i<=battleSequence(record).indexOf(phase)?'active':''}/>)}
  </div>
  <div className="arena"><div className={'battle-unit '+(phase==='attack'?'perform-attack':'')}><Tanu pose={pose.tanu} className="arena-tanu" size={118}/><b>たぬ</b><small><Icon name="shield" size={13}/> {hpTanu}/{record.guardMax}</small></div><div className="battle-vs">VS</div><div className={'battle-unit '+(phase==='counter'?'perform-attack':'')}><EnemySprite id={record.enemyId} pose={pose.enemy}/><b>{enemyName(record.enemyId)}</b><small>敵HP {hpEnemy}/{record.enemyMaxHp}</small></div></div>
  <div className="battle-message" aria-live="polite"><div className="battle-status">{status}</div><p>{message}</p></div>
  <div className="battle-numbers"><div><span>完了</span><b>{record.C}</b></div><div><span>未完了</span><b>{record.R}</b></div><div><span>先取り</span><b>+{record.F}</b></div></div>
  <p className="field-note">敵HP＝完了＋未完了、攻撃力＝完了＋先取り。敵HPを削り切ると勝利。未完了0件なら全クリだよ。</p>
  {phase==='result'?<button className="primary wide battle-go-home" onClick={onGoHome}><Icon name="home" size={19}/>{mood.action}</button>:<button className="secondary wide battle-skip" onClick={()=>setPhase('result')}>{phase==='summary'?'結果を見る':'演出をスキップして結果を見る'}</button>}
  {phase==='result'&&<p className="battle-dismiss-hint">右上の × で閉じれば、この画面に戻れるよ。</p>}
 </Modal>;
}

function App(){
 const [state,setState]=useState(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?validateState(JSON.parse(raw)):initialState()}catch(e){return {...initialState(),readError:e.message}}});
 const [tab,setTab]=useState('home');const [clock,setClock]=useState(new Date());const [notice,setNotice]=useState('');const [comment,setComment]=useState(POSITIVE[0]);
 const [levelUp,setLevelUp]=useState(null);const [draft,setDraft]=useState(null);const [editing,setEditing]=useState(null);const [battle,setBattle]=useState(null);const [battleDemo,setBattleDemo]=useState(false);
 const [formError,setFormError]=useState('');const showFormError=message=>{document.activeElement?.blur?.();setFormError(message)};
 const backupRef=useRef(null);const noticed=useRef(0);const levelNoticeSerial=useRef(0);const today=logicalDateKey(clock);const battleDay=dateKey(clock);
 const dashboard=useMemo(()=>dashboardItems(state,today),[state,today]);
 const recurringFuture=useMemo(()=>(state.recurrenceRules||[]).filter(r=>!r.isDeleted).map(r=>({...r,futureDate:nextFutureDate(r,today)})).filter(r=>r.futureDate),[state,today]);
 const todayXP=dailyXP(state.xpEvents,today),total=totalXP(state.xpEvents),level=levelFromXP(total),score=stats(state.battleRecords),titles=unlockedTitles(score);
 const futureCount=dashboard.future.length+recurringFuture.length;
 const theme=normalizeTheme(state.settings?.theme);
 const notify=message=>{setNotice(message);setComment(POSITIVE[noticed.current++%POSITIVE.length])};
 const clearLevelUp=useCallback(()=>setLevelUp(null),[]);
 const celebrateLevel=(oldXp,newXp)=>{const event=levelUpEvent(oldXp,newXp,levelFromXP);if(event)setLevelUp({...event,id:++levelNoticeSerial.current});};
 const commit=(next,allowRecover=false)=>{
  try{
   if(state.readError&&!allowRecover)throw Error('保存データを読み込めていないので、バックアップ復元を先にしてね');
   const validated=validateState(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(validated));setState(validated);return true;
  }catch(e){notify('保存に失敗したたぬ：'+e.message);return false;}
 };
 useEffect(()=>{const timer=setInterval(()=>setClock(new Date()),10000);const active=()=>{if(!document.hidden)setClock(new Date())};document.addEventListener('visibilitychange',active);window.addEventListener('focus',active);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',active);window.removeEventListener('focus',active)}},[]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),4400);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{document.documentElement.dataset.tanuTheme=theme;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',THEME_META[theme]);return()=>{delete document.documentElement.dataset.tanuTheme}},[theme]);
 useEffect(()=>{
  if(state.readError)return;
  const result=evaluateMorning(state,clock);
  if(!result)return;
  commit({...state,revision:state.revision+1,battleRecords:[...state.battleRecords,result]});
 },[clock,state.revision]);
 // The result is persisted before display; resume if reload interrupted the popup.
 // Never show a modal for no_battle, and defer presentation while a form is open.
 useEffect(()=>{
  const current=pendingAutoBattle(state,battleDay);
  if(current&&!draft&&!editing&&!battle){setBattleDemo(false);setBattle(current)}
 },[state.revision,battleDay,draft,editing,battle]);
 function closeBattle(){
  const shouldAck=battle&&!battleDemo&&battle.battleDate===battleDay&&state.settings?.lastBattleAcknowledgedDate!==battleDay;
  setBattle(null);
  if(shouldAck)commit({...state,revision:state.revision+1,settings:{...state.settings,lastBattleAcknowledgedDate:battleDay}});
 }
 function battleGoHome(){closeBattle();setTab('home');window.scrollTo({top:0,behavior:'auto'})}

 const openAdd=()=>{setClock(new Date());setDraft(defaultSingle());setEditing(null);setFormError('');};
 function saveNew(){
  if(!draft?.title.trim()){showFormError('タスク名を入力してね。');return}
  if(draft.kind==='single'){
   if(draft.plannedDate&&draft.dueDate&&draft.dueDate<draft.plannedDate){showFormError('期限日は予定日と同じ日か、それ以降の日付を指定してね。');return}
   const entry={id:makeId(),title:draft.title.trim(),plannedDate:draft.plannedDate||null,dueDate:draft.dueDate||null,note:'',priority:'normal',status:'open',createdAt:new Date().toISOString(),completedAt:null,deletedAt:null};
   if(commit({...state,revision:state.revision+1,tasks:[...state.tasks,entry]})){setDraft(null);notify('新しいタスクが増えたたぬ！')}
  }else{
   if(!draft.startDate){showFormError('初回実施日を指定してね。');return}
   if(draft.frequency==='weekly'&&!draft.weekdays?.length){showFormError('対象の曜日を1つ以上選んでね。');return}
   const limit=draft.frequency==='interval_weekly'?999:120,n=Number(draft.interval);
   if(['interval_weekly','interval_monthly'].includes(draft.frequency)&&(!Number.isInteger(n)||n<1||n>limit)){showFormError(`繰り返し間隔を1〜${limit}の整数で入力してね。`);return}
   const day=Number(draft.dayOfMonth);
   if(draft.frequency==='monthly'&&(!Number.isInteger(day)||day<1||day>31)){showFormError('毎月の日付を1〜31の整数で入力してね。');return}
   const entry={id:makeId(),title:draft.title.trim(),frequency:draft.frequency,interval:n,weekdays:draft.weekdays,dayOfMonth:day,anchorDay:Number(draft.startDate.slice(-2)),startDate:draft.startDate,currentOccurrenceDate:draft.startDate,pausedRanges:[],isPaused:false,isDeleted:false,createdAt:new Date().toISOString()};
   if(commit({...state,revision:state.revision+1,recurrenceRules:[...state.recurrenceRules,entry]})){setDraft(null);notify('繰り返しを登録したたぬ！')}
  }
 }
 function complete(item){
  try{const now=new Date();setClock(now);const before=totalXP(state.xpEvents),next=item.kind==='repeat'?finishOccurrence(state,item.id,now,false,item.occurrenceDate):completeTask(state,item.id,now);if(commit(next)){const earned=totalXP(next.xpEvents);notify(`完了たぬ！ +${earned-before} XP`);celebrateLevel(before,earned)}}catch(e){notify(e.message)}
 }
 function undo(item){
  try{const next=item.kind==='repeat'?undoOccurrence(state,item.sourceId):undoTask(state,item.id);if(commit(next))notify('完了を取り消したたぬ！')}catch(e){notify(e.message)}
 }
 function skip(item){
  if(!window.confirm(`${item.title}（${item.occurrenceDate}分）を見送る？\n※この1回だけ対象外になるよ。`))return;
  try{const now=new Date();setClock(now);if(commit(finishOccurrence(state,item.id,now,true,item.occurrenceDate)))notify('この回を見送ったたぬ！')}catch(e){notify(e.message)}
 }
 function saveEdit(){
  if(!editing?.title.trim()){showFormError('タスク名を入力してね。');return}
  if(editing.kind==='repeat'){
   if(commit({...state,revision:state.revision+1,recurrenceRules:state.recurrenceRules.map(r=>r.id===editing.id?{...r,title:editing.title.trim()}:r)})){setEditing(null);notify('変更を保存したたぬ！')}
  }else{
   if(editing.plannedDate&&editing.dueDate&&editing.dueDate<editing.plannedDate){showFormError('期限日は予定日以降を指定してね。');return}
   if(commit({...state,revision:state.revision+1,tasks:state.tasks.map(t=>t.id===editing.id?{...t,title:editing.title.trim(),plannedDate:editing.plannedDate||null,dueDate:editing.dueDate||null}:t)})){setEditing(null);notify('変更を保存したたぬ！')}
  }
 }
 function deleteEntry(){
  if(!editing||editing.kind==='repeat')return;
  if(!window.confirm('未完了のタスクを削除する？（元には戻せないよ）'))return;
  try{if(commit(deleteTask(state,editing.id))){setEditing(null);notify('未完了タスクを削除したたぬ！')}}catch(e){notify(e.message)}
 }
 const onEdit=item=>{setEditing({...item,kind:item.kind==='repeat'?'repeat':'single'});setDraft(null);setFormError('')};
 function backup(){const blob=new Blob([JSON.stringify({appId:'pon-task',exportedAt:new Date().toISOString(),payload:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`tanu-task-${today}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),6000)}
 async function restore(file){try{const j=JSON.parse(await file.text());if(j.appId!=='pon-task')throw Error('たぬタスクのバックアップではないよ');const next=validateState(j.payload);if(window.confirm(`現在の保存データをバックアップ（単発${next.tasks.length}件）で置き換える？`)){if(commit({...next,readError:undefined},true))notify('バックアップを復元したたぬ！')}}catch(e){notify('復元できなかったたぬ：'+e.message)}finally{if(backupRef.current)backupRef.current.value=''}}
 const viewBattle=record=>{setBattleDemo(!record);setBattle(record||{...buildBattle(3,2,2,level),enemyId:pickEnemy(),battleDate:today})};
 const allPending=[...dashboard.overdue,...dashboard.today,...dashboard.future,...dashboard.undated];
 const doneSingles=state.tasks.filter(t=>!t.deletedAt&&t.status==='done').map(t=>({...t,kind:'single',sourceId:t.id}));
 const doneRepeats=(state.occurrenceEvents||[]).filter(e=>!e.reverted&&e.eventType==='completed').map(e=>{const r=state.recurrenceRules.find(x=>x.id===e.ruleId);return {...e,kind:'repeat',id:e.ruleId,title:r?.title||'繰り返し',category:r?.category||'その他',plannedDate:e.occurrenceDate,date:e.occurrenceDate,completedAt:e.occurredAt}});
 const allDone=[...doneSingles,...doneRepeats];
 // Prefer persisted earned/recorded day, so old midnight records keep their original labels.
 const completionDay=item=>item.recordedDay||state.xpEvents.find(e=>e.sourceId===item.sourceId)?.earnedDate||(item.completedAt?dateKey(new Date(item.completedAt)):'—');
 const managedSingles=state.tasks.filter(t=>!t.deletedAt).sort((a,b)=>(a.status==='done'?1:0)-(b.status==='done'?1:0)||(a.dueDate||a.plannedDate||'9999').localeCompare(b.dueDate||b.plannedDate||'9999'));
 const pendingCounts=new Map();for(const item of [...dashboard.today,...dashboard.overdue].filter(i=>i.kind==='repeat'))pendingCounts.set(item.id,(pendingCounts.get(item.id)||0)+1);
 const managedRepeats=state.recurrenceRules.filter(r=>!r.isDeleted).map(r=>({...r,openCount:pendingCounts.get(r.id)||0,nextDate:nextFutureDate(r,today)}));
 const recentBattles=[...state.battleRecords].reverse().filter(b=>b.enemyMaxHp>0);
 const lastEvaluation=state.battleRecords.find(b=>b.battleDate===battleDay);
 const lastBattle=recentBattles[0];
 const xpThreshold=nextLevelAt(level),xpPrev=level<=1?0:nextLevelAt(level-1),xpProgress=pct(total-xpPrev,xpThreshold-xpPrev);
 const nextWin=WIN_TIERS.find(n=>n>score.wins),nextDamage=DAMAGE_TIERS.find(n=>n>score.damage);
 const setTheme=id=>{if(commit({...state,revision:state.revision+1,settings:{...state.settings,theme:normalizeTheme(id)}}))notify('配色を変更したたぬ！')};
 return <div className="app-shell" data-theme={theme}>
  <main className="main-content">
  {state.readError&&<div className="warning-box"><Icon name="alert"/> 保存データの読み込みに失敗したよ。以前のデータを消さないため、バックアップ復元まで変更を保存できないようにしているよ。</div>}
  {tab==='home'&&<>
    <div className="home-date-head"><div><div className="eyebrow">{today.slice(0,4)} · TODAY（翌朝3:59まで）</div><h1><time dateTime={today}>{new Date(Number(today.slice(0,4)),Number(today.slice(5,7))-1,Number(today.slice(8,10))).toLocaleDateString('ja-JP',{month:'long',day:'numeric',weekday:'short'})}</time></h1></div><button className="home-new-task" onClick={()=>{setTab('manage');openAdd()}}><Icon name="plus" size={18}/>登録</button></div>
    <div className="summary-grid compact-summary"><div className="summary-tile today-tile"><span>今日</span><b>{dashboard.today.length}</b></div><div className="summary-tile overdue-tile"><span>期限超過</span><b>{dashboard.overdue.length}</b></div><div className="summary-tile future-tile"><span>未来</span><b>{futureCount}</b></div></div>
    <div className="section-title"><div><span className="title-icon"><Icon name="target"/></span><h2>今日やること <em>{dashboard.today.length}</em></h2></div><button className="subtle-link" onClick={()=>{setTab('manage');openAdd()}}><Icon name="plus" size={16}/>追加</button></div>
    <section className="task-list">{dashboard.today.length?dashboard.today.map(item=><TaskRow key={item.sourceId} item={item} onDone={complete} onSkip={skip} onEdit={onEdit}/>):<NoTasks title="今日のタスクはすべて片づいたたぬ！" detail="新しいタスクはタスク管理から登録できるよ"/>}</section>
    <div className="section-title overdue-heading"><div><span className="title-icon warn"><Icon name="flame"/></span><h2>期限超過・積み残し <em>{dashboard.overdue.length}</em></h2></div></div>
    <section className="task-list">{dashboard.overdue.length?dashboard.overdue.map(item=><TaskRow key={item.sourceId} item={item} onDone={complete} onSkip={skip} onEdit={onEdit}/>):<div className="overdue-all-clear"><Icon name="check" size={17}/>積み残しなし。今日のタスクに集中できるたぬ！</div>}</section>
    {dashboard.undated.length>0&&<p className="undated-reminder" onClick={()=>setTab('manage')}>日付未設定のタスクが {dashboard.undated.length} 件あるよ。<Icon name="chevron-right" size={17}/></p>}
    <button className="manage-shortcut" onClick={()=>setTab('manage')}><Icon name="list-checks"/> タスクを整理する <Icon name="chevron-right" size={17}/></button>
  </>}
  {tab==='manage'&&<>
    <div className="page-title"><div className="eyebrow">TASK ORGANIZER</div><h1>タスク管理</h1><p className="subtle">登録済みの内容を、ここで編集・整理しよう。</p></div>
    <div className="create-panel"><div className="create-heading"><div><Icon name="plus" size={20}/><strong>新しいタスク</strong></div><p>単発か繰り返しかは、登録画面で選べるよ。</p></div><button className="primary wide" onClick={()=>openAdd()}><Icon name="plus"/>タスクを登録</button></div>
    <div className="section-title"><div><span className="title-icon"><Icon name="calendar"/></span><h2>単発タスク <em>{managedSingles.length}</em></h2></div></div>
    <section className="task-group"><div className="table-head"><span>状態</span><span>タスク名・日付</span><span>操作</span></div>
    {managedSingles.length===0?<NoTasks title="単発タスクはまだないよ" detail="上のボタンから登録しよう"/>:managedSingles.map(t=><div className="managed-row" key={t.id}><div className="managed-status"><Badge type={t.status==='done'?'complete':t.dueDate&&t.dueDate<today?'urgent':t.plannedDate&&t.plannedDate>today?'future':'today'}>{t.status==='done'?'完了':t.dueDate&&t.dueDate<today?'超過':t.plannedDate&&t.plannedDate>today?'未来':'未完了'}</Badge></div><div className="managed-detail"><strong className={t.status==='done'?'line-through':''}>{t.title}</strong><small>予定 {formatDate(t.plannedDate)} · 期限 {formatDate(t.dueDate)}</small></div><div className="managed-actions">{t.status==='done'?<button className="icon-action" onClick={()=>undo({...t,kind:'single'})} aria-label="完了を取り消す"><Icon name="undo"/></button>:<><button className="icon-action success-action" onClick={()=>complete({...t,kind:'single'})} aria-label="完了する"><Icon name="check"/></button><button className="icon-action" onClick={()=>onEdit({...t,kind:'single'})} aria-label="編集"><Icon name="edit"/></button></>}</div></div>)}
    </section>
    <div className="section-title"><div><span className="title-icon"><Icon name="repeat"/></span><h2>繰り返しタスク <em>{managedRepeats.length}</em></h2></div></div>
    <p className="subtle">登録ルールごとに1行。未完了の各回はホームから完了・見送りできるよ。</p>
    <section className="task-group"><div className="table-head"><span>状態</span><span>設定・次回予定</span><span>操作</span></div>
    {managedRepeats.length===0?<NoTasks title="繰り返しタスクはまだないよ" detail="毎日・曜日・N週間などの予定を登録できるよ"/>:managedRepeats.map(r=><div className="managed-row" key={r.id}><div className="managed-status"><Badge type={r.isPaused?'muted':r.openCount?'urgent':'future'}>{r.isPaused?'停止':r.openCount?`未完${r.openCount}`:'稼働'}</Badge></div><div className="managed-detail"><strong>{r.title}</strong><small>{frequencyLabel(r)} · 次回 {formatDate(r.nextDate)} · 初回 {formatDate(r.startDate||r.currentOccurrenceDate)}</small></div><div className="managed-actions"><button className="icon-action" onClick={()=>onEdit({...r,kind:'repeat'})} aria-label="編集"><Icon name="edit"/></button><button className="icon-action" onClick={()=>{if(commit(pauseRule(state,r.id,today)))notify(r.isPaused?'再開したたぬ！':'停止したたぬ！')}} aria-label={r.isPaused?'再開':'停止'}><Icon name={r.isPaused?'repeat':'pause'}/></button></div></div>)}
    </section>
  </>}
  {tab==='achievements'&&<>
      <section className="masthead achievements-masthead"><div className="identity"><div className="avatar-frame"><Tanu pose={notice?'happy':'idle'} size={76}/></div><div><div className="brand-title">たぬタスク</div><div className="level-inline"><Badge type="xp">Lv {level}</Badge> <span>踏ん張りHP {guardMax(level)}</span></div></div></div><div className="tanu-message" key={notice||comment}><Icon name="sparkle" size={17}/><span>{notice?notice:`「${comment}」`}</span></div><MiniLevelProgress level={level} total={total} next={nextLevelAt(level)} progress={pct(total-(level<=1?0:nextLevelAt(level-1)),nextLevelAt(level)-(level<=1?0:nextLevelAt(level-1)))}/></section>

    <div className="page-title"><div className="eyebrow">YOUR PROGRESS</div><h1>たぬの実績</h1><p className="subtle">積み上げた成長と称号を振り返ろう。</p></div>
    <div className="xp-strip achievements-xp"><div><span className="tiny-caption">今日の獲得経験値（翌朝3:59まで）</span><div className="xp-value">{todayXP.total}<small> XP</small></div></div><div className="xp-strip-right"><Icon name="sparkle" size={26}/><span>基礎 {todayXP.base}/50<br/>初回 {todayXP.firstBonus} · 完了 {todayXP.countBonus}</span></div></div>
    <section className="level-card"><div className="level-top"><div><div className="level-label">YOUR LEVEL</div><div className="big-level">Lv <strong>{level}</strong></div><p>合計 {total.toLocaleString()} XP</p></div><Tanu pose="proud" size={105}/></div><div className="level-progress-heading"><span>次のレベルまで</span><b>{Math.max(0,xpThreshold-total)} XP</b></div><div className="progress-track"><div style={{width:`${xpProgress}%`}}/></div><div className="level-small"><span>Lv {level}</span><span>Lv {level+1}</span></div></section>
    <div className="history-stats"><div><Icon name="trophy"/><b>{score.wins}</b><span>勝利数</span></div><div><Icon name="sword"/><b>{score.damage}</b><span>累計ダメージ</span></div><div><Icon name="sparkle"/><b>{score.longestStreak}</b><span>最長連勝</span></div><div><Icon name="target"/><b>{score.averageRate===null?'—':`${Math.round(score.averageRate*100)}%`}</b><span>平均消化率</span></div></div>
    <div className="section-title"><div><span className="title-icon"><Icon name="trophy"/></span><h2>称号コレクション <em>{titles.length}/37</em></h2></div></div>
    <div className="collection-progress"><div className="progress-track"><div style={{width:`${pct(titles.length,37)}%`}}/></div><span>{pct(titles.length,37)}% 解放済み</span></div>
    <div className="achievements"><div className="achievement unlocked"><Icon name="trophy" size={24}/><div><strong>{titles.at(-1)?.label||'初勝利を目指そう'}</strong><small>{titles.length?'最近手に入れた称号':'初めての勝利で称号が解放されるよ'}</small></div></div><div className="achievement"><Icon name="target" size={24}/><div><strong>{nextWin?`次は ${nextWin} 勝`:'勝利称号コンプリート！'}</strong><small>{nextWin?`あと ${nextWin-score.wins} 勝で新称号`:'すべての勝利称号を獲得したよ'}</small></div></div><div className="achievement"><Icon name="sword" size={24}/><div><strong>{nextDamage?`次は累計 ${nextDamage} ダメージ`:'ダメージ称号コンプリート！'}</strong><small>{nextDamage?`あと ${nextDamage-score.damage} ダメージ`:'すべて獲得済み'}</small></div></div></div>
    {titles.length>0&&<div className="title-badges">{titles.slice(-12).reverse().map(t=><Badge key={t.id} type="xp">{t.label}</Badge>)}</div>}
  </>}
  {tab==='history'&&<>
   <div className="page-title"><div className="eyebrow">ACTIVITY LOG</div><h1>履歴</h1><p className="subtle">完了・見送り・戦闘を、日付順に確認できるよ。</p></div>
   <div className="section-title"><div><span className="title-icon"><Icon name="sword"/></span><h2>たぬの戦闘記録</h2></div></div>
   <div className="battle-feature"><div><div className="eyebrow">MORNING BATTLE · 4:00</div><strong>{lastBattle?`${formatDate(lastBattle.battleDate)}　${lastBattle.exterminated?'勝利！':'討伐失敗'}`:lastEvaluation?'今日は戦闘対象なし':'戦闘は朝4時からだよ'}</strong><p>{lastBattle?`完了 ${lastBattle.C} · 未完了 ${lastBattle.R} · 先取り ${lastBattle.F}`:lastEvaluation?`先取り ${lastEvaluation.F}件。敵HPが0なので戦闘演出は発生しなかったよ。`:'前日4時〜当日4時の実績で、朝4時以降の最初の起動時に戦うよ。'}</p></div><button className="primary" onClick={()=>viewBattle(lastBattle)}><Icon name="play" size={17}/>{lastBattle?'最新の戦闘を再生':'デモ戦闘を体験'}</button></div>
   <p className="field-note history-explain">午前4時以降の初回起動時に、前日4時〜当日4時の実績を1回だけ評価。敵HPが0の場合は『戦闘なし』になり、デモは実績に反映されないよ。</p>
   <div className="section-title"><div><span className="title-icon"><Icon name="calendar"/></span><h2>達成の記録</h2></div></div>
   <div className="history-feed">{allDone.length===0?<NoTasks title="最初の達成を待っているたぬ" detail="タスクを1つ完了すると、ここに刻まれるよ"/>:allDone.slice().sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||'')).slice(0,30).map((item,i)=><div className="history-entry" key={`done-${item.id}-${item.occurrenceDate||i}`}><span className="history-dot"><Icon name="check" size={14}/></span><div><strong>{item.title}</strong><small>{completionDay(item)} · {item.kind==='repeat'?'繰り返し':'単発'}{item.occurrenceDate?` · ${formatDate(item.occurrenceDate)}分`:''}</small></div></div>)}</div>
   {(state.occurrenceEvents||[]).some(e=>!e.reverted&&e.eventType==='skipped')&&<><div className="section-title"><div><span className="title-icon"><Icon name="repeat"/></span><h2>見送りの記録</h2></div></div><div className="history-feed">{state.occurrenceEvents.filter(e=>!e.reverted&&e.eventType==='skipped').slice().reverse().slice(0,20).map(e=><div className="history-entry" key={e.sourceId}><span className="history-dot"><Icon name="x" size={14}/></span><div style={{flex:1,minWidth:0}}><strong>{state.recurrenceRules.find(r=>r.id===e.ruleId)?.title||'繰り返し'} · {formatDate(e.occurrenceDate)}分</strong><small>見送り {e.recordedDay||(e.occurredAt?dateKey(new Date(e.occurredAt)):'—')}</small></div><button className="text-action" onClick={()=>undo({...e,kind:'repeat'})}>取り消す</button></div>)}</div></>}
   {recentBattles.length>0&&<><div className="section-title"><div><span className="title-icon"><Icon name="shield"/></span><h2>過去の戦闘</h2></div></div><div className="battle-history">{recentBattles.slice(0,12).map(b=><button key={b.battleDate} onClick={()=>viewBattle(b)}><strong>{b.battleDate}</strong><span>{enemyName(b.enemyId)} · {b.exterminated?'勝利':'敗北'}</span><Icon name="chevron-right" size={17}/></button>)}</div></>}
  </>}
  {tab==='settings'&&<><div className="page-title"><div className="eyebrow">PREFERENCES</div><h1>設定</h1><p className="subtle">記録の保護とアプリについて。</p></div><section className="setting-panel theme-panel"><div className="setting-section-intro"><Icon name="sparkle" size={19}/><h2>見た目のテーマ</h2></div><p>習慣化アプリ「ぽん」の配色をベースにした3種類。好みや周囲の明るさに合わせて選べるよ。</p><div className="theme-options" role="group" aria-label="配色テーマ">{THEME_OPTIONS.map(option=><button type="button" key={option.id} className={'theme-choice '+(theme===option.id?'selected':'')} onClick={()=>setTheme(option.id)} aria-pressed={theme===option.id}><span className="theme-swatches" aria-hidden="true">{option.preview.map((color,i)=><i key={color} style={{background:color,zIndex:3-i}}/>)}</span><span className="theme-choice-text"><strong>{option.label}</strong><small>{option.hint}</small></span>{theme===option.id&&<span className="theme-selected-mark"><Icon name="check" size={16}/></span>}</button>)}</div><p className="theme-save-caption">選択したテーマはこの端末に保存されるよ。</p></section><section className="setting-panel"><h2>バックアップ・復元</h2><p>記録は現在、この端末のブラウザに保存されているよ。Safariのデータ消去や端末の変更に備えて、バックアップを残してね。</p><div className="setting-actions"><button className="primary" onClick={backup}><Icon name="download" size={19}/>バックアップを保存</button><button className="secondary" onClick={()=>backupRef.current?.click()}><Icon name="upload" size={19}/>復元する</button><input ref={backupRef} type="file" accept="application/json,.json" hidden onChange={e=>e.target.files?.[0]&&restore(e.target.files[0])}/></div></section><section className="setting-panel"><h2>ゲームのルール</h2><p>実績上の1日は午前4:00〜翌日3:59。日ごとの基礎経験値は最大50XP。最初の完了で15XP、完了件数に応じた加算もあるよ。レベル算出式はまだ暫定版だよ。</p><p>実績と戦闘はどちらも朝4時基準。戦闘は4時以降の起動で1日1回。未完了の繰り返しは実施日ごとに残り、見送るか完了するまで消えないよ。</p></section><p className="version-label">たぬタスク · UX update v0.8.1</p></>}
  </main>
  <nav className="bottom-nav" aria-label="メインメニュー">{NAV.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>{setTab(id);window.scrollTo({top:0,behavior:'auto'})}}><Icon name={icon} size={23}/><span>{label}</span></button>)}</nav>
  {draft&&<Modal heading="新しいタスクを登録" onClose={()=>{setDraft(null);notify('入力をキャンセルしたたぬ！')}} actions={<><button className="primary" onClick={saveNew}><Icon name="check" size={18}/>登録する</button><button className="secondary" onClick={()=>{setDraft(null);notify('入力をキャンセルしたたぬ！')}}>キャンセル</button></>}><FormFields draft={draft} setDraft={setDraft}/></Modal>}
  {editing&&<Modal heading={editing.kind==='repeat'?'繰り返し設定の編集':'タスクの編集'} onClose={()=>setEditing(null)} actions={<><button className="primary" onClick={saveEdit}>保存する</button><button className="secondary" onClick={()=>setEditing(null)}>戻る</button>{editing.kind==='single'&&editing.status!=='done'&&!state.xpEvents.some(e=>e.sourceId===editing.id)&&<button className="danger-text" onClick={deleteEntry}>削除</button>}</>}><FormFields draft={editing} setDraft={setEditing} isEdit/><p className="field-note">{editing.status==='done'?'完了したタスクは削除できないよ。':'完了履歴とXPは削除しない設計だよ。'}</p></Modal>}
  {notice&&<div className="global-toast" role="status"><Icon name="sparkle" size={17}/>{notice}</div>}
  <ValidationDialog message={formError} onClose={()=>setFormError('')}/>
  {levelUp&&<LevelCelebration info={levelUp} onDone={clearLevelUp}/>}
  {battle&&<Battle record={battle} onClose={closeBattle} onGoHome={battleGoHome} demo={battleDemo}/>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
