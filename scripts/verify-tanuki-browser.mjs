import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await mkdir('artifacts/screenshots',{recursive:true});
 const readSprite=async()=>{
  await page.waitForFunction(()=>{
   const img=document.querySelector('img.tanu-image');
   return !!img&&img.complete&&img.naturalWidth>0;
  });
  return page.locator('img.tanu-image').first().getAttribute('src');
 };
 const visited=[];
 let previous=await readSprite();
 if(!previous.includes('/sprites/tanu/tanuki_'))throw Error('Home sprite is not one of the 36 approved PNGs: '+previous);
 visited.push({screen:'home',src:previous});
 await page.screenshot({path:'artifacts/screenshots/home-mobile.png',fullPage:true});

 // The home dashboard should scroll to and expand its matching task section.
 const sectionButton=id=>page.locator('#home-section-'+id+' .home-section-toggle');
 const sectionList=id=>page.locator('#home-list-'+id);
 const assertExpanded=async(id,expected)=>{
  const actual=await sectionButton(id).getAttribute('aria-expanded');
  if(actual!==String(expected))throw Error(id+' expansion mismatch: expected '+expected+', got '+actual);
  if(await sectionList(id).isVisible()!==expected)throw Error(id+' list visibility mismatch');
 };
 await assertExpanded('today',true);
 await assertExpanded('overdue',true);
 await assertExpanded('future',false);
 await page.getByRole('button',{name:'未来の予定を展開して表示'}).click();
 await assertExpanded('future',true);
 await page.screenshot({path:'artifacts/screenshots/home-future-expanded-mobile.png',fullPage:true});
 await sectionButton('future').click();
 await assertExpanded('future',false);
 await sectionButton('today').click();
 await assertExpanded('today',false);
 await page.getByRole('button',{name:'今日のタスクを表示'}).click();
 await assertExpanded('today',true);
 await sectionButton('overdue').click();
 await assertExpanded('overdue',false);
 await page.getByRole('button',{name:'期限超過のタスクを表示'}).click();
 await assertExpanded('overdue',true);


 const nav=page.getByRole('navigation',{name:'メインメニュー'});
 for(const [screen,label] of [
  ['manage','タスク管理'],
  ['achievements','実績'],
  ['history','履歴'],
  ['settings','設定'],
  ['home','ホーム'],
  ['manage','タスク管理'],
 ]){
  await nav.getByRole('button',{name:label,exact:true}).click();
  await page.waitForFunction(old=>{
   const img=document.querySelector('img.tanu-image');
   return !!img&&img.getAttribute('src')!==old&&img.complete&&img.naturalWidth>0;
  },previous,{timeout:10000});
  const next=await readSprite();
  if(!next.includes('/sprites/tanu/tanuki_'))throw Error('Unexpected sprite on '+screen+': '+next);
  if(next===previous)throw Error('Consecutive navigation repeated the sprite on '+screen);
  visited.push({screen,src:next});
  await page.screenshot({path:`artifacts/screenshots/${screen}-mobile.png`,fullPage:true});
  previous=next;
 }

 // Reselecting an already active tab is not a navigation: keep the pose stable.
 await nav.getByRole('button',{name:'タスク管理',exact:true}).click();
 if(await readSprite()!==previous)throw Error('Current tab redraw unexpectedly rerolled the sprite');

 const asset=await page.evaluate(async()=>{
  const res=await fetch('./sprites/tanu/tanuki_defeated.png');
  return {ok:res.ok,type:res.headers.get('content-type'),size:(await res.arrayBuffer()).byteLength};
 });
 if(!asset.ok||asset.size<1000)throw Error('Defeated sprite unavailable: '+JSON.stringify(asset));
 if(errors.length)throw Error('Browser runtime errors: '+errors.join('; '));
 console.log('Browser navigation smoke OK',JSON.stringify({visited,defeated:asset}));
}finally{await browser.close()}
