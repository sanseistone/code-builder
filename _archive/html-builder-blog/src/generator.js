// ============================================================
// 数据模型 → HTML 源码生成器
// 输出结构与 demo.html 保持一致：
//   <style>全局样式</style>
//   <div class="container">
//     目次 / 各区块
//   </div>
// ============================================================

import { collectSections, walkBlocks } from './types.js'

// ---------- 基础工具 ----------

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 只允许安全协议，避免 javascript: 之类的注入
function safeUrl(url) {
  const s = String(url || '').trim()
  return /^(https?:\/\/|\/|#|mailto:)/i.test(s) ? s : '#'
}

// 行内标记：**粗体** / __下划线__ / ==高亮== / [文字](链接)
function applyMarks(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<span style="text-decoration: underline;">$1</span>')
    .replace(/==([^=]+)==/g, '<span class="highlight">$1</span>')
}

export function inline(raw) {
  let s = esc(raw)
  // 链接最先处理：链接文字内部再跑一遍行内标记
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
    const plain = text.replace(/\*\*|__|==/g, '')
    return `<a title="${plain}" href="${safeUrl(url)}">${applyMarks(text)}</a>`
  })
  return applyMarks(s)
}

// 多行文本 → 带 <br> 与缩进的 HTML 片段
function inlineMultiline(raw, pad) {
  const lines = String(raw ?? '').split('\n')
  return lines
    .map((l) => inline(l))
    .join(`<br>\n${pad}    `)
}

// ---------- 各区块渲染 ----------

function renderParagraph(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  return [`${pad}<p>${inlineMultiline(b.text, pad)}</p>`]
}

function renderSubheading(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  return [
    `${pad}<div class="section-head">`,
    `${pad}    <h3>${inline(b.text)}</h3>`,
    `${pad}</div>`,
  ]
}

function renderImage(b, indent) {
  if (!String(b.src).trim()) return []
  const pad = ' '.repeat(indent)
  const attrs = [
    `src="${esc(b.src)}"`,
    `alt="${esc(b.alt)}"`,
    b.width ? `width="${esc(b.width)}"` : '',
    b.height ? `height="${esc(b.height)}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const img = `<img ${attrs}>`

  // 头图模式：外层包 .article-banner
  if (b.banner) {
    return [`${pad}<div class="article-banner">${img}`, `${pad}</div>`]
  }
  const wrapped = b.link ? `<a href="${safeUrl(b.link)}">${img}</a>` : img
  // 段落包裹模式：demo-01 中正文图片写在 <p> 内
  if (b.wrapP) {
    return [`${pad}<p>${wrapped}</p>`]
  }
  return [`${pad}<div class="article-image">${wrapped}</div>`]
}

function renderVideo(b, indent) {
  if (!String(b.src).trim()) return []
  const pad = ' '.repeat(indent)
  const attrs = ['controls="controls"']
  if (String(b.poster).trim()) attrs.push(`poster="${esc(b.poster)}"`)
  if (String(b.width).trim()) attrs.push(`width="${esc(b.width)}"`)
  if (String(b.height).trim()) attrs.push(`height="${esc(b.height)}"`)
  const source = `<source src="${esc(b.src)}" type="${esc(b.mime || 'video/mp4')}">`
  const open = `<video ${attrs.join(' ')}>`
  if (b.wrapP === false) {
    return [`${pad}${open}`, `${pad}    ${source}`, `${pad}</video>`]
  }
  // demo-01 写法：<p><video …>\n<source …>\n</video></p>
  return [`${pad}<p>${open}`, `${pad}        ${source}`, `${pad}    </video></p>`]
}

function renderCta(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  const cls = String(b.className || 'cta-btn').trim() || 'cta-btn'
  const a = `<a class="${esc(cls)}" href="${safeUrl(b.href)}">${inline(b.text)}</a>`
  return b.wrapP === false ? [`${pad}${a}`] : [`${pad}<p>${a}</p>`]
}

// PDF 弹窗：Bootstrap modal 结构 + showModalById() 触发（demo-01 写法）
function renderModal(b, indent) {
  if (!String(b.src).trim() && !String(b.btnText).trim()) return []
  const pad = ' '.repeat(indent)
  const id = String(b.modalId || 'pdfModal').trim() || 'pdfModal'
  const labelId = `${id}Label`
  const size = String(b.size || 'modal-xl').trim()
  const btnClass = String(b.btnClass || 'btn btn-primary').trim()
  const out = [
    `${pad}<div class="item grid gap-3 [&>p]:text-sm [&>ul]:text-sm">`,
    `${pad}    <p class="inline-flex">`,
    `${pad}        <button class="${esc(btnClass)}" onclick="showModalById('${esc(id)}')">${inline(b.btnText)}</button>`,
    `${pad}    </p>`,
    `${pad}    <div id="${esc(id)}" class="modal fade" style="display: none;" tabindex="-1" aria-labelledby="${esc(labelId)}" aria-hidden="true">`,
    `${pad}        <div class="modal-dialog ${esc(size)} modal-dialog-centered">`,
    `${pad}            <div class="modal-content">`,
    `${pad}                <div class="modal-header">`,
    `${pad}                    <p id="${esc(labelId)}" class="modal-title font-semibold">${inline(b.title || b.btnText)}</p>`,
    `${pad}                    <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>`,
    `${pad}                </div>`,
    `${pad}                <div class="modal-body"><iframe class="pdf-preview aspect-square w-full" src="${safeUrl(b.src)}" data-src="${safeUrl(b.src)}"></iframe>`,
    `${pad}                </div>`,
    `${pad}            </div>`,
    `${pad}        </div>`,
    `${pad}    </div>`,
    `${pad}</div>`,
  ]
  return out
}

function renderList(b, indent) {
  const items = (b.items || []).filter((i) => String(i.text).trim() !== '')
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const tag = b.ordered ? 'ol' : 'ul'
  const out = [`${pad}<${tag}>`]
  for (const item of items) {
    out.push(`${pad}    <li>${inlineMultiline(item.text, pad + '    ')}</li>`)
  }
  out.push(`${pad}</${tag}>`)
  return out
}

function renderQuote(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  return [
    `${pad}<div class="insight-box">`,
    `${pad}    <p>${inlineMultiline(b.text, pad)}</p>`,
    `${pad}</div>`,
  ]
}

function renderBadge(b, indent) {
  const items = (b.items || []).filter((i) => String(i.text).trim() !== '')
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [`${pad}<p class="mb-3">`]
  for (const item of items) {
    out.push(`${pad}    <span class="badge-light">${inline(item.text)}</span>`)
  }
  out.push(`${pad}</p>`)
  return out
}

function renderProducts(b, indent) {
  const items = (b.items || []).filter((i) => String(i.img).trim() || String(i.title).trim())
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [
    `${pad}<div class="mb-5 p-3 bg-gray-100">`,
    `${pad}    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-5">`,
  ]
  for (const it of items) {
    out.push(`${pad}        <div class="product-item">`)
    if (String(it.img).trim()) {
      const imgAttrs = [
        `src="${esc(it.img)}"`,
        `alt="${esc(it.alt)}"`,
        it.width ? `width="${esc(it.width)}"` : '',
        it.height ? `height="${esc(it.height)}"` : '',
      ]
        .filter(Boolean)
        .join(' ')
      const inner = `<img ${imgAttrs}>`
      out.push(
        it.href
          ? `${pad}            <a class="image" href="${safeUrl(it.href)}">${inner}</a>`
          : `${pad}            ${inner}`
      )
    }
    if (String(it.title).trim()) {
      const t = inline(it.title)
      out.push(
        it.href
          ? `${pad}            <a class="title line-clamp-2" href="${safeUrl(it.href)}">${t}</a>`
          : `${pad}            <span class="title line-clamp-2">${t}</span>`
      )
    }
    if (String(it.price).trim()) {
      out.push(`${pad}            <div class="price">${inline(it.price)}</div>`)
    }
    out.push(`${pad}        </div>`)
  }
  out.push(`${pad}    </div>`, `${pad}</div>`)
  return out
}

// 章节：标题行（H2/H3 + 返回目次）+ 子区块
function renderSection(b, indent, index) {
  const pad = ' '.repeat(indent)
  const tag = b.level === 3 ? 'h3' : 'h2'
  const out = [
    `${pad}<!-- セクション${index} -->`,
    `${pad}<section id="${esc(b.id)}">`,
    `${pad}    <div class="section-head">`,
    `${pad}        <${tag}>${inline(b.title)}</${tag}>`,
  ]
  if (b.showBackToToc !== false) {
    out.push(
      `${pad}        <p class="back-to-toc up-to" style="cursor: pointer;" title="目次に戻る" data-target="list-title">↑ 目次へ</p>`
    )
  }
  out.push(`${pad}    </div>`)
  out.push(...renderBlocks(b.children, indent + 4))
  out.push(`${pad}</section>`)
  return out
}

// 区块列表分发
export function renderBlocks(blocks, indent = 4) {
  const out = []
  let sectionIndex = 0
  for (const b of blocks || []) {
    switch (b.type) {
      case 'section':
        sectionIndex += 1
        out.push(...renderSection(b, indent, sectionIndex))
        break
      case 'subheading':
        out.push(...renderSubheading(b, indent))
        break
      case 'paragraph':
        out.push(...renderParagraph(b, indent))
        break
      case 'image':
        out.push(...renderImage(b, indent))
        break
      case 'video':
        out.push(...renderVideo(b, indent))
        break
      case 'modal':
        out.push(...renderModal(b, indent))
        break
      case 'cta':
        out.push(...renderCta(b, indent))
        break
      case 'list':
        out.push(...renderList(b, indent))
        break
      case 'quote':
        out.push(...renderQuote(b, indent))
        break
      case 'products':
        out.push(...renderProducts(b, indent))
        break
      case 'badge':
        out.push(...renderBadge(b, indent))
        break
      default:
        break
    }
  }
  return out
}

// ---------- 目次 ----------

// 解析最终生效的目次条目
export function resolveTocItems(doc) {
  if (!doc.toc || !doc.toc.enabled) return []
  if (doc.toc.mode === 'manual') {
    return (doc.toc.items || []).filter((i) => String(i.text).trim() !== '')
  }
  // auto：直接由文档中的章节派生
  return collectSections(doc.blocks).map((s) => ({ id: s.id, text: s.title }))
}

function renderToc(doc, indent) {
  const items = resolveTocItems(doc)
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [
    `${pad}<!-- 目次 (クリックで各セクションへジャンプ) -->`,
    `${pad}<div class="inner border border-solid border-[var(--main-color)] rounded-lg p-4 mb-5">`,
    `${pad}    <div class="flex items-center justify-center">`,
    `${pad}        <div id="list-title" class="toggle-title"> ${esc(doc.toc.title || '目次')}</div>`,
    `${pad}    </div>`,
    `${pad}    <ol id="list-content" class="toggle-list open">`,
  ]
  for (const item of items) {
    out.push(
      `${pad}        <li>`,
      `${pad}            <p data-target="${esc(item.id)}">${inline(item.text)}</p>`,
      `${pad}        </li>`
    )
  }
  out.push(`${pad}    </ol>`, `${pad}</div>`)
  return out
}

// ---------- 主入口 ----------

export function generateHtml(doc) {
  const out = []
  // ① 样式块（可选）
  if (doc.includeStyle) {
    out.push('<style>', ARTICLE_STYLE, '</style>')
  }
  // ② 容器
  out.push('<div class="container">')
  out.push(...renderToc(doc, 4))
  out.push(...renderBlocks(doc.blocks, 4))
  out.push('</div>')
  out.push('<!-- スムーズスクロール＋目次からのジャンプ（htmlのidに対応） -->')
  return out.join('\n')
}

// 预览专用：站点已有 showModalById()，但预览 iframe 里没有，
// 这里补一个等价实现，保证「PDF 弹窗」在预览中也能点开（不写入产出代码）
const MODAL_SHIM_CSS = `
  .modal { position: fixed; inset: 0; z-index: 1055; overflow: auto; padding: 28px 14px; }
  .modal-dialog { max-width: 720px; margin: 0 auto; }
  .modal-lg { max-width: 900px; }
  .modal-xl { max-width: 1140px; }
  .modal-content { background: #fff; border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.25); overflow: hidden; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #eee; }
  .modal-title { margin: 0; font-size: 15px; }
  .btn-close { border: 0; background: transparent; font-size: 20px; line-height: 1; cursor: pointer; opacity: .5; }
  .btn-close:hover { opacity: 1; }
  .modal-body { padding: 14px 18px; }
  .modal-backdrop { position: fixed; inset: 0; background: #000; opacity: .5; z-index: 1050; }
  .btn { display: inline-block; padding: 8px 16px; border: 1px solid transparent; border-radius: 6px; font-size: 13px; cursor: pointer; }
  .btn-primary { background: #c4a79a; color: #fff; }
  .pdf-preview { width: 100%; height: 70vh; border: 0; }
`

const MODAL_SHIM_JS = `
(function () {
  if (window.showModalById) return;
  function close(el) {
    if (!el) return;
    el.style.display = 'none';
    el.classList.remove('show');
    if (el._shimBackdrop) { el._shimBackdrop.remove(); el._shimBackdrop = null; }
  }
  window.showModalById = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    close(el);
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.onclick = function () { close(el); };
    document.body.appendChild(backdrop);
    el._shimBackdrop = backdrop;
    el.style.display = 'block';
    el.classList.add('show');
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-bs-dismiss="modal"]');
    if (t) close(t.closest('.modal'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      Array.prototype.forEach.call(document.querySelectorAll('.modal.show'), close);
    }
  });
})();
`

// 完整 HTML 文档（用于 iframe 预览）
export function generatePreviewDoc(doc) {
  const style = doc.includeStyle ? `<style>\n${ARTICLE_STYLE}\n</style>` : ''
  let hasModal = false
  walkBlocks(doc.blocks, (b) => {
    if (b.type === 'modal') hasModal = true
  })
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(doc.title || 'プレビュー')}</title>
<style>
  body { margin: 0; padding: 28px; background: #f3f4f6; font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', system-ui, sans-serif; }
  .preview-wrap { max-width: 820px; margin: 0 auto; }
  .preview-wrap video, .preview-wrap img { max-width: 100%; height: auto; }
${hasModal ? MODAL_SHIM_CSS : ''}</style>
${style}
<script src="vendor/tailwindcss.browser.js"><\/script>
</head>
<body>
<div class="preview-wrap">
${generateHtml(doc)}
</div>
${hasModal ? `<script>${MODAL_SHIM_JS}<\/script>` : ''}
</body>
</html>`
}

// ============================================================
// 文章全局样式（与 demo.html 内联 style 一致）
// ============================================================
export const ARTICLE_STYLE = `/* ヘッダー */
.blog-header {
    margin-bottom: 28px;
    border-bottom: 1px solid #e9dfd7;
    padding-bottom: 18px;
}

.blog-header h1 {
    font-size: 2.1rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    color: #3b2e28;
    margin-bottom: 8px;
}

.blog-header .kuma-note {
    color: #8b7168;
    font-size: 0.95rem;
    margin-top: 8px;
    border-left: 4px solid #d9c6bc;
    padding-left: 18px;
    font-weight: 300;
}

/* 目次 (クリックジャンプ可能) */
.toc {
    background: #f5f0ed;
    padding: 24px 28px;
    border-radius: 20px;
    margin: 28px 0 36px;
    border: 1px solid #e7dbd4;
}

.toc h2 {
    font-size: 1.3rem;
    font-weight: 500;
    margin-bottom: 18px;
    color: #4d3e37;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
}

.toc h2:before {
    content: "📖";
    margin-right: 12px;
    font-size: 1.4rem;
}

.toc ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
}

.toc li {
    width: calc(50% - 20px);
    min-width: 200px;
    margin-bottom: 6px;
    position: relative;
}

.toc li a {
    text-decoration: none;
    color: #5f4a40;
    font-weight: 400;
    font-size: 1.05rem;
    padding: 6px 0 6px 24px;
    display: inline-block;
    border-bottom: 1px dotted #cbb9af;
    transition: all 0.15s;
    position: relative;
}

.toc li a:before {
    content: "▹";
    position: absolute;
    left: 4px;
    color: #b28b7a;
    font-size: 1.2rem;
}

.toc li a:hover {
    color: #9e6b58;
    border-bottom: 1px solid #9e6b58;
    padding-left: 28px;
}

/* セクション一般 */
section {
    margin-bottom: 26px;
    scroll-margin-top: 24px;
    /* 固定ヘッダーがないので、ジャンプ時の見やすさ */
}


/* 見出し + 戻るボタンの行 */
.section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 25px 0;
    padding-bottom: 2px;
    border-bottom: 2px solid #e1d3cb;
}

h2 {
    font-size: 1.9rem;
    font-weight: 350;
    margin: 28px 0 0;
    padding-bottom: 8px;
    /* border-bottom: 2px solid #e1d3cb; */
    color: #3d2f28;
    letter-spacing: 0.02em;
}

h3 {
    font-size: 1.4rem;
    font-weight: 450;
    margin: 28px 0 12px;
    color: #5f4a3f;
}

p {
    margin-bottom: 1.3rem;
    color: #352e2a;
}

.highlight {
    background: linear-gradient(transparent 70%, #f3e4dc 30%);
    font-weight: 450;
}

/* 引用・特徴ボックス */
.insight-box {
    background: #fcf9f7;
    border-left: 6px solid #c4a79a;
    padding: 20px 24px;
    margin: 28px 0;
    border-radius: 0 14px 14px 0;
    font-style: normal;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.insight-box p:last-child {
    margin-bottom: 0;
}

.brand-note {
    background: #f2ebe8;
    padding: 18px 24px;
    border-radius: 18px;
    margin-top: 24px;
}

/* 画像的なプレースホルダー（テキストの質感を補う） */
.texture-show {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8ddd7;
    color: #594b44;
    padding: 16px 12px;
    border-radius: 30px;
    margin: 20px 0;
    font-size: 0.9rem;
    font-weight: 300;
    letter-spacing: 2px;
    border: 1px dashed #b7a094;
}

.texture-show span {
    background: white;
    padding: 5px 16px;
    border-radius: 40px;
    margin: 0 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* レビュー数など */
.badge-light {
    display: inline-block;
    background: #dccfc8;
    color: #2e2622;
    padding: 2px 14px;
    border-radius: 40px;
    font-size: 0.9rem;
    margin-right: 6px;
}

/* フッター */
.footer-note {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #e2d7d1;
    text-align: center;
    color: #7a6a62;
    font-size: 0.9rem;
}

/* レスポンシブ */
@media (max-width: 600px) {
    .container {
        padding: 16px 16px 30px;
    }

    .blog-header h1 {
        font-size: 1.8rem;
    }

    .toc ul {
        flex-direction: column;
        gap: 2px;
    }

    .toc li {
        width: 100%;
    }

    h2 {
        font-size: 1.6rem;
    }
}

/* ボタン（CTA） */
.cta-btn {
    display: inline-block;
    margin-top: 10px;
    background: linear-gradient(135deg, #ff4d7a, #ff7aa2);
    color: #fff;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 14px;
    text-decoration: none;
    box-shadow: 0 6px 16px rgba(255, 77, 122, 0.25);
    transition: 0.2s;
}

.cta-btn:hover {
    opacity: 0.9;
    color: #fff;
}`
