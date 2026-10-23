// The art originally lives in a PRIVATE Obsidian repository. GitHub Pages
// must use these public, locally bundled, purpose-specific sprite files.
export const ART_BASE='./sprites/';
// Eight full-resolution approved pixel-art originals were recovered from the
// previous illustration package. Other logical states intentionally reuse the
// closest original pose, never an unrelated app icon or invented artwork.
export const TANU={idle:'01_normal.png',happy:'02_happy.png',sad:'03_sad.png',defeated:'05_defeated.png',cry:'07_crying.png',ready:'08_warrior_sword.png',attack:'06_jump.png',hit:'04_broken_bone.png',tired:'03_sad.png',proud:'02_happy.png',panic:'03_sad.png',shock:'07_crying.png'};
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
export const tanuArt=key=>ART_BASE+'tanu/'+(TANU[key]||TANU.idle);
export const enemyArt=(id,pose='normal')=>{const e=ENEMIES.find(x=>x.id===id)||ENEMIES[0];return ART_BASE+'enemies/'+e.stem+'_'+(['normal','victory','defeat'].includes(pose)?pose:'normal')+'.png';};
export const enemyName=id=>(ENEMIES.find(x=>x.id===id)||ENEMIES[0]).name;
export function pickEnemy(random=Math.random){return ENEMIES[Math.min(ENEMIES.length-1,Math.max(0,Math.floor(random()*ENEMIES.length)))].id;}
export function battlePoses(record,phase){
 if(phase==='ready')return {tanu:'ready',enemy:'normal'};
 if(phase==='attack')return {tanu:'attack',enemy:'normal'};
 if(phase==='counter')return {tanu:record.guardRemain===0?'defeated':'hit',enemy:'normal'};
 if(record.exterminated)return {tanu:'proud',enemy:'defeat'};
 return {tanu:record.guardRemain===0?'defeated':record.guardRemain<=1?'tired':'panic',enemy:'victory'};
}
