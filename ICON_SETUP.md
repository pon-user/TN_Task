# アプリアイコンについて

ホーム画面に追加する際のアイコン、ブラウザのfavicon、Web App Manifestを設定済み。

- `public/icons/icon-192.png`, `icon-512.png`: Android/PWA
- `public/icons/apple-touch-icon.png`: iPhone「ホーム画面に追加」
- `public/icons/favicon-32.png`: ブラウザのタブ
- `public/manifest.webmanifest`: PWAメタデータ

アイコンは元気なたぬをモチーフにした**新規のドット絵アイコン**。Obsidianの`02_happy.svg`をそのまま流用したものではありません。アプリ内のキャラクター素材は既存のObsidian版を引き続き参照します。

各アイコンは64×64の原画から最近傍補間で生成。GitHub Pagesのサブパスでも参照できるよう相対パスを採用。iPhoneのホーム画面追加後はSafariやiOSのキャッシュでアイコンの更新に時間がかかる場合があります。
