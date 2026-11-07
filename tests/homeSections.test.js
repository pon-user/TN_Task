import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOME_SECTION_DEFAULTS,toggleHomeSection,expandHomeSection,futurePreviewEntries,groupFutureEntries} from '../src/domain/homeSections.js';
const ui=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/v08.css',import.meta.url),'utf8');
test('today and overdue start expanded, future starts collapsed',()=>{
 assert.deepEqual(HOME_SECTION_DEFAULTS,{today:true,overdue:true,future:false});
 assert.equal(toggleHomeSection(HOME_SECTION_DEFAULTS,'today').today,false);
 assert.equal(toggleHomeSection(HOME_SECTION_DEFAULTS,'future').future,true);
 assert.equal(HOME_SECTION_DEFAULTS.today,true);
});
test('dashboard navigation expands target without collapsing other sections',()=>{
 const closed={today:false,overdue:false,future:false};
 assert.deepEqual(expandHomeSection(closed,'future'),{today:false,overdue:false,future:true});
 assert.equal(expandHomeSection(HOME_SECTION_DEFAULTS,'today'),HOME_SECTION_DEFAULTS);
 assert.equal(expandHomeSection(closed,'unknown'),closed);
});
test('future previews combine singles and one next date per active recurring rule',()=>{
 const entries=futurePreviewEntries([
  {id:'s1',sourceId:'s1',title:'単発A',plannedDate:'2026-11-08',dueDate:'2026-11-10',kind:'single'},
  {id:'s2',sourceId:'s2',title:'単発B',plannedDate:'2026-11-06',kind:'single'}
 ],[
  {id:'r1',title:'毎週A',futureDate:'2026-11-07'},
  {id:'r2',title:'停止中',futureDate:null}
 ]);
 assert.equal(entries.length,3);
 assert.deepEqual(entries.map(x=>x.scheduledDate),['2026-11-06','2026-11-07','2026-11-08']);
 assert.deepEqual(entries.map(x=>x.previewKey),['single:s2','repeat:r1','single:s1']);
 assert.deepEqual(groupFutureEntries(entries).map(x=>x.date),['2026-11-06','2026-11-07','2026-11-08']);
});
test('dashboard cards, section toggles, scroll targets are wired',()=>{
 for(const id of ['today','overdue','future']){
  assert.ok(ui.includes("jumpHome('"+id+"')"));
  assert.ok(ui.includes('id="home-list-'+id+'"'));
  assert.ok(ui.includes('id="'+id+'"'));
 }
 assert.ok(ui.includes('aria-expanded={expanded}'));
 assert.ok(ui.includes('setHomeSections(current=>expandHomeSection(current,id))'));
 assert.ok(ui.includes('requestAnimationFrame(()=>document.getElementById'));
 assert.ok(ui.includes("scrollIntoView({behavior:'smooth',block:'start'})"));
 assert.ok(ui.includes('hidden={!homeSections.future}'));
 assert.ok(css.includes('.task-list[hidden]'));
});
