// Generated artwork is staged separately from code. Public GitHub Pages must never
// request private Obsidian URLs. Place approved PNGs under public/trophy-room/.
const base = import.meta.env.BASE_URL + 'trophy-room/';
const names = {bronze:'ブロンズ',silver:'シルバー',gold:'ゴールド',legend:'レジェンド'};
const kinds = {win:'戦闘系',damage:'ダメージ系',streak:'連勝系',average:'消化率系'};
export const trophyAsset = {
  background: base + 'background.png',
  header: tier => base + 'header-' + tier + '.png',
  plaque: tier => base + 'plaque-' + tier + '.png',
  trophy: (tier,kind) => base + tier + '-' + kind + '.png',
  fallback: tier => import.meta.env.BASE_URL + 'trophies/' + tier + '.svg',
};
export const sourceAssetMap = {
  background: 'トロフィー展示室_背景.PNG',
  ...Object.fromEntries(Object.keys(names).flatMap(tier=>[
    ['header-'+tier,'トロフィー展示室_上部プレート_'+names[tier]+'.PNG'],
    ['plaque-'+tier,'トロフィー展示室_称号プレート_'+names[tier]+'.PNG'],
    ...Object.keys(kinds).map(kind=>[tier+'-'+kind,'トロフィー展示室_'+kinds[kind]+'トロフィー_'+names[tier]+'.PNG']),
  ])),
};
// Source images are in Obsidian: 11_たぬタスク/01_成果物/素材・データ/称号素材/
