export function GameInfo() {
  return <section className="game-info" aria-labelledby="game-info-title">
    <h2 id="game-info-title">暗めいろとは</h2>
    <p>暗めいろは、小さな明かりと記憶を頼りに出口を探す、無料・登録不要のブラウザ迷路ゲームです。見えるのは明かりの届く範囲だけ。通った道を覚えながら、緑の灯る扉を目指します。</p>
    <div className="game-info-sections">
      <section><h3>迷路で遊ぶ</h3><p>9×9・15×15・21×21マスから大きさを選べます。PCではWASD・矢印キー、スマホでは画面のタッチスティックで移動。途中で止めたいときは一時停止ボタンを使えます。</p><p>クリアすると、タイム・壁への接触回数・歩いたマス数と迷路の全体図を表示します。歩いた経路をたどり、最短経路と比べることもできます。</p></section>
      <section><h3>迷路を作って共有</h3><p>迷路メーカーでは、壁・通路・スタート・ゴールを編集できます。自分でテストプレイしてから、挑戦URLを友達に送れます。同じURLで同じ迷路に挑戦できます。</p></section>
      <section><h3>よくある質問</h3>
        <details><summary>無料ですか？ 登録やアプリのインストールは必要ですか？</summary><p>無料で遊べます。会員登録もアプリのインストールも必要ありません。スマホやPCのブラウザから開いて遊べます。</p></details>
        <details><summary>自分で作った迷路は保存できますか？</summary><p>共有URLに迷路の情報が含まれます。残しておきたい迷路はURLを控えてください。編集中の内容やプレイ結果は、ページを更新すると失われます。</p></details>
        <details><summary>プレイ結果や入力内容はサーバーに保存されますか？</summary><p>迷路の生成・編集・プレイ結果の処理はブラウザ内で行います。迷路や結果を保存するサーバー機能はありません。操作設定は利用中のブラウザに保存されます。</p></details>
      </section>
    </div>
    <footer className="game-info-footer">
      <a href="/">soggggg games</a><a href="/about/">About</a><a href="/privacy-policy/">Privacy Policy</a><a href="/contact/">Contact</a><a href="https://x.com/soguomede10">made by @soguomede10</a>
    </footer>
  </section>;
}
