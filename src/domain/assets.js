// In v0.6 sprite SVGs are unwrapped to PNG data in the client (iOS Safari fix).
// All images are read from the existing Obsidian canonical asset path.
export const ART_BASE='https://raw.githubusercontent.com/pon-user/obsidian-vault/main/%E3%81%BD%E3%82%93%E3%81%AE%E8%A8%98%E6%86%B6/%E3%82%BF%E3%82%B9%E3%82%AF%E7%AE%A1%E7%90%86%E3%82%A2%E3%83%97%E3%83%AA_%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E7%B4%A0%E6%9D%90/';
export const TANU={idle:'01_normal.svg',happy:'02_happy.svg',sad:'03_sad.svg',defeated:'05_defeated.svg',cry:'07_crying.svg',ready:'08_warrior_sword.svg',attack:'09_sword_attack.svg',hit:'10_hit_recoil.svg',tired:'11_exhausted.svg',proud:'13_proud.svg',panic:'14_panicked.svg',shock:'15_shocked.svg'};
export const ENEMIES=[
{id:'task_hoarder',name:'タスク溜め込みマン',stem:'01_task_hoarder'},
{id:'leftover_demon',name:'タスク積み残し魔人',stem:'02_leftover_demon'},
{id:'deadline_count',name:'締切ギリギリ伯爵',stem:'03_deadline_count'},
{id:'later_elephant',name:'あとでやるゾウ',stem:'04_later_elephant'},
{id:'unread_ghost',name:'未読の亡霊',stem:'05_unread_ghost'},
{id:'task_adding_oni',name:'やること増やし鬼',stem:'06_task_adding_oni'},
{id:'perfectionist_golem',name:'完璧主義ゴーレム',stem:'07_perfectionist_golem'},
{id:'priority_dragon',name:'優先順位ぐちゃぐちゃドラゴン',stem:'08_priority_dragon'},
];
export const tanuArt=key=>ART_BASE+(TANU[key]||TANU.idle);
export const enemyArt=(id,pose='normal')=>{const e=ENEMIES.find(x=>x.id===id)||ENEMIES[0];return ART_BASE+e.stem+'_'+(['normal','victory','defeat'].includes(pose)?pose:'normal')+'.png';};
export const enemyName=id=>(ENEMIES.find(x=>x.id===id)||ENEMIES[0]).name;
export function pickEnemy(random=Math.random){return ENEMIES[Math.min(ENEMIES.length-1,Math.max(0,Math.floor(random()*ENEMIES.length)))].id;}
export function battlePoses(record,phase){
 if(phase==='ready')return {tanu:'ready',enemy:'normal'};
 if(phase==='attack')return {tanu:'attack',enemy:'normal'};
 if(phase==='counter')return {tanu:record.guardRemain===0?'defeated':'hit',enemy:'normal'};
 if(record.exterminated)return {tanu:'proud',enemy:'defeat'};
 return {tanu:record.guardRemain===0?'defeated':record.guardRemain<=1?'tired':'panic',enemy:'victory'};
}
