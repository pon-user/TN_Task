import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));
const current=join(root,'dist','icons');
const originals=join(root,'public','icons','previous');
const config=JSON.parse(await readFile(join(root,'public','icons','icon-source.json'),'utf8'));
const image=join(root,'public','sprites','tanu','tanuki_injured.png');
const source=await sharp(image).metadata();
if(source.width!==256||source.height!==256)throw Error('Unexpected approved sprite dimensions');
const sizes={'favicon-32.png':32,'apple-touch-icon.png':180,'icon-192.png':192,'icon-512.png':512};
for(const [name,size] of Object.entries(sizes)){
 const file=join(current,name);
 const info=await sharp(file).metadata();
 if(info.width!==size||info.height!==size||info.format!=='png')throw Error(name+' is not '+size+'px PNG');
 const original=await readFile(join(originals,name));
 const actual=await readFile(file);
 const digest=x=>createHash('sha256').update(x).digest('hex');
 if(config.active==='injured'&&digest(original)===digest(actual))throw Error(name+' still matches original icon');
 if(config.active==='original'&&digest(original)!==digest(actual))throw Error(name+' restoration mismatch');
}
console.log('PWA icons verified: '+config.active+' (32/180/192/512px), originals preserved');
