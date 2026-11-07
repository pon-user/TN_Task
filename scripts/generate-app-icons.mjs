// Rebuild icon PNGs from an existing approved sprite. No image generation.
// Edit public/icons/icon-source.json to switch between injured and original.
import sharp from 'sharp';
import {copyFile, mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../', import.meta.url));
const iconsDir=join(root,'public','icons');
const settings=JSON.parse(await readFile(join(iconsDir,'icon-source.json'),'utf8'));
const override=process.argv.find(x=>x.startsWith('--mode='))?.slice('--mode='.length);
const mode=override??settings.active;
if(!['injured','original'].includes(mode)) throw Error('Unknown app icon mode: '+mode);

const originals=join(iconsDir,'previous');
const source=join(root,'public','sprites','tanu','tanuki_injured.png');
const sizes=Object.freeze({
 'favicon-32.png':32,
 'apple-touch-icon.png':180,
 'icon-192.png':192,
 'icon-512.png':512,
});
await mkdir(iconsDir,{recursive:true});
for(const [name,size] of Object.entries(sizes)){
 const dest=join(iconsDir,name);
 if(mode==='original'){
  await copyFile(join(originals,name),dest);
 }else{
  const artSize=Math.max(1,Math.round(size*0.86));
  const sprite=await sharp(source).resize(artSize,artSize,{fit:'contain',kernel:'nearest'}).png().toBuffer();
  await sharp({create:{width:size,height:size,channels:4,background:'#f8f1e3'}})
   .composite([{input:sprite,gravity:'centre'}]).png().toFile(dest);
 }
 const info=await sharp(dest).metadata();
 if(info.width!==size||info.height!==size)throw Error('Invalid generated icon size for '+name);
}
console.log('App icons prepared from '+mode+' source ('+Object.keys(sizes).join(', ')+')');
