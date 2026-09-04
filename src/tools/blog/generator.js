// ============================================================
// 数据模型 → HTML 源码生成器
// 输出结构：
//   <style>…固定样式…</style>          ← 普通 CSS，自包含，无 JS / 外部文件依赖
//   <div class="article-container …">
//     目次 / 各区块
//   </div>
//
// 视觉统一由 .article-* 语义类承担（见 article-style.js，手写普通 CSS，
// 不依赖站点是否带 Tailwind / Bootstrap）。个别元素额外保留后台模板脚本
// 需要认的结构钩子类（toggle-list / modal fade / btn-close 等），
// 但它们不再承担样式，视觉只认 article-* 类。
// ============================================================

import { esc, safeUrl } from '@shared'
import { collectSections, walkBlocks, SUBHEADING_TAGS } from './types.js'
import { ARTICLE_CSS } from './article-style.js'

// ---------- 产出代码类名表 ----------
// 主视觉类统一 .article-* 前缀：选择器只命中文章内容，不会和站点全局类
// （如 .btn / .item / .title / .price）撞车。
// 保留的结构钩子类（样式责任已由 article-* 类接管）：
//   目次    inner / toggle-title / toggle-list open   ← 后台目录脚本认它们
//   章节头  section-head；返回目次 back-to-toc up-to
//   引用框  insight-box；标签 badge-light
//   PDF 弹窗 modal fade / modal-dialog modal-* / modal-content / …（Bootstrap 结构）
const C = {
  // 容器 / 章节
  container: 'article-container',
  section: 'article-section',
  sectionHead: 'article-section-head section-head',
  subHead: 'article-subhead section-head',
  h2: 'article-h2',
  h3: 'article-h3',
  h4: 'article-h4',
  backToToc: 'article-back-to-toc back-to-toc up-to',

  // 文字
  paragraph: 'article-text',
  link: 'article-link',
  underline: 'article-mark-underline',
  highlight: 'article-mark-highlight',

  // 列表
  ul: 'article-list',
  ol: 'article-list',

  // 媒体（图片 / 视频统一为块级并预留与正文的间距）
  banner: 'article-banner',
  image: 'article-image',
  imageLink: 'article-image-link',
  img: 'article-img',
  media: 'article-media', // <p> 包裹层（正文内嵌图片 / 视频 / CTA）
  video: 'article-video',

  // 引用框 / 标签组 / CTA
  quote: 'article-quote insight-box',
  quoteText: 'article-quote-text',
  badge: 'article-badge',
  badgeItem: 'article-badge-item badge-light',
  cta: 'article-cta', // 用户 className 会追加在它后面

  // 商品网格
  productsWrap: 'article-products',
  productsGrid: 'article-products-grid',
  productItem: 'article-products-item',
  productImage: 'article-products-img',
  productTitle: 'article-products-title',
  productPrice: 'article-products-price',

  // 目次
  tocWrap: 'article-toc inner',
  tocTitle: 'article-toc-title toggle-title',
  tocList: 'article-toc-list toggle-list open',
  tocLink: 'article-toc-link',

  // PDF 弹窗（Bootstrap 结构类保留给后台脚本，视觉由 article-* 前缀类提供）
  modalWrap: 'article-modal-wrap',
  modalTrigger: 'article-modal-trigger',
  modalContent: 'article-modal-content modal-content',
  modalHeader: 'article-modal-header modal-header',
  modalTitle: 'article-modal-title modal-title',
  modalClose: 'article-modal-close btn-close',
  modalBody: 'article-modal-body modal-body',
  pdfPreview: 'article-modal-pdf pdf-preview',
}

// ---------- 基础工具 ----------

// 预览模式下给区块的最外层元素打上 data-block-uid，
// 供「点击左侧编辑 → 预览滚动定位并高亮」使用。
// 只改第一个真实标签（跳过 <!-- --> 注释行），
// 且仅当 opts.preview 为真时生效 —— 下载出去的代码保持干净。
function markUid(lines, b, opts) {
  if (!opts || !opts.preview || !b || !b.uid) return lines
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*<[a-zA-Z]/.test(lines[i])) continue
    lines[i] = lines[i].replace(
      /<[a-zA-Z][\w-]*/,
      (tag) => `${tag} data-block-uid="${esc(b.uid)}"`
    )
    break
  }
  return lines
}

// 行内标记：**粗体** / __下划线__ / ==高亮== / [文字](链接)
function applyMarks(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, `<span class="${C.underline}">$1</span>`)
    .replace(/==([^=]+)==/g, `<span class="${C.highlight}">$1</span>`)
}

export function inline(raw) {
  let s = esc(raw)
  // 链接最先处理：链接文字内部再跑一遍行内标记
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
    const plain = text.replace(/\*\*|__|==/g, '')
    return `<a class="${C.link}" title="${plain}" href="${safeUrl(url)}">${applyMarks(text)}</a>`
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
  return [`${pad}<p class="${C.paragraph}">${inlineMultiline(b.text, pad)}</p>`]
}

function renderSubheading(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  // 标签只取白名单内的值，非法数据回落到 h3
  const tag = SUBHEADING_TAGS.includes(b.tag) ? b.tag : 'h3'
  const cls = tag === 'h2' ? C.h2 : tag === 'h3' ? C.h3 : tag === 'h4' ? C.h4 : C.paragraph
  return [
    `${pad}<div class="${C.subHead}">`,
    `${pad}    <${tag} class="${cls}">${inline(b.text)}</${tag}>`,
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
  const img = `<img class="${C.img}" ${attrs}>`

  // 头图模式：外层包 .article-banner
  if (b.banner) {
    return [`${pad}<div class="${C.banner}">${img}`, `${pad}</div>`]
  }
  const wrapped = b.link
    ? `<a class="${C.imageLink}" href="${safeUrl(b.link)}">${img}</a>`
    : img
  // 段落包裹模式：demo-01 中正文图片写在 <p> 内
  if (b.wrapP) {
    return [`${pad}<p class="${C.media}">${wrapped}</p>`]
  }
  return [`${pad}<div class="${C.image}">${wrapped}</div>`]
}

function renderVideo(b, indent) {
  if (!String(b.src).trim()) return []
  const pad = ' '.repeat(indent)
  const attrs = ['controls="controls"']
  if (String(b.poster).trim()) attrs.push(`poster="${esc(b.poster)}"`)
  if (String(b.width).trim()) attrs.push(`width="${esc(b.width)}"`)
  if (String(b.height).trim()) attrs.push(`height="${esc(b.height)}"`)
  const source = `<source src="${esc(b.src)}" type="${esc(b.mime || 'video/mp4')}">`
  const open = `<video class="${C.video}" ${attrs.join(' ')}>`
  if (b.wrapP === false) {
    return [`${pad}${open}`, `${pad}    ${source}`, `${pad}</video>`]
  }
  // demo-01 写法：<p><video …>\n<source …>\n</video></p>
  return [`${pad}<p class="${C.media}">${open}`, `${pad}        ${source}`, `${pad}    </video></p>`]
}

function renderCta(b, indent) {
  if (!String(b.text).trim()) return []
  const pad = ' '.repeat(indent)
  const extra = String(b.className || 'cta-btn').trim() || 'cta-btn'
  const a = `<a class="${C.cta} ${esc(extra)}" href="${safeUrl(b.href)}">${inline(b.text)}</a>`
  return b.wrapP === false ? [`${pad}${a}`] : [`${pad}<p class="${C.media}">${a}</p>`]
}

// PDF 弹窗：Bootstrap modal 结构 + showModalById() 触发（后台模板脚本提供，预览内置补齐）
function renderModal(b, indent) {
  if (!String(b.src).trim() && !String(b.btnText).trim()) return []
  const pad = ' '.repeat(indent)
  const id = String(b.modalId || 'pdfModal').trim() || 'pdfModal'
  const labelId = `${id}Label`
  const size = String(b.size || 'modal-xl').trim()
  const out = [
    `${pad}<div class="${C.modalWrap}">`,
    `${pad}    <button class="${C.modalTrigger}" type="button" onclick="showModalById('${esc(id)}')">${inline(b.btnText)}</button>`,
    `${pad}    <div id="${esc(id)}" class="modal fade" style="display: none;" tabindex="-1" aria-labelledby="${esc(labelId)}" aria-hidden="true">`,
    `${pad}        <div class="modal-dialog ${esc(size)} modal-dialog-centered">`,
    `${pad}            <div class="${C.modalContent}">`,
    `${pad}                <div class="${C.modalHeader}">`,
    `${pad}                    <p id="${esc(labelId)}" class="${C.modalTitle}">${inline(b.title || b.btnText)}</p>`,
    `${pad}                    <button class="${C.modalClose}" type="button" data-bs-dismiss="modal" aria-label="Close">×</button>`,
    `${pad}                </div>`,
    `${pad}                <div class="${C.modalBody}"><iframe class="${C.pdfPreview}" src="${safeUrl(b.src)}" data-src="${safeUrl(b.src)}"></iframe>`,
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
  const out = [`${pad}<${tag} class="${b.ordered ? C.ol : C.ul}">`]
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
    `${pad}<div class="${C.quote}">`,
    `${pad}    <p class="${C.quoteText}">${inlineMultiline(b.text, pad)}</p>`,
    `${pad}</div>`,
  ]
}

function renderBadge(b, indent) {
  const items = (b.items || []).filter((i) => String(i.text).trim() !== '')
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [`${pad}<p class="${C.badge}">`]
  for (const item of items) {
    out.push(`${pad}    <span class="${C.badgeItem}">${inline(item.text)}</span>`)
  }
  out.push(`${pad}</p>`)
  return out
}

function renderProducts(b, indent) {
  const items = (b.items || []).filter((i) => String(i.img).trim() || String(i.title).trim())
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [
    `${pad}<div class="${C.productsWrap}">`,
    `${pad}    <div class="${C.productsGrid}">`,
  ]
  for (const it of items) {
    out.push(`${pad}        <div class="${C.productItem}">`)
    if (String(it.img).trim()) {
      const imgAttrs = [
        `src="${esc(it.img)}"`,
        `alt="${esc(it.alt)}"`,
        it.width ? `width="${esc(it.width)}"` : '',
        it.height ? `height="${esc(it.height)}"` : '',
      ]
        .filter(Boolean)
        .join(' ')
      const inner = `<img class="${C.img}" ${imgAttrs}>`
      out.push(
        it.href
          ? `${pad}            <a class="${C.productImage}" href="${safeUrl(it.href)}">${inner}</a>`
          : `${pad}            <div class="${C.productImage}">${inner}</div>`
      )
    }
    if (String(it.title).trim()) {
      const t = inline(it.title)
      out.push(
        it.href
          ? `${pad}            <a class="${C.productTitle}" href="${safeUrl(it.href)}">${t}</a>`
          : `${pad}            <span class="${C.productTitle}">${t}</span>`
      )
    }
    if (String(it.price).trim()) {
      out.push(`${pad}            <div class="${C.productPrice}">${inline(it.price)}</div>`)
    }
    out.push(`${pad}        </div>`)
  }
  out.push(`${pad}    </div>`, `${pad}</div>`)
  return out
}

// 章节：标题行（H2/H3 + 返回目次）+ 子区块
function renderSection(b, indent, index, opts) {
  const pad = ' '.repeat(indent)
  const tag = b.level === 3 ? 'h3' : 'h2'
  // 标题加粗与否由区块的 bold 开关决定，标题文字里不再写 **…**
  const title = inline(b.title)
  const heading = b.bold ? `<strong>${title}</strong>` : title
  const out = [
    `${pad}<!-- セクション${index} -->`,
    `${pad}<section id="${esc(b.id)}" class="${C.section}">`,
    `${pad}    <div class="${C.sectionHead}">`,
    `${pad}        <${tag} class="${b.level === 3 ? C.h3 : C.h2}">${heading}</${tag}>`,
  ]
  if (b.showBackToToc !== false) {
    out.push(
      `${pad}        <p class="${C.backToToc}" title="目次に戻る" data-target="list-title">↑ 目次へ</p>`
    )
  }
  out.push(`${pad}    </div>`)
  out.push(...renderBlocks(b.children, indent + 4, opts))
  out.push(`${pad}</section>`)
  return out
}

// 区块列表分发
export function renderBlocks(blocks, indent = 4, opts) {
  const out = []
  let sectionIndex = 0
  for (const b of blocks || []) {
    // 预览模式下统一在此给每个区块的最外层元素打标记
    const emit = (lines) => out.push(...markUid(lines, b, opts))
    switch (b.type) {
      case 'section':
        sectionIndex += 1
        emit(renderSection(b, indent, sectionIndex, opts))
        break
      case 'subheading':
        emit(renderSubheading(b, indent))
        break
      case 'paragraph':
        emit(renderParagraph(b, indent))
        break
      case 'image':
        emit(renderImage(b, indent))
        break
      case 'video':
        emit(renderVideo(b, indent))
        break
      case 'modal':
        emit(renderModal(b, indent))
        break
      case 'cta':
        emit(renderCta(b, indent))
        break
      case 'list':
        emit(renderList(b, indent))
        break
      case 'quote':
        emit(renderQuote(b, indent))
        break
      case 'products':
        emit(renderProducts(b, indent))
        break
      case 'badge':
        emit(renderBadge(b, indent))
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
  return collectSections(doc.blocks).map((s) => ({ id: s.id, text: s.title, bold: !!s.bold }))
}

function renderToc(doc, indent) {
  const items = resolveTocItems(doc)
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [
    `${pad}<!-- 目次 (クリックで各セクションへジャンプ) -->`,
    `${pad}<div class="${C.tocWrap}">`,
    `${pad}    <p id="list-title" class="${C.tocTitle}"> ${esc(doc.toc.title || '目次')}</p>`,
    `${pad}    <ol id="list-content" class="${C.tocList}">`,
  ]
  for (const item of items) {
    const label = inline(item.text)
    out.push(
      `${pad}        <li>`,
      `${pad}            <p class="${C.tocLink}" data-target="${esc(item.id)}">${item.bold ? `<strong>${label}</strong>` : label}</p>`,
      `${pad}        </li>`
    )
  }
  out.push(`${pad}    </ol>`, `${pad}</div>`)
  return out
}

// ---------- 主入口 ----------

// opts.preview = true 时附带 data-block-uid 标记（仅预览用，下载的代码不带）
// opts.skipStyle / opts.skipTailwind = true 时不输出 <style>（预览文档已在 <head> 引入，避免重复）
export function generateHtml(doc, opts) {
  const out = []
  // ① 固定样式：普通 CSS 内联，自包含，粘到任何页面都生效
  //    （无 @layer / 无 @import / 不需要 JS 或外部文件）
  if (!(opts && (opts.skipStyle || opts.skipTailwind))) {
    out.push(`<style>\n${ARTICLE_CSS}\n</style>`)
  }
  // ② 容器
  out.push(`<div class="${C.container}">`)
  out.push(...renderToc(doc, 4))
  out.push(...renderBlocks(doc.blocks, 4, opts))
  out.push('</div>')
  out.push('<!-- スムーズスクロール＋目次からのジャンプ（htmlのidに対応） -->')
  return out.join('\n')
}

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

// 预览专用：定位高亮。接收父页面 postMessage，把目标区块滚动到可视区并闪烁提示。
// 与 MODAL_SHIM 一样只存在于预览文档，不会写进产出代码。
const HIGHLIGHT_CSS = `
  [data-block-uid] { scroll-margin-top: 24px; border-radius: 6px; }
  /* 常驻高亮：与左侧编辑区的激活态同步，始终标出「正在编辑的这一块」 */
  .block-active { box-shadow: 0 0 0 2px rgba(37, 99, 235, .55); background-color: rgba(37, 99, 235, .05); }
  /* 定位到区块时再闪一下，动画结束后回到常驻高亮 */
  .block-flash { animation: blockFlash 1.3s ease-out 1; }
  @keyframes blockFlash {
    0%, 60% { box-shadow: 0 0 0 2px #2563eb, 0 0 0 7px rgba(37, 99, 235, .22); background-color: rgba(37, 99, 235, .12); }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); background-color: transparent; }
  }
`

const HIGHLIGHT_JS = `
(function () {
  var timer = null;
  function escUid(uid) {
    return (window.CSS && CSS.escape) ? CSS.escape(uid) : uid;
  }
  function find(uid) {
    return document.querySelector('[data-block-uid="' + escUid(uid) + '"]');
  }
  function clearFlash() {
    var prev = document.querySelector('.block-flash');
    if (prev) prev.classList.remove('block-flash');
    if (timer) { clearTimeout(timer); timer = null; }
  }
  // 常驻高亮：同一时刻只保留一个，uid 为空表示清除
  function setActive(uid) {
    var prev = document.querySelector('.block-active');
    if (prev) prev.classList.remove('block-active');
    if (!uid) return;
    var el = find(uid);
    if (el) el.classList.add('block-active');
  }
  function focus(uid) {
    clearFlash();
    var el = find(uid);
    parent.postMessage({ type: 'preview:focus-result', uid: uid, found: !!el }, '*');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('block-flash');
    timer = setTimeout(clearFlash, 1400);
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d) return;
    if (d.type === 'preview:focus-block' && d.uid) focus(d.uid);
    if (d.type === 'preview:set-active') setActive(d.uid);
  });
})();
`

// 预览专用：点击预览里的区块时，把 uid 回传父页面，
// 父页面据此把左侧编辑区滚动到对应卡片（反向联动）。不写入产出代码。
const SELECT_JS = `
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // 表单控件与媒体交给它们自己处理，不做定位
    if (t.closest('input, select, textarea, video, iframe')) return;
    var el = t.closest('[data-block-uid]');
    if (!el) return;
    // 预览里不该真的跳转：链接 / 按钮只用来定位到它所在的区块
    // （preventDefault 不会拦掉 onclick，PDF 弹窗仍能正常打开）
    if (t.closest('a, button, label')) e.preventDefault();
    parent.postMessage({ type: 'preview:select-block', uid: el.getAttribute('data-block-uid') }, '*');
  });
})();
`

// 完整 HTML 文档（用于 iframe 预览）
export function generatePreviewDoc(doc) {
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
  .preview-wrap { max-width: 900px; margin: 0 auto; }
${HIGHLIGHT_CSS}</style>
<style>
${ARTICLE_CSS}</style>
</head>
<body>
<div class="preview-wrap">
${generateHtml(doc, { preview: true, skipTailwind: true })}
</div>
${hasModal ? `<script>${MODAL_SHIM_JS}<\/script>` : ''}
<script>${HIGHLIGHT_JS}<\/script>
<script>${SELECT_JS}<\/script>
</body>
</html>`
}
