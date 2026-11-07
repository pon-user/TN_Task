import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const icons=join(root,'public','icons');
const config=JSON.parse(readFileSync(join(icons,'icon-source.json'),'utf8'));

test('icon modes preserve approved injured source and original backups',()=>{
 assert.ok(['injured','original'].includes(config.active),'active must be a supported mode');
 const source=readFileSync(join(root,'public','sprites','tanu','tanuki_injured.png'));
 assert.equal(source.toString('hex',0,8),'89504e470d0a1a0a');
 assert.equal(source.readUInt32BE(16),256);
 assert.equal(source.readUInt32BE(20),256);
 for(const name of ['favicon-32.png','apple-touch-icon.png','icon-192.png','icon-512.png']){
  assert.ok(existsSync(join(icons,'previous',name)),name);
 }
});
test('manifest and HTML keep supported icon filenames for iPhone and PWA',()=>{
 const manifest=JSON.parse(readFileSync(join(root,'public','manifest.webmanifest'),'utf8'));
 assert.deepEqual(manifest.icons.map(icon=>icon.sizes),['192x192','512x512']);
 const html=readFileSync(join(root,'index.html'),'utf8');
 for(const path of ['favicon-32.png','apple-touch-icon.png']){
  assert.ok(html.includes('icons/'+path+'?v='+config.active+'-'),path+' cache version must follow active icon mode');
 }
 for(const icon of manifest.icons)assert.ok(icon.src.includes('?v='+config.active+'-'));
});
