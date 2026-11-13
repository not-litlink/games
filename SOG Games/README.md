# soggggg games

tools の既存サイト基盤を複製した独立プロジェクト。公開・デプロイ未実施。

## 起動

```sh
cd '/Users/s/SOG Games'
npm run dev
```

一覧: http://127.0.0.1:4173/
暗めいろ: http://127.0.0.1:4173/kurameiro/dist/

ゲームを変更したら、以下で成果物を更新する。

```sh
npm test
npm run build
```

別環境では最初に `npm --prefix kurameiro ci`。Node.jsの条件はゲームのREADMEを参照。Python 3も必要。
ゲーム単体の開発: `npm --prefix kurameiro run dev -- --port 5178`。

## 引き継いだもの

- `index.html`、`src/main.js`、`src/styles.css`: 元の一覧・プレビュー・レスポンシブ・フッター構造。名前・掲載内容のみ変更。アクセントは黄緑からネオンピンク `#e00092` へ。
- `about/`、`contact/`、`privacy-policy/`: 同じページ構造でgamesの名称・掲載内容へ変更。
- `assets/previews/kurameiro.webp`: 元のゲームプレビュー。
- `kurameiro/`: `/Users/s/文字数カウンター/kurameiro/` からフォルダごと移動。ゲーム処理・CSS・テスト・依存バージョンは維持。サイトへの戻りリンク名と検索・共有用メタデータのみ調整。
- ルートの起動方式はtoolsと同じPython静的サーバー。ビルドは既存のJavaScript構文確認＋ゲーム側の既存TypeScript・Vite・事前HTML出力。tools専用の各ツールのビルドは除外。
- `_redirects`: 元と同じゲームパス転送定義。Pythonの簡易サーバーでは解釈されないため、一覧は直接 `/kurameiro/dist/` を開く。

## 公開前に決めること

公開先ドメインは未指定。旧toolsを指すcanonical・OGP URL・構造化データの絶対URL・サイトマップ設定は引き継がず、ドメイン確定後にgames用として設定する。共有迷路のURL生成は現在のURLを使うため、ドメインを固定していない。

共有URLは同じMacで確認済み。別端末から使うには公開先が必要。旧toolsの公開設定・一覧・リダイレクトには手を加えていないため、旧toolsからgamesへの転送は未設定。

確認記録: `qa/migration-verification.md`。移動元の暗めいろ以外の432ファイルは移行前後でSHA-256一致。
