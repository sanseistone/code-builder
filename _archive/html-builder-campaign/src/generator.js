// ============================================================
// 数据模型 → HTML 源码生成器
// 输出结构与 type-01 ~ type-04 保持一致
// ============================================================

// HTML 转义（文本内容插入源码时防止破坏结构）
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const OUTER =
  '<div class="overflow-hidden rounded-lg border border-red-200 bg-white shadow-xl px-4" style="margin: -20px;">'

// 蓝色说明文字
function renderNote(note, indent) {
  const lines = (note.lines || []).filter((l) => String(l).trim() !== '')
  if (!lines.length) return []
  const pad = ' '.repeat(indent)
  const cls = note.bold
    ? 'mt-2 mb-1 text-xs font-bold text-blue-600'
    : 'mt-2 mb-1 text-xs text-blue-600'
  const content = lines.map(esc).join(`<br>\n${pad}    `)
  return [
    `${pad}<p class="${cls}">`,
    `${pad}    ${content}`,
    `${pad}</p>`,
  ]
}

// 胶囊标签组
function renderTags(tags, indent) {
  const items = (tags.items || []).filter((t) => String(t).trim() !== '')
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [`${pad}<div class="flex flex-wrap gap-2 mb-1">`]
  for (const item of items) {
    out.push(
      `${pad}    <span class="rounded-full border border-gray-200 bg-gray-50 px-4 lg:py-1.5 text-xs">`,
      `${pad}        ${esc(item)}`,
      `${pad}    </span>`
    )
  }
  out.push(`${pad}</div>`)
  return out
}

// 价格列表
function renderList(list, indent) {
  const items = (list.items || []).filter(
    (i) => String(i.name).trim() !== '' || String(i.price).trim() !== '' || String(i.note).trim() !== ''
  )
  if (!items.length) return []
  const pad = ' '.repeat(indent)
  const out = [`${pad}<ul class="space-y-2 text-sm mb-1">`]
  for (const item of items) {
    const noteCls =
      item.noteColor === 'red'
        ? 'text-red-500 font-bold text-xs'
        : 'text-gray-500 text-xs'
    out.push(`${pad}    <li>`)
    out.push(`${pad}        ・${esc(item.name)}`)
    if (String(item.price).trim()) {
      out.push(`${pad}        <strong class="text-red-500 font-bold">${esc(item.price)}</strong>`)
    }
    if (String(item.note).trim()) {
      out.push(`${pad}        <span class="${noteCls}">${esc(item.note)}</span>`)
    }
    out.push(`${pad}    </li>`)
  }
  out.push(`${pad}</ul>`)
  return out
}

// section 内子模块渲染
function renderChildren(children, indent) {
  const out = []
  for (const child of children || []) {
    if (child.type === 'note') out.push(...renderNote(child, indent))
    else if (child.type === 'tags') out.push(...renderTags(child, indent))
    else if (child.type === 'list') out.push(...renderList(child, indent))
  }
  return out
}

// 序号小标题块
function renderSection(section, indent, numberIndex) {
  const pad = ' '.repeat(indent)
  const titleCls = section.link
    ? 'text-base font-bold underline transition'
    : 'text-base font-bold transition'

  const hasChildren = renderChildren(section.children, indent + 8).length > 0
  const headMb = hasChildren ? 'mb-4' : 'mb-1'

  const out = [
    `${pad}<!-- Campaign Item -->`,
    `${pad}<div class="py-1 border-b border-dashed border-gray-300">`,
    `${pad}    <div class="flex items-center gap-3 ${headMb}">`,
  ]
  if (section.showNumber) {
    out.push(
      `${pad}        <span class="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">${numberIndex}</span>`
    )
  }
  if (section.link) {
    out.push(
      `${pad}        <a class="${titleCls}" href="${esc(section.link)}">${esc(section.title)}`,
      `${pad}        </a>`
    )
  } else {
    out.push(`${pad}        <p class="${titleCls}">${esc(section.title)}</p>`)
  }
  if (String(section.discount).trim()) {
    out.push(
      `${pad}        <span class="rounded-full bg-red-500 px-2 py-1 text-sm font-bold text-white">${esc(section.discount)}</span>`
    )
  }
  out.push(`${pad}    </div>`)
  out.push(...renderChildren(section.children, indent + 8))
  out.push(`${pad}</div>`)
  return out
}

// 日期区
function renderDate(date, indent) {
  if (!date || !String(date.text).trim()) return []
  const pad = ' '.repeat(indent)
  return [
    `${pad}<!-- Date -->`,
    `${pad}<div class="flex items-center gap-2 mt-3 py-3">`,
    `${pad}    <span class="text-xs pr-4">📅</span>`,
    `${pad}    <strong class="text-xs text-orange-500">${esc(date.text)}</strong>`,
    `${pad}</div>`,
  ]
}

// 主入口：配置对象 → 完整 HTML 片段
export function generateHtml(config) {
  const out = [OUTER]

  // Header（必选，第一行）
  out.push('    <!-- Header -->')
  out.push('    <div class="flex items-center gap-3 py-1 border-b border-gray-300">')
  out.push(`        <span class="text-3xl">${esc(config.header.icon || '🎉')}</span>`)
  out.push(`        <p class="text-xl font-bold text-red-500">${esc(config.header.title)}</p>`)
  out.push('    </div>')

  // 主体区（note / section 混合）
  out.push('    <!-- Campaign List -->')
  out.push('    <div class="space-y-3 mx-2">')
  let numberIndex = 0
  for (const block of config.blocks || []) {
    if (block.type === 'note') {
      out.push(...renderNote(block, 8))
    } else if (block.type === 'section') {
      numberIndex += block.showNumber ? 1 : 0
      out.push(...renderSection(block, 8, numberIndex))
    }
  }
  out.push('    </div>')

  // 尾部（日期）
  out.push(...renderDate(config.date, 4))

  out.push('</div>')
  return out.join('\n')
}

// 完整 HTML 文档（用于 iframe 预览）
export function generatePreviewDoc(config) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>プレビュー</title>
<style>
  body { margin: 0; padding: 28px; background: #f3f4f6; font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', system-ui, sans-serif; }
  .preview-wrap { max-width: 720px; margin: 0 auto; }
</style>
<script src="vendor/tailwindcss.browser.js"></script>
</head>
<body>
<div class="preview-wrap">
${generateHtml(config)}
</div>
</body>
</html>`
}
