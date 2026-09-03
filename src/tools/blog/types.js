// ============================================================
// 文章数据模型：区块类型定义与工厂函数
//
// 文档结构 doc = {
//   title           文章标题（仅用于编辑器识别，不输出）
//   includeStyle    是否输出 <style> 样式块
//   toc             { enabled, title, mode: auto|manual, items: [{id,text}] }
//   blocks          [ 顶层区块 ]
// }
//
// 区块（可拖拽排序，两级嵌套）：
//   section    章节容器 H2/H3，内部 children 可再放任意非 section 区块
//   subheading 独立子标题 H3
//   paragraph  正文段落（支持 **粗体** __下划线__ ==高亮__ [文字](链接)）
//   image      图片（可切换头图 article-banner 模式 / 段落内包裹）
//   list       列表（有序 / 无序）
//   quote      引用框 .insight-box
//   products   商品卡片网格
//   badge      标签组 .badge-light
//   video      视频 <video controls><source>
//   cta        行动按钮 <a class="cta-btn">
//   modal      PDF 弹窗（Bootstrap modal + showModalById 触发）
// ============================================================

// 各区块的展示元信息：name = 中文名，tone = 主题色（tailwind 色板名），container = 是否可嵌套子区块
export const BLOCK_META = {
  section: { name: '章节（H2/H3）', tone: 'rose', container: true },
  subheading: { name: '子标题（H3）', tone: 'orange' },
  paragraph: { name: '正文段落', tone: 'slate' },
  image: { name: '图片 / 头图', tone: 'sky' },
  video: { name: '视频', tone: 'indigo' },
  list: { name: '列表', tone: 'amber' },
  quote: { name: '引用框', tone: 'violet' },
  products: { name: '商品卡片', tone: 'emerald' },
  badge: { name: '标签组', tone: 'teal' },
  modal: { name: 'PDF 弹窗', tone: 'cyan' },
  cta: { name: '行动按钮（CTA）', tone: 'pink' },
}

// 顶层可选区块（含 section）
export const TOP_BLOCK_TYPES = Object.keys(BLOCK_META)

// section 内部可选区块（不含 section，避免无限嵌套）
export const CHILD_BLOCK_TYPES = TOP_BLOCK_TYPES.filter((t) => t !== 'section')

// 每个 tone 对应的 tailwind class（用于区块卡片配色，避免动态拼接 class 被 purge）
export const TONE_CLASS = {
  rose: { chip: 'bg-rose-100 text-rose-600 border-rose-200', bar: 'border-l-rose-400' },
  orange: { chip: 'bg-orange-100 text-orange-600 border-orange-200', bar: 'border-l-orange-400' },
  slate: { chip: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'border-l-slate-400' },
  sky: { chip: 'bg-sky-100 text-sky-600 border-sky-200', bar: 'border-l-sky-400' },
  amber: { chip: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'border-l-amber-400' },
  violet: { chip: 'bg-violet-100 text-violet-600 border-violet-200', bar: 'border-l-violet-400' },
  emerald: { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'border-l-emerald-400' },
  teal: { chip: 'bg-teal-100 text-teal-600 border-teal-200', bar: 'border-l-teal-400' },
  indigo: { chip: 'bg-indigo-100 text-indigo-600 border-indigo-200', bar: 'border-l-indigo-400' },
  cyan: { chip: 'bg-cyan-100 text-cyan-600 border-cyan-200', bar: 'border-l-cyan-400' },
  pink: { chip: 'bg-pink-100 text-pink-600 border-pink-200', bar: 'border-l-pink-400' },
}

// ---------- 工厂函数 ----------

// uid 由共享层提供（全站统一计数器）
// 先 import 进本模块作用域（工厂函数要用），再导出以保持原有引用方式
import { uid } from '@shared'
export { uid }

export function createSection(over = {}) {
  return {
    type: 'section',
    uid: uid('sec'),
    id: 'item1', // 目次锚点 id
    level: 2, // 2 → <h2>；3 → <h3>
    title: '',
    showBackToToc: true, // 是否显示「↑ 目次へ」
    inToc: true, // 是否进入目次列表
    children: [],
    ...over,
  }
}

export function createSubheading(over = {}) {
  return { type: 'subheading', uid: uid('sub'), text: '', ...over }
}

export function createParagraph(over = {}) {
  return { type: 'paragraph', uid: uid('p'), text: '', ...over }
}

export function createImage(over = {}) {
  return {
    type: 'image',
    uid: uid('img'),
    src: '',
    alt: '',
    width: '',
    height: '',
    banner: false, // true → 外层包 <div class="article-banner">
    wrapP: false, // true → 包在 <p> 内（demo-01 中正文图片的写法）
    link: '', // 可选，填写后图片包 <a>
    ...over,
  }
}

export function createVideo(over = {}) {
  return {
    type: 'video',
    uid: uid('vid'),
    src: '',
    mime: 'video/mp4',
    poster: '', // 可选封面图
    width: '',
    height: '',
    wrapP: true, // demo-01 写法：<p><video ...></video></p>
    ...over,
  }
}

export function createCta(over = {}) {
  return {
    type: 'cta',
    uid: uid('cta'),
    text: '',
    href: '',
    className: 'cta-btn', // 站点自定义样式类
    wrapP: true,
    ...over,
  }
}

export function createModal(over = {}) {
  return {
    type: 'modal',
    uid: uid('mdl'),
    modalId: 'pdfModal', // 弹窗 DOM id，同时作为 showModalById 的参数
    btnText: '', // 触发按钮文字
    btnClass: 'btn btn-primary',
    title: '', // 弹窗标题
    src: '', // PDF / iframe 地址
    size: 'modal-xl', // modal-sm / modal-lg / modal-xl
    ...over,
  }
}

export function createListItem(item = {}) {
  return { text: item.text || '' }
}

export function createList(over = {}) {
  return {
    type: 'list',
    uid: uid('list'),
    ordered: false, // true → <ol>
    items: over.items ? over.items.map(createListItem) : [createListItem()],
    ...over,
  }
}

export function createQuote(over = {}) {
  return { type: 'quote', uid: uid('q'), text: '', ...over }
}

export function createProductItem(item = {}) {
  return {
    href: item.href || '',
    img: item.img || '',
    alt: item.alt || '',
    title: item.title || '',
    price: item.price || '',
    width: item.width || '600',
    height: item.height || '900',
  }
}

export function createProducts(over = {}) {
  return {
    type: 'products',
    uid: uid('prd'),
    items: over.items ? over.items.map(createProductItem) : [createProductItem()],
    ...over,
  }
}

export function createBadge(over = {}) {
  return {
    type: 'badge',
    uid: uid('tag'),
    items: over.items ? over.items.map((t) => ({ text: t.text || t })) : [{ text: '' }],
    ...over,
  }
}

// 按类型创建空区块
export function createBlock(type) {
  switch (type) {
    case 'section':
      return createSection()
    case 'subheading':
      return createSubheading()
    case 'paragraph':
      return createParagraph()
    case 'image':
      return createImage()
    case 'video':
      return createVideo()
    case 'list':
      return createList()
    case 'quote':
      return createQuote()
    case 'products':
      return createProducts()
    case 'badge':
      return createBadge()
    case 'modal':
      return createModal()
    case 'cta':
      return createCta()
    default:
      return null
  }
}

// ---------- 文档级 ----------

export function createDoc(over = {}) {
  return {
    title: '新規記事',
    includeStyle: true,
    toc: {
      enabled: true,
      title: '目次',
      mode: 'auto', // auto: 跟随章节自动生成；manual: 手动维护 items
      items: [],
    },
    blocks: [],
    ...over,
  }
}

// 收集文档中所有参与目次的章节（按出现顺序）
export function collectSections(blocks) {
  const out = []
  for (const b of blocks || []) {
    if (b.type === 'section' && b.inToc && b.id) out.push(b)
  }
  return out
}

// 生成下一个可用的章节锚点 id（item1 / item2 / ...）
export function nextSectionId(blocks) {
  const used = new Set()
  const walk = (list) => {
    for (const b of list || []) {
      if (b.id) used.add(b.id)
      if (b.children) walk(b.children)
    }
  }
  walk(blocks)
  let n = 1
  while (used.has(`item${n}`)) n += 1
  return `item${n}`
}

// 生成下一个可用的弹窗 id（pdfModal / pdfModal2 / ...），避免同页多个弹窗冲突
export function nextModalId(blocks) {
  const used = new Set()
  const walk = (list) => {
    for (const b of list || []) {
      if (b.type === 'modal' && b.modalId) used.add(b.modalId)
      if (b.children) walk(b.children)
    }
  }
  walk(blocks)
  if (!used.has('pdfModal')) return 'pdfModal'
  let n = 2
  while (used.has(`pdfModal${n}`)) n += 1
  return `pdfModal${n}`
}

// 递归遍历全部区块（含章节子区块），用于检测文档中是否存在某类型
export function walkBlocks(blocks, fn) {
  for (const b of blocks || []) {
    fn(b)
    if (b.children) walkBlocks(b.children, fn)
  }
}
