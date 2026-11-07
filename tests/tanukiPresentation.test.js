import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pickRandomTanukiVariant,battleTanuki} from '../src/domain/tanukiPresentation.js';
import {TANUKI_VARIANT_IDS,variantPathForId} from '../src/domain/tanukiVariants.js';

test('all 36 approved image variants are reachable by the random selector',()=>{
 const count=TANUKI_VARIANT_IDS.length;
 assert.equal(count,36);
 for(let i=0;i<count;i++){
  const choice=pickRandomTanukiVariant(null,()=>(i+0.5)/count);
  assert.equal(choice,TANUKI_VARIANT_IDS[i]);
  assert.ok(variantPathForId(choice)?.endsWith('.png'));
 }
});
test('every navigation chooses a different sprite from the immediately previous one',()=>{
 for(const previous of TANUKI_VARIANT_IDS){
  for(const sample of [0,0.01,0.25,0.5,0.75,0.999999,1,-1]){
   const next=pickRandomTanukiVariant(previous,()=>sample);
   assert.ok(TANUKI_VARIANT_IDS.includes(next));
   assert.notEqual(next,previous);
  }
 }
});
test('unknown previous sprite does not reduce the pool',()=>{
 assert.equal(pickRandomTanukiVariant('not-a-variant',()=>0),TANUKI_VARIANT_IDS[0]);
 assert.equal(pickRandomTanukiVariant(null,()=>1),TANUKI_VARIANT_IDS.at(-1));
});
test('battle poses stay contextual rather than randomly changing',()=>{
 const record={exterminated:false,guardRemain:0};
 assert.equal(battleTanuki(record,'ready','ready'),'ready');
 assert.equal(battleTanuki(record,'attack','ready'),'attack');
 assert.equal(battleTanuki(record,'result','ready'),'defeated');
 assert.equal(battleTanuki({...record,exterminated:true},'result','ready'),'proud');
});
test('all five main screens use the same navigation-selected sprite',()=>{
 const ui=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(ui,/useState\(\(\)=>pickRandomTanukiVariant\(\)\)/);
 assert.match(ui,/pickRandomTanukiVariant\(displayVariant\)/);
 assert.equal((ui.match(/<Tanu pose=\{displayVariant\}/g)||[]).length,5);
 for(const tab of ['home','manage','achievements','history','settings'])assert.ok(ui.includes("tab==='"+tab+"'"));
 assert.ok(ui.includes("navigateTab('manage')"));
 assert.ok(ui.includes("navigateTab('home',true)"));
 assert.ok(ui.includes('navigateTab(id)'));
 assert.ok(!ui.includes('screenTanuki('));
 assert.ok(!ui.includes('homeTanuki('));
});
