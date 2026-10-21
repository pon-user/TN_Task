# TN_Task GitHubへの格納（iPhone対応）
1. GitHubの `pon-user/TN_Task` の main にこのZIPの **中身のフォルダ構造ごと** 格納する。
2. `.github/workflows/pages.yml` と `src/main.jsx` と `src/domain/core.js` がそれぞれ指定の階層にあることを必ず確認する。GitHubのアップロード画面でフォルダが平坦化された場合はそのまま公開しない。
3. Settings → Pages → Source は **GitHub Actions** のまま。
4. Actions → Deploy GitHub Pages で `Test` / `Build` / `deploy` が成功することを確認する。
5. URL: https://pon-user.github.io/TN_Task/

注意: 以前のファイルを削除する際は、`.github/workflows/pages.yml` も本ZIP版で再作成すること。
この初版はiPhone実機で未検証。戦闘画像は外部GitHub raw参照。
