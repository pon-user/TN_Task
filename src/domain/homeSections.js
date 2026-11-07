/* Home section state is view-only: no changes to task persistence. */
export const HOME_SECTION_DEFAULTS=Object.freeze({today:true,overdue:true,future:false});
const HOME_IDS=new Set(Object.keys(HOME_SECTION_DEFAULTS));
export function toggleHomeSection(open,id){
 if(!HOME_IDS.has(id))return open;
 return {...open,[id]:!open[id]};
}
export function expandHomeSection(open,id){
 if(!HOME_IDS.has(id)||open[id])return open;
 return {...open,[id]:true};
}
/** Each repeating rule appears once at its next upcoming date. */
export function futurePreviewEntries(singles,recurring){
 return [
  ...singles.map(item=>({...item,scheduledDate:item.plannedDate||item.dueDate||item.date,previewKey:'single:'+(item.sourceId||item.id)})),
  ...recurring.map(rule=>({...rule,kind:'repeat',scheduledDate:rule.futureDate,previewKey:'repeat:'+rule.id})),
 ].filter(item=>item.scheduledDate).sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate)||a.title.localeCompare(b.title));
}
export function groupFutureEntries(entries){
 const groups=[];
 for(const item of entries){
  let group=groups[groups.length-1];
  if(!group||group.date!==item.scheduledDate){group={date:item.scheduledDate,items:[]};groups.push(group);}
  group.items.push(item);
 }
 return groups;
}
