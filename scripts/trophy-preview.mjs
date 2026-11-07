import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

mkdirSync('review-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.getByRole('button',{name:/実績/}).last().click();
await page.getByRole('heading',{name:'トロフィー展示室'}).waitFor();
for(const [tier,label] of [['bronze','初級'],['silver','中級'],['gold','上級'],['legend','伝説級']]){
 await page.getByRole('group',{name:'階級を選択'}).getByRole('button',{name:label}).click();
 const slots=page.locator('.trophy-room-slot');
 if(await slots.count()>9)throw new Error('More than nine trophies on a page');
 const alignment=await page.locator('.trophy-room-slot').evaluateAll(nodes=>nodes.map(node=>{const center=e=>{const b=e.getBoundingClientRect();return b.left+b.width/2};const trophy=node.querySelector('.trophy-room-trophy');const plaque=node.querySelector('.trophy-room-name');return {slot:center(node),trophy:center(trophy),plaque:center(plaque)}}));
 for(const a of alignment){if(Math.abs(a.slot-a.trophy)>1||Math.abs(a.slot-a.plaque)>1)throw new Error('Misaligned trophy/plaque: '+JSON.stringify(a));}
 await page.screenshot({path:'review-screenshots/'+tier+'.png',fullPage:true});
}
await page.getByRole('group',{name:'階級を選択'}).getByRole('button',{name:'初級'}).click();
await page.getByRole('button',{name:'次へ'}).click();
await page.getByText('2 / 2 ページ').waitFor();
await page.screenshot({path:'review-screenshots/bronze-page2.png',fullPage:true});
await page.locator('.trophy-room-slot').first().click();
await page.locator('.trophy-room-detail').waitFor();
await page.screenshot({path:'review-screenshots/bronze-detail.png',fullPage:true});
await browser.close();
