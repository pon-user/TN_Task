# TN_task アプリアイコンの切り替え・復元

## 現行アイコン
- モード: `injured`
- 画像正本: `public/sprites/tanu/tanuki_injured.png`（承認済みの既存たぬPNG、256×256）
- 生成サイズ: `public/icons/favicon-32.png`（32px）、`apple-touch-icon.png`（180px）、`icon-192.png`（192px）、`icon-512.png`（512px）
- 生成処理: `scripts/generate-app-icons.mjs`。新しいイラストは生成せず、承認済み画像をサイズ調整して淡い背景に配置する
- GitHub Pagesは `npm run build` に伴う `prebuild` でアイコンを生成し、`dist/icons/` に同梱する
- `npm run dev` でも `predev` で生成する

## 元のアイコンへ復元する方法
1. `public/icons/icon-source.json` の `active` を `injured` から `original` に変更する。
2. `index.html` の `?v=injured-20261103` と `public/manifest.webmanifest` の `?v=injured-20261103` を `?v=original-<新しい識別子>` に変更する（キャッシュ更新用）。
3. `npm run build` を実行する。ビルド処理が `public/icons/previous/` に保存した旧アイコン4枚をコピーする。
4. テストとGitHub Pagesの公開結果を確認する。iPhoneでアイコンが変わらない場合、まずSafariから公開サイトを開いて表示を確認する。ホーム画面アプリの削除・再追加を試す場合は、**先にアプリの設定画面からJSONバックアップを保存すること**。iPhoneでホーム画面Webアプリを削除すると、端末内のタスク保存データも失われる可能性がある。バックアップを確認してからSafariの共有メニューで再追加し、必要ならバックアップから復元する。

旧アイコンのバイナリは `public/icons/previous/` に4枚とも保存してある。Git履歴だけに頼らず復元可能。

## 注意事項
- `public/icons/` 直下の4枚はビルド時に自動生成・上書きする出力物。直接編集しても次のビルドで置き換わる。
- `public/sprites/tanu/tanuki_injured.png` は変更しない。ゲーム内画像とアプリアイコンの元画像が同じである。
- iPhone Safariのホーム画面表示は実機確認が必要。GitHub Actionsの成功だけでは実機確認済みにはならない。
