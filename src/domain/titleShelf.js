import {WIN_TIERS,DAMAGE_TIERS} from './core.js';
const rank=(index,total)=>index/total>=.90?'legend':index/total>=.67?'gold':index/total>=.33?'silver':'bronze';
export function titleCatalog(){
 const wins=WIN_TIERS.map((n,i)=>({id:`W-${n}`,label:n===1000?'千勝のたぬ王':`${n}勝のたぬ`,kind:'win',threshold:n,tier:rank(i,WIN_TIERS.length)}));
 const damage=DAMAGE_TIERS.map((n,i)=>({id:`D-${n}`,label:n===10000?'万撃のたぬ神':`${n}撃のたぬ`,kind:'damage',threshold:n,tier:rank(i,DAMAGE_TIERS.length)}));
 return [...wins,...damage,
 {id:'S-3',label:'三連勝のたぬ',kind:'streak',threshold:3,tier:'silver'},
 {id:'S-7',label:'七連勝のたぬ',kind:'streak',threshold:7,tier:'gold'},
 {id:'A-80',label:'堅実なたぬ',kind:'average',threshold:80,tier:'silver'},
 {id:'A-90',label:'達人たぬ',kind:'average',threshold:90,tier:'legend'}];
}
export const trophyTiers=[{id:'legend',name:'伝説級',description:'最高峰の称号'},{id:'gold',name:'上級',description:'努力の結晶'},{id:'silver',name:'中級',description:'着実な成長'},{id:'bronze',name:'初級',description:'最初の一歩'}];
export function titleProgress(item,score){
 const value=item.kind==='win'?score.wins:item.kind==='damage'?score.damage:item.kind==='streak'?score.longestStreak:Math.round((score.averageRate||0)*100);
 const eligible=item.kind!=='average'||score.battles>=(item.threshold===80?7:20);
 return {value,goal:item.threshold,eligible,description:item.kind==='win'?'勝利数':item.kind==='damage'?'累計ダメージ':item.kind==='streak'?'最長連勝':'平均消化率'};
}
