# たぬ画像の登録・検証手順（2026-11-03 現行版）

## 現行の画像配置
- 追加たぬ画像36枚: `public/sprites/tanu/tanuki_<id>.png`（`tanu`直下）
- 従来のたぬ画像8枚: `public/sprites/tanu/01_normal.png` など（フォールバック用として維持）
- 追加画像ID・ファイル名の正本: `src/domain/tanukiVariants.js` の `TANUKI_VARIANT_IDS` / `TANUKI_VARIANT_FILES`
- 既存ゲーム内のポーズとの対応表: 同ファイルの `LEGACY_TO_VARIANT`
- 実際に表示する画像パス: `src/domain/assets.js` の `tanuArt`
- ページ・戦闘状況ごとのポーズ選択: `src/domain/tanukiPresentation.js`

**注意:** 旧草案の `public/sprites/tanu/variants/` と `manifest.json` は現行実装で使用していない。36枚を `tanu` 直下に置く。過去の配置案を根拠にフォルダを作り直さない。

## 画像差し替え・追加の手順
1. 承認済みの画像を個別の透過PNGとして準備し、輪郭・足・尻尾・表情・サイズ・背景透過を確認する。
2. 画像名は `tanuki_<id>.png` とし、既存の`TANUKI_VARIANT_IDS` と一致させる。個数やIDを変える場合は対応表、テスト、CIの件数検証も更新する。
3. バイナリPNGはGit/Codex CLI等の正規のアップロード手段で作業ブランチに追加する。既存の従来画像8枚は上書きしない。
4. `git status` で追加・変更を点検し、意図しない画像やディレクトリが混入していないか確認する。
5. `npm test` と `npm run build` を実行し、画像マッピング・従来画像へのフォールバック・タスク/XP/戦闘の既存仕様への影響を確認する。
6. PRのGitHub Actionsで、36枚の本番出力、Chromium 390px幅のホーム表示、画像の読み込み、JavaScript実行エラーがないことを確認する。
7. 結果を記録して`main`への統合を判断する。iPhone Safariの実機確認はブラウザ自動検証とは区別し、未実施の場合はその旨を明記する。

## 2026-11-03 の統合前検証
- 追加画像36枚の配置と本番ビルドへの同梱を確認。
- `npm test`: 77件成功・失敗0件。
- `npm run build`: 成功。
- PR #13 のCI: テスト・ビルド・36画像検証・Chromiumホーム画面スモークテストが成功。
- 実行ログ: https://github.com/pon-user/TN_Task/actions/runs/41599081768
- **留保:** iPhone Safari実機および全画面の手動目視確認は未実施。自動検証の成功を実機検証済みと扱わない。
