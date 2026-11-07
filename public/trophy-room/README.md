# トロフィー展示室 PNG 素材配置

実装コードは `src/trophyAssets.js` の25素材を参照します。画像本体は Obsidian の非公開保管庫から公開アプリの `public/trophy-room/` に複製してください。Obsidian 側の原本は変更しません。

元フォルダ: `pon-user/obsidian-vault/11_たぬタスク/01_成果物/素材・データ/称号素材/`

配置先: `pon-user/TN_Task/public/trophy-room/`

| 種別 | 元ファイル名 | 配置ファイル名 |
|---|---|---|
| 背景 | トロフィー展示室_背景.PNG | background.png |
| 上部プレート | トロフィー展示室_上部プレート_ブロンズ.PNG | header-bronze.png |
| 銘板 | トロフィー展示室_称号プレート_ブロンズ.PNG | plaque-bronze.png |
| トロフィー | トロフィー展示室_戦闘系トロフィー_ブロンズ.PNG | bronze-win.png |
| トロフィー | トロフィー展示室_ダメージ系トロフィー_ブロンズ.PNG | bronze-damage.png |
| トロフィー | トロフィー展示室_連勝系トロフィー_ブロンズ.PNG | bronze-streak.png |
| トロフィー | トロフィー展示室_消化率系トロフィー_ブロンズ.PNG | bronze-average.png |
| 上部プレート | トロフィー展示室_上部プレート_シルバー.PNG | header-silver.png |
| 銘板 | トロフィー展示室_称号プレート_シルバー.PNG | plaque-silver.png |
| トロフィー | トロフィー展示室_戦闘系トロフィー_シルバー.PNG | silver-win.png |
| トロフィー | トロフィー展示室_ダメージ系トロフィー_シルバー.PNG | silver-damage.png |
| トロフィー | トロフィー展示室_連勝系トロフィー_シルバー.PNG | silver-streak.png |
| トロフィー | トロフィー展示室_消化率系トロフィー_シルバー.PNG | silver-average.png |
| 上部プレート | トロフィー展示室_上部プレート_ゴールド.PNG | header-gold.png |
| 銘板 | トロフィー展示室_称号プレート_ゴールド.PNG | plaque-gold.png |
| トロフィー | トロフィー展示室_戦闘系トロフィー_ゴールド.PNG | gold-win.png |
| トロフィー | トロフィー展示室_ダメージ系トロフィー_ゴールド.PNG | gold-damage.png |
| トロフィー | トロフィー展示室_連勝系トロフィー_ゴールド.PNG | gold-streak.png |
| トロフィー | トロフィー展示室_消化率系トロフィー_ゴールド.PNG | gold-average.png |
| 上部プレート | トロフィー展示室_上部プレート_レジェンド.PNG | header-legend.png |
| 銘板 | トロフィー展示室_称号プレート_レジェンド.PNG | plaque-legend.png |
| トロフィー | トロフィー展示室_戦闘系トロフィー_レジェンド.PNG | legend-win.png |
| トロフィー | トロフィー展示室_ダメージ系トロフィー_レジェンド.PNG | legend-damage.png |
| トロフィー | トロフィー展示室_連勝系トロフィー_レジェンド.PNG | legend-streak.png |
| トロフィー | トロフィー展示室_消化率系トロフィー_レジェンド.PNG | legend-average.png |

## 検証条件
- 25ファイルが公開アプリのパスでHTTP 200になること。画像が欠ける場合は従来SVGにフォールバックするが完成扱いしない。
- 画像の透明度・余白・縦横比を検査。特に市松模様の焼き込みを確認。
- 37称号の判定、ページ送り、0/37・一部・37/37、各種テーマ、iPhone幅を確認。
- 画像は実行時にPrivate Obsidian URLを参照しない。
- ソース側に「消化率系系トロフィー_ブロンズ.PNG」という重複命名の画像があるため、採用原本は「消化率系トロフィー_ブロンズ.PNG」とする。
