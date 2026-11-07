// UI-only pacing and feedback; the battle record and its rewards never change here.
export const BATTLE_STAGE_DURATION_MS=Object.freeze({ready:1600,attack:2400,counter:1800,summary:1900});
export const battleSequence=record=>['ready','attack',...(record.enemyRemainHp>0?['counter']:[]),'summary','result'];
export const battlePlaybackDuration=record=>battleSequence(record).slice(0,-1).reduce((sum,s)=>sum+BATTLE_STAGE_DURATION_MS[s],0);
export function battleMood(record){
 if(record.allClear)return {kind:'perfect',subtitle:'ぜんぶ片づいた！元気いっぱいたぬ！',action:'勢いそのまま！今日のタスクへ向かうたぬ！'};
 if(record.exterminated)return {kind:'victory',subtitle:'勝ったたぬ！この調子で今日も進むたぬ！',action:'今日のタスクへ向かうたぬ！'};
 if(record.guardRemain===0)return {kind:'exhausted',subtitle:'今日はちょっとくたくたたぬ…。無理せず一つずつ、たぬ。',action:'ゆっくり今日のタスクへ向かうたぬ…'};
 return {kind:'recovering',subtitle:'負けちゃったたぬ…。でも、今日も一歩ずつ進めるたぬ。',action:'気を取り直して今日のタスクへ向かうたぬ！'};
}

/** Reopen today's persisted encounter until the user explicitly dismisses it.
 * A no-battle record (possibly containing advance-attack damage) is not an encounter.
 */
export function pendingAutoBattle(state,date){
 const record=(state.battleRecords||[]).find(b=>b.battleDate===date);
 if(!record||record.enemyMaxHp<=0||state.settings?.lastBattleAcknowledgedDate===date)return null;
 return record;
}
