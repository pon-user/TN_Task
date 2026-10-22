// Adopted from habit companion Pon v7.2 (Obsidian): semantic palette roles.
// Keep Tanu Task state and game rules separate from appearance.
export const THEME_OPTIONS = [
  {id:'dark',label:'シック・ナイト',hint:'落ち着いたダーク × 明るいグリーン',preview:['#111318','#1a1d25','#4ade80']},
  {id:'light',label:'クリア・オーシャン',hint:'すっきりしたブルー × 明るい背景',preview:['#f0f6ff','#ffffff','#2196f3']},
  {id:'warm',label:'ソフト・ブロッサム',hint:'やわらかな暖色 × ピンク',preview:['#fdf6f0','#fffaf7','#e57a8a']}
];
export const normalizeTheme = value => THEME_OPTIONS.some(t=>t.id===value)?value:'dark';
export const THEME_META = {dark:'#111318',light:'#f0f6ff',warm:'#fdf6f0'};

/** Presentation event only. Returns null when XP is unchanged, undone, or restored elsewhere. */
export function levelUpEvent(beforeXp,afterXp,levelFromXP){
 const prev=levelFromXP(beforeXp),next=levelFromXP(afterXp);
 return afterXp>beforeXp&&next>prev ? {from:prev,to:next,gain:afterXp-beforeXp}:null;
}
