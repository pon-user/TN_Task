import React,{useState} from 'react';
import {titleCatalog,trophyTiers,titleProgress} from './domain/titleShelf.js';
import {trophyAsset} from './trophyAssets.js';
import './trophy-room.css';

function Art({src,fallback,className='',alt='',onMissing}){
  const [failed,setFailed]=useState(false);
  React.useEffect(()=>setFailed(false),[src]);
  return failed ? (fallback ? <img className={className} src={fallback} alt={alt}/> : null) :
    <img className={className} src={src} alt={alt} onError={()=>{setFailed(true);onMissing?.(src)}}/>;
}
const PAGE_SIZE=9;
export default function TrophyRoom({score,titles}){
  const [tier,setTier]=useState('bronze');
  const [page,setPage]=useState(0);
  const [selected,setSelected]=useState(null);
  const [missing,setMissing]=useState({});
  const onMissing=src=>setMissing(prev=>prev[src]?prev:{...prev,[src]:true});
  const items=titleCatalog().filter(x=>x.tier===tier);
  const pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
  const visible=items.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const selectedTier=trophyTiers.find(t=>t.id===tier);
  const earnedIds=new Set(titles.map(t=>t.id));
  const assetAvailable=src=>!missing[src];
  return <section className={'trophy-room tier-'+tier} aria-label="トロフィー展示室">
    <div className="trophy-room-heading"><h3>トロフィー展示室</h3><strong>{titles.length} / 37</strong></div>
    <div className="trophy-room-tabs" role="group" aria-label="階級を選択">
      {[...trophyTiers].reverse().map(t=><button key={t.id} type="button" aria-pressed={tier===t.id} className={tier===t.id?'selected':''} onClick={()=>{setTier(t.id);setPage(0);setSelected(null)}}>{t.name}</button>)}
    </div>
    <div className="trophy-room-scene">
      <Art src={trophyAsset.background} className="trophy-room-background" onMissing={onMissing}/>
      <div className="trophy-room-content">
        <header className="trophy-room-header">
          <Art src={trophyAsset.header(tier)} className="trophy-room-header-art" onMissing={onMissing}/>
          <div className="trophy-room-header-text"><b>{selectedTier.name}</b><small>{selectedTier.description}</small></div>
        </header>
        <div className="trophy-room-grid">
          {Array.from({length:PAGE_SIZE},(_,i)=>{
            const item=visible[i];
            if(!item)return <div className="trophy-room-empty" key={'empty-'+i} aria-hidden="true"/>;
            const earned=earnedIds.has(item.id);
            const image=trophyAsset.trophy(tier,item.kind);
            const plaque=trophyAsset.plaque(tier);
            return <button type="button" key={item.id} style={{'--slot-x':`${[22.4,49.9,77.2][i%3]}%`,'--slot-y':`${[37.5,57.3,76.0][Math.floor(i/3)]}%`}} className={'trophy-room-slot '+(earned?'earned':'locked')} onClick={()=>setSelected(item)} aria-label={item.label+'：'+(earned?'獲得済み':'未獲得')+'。詳細を表示'}>
              <span className="trophy-room-object">
                <Art src={image} fallback={trophyAsset.fallback(tier)} className="trophy-room-trophy" onMissing={onMissing}/>
                {!earned&&<span className="trophy-room-lock" aria-hidden="true">🔒</span>}
              </span>
              <span className={'trophy-room-name '+(!assetAvailable(plaque)?'no-art':'')}>
                <Art src={plaque} className="trophy-room-name-art" onMissing={onMissing}/>
                <span>{item.label}</span>
              </span>
              
            </button>;
          })}
        </div>
      </div>
    </div>
    <nav className="trophy-room-pages" aria-label="展示ページ">
      <button type="button" disabled={page===0} onClick={()=>{setPage(v=>v-1);setSelected(null)}}>前へ</button>
      <span>{page+1} / {pages} ページ</span>
      <button type="button" disabled={page+1>=pages} onClick={()=>{setPage(v=>v+1);setSelected(null)}}>次へ</button>
    </nav>
    {selected&&(()=>{
      const p=titleProgress(selected,score),earned=earnedIds.has(selected.id);
      return <div className="trophy-room-detail" role="status">
        <div><strong>{selected.label}</strong><span>{earned?'獲得済み':'未獲得'}</span></div>
        <p>{p.description}：{p.value} / {p.goal}{selected.kind==='average'?'%':''}{!p.eligible?'（必要戦闘数未達）':''}</p>
        <button type="button" onClick={()=>setSelected(null)}>閉じる</button>
      </div>;
    })()}
  </section>;
}
