import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/v08.css',import.meta.url),'utf8');
const segment=(from,to)=>ui.slice(ui.indexOf(from),ui.indexOf(to,ui.indexOf(from)));
test('five tabs keep home task-first and distinguish achievement versus history',()=>{
 assert.match(ui,/\['home','home','ホーム'\]/);
 assert.match(ui,/\['achievements','trophy','実績'\]/);
 assert.match(ui,/\['history','clock','履歴'\]/);
 const home=segment("{tab==='home'&&<>","{tab==='manage'&&<>");
 assert.match(home,/home-date-head/);assert.match(home,/dashboard\.today\.map/);
 assert.doesNotMatch(home,/xp-strip|masthead|MiniLevelProgress/);
 const growth=segment("{tab==='achievements'&&<>","{tab==='history'&&<>");
 assert.match(growth,/level-card/);assert.match(growth,/称号コレクション/);assert.match(growth,/xp-strip/);
});
test('task input has one entry and no category control',()=>{
 const manage=segment("{tab==='manage'&&<>","{tab==='achievements'&&<>");
 assert.match(manage,/タスクを登録/);
 assert.doesNotMatch(manage,/分類を絞る|create-options|filterStatus|grouped\.map/);
 assert.match(ui,/setFormError/);assert.match(ui,/role="alertdialog"/);
 assert.doesNotMatch(ui,/htmlFor="category"/);
});
test('registered recurring rules appear once, not occurrence and future duplicates',()=>{
 const manage=segment("{tab==='manage'&&<>","{tab==='achievements'&&<>");
 assert.match(manage,/managedRepeats\.map/);assert.match(manage,/managedSingles\.map/);
 assert.doesNotMatch(manage,/recurringFuture\.map|dashboard\.today\.map|pendingOccurrences\(state,today\)\.map/);
});
test('battle is acknowledged before it stops auto-opening, while demo cannot overwrite results',()=>{
 assert.match(ui,/lastBattleAcknowledgedDate/);
 assert.match(ui,/enemyMaxHp>0/);
 assert.match(ui,/battleDemo/);
 assert.match(ui,/敵HPが0なので戦闘演出は発生しなかった/);
});
test('native iPhone form keeps date fields single column and responds to visual viewport',()=>{
 assert.match(css,/\.date-fields\{display:flex;flex-direction:column/);
 assert.match(css,/::-webkit-calendar-picker-indicator/);
 assert.match(ui,/visualViewport/);
});
