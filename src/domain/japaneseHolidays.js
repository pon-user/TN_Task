// Japanese national holidays, including substitute and citizens' holidays.
// Rules are calculated offline for 2000-2099. Future legal changes require an update.
const pad=n=>String(n).padStart(2,'0');
const key=(y,m,d)=>`${y}-${pad(m)}-${pad(d)}`;
const weekday=(y,m,d)=>new Date(Date.UTC(y,m-1,d)).getUTCDay();
const nthMonday=(y,m,n)=>1+(8-weekday(y,m,1))%7+7*(n-1);
const equinox=(y,spring)=>Math.floor((spring?20.8431:23.2488)+0.242194*(y-1980)-Math.floor((y-1980)/4));
const cache=new Map();
export function japaneseHolidays(year){
 if(cache.has(year))return cache.get(year);
 const days=new Set();
 if(year<2000||year>2099){cache.set(year,days);return days}
 const add=(m,d)=>days.add(key(year,m,d));
 add(1,1);add(1,nthMonday(year,1,2));add(2,11);
 if(year>=2020)add(2,23);
 add(3,equinox(year,true));add(4,29);add(5,3);add(5,4);add(5,5);
 add(9,nthMonday(year,9,3));add(9,equinox(year,false));
 add(11,3);add(11,23);
 if(year<=2018)add(12,23);
 if(year===2020){add(7,23);add(7,24);add(8,10)}
 else if(year===2021){add(7,22);add(7,23);add(8,8)}
 else {add(7,nthMonday(year,7,3));add(8,11);add(10,nthMonday(year,10,2))}
 if(year===2019){add(5,1);add(10,22);days.delete(key(year,12,23))}
 // Substitute holiday: since 2007, find the first subsequent non-holiday.
 const national=[...days].sort();
 for(const date of national){
  const [,m,d]=date.split('-').map(Number);
  if(weekday(year,m,d)!==0)continue;
  let cursor=new Date(Date.UTC(year,m-1,d+1));
  while(cursor.getUTCFullYear()===year){
   const candidate=key(year,cursor.getUTCMonth()+1,cursor.getUTCDate());
   if(!days.has(candidate)){days.add(candidate);break}
   cursor.setUTCDate(cursor.getUTCDate()+1);
  }
 }
 // Citizens' holiday between two national holidays.
 for(let t=Date.UTC(year,0,2);t<Date.UTC(year,11,31);t+=86400000){
  const d=new Date(t),k=key(year,d.getUTCMonth()+1,d.getUTCDate());
  if(days.has(k))continue;
  const before=new Date(t-86400000),after=new Date(t+86400000);
  if(days.has(key(year,before.getUTCMonth()+1,before.getUTCDate()))&&days.has(key(year,after.getUTCMonth()+1,after.getUTCDate())))days.add(k);
 }
 cache.set(year,days);return days;
}
export function isJapaneseHoliday(date){
 const year=Number(date?.slice(0,4));
 return japaneseHolidays(year).has(date);
}
