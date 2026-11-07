import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {TANUKI_VARIANT_IDS,TANUKI_VARIANT_FILES,LEGACY_TO_VARIANT,variantPathForId,variantPathForPose} from '../src/domain/tanukiVariants.js';
import {TANU,legacyTanuArt,tanuArt} from '../src/domain/assets.js';

test('approved sprite mapping is unique and covers all 36 variants',()=>{
 assert.equal(TANUKI_VARIANT_IDS.length,36);
 assert.equal(new Set(TANUKI_VARIANT_IDS).size,36);
 assert.equal(new Set(Object.values(TANUKI_VARIANT_FILES)).size,36);
 assert.equal(TANUKI_VARIANT_IDS[29],'defeated');
 assert.equal(TANUKI_VARIANT_FILES.defeated,'tanuki_defeated.png');
 assert.equal(variantPathForId('defeated'),'./sprites/tanu/tanuki_defeated.png');
 assert.equal(variantPathForId('not-real'),null);
});
test('existing gameplay poses remain mapped and old assets remain available',()=>{
 for(const key of Object.keys(TANU)){
  assert.ok(LEGACY_TO_VARIANT[key],key);
  assert.ok(variantPathForPose(key)?.endsWith('.png'),key);
  assert.ok(legacyTanuArt(key).endsWith(TANU[key]),key);
  assert.ok(tanuArt(key).includes('/sprites/tanu/'),key);
 }
});
test('random variant IDs resolve to their exact local PNGs, not idle fallbacks',()=>{
 for(const [id,file] of Object.entries(TANUKI_VARIANT_FILES)){
  assert.equal(tanuArt(id),'./sprites/tanu/'+file,id);
 }
});
test('approved PNG files exist when final asset package is installed',()=>{
 const dir=new URL('../public/sprites/tanu/',import.meta.url);
 assert.ok(existsSync(dir),'sprite directory must exist');
 for(const name of Object.values(TANUKI_VARIANT_FILES))assert.ok(existsSync(new URL(name,dir)),name);
});
