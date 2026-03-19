import { escapeHtml } from "../markdown.mjs";
import { t, getLocale } from "../i18n.mjs";

export function layout(title, body, page = "home") {
  return `<!DOCTYPE html>
<html lang="${getLocale() === 'zh' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — ${t("nav.title")}</title>
   <script>document.documentElement.dataset.theme=localStorage.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')</script>
   <link rel="stylesheet" href="/static/style.css">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">
</head>
<body data-page="${page}">
  <nav class="topbar">
    <a href="/" class="logo"><span style="color:var(--success-color)">~</span>/${t("nav.title")}</a>
    <a href="/stats" class="nav-link">$ ${t("nav.stats")}</a>
    <a href="/trash" class="nav-link">$ ${t("nav.trash")}</a>
    <form class="search-form" action="/search" method="GET">
      <input type="text" name="q" placeholder="${t("nav.search_placeholder")}" class="search-input" id="search-input">
    </form>
    <button id="theme-toggle" class="theme-toggle" title="Toggle theme">🌙</button>
  </nav>
  <main class="content">
    ${body}
  </main>
  <div id="toast-container"></div>
   <script src="/static/app.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
</body>
</html>`;
}
