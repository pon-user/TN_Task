# v0.8 公開用ZIPの反映方法

1. **更新前に設定画面からJSONバックアップを保存**する（念のため）。
2. 本ZIPを解凍し、ZIPの**中身**を `pon-user/TN_Task` リポジトリのルートへフォルダ構成を保持したまま上書きアップロード。
3. `.github/workflows/pages.yml`, `src/`, `tests/`, `public/icons/`, `public/sprites/` がルート直下にあることを確認。フォルダをもう1階層増やさない。
4. GitHub Actionsで `Verify task and sprite integration` と `Build` と `Deploy` が緑色になったら、公開ページを再読み込み。
5. Safariとホーム画面アイコンから表示が異なる場合は、どちらが新しいコードを参照しているか確認する。既存の記録は安易に消さない。

## 画像ファイル

`public/sprites/tanu/`（8PNG）と`public/sprites/enemies/`（24PNG）を**必ず一緒にアップロード**。非公開Obsidianから直接読む方式は廃止した。画像不足の場合はテストが失敗し、デプロイされない。

## 保存

保存キー `pon_task_v1_snapshot` を継続。既存の単発／繰り返し／XP／戦闘履歴を初期化する処理は追加していない。
