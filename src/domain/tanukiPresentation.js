// Screen decorations are intentionally independent from task or battle outcomes.
// Randomness is invoked on initial display and on navigation, never during render.
import {TANUKI_VARIANT_IDS} from './tanukiVariants.js';

export function pickRandomTanukiVariant(previousId=null,random=Math.random){
 const choices=TANUKI_VARIANT_IDS.filter(id=>id!==previousId);
 const sample=Number(random());
 const index=Number.isFinite(sample)?Math.min(choices.length-1,Math.max(0,Math.floor(sample*choices.length))):0;
 return choices[index];
}

export function battleTanuki(record,phase,basePose){
 if(phase==='attack')return 'attack';
 if(phase==='result'&&record.exterminated)return 'proud';
 if(phase==='result'&&!record.exterminated)return record.guardRemain===0?'defeated':'sad';
 return basePose;
}
