# たぬタスク｜GitHub リポジトリへの格納・公開手順

## アップロード
1. GitHubで新規リポジトリを作成。公開するなら `Public` を選択。
2. ZIPを展開し、**`tanu-task-repository-v0.1` フォルダの中身**をリポジトリのルートにアップロード。フォルダ自体を入れない。
3. `.github/workflows/pages.yml` を含めてアップロードする。GitHubのWebアップロードでドットから始まるフォルダを追加しにくい場合は、GitHubの「Add file → Create new file」で `.github/workflows/pages.yml` を作成して同内容を貼り付ける。
4. リポジトリの **Settings → Pages → Build and deployment → Source: GitHub Actions** を選択。
5. Actionsで「Deploy GitHub Pages」が成功すれば、Pagesに表示されるURLを開く。

## ローカルで確認する場合
Node.js 22を推奨。`npm install` → `npm test` → `npm run dev`。公開用は `npm run build`。

## 注意
- このZIPは**初版の試用・実装継続用**。朝6時の戦闘、XP、単発・繰り返し、37称号の解放判定を含むが、279種類のたぬセリフの統合、正式Lv曲線、称号装備などは未完成。
- たぬ・敵の画像は現状 `pon-user/obsidian-vault` の `raw.githubusercontent.com` URLを参照するため、オンライン接続が必要。リポジトリを公開するとソースも公開される。
- `localStorage`に保存されるため、Safariと別ブラウザ間・別端末間でデータは同期されない。定期的に設定画面からJSONバックアップを保存。
- **既存の習慣化アプリ `pon-user/pon-habit` とは別リポジトリにすること。**
- 現環境ではReact/Viteの依存パッケージをインストールできず、**GitHub Actionsでのビルド成功やiPhone表示は未確認**。Actionsが失敗した場合はログを共有してほしい。
