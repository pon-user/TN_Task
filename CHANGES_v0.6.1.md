# たぬタスク v0.6.1 戦闘体験改善

## 変更箇所
- `src/main.jsx`：戦闘フェーズの時間調整、進行バー、勝敗別のたぬ発言、結果からホームへ移動するボタン
- `src/domain/battlePresentation.js`：演出時間・順番・たぬの元気さの独立ロジック
- `src/style.css`：戦闘結果ボタン・進行バー・狭画面対応のスタイル
- `tests/battlePresentation.test.js`：戦闘体験4ケースのテスト
- `README.md` / `ACCEPTANCE_CHECKLIST.md`：仕様と確認点

## 設置方法
ZIPを解凍し、既存の GitHub リポジトリの同じパスに上書き・追加する。既存 `public/icons/` のPNGは必ず残す。v0.6を未アップロードの場合にも、このZIP単体でv0.6の変更を含めた更新ができる（ただし既存アイコン画像は別途必要）。

## 未実施
実機Safariテスト、依存パッケージを用いたViteビルド。
