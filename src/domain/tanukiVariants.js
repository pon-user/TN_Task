// Approved 36 tanuki sprite identities, ordered by the source sheet (2026-11-03).
// The 36 approved PNGs live in public/sprites/tanu/; preserve legacy fallbacks for load failures.
export const TANUKI_VARIANT_IDS=Object.freeze(["idle","cheer","love_heart","sparkle","calm","idea","surprised","affection","angry","exhausted","sleep","working","reading","party","king","trophy","knight","archer","wizard","heart_eyes","dash","jump","rolling","bath","blanket","box","bush","injured","crying","defeated","onigiri","tea","traveler","back_view","confused","note"]);
export const TANUKI_VARIANT_FILES=Object.freeze(Object.fromEntries(TANUKI_VARIANT_IDS.map(id=>[id,`tanuki_${id}.png`])));
export const TANUKI_VARIANT_DIR='sprites/tanu/';
// Existing gameplay pose keys are stable. New image names are intentionally decoupled.
export const LEGACY_TO_VARIANT=Object.freeze({idle:'idle',happy:'cheer',sad:'exhausted',defeated:'defeated',cry:'crying',ready:'knight',attack:'jump',hit:'injured',tired:'exhausted',proud:'trophy',panic:'surprised',shock:'surprised'});
export function variantFile(id){return TANUKI_VARIANT_FILES[id]??null;}
export function variantPathForId(id,base='./'){
 const file=variantFile(id);return file?`${base}${TANUKI_VARIANT_DIR}${file}`:null;
}
export function variantPathForPose(pose,base='./'){
 const id=LEGACY_TO_VARIANT[pose];return id?`${base}${TANUKI_VARIANT_DIR}${TANUKI_VARIANT_FILES[id]}`:null;
}
