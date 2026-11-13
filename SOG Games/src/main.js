const root = document.getElementById("root");

const tools = [
  {
    number: "001",
    title: "暗めいろ",
    description: "無料・登録不要のブラウザ迷路ゲーム。小さな明かりと記憶で出口を探し、自分で作った迷路をURLで共有できます。",
    category: "Game",
    href: "/kurameiro/dist/"
  }
];

function toolRow(tool) {
  return `
    <article class="tool-item" data-tool="${tool.number}">
    <a class="tool-row" href="${tool.href}" aria-describedby="description-${tool.number}">
      <span class="tool-number">${tool.number}</span>
      <span class="tool-copy">
        <span class="tool-title">${tool.title}</span>
        <span class="tool-description" id="description-${tool.number}">${tool.description}</span>
      </span>
      <span class="tool-meta" aria-label="${tool.category}">
        <span><small>category</small>${tool.category}</span>
      </span>
      <span class="tool-arrow" aria-hidden="true">→</span>
    </a>
    <details class="inline-preview">
      <summary aria-label="${tool.title}のプレビュー">プレビュー</summary>
      <div class="inline-preview-content">
        <img src="${previewPath(tool)}" alt="${tool.title}の操作画面" width="1280" height="900" loading="lazy">
        <a href="${tool.href}">${tool.title}を開く <span aria-hidden="true">→</span></a>
      </div>
    </details>
    </article>
  `;
}

function previewPath(tool) {
  return `/assets/previews/${tool.href.split("/")[1]}.webp`;
}

function render() {
  document.documentElement.lang = "ja";
  document.title = "soggggg games | 自作ブラウザゲーム";
  root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <nav class="site-nav" aria-label="サイト内リンク">
          <a href="#index" aria-current="page">Index</a>
          <a href="/about/">About</a>
          <a href="https://soggggg.com/">soggggg.com</a>
        </nav>
      </header>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">soggggg games</h1>
        </section>

        <section class="index-layout" id="index" aria-label="ゲーム一覧" data-nosnippet>
          <div class="tool-index">${tools.map(toolRow).join("")}</div>
          <aside class="preview-column" aria-label="ゲームのプレビュー">
            <figure class="tool-preview">
              <a class="preview-link" href="${tools[0].href}" tabindex="-1">
                <img class="preview-image" src="${previewPath(tools[0])}" alt="${tools[0].title}の操作画面" width="1280" height="900">
              </a>
              <figcaption>
                <span class="preview-number">${tools[0].number}</span>
                <a class="preview-title" href="${tools[0].href}">${tools[0].title} <span aria-hidden="true">→</span></a>
              </figcaption>
            </figure>
          </aside>
        </section>

        <section class="about" id="about" aria-labelledby="about-title">
          <h2 id="about-title">このサイトについて</h2>
          <p>soggggg games は、小林壮悟が作ったブラウザゲームの置き場です。</p>
          <p>入力された内容は、できる限りブラウザ上で処理し、<br>不要にサーバーへ送信しない設計を目指します。</p>
        </section>
      </main>

      <footer class="site-footer">
        <div>
          <p class="footer-name"><a href="https://x.com/soguomede10">made by @soguomede10</a></p>
          <p>© 2026 soggggg games</p>
        </div>
        <nav aria-label="フッターリンク">
          <a href="https://soggggg.com/">soggggg.com</a>
          <a href="/about/">About</a>
          <a href="/contact/">Contact</a>
          <a href="/privacy-policy/">Privacy Policy</a>
        </nav>
      </footer>
    </div>
  `;
}

render();

const desktopPreview = window.matchMedia("(min-width: 1100px) and (hover: hover) and (pointer: fine)");
const items = [...document.querySelectorAll(".tool-item")];
const previewImage = document.querySelector(".preview-image");
const previewLink = document.querySelector(".preview-link");
const previewTitle = document.querySelector(".preview-title");
const previewNumber = document.querySelector(".preview-number");
let selectedNumber = tools[0].number;

function selectTool(tool) {
  selectedNumber = tool.number;
  items.forEach((item) => item.classList.toggle("is-selected", item.dataset.tool === tool.number));
  previewImage.src = previewPath(tool);
  previewImage.alt = `${tool.title}の操作画面`;
  previewLink.href = tool.href;
  previewTitle.href = tool.href;
  previewTitle.replaceChildren(document.createTextNode(`${tool.title} `));
  const arrow = document.createElement("span");
  arrow.textContent = "→";
  arrow.setAttribute("aria-hidden", "true");
  previewTitle.append(arrow);
  previewNumber.textContent = tool.number;
}

items.forEach((item, index) => {
  item.querySelector(".tool-row").addEventListener("pointerenter", () => {
    if (desktopPreview.matches && selectedNumber !== tools[index].number) selectTool(tools[index]);
  });
  item.querySelector(".tool-row").addEventListener("focus", () => {
    if (desktopPreview.matches) selectTool(tools[index]);
  });
  item.querySelector("details").addEventListener("toggle", (event) => {
    if (event.target.open) {
      items.forEach((other) => {
        if (other !== item) other.querySelector("details").open = false;
      });
    }
  });
});
selectTool(tools[0]);
