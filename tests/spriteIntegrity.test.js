import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {TANU,ENEMIES,tanuArt,enemyArt,pickEnemy} from '../src/domain/assets.js';
const root=resolve('public');
const pngSig='89504e470d0a1a0a';
const png=(asset)=>{
 assert.match(asset,/^\.\/sprites\//);
 const f=resolve(root,asset.slice(2));
 assert.ok(existsSync(f),`missing: ${f}`);
 const bytes=readFileSync(f);
 assert.equal(bytes.subarray(0,8).toString('hex'),pngSig,`invalid: ${f}`);
 assert.ok(bytes.length>500,`empty: ${f}`);
};
test('every tanuki state resolves to actual approved pixel art, not the app icon',()=>{
 for(const key of Object.keys(TANU))png(tanuArt(key));
 assert.ok(new Set(Object.values(TANU)).size>=8);
 assert.doesNotMatch(tanuArt('idle'),/icon-192/);
});
test('all eight enemies provide all three individual PNG poses',()=>{
 assert.equal(ENEMIES.length,8);
 for(const enemy of ENEMIES)for(const pose of ['normal','victory','defeat'])png(enemyArt(enemy.id,pose));
 for(let i=0;i<8;i++)assert.equal(pickEnemy(()=>(i+.2)/8),ENEMIES[i].id);
});
