import { describe, it, expect } from 'vitest'
import { makeTemplate } from '../src/tools/blog/templates.js'
import { generateHtml, generatePreviewDoc, inline } from '../src/tools/blog/generator.js'
import {
  createDoc,
  createSection,
  createSubheading,
  createParagraph,
  createImage,
  createVideo,
  createList,
  createQuote,
  createProducts,
  createBadge,
  createModal,
  createCta,
  collectSections,
  nextSectionId,
  nextModalId,
} from '../src/tools/blog/types.js'
import { normalizeDoc } from '../src/tools/blog/doc.js'

// 构造包含全部 8 种区块的文档
function fullDoc(over = {}) {
  return createDoc({
    title: 'test',
    toc: { enabled: true, title: '目次', mode: 'auto', items: [] },
    blocks: [
      createImage({ src: 'https://x.test/a.webp', alt: 'alt text', width: '1400', height: '855', banner: true }),
      createParagraph({ text: '導入文 **太字** __下線__ ==ハイライト== [リンク](https://x.test)' }),
      createSection({
        id: 'item1',
        level: 2,
        title: '章タイトル',
        children: [
          createParagraph({ text: '段落1\n段落2' }),
          createSubheading({ text: '小見出し' }),
          createList({ ordered: false, items: [{ text: 'A' }, { text: 'B\nB2' }] }),
          createList({ ordered: true, items: [{ text: '1st' }] }),
          createQuote({ text: '引用テキスト' }),
          createProducts({
            items: [
              {
                href: 'https://x.test/p',
                img: 'https://x.test/i.webp',
                alt: '商品',
                title: '商品名',
                price: '15,000 円(税込)',
                width: '600',
                height: '900',
              },
            ],
          }),
          createBadge({ items: [{ text: 'タグ1' }, { text: 'タグ2' }] }),
          createImage({ src: 'https://x.test/b.webp', alt: 'b', link: 'https://x.test/l' }),
        ],
      }),
      createSection({ id: 'item2', level: 3, inToc: false, showBackToToc: false, title: 'H3章', children: [] }),
    ],
    ...over,
  })
}

describe('结构输出', () => {
  const html = generateHtml(fullDoc())

  it('恒内联一份普通 CSS：自包含、零依赖，粘到任何页面都生效', () => {
    const out = generateHtml(createDoc({ title: 't' }))
    expect(out).toContain('<style>')
    // 手写普通 CSS（.article-* 语义类），不是编译产物，也不需要外部文件 / 执行 JS
    expect(out).not.toContain('<link')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('@layer')
    expect(out).not.toContain('@import')
    // 只有带命名空间的类规则：没有 Tailwind preflight 那种全局元素重置，
    // 粘进页面不会波及其它区域
    expect(out).not.toContain('*,:before,:after')
    expect(out).not.toContain('.text-stone-700')
    expect(out).toContain('.article-container {')
    expect(out).toContain('.article-text {')
  })

  it('预览专用参数可跳过正文的 <style>（预览文档已在 <head> 引入）', () => {
    const out = generateHtml(createDoc({ title: 't' }), { skipStyle: true })
    expect(out).not.toContain('<style>')
    expect(out).toContain('<div class="article-container">')
  })

  it('容器与尾部注释与 demo.html 一致', () => {
    expect(html).toContain('<div class="article-container">')
    expect(html).toContain('<!-- スムーズスクロール＋目次からのジャンプ（htmlのidに対応） -->')
  })

  it('目次只收录 inToc 的章节', () => {
    expect(html).toContain('data-target="item1"')
    expect(html).not.toContain('data-target="item2"')
  })

  it('头图与非头图两种图片形态', () => {
    expect(html).toContain('<div class="article-banner"><img class="article-img" src="https://x.test/a.webp" alt="alt text" width="1400" height="855">')
    expect(html).toContain('<a class="article-image-link" href="https://x.test/l"><img class="article-img" src="https://x.test/b.webp"')
  })

  it('章节标题级别与返回目次', () => {
    expect(html).toContain('<h2 class="article-h2">章タイトル</h2>')
    expect(html).toContain('<h3 class="article-h3">H3章</h3>')
    expect(html).toContain('data-target="list-title">↑ 目次へ')
  })

  it('showBackToToc=false 的章节不输出返回目次', () => {
    const seg = html.slice(html.indexOf('id="item2"'))
    expect(seg).not.toContain('目次へ')
  })

  it('独立子标题渲染为 article-subhead + h3', () => {
    expect(html).toContain('<div class="article-subhead section-head">')
    expect(html).toContain('<h3 class="article-h3">小見出し</h3>')
  })

  it('子标题可切换输出标签，白名单外的值回落 h3', () => {
    const out = generateHtml(
      createDoc({
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [
          createSubheading({ text: 'A' }),
          createSubheading({ text: 'B', tag: 'h2' }),
          createSubheading({ text: 'C', tag: 'h4' }),
          createSubheading({ text: 'D', tag: 'p' }),
          createSubheading({ text: 'E', tag: 'script' }),
        ],
      })
    )
    expect(out).toContain('<h3 class="article-h3">A</h3>')
    expect(out).toContain('<h2 class="article-h2">B</h2>')
    expect(out).toContain('<h4 class="article-h4">C</h4>')
    expect(out).toContain('<p class="article-text">D</p>')
    // 非法标签回落 h3，不会把用户数据当标签输出
    expect(out).toContain('<h3 class="article-h3">E</h3>')
    expect(out).not.toContain('<script')
  })

  it('列表、引用框、商品网格、标签', () => {
    expect(html).toContain('<ul class="article-list">')
    expect(html).toContain('<li>A</li>')
    expect(html).toContain('<ol class="article-list">')
    expect(html).toContain('<div class="article-quote insight-box">')
    expect(html).toContain('class="article-products-grid"')
    expect(html).toContain('<div class="article-products-price">15,000 円(税込)</div>')
    expect(html).toContain('<span class="article-badge-item badge-light">')
  })

  it('空内容区块被跳过，不产生空标签', () => {
    const empty = createDoc({
        toc: { enabled: false, mode: 'auto', items: [] },
      blocks: [createParagraph({ text: '   ' }), createList({ items: [{ text: '' }] }), createQuote({ text: '' })],
    })
    const out = generateHtml(empty)
    expect(out).not.toContain('<p>')
    expect(out).not.toContain('<ul')
    expect(out).not.toContain('insight-box')
  })
})

describe('行内标记与安全', () => {
  it('粗体 / 下划线 / 高亮 / 链接', () => {
    expect(inline('**太字**')).toBe('<strong>太字</strong>')
    expect(inline('__下線__')).toBe('<span class="article-mark-underline">下線</span>')
    expect(inline('==強調==')).toBe(
      '<span class="article-mark-highlight">強調</span>'
    )
    expect(inline('[リンク](https://x.test)')).toBe(
      '<a class="article-link" title="リンク" href="https://x.test">リンク</a>'
    )
  })

  it('链接文字内部支持嵌套标记', () => {
    expect(inline('[**太字リンク**](https://x.test)')).toBe(
      '<a class="article-link" title="太字リンク" href="https://x.test"><strong>太字リンク</strong></a>'
    )
  })

  it('HTML 转义，防止注入', () => {
    expect(inline('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(inline('a & b')).toBe('a &amp; b')
  })

  it('拦截 javascript: 等危险协议', () => {
    expect(inline('[x](javascript:alert(1))')).toContain('href="#"')
    expect(inline('[x](data:text/html,<script>)')).toContain('href="#"')
    expect(inline('[x](/safe/path)')).toContain('href="/safe/path"')
  })
})

describe('内置模板', () => {
  it('demo 模板可生成，且目次含 7 项', () => {
    const doc = makeTemplate('kuma-disposal')
    const html = generateHtml(doc)
    expect(collectSections(doc.blocks).length).toBe(7)
    expect(html).toContain('data-target="item7"')
    expect(html).toContain('ラブドール代理店の「里帰り」サービス利用')
  })

  it('内置模板的头图统一使用 1600x800 占位图', () => {
    for (const id of ['blank', 'kuma-disposal', 'kuma-ironai']) {
      const banner = makeTemplate(id).blocks.find((b) => b.type === 'image' && b.banner)
      expect(banner.src).toBe('https://fpoimg.com/1600x800')
      expect(banner.width).toBe('1600')
      expect(banner.height).toBe('800')
    }
  })

  it('图片类名全部 article- 前缀，样式由内联 CSS 负责', () => {
    const out = generateHtml(fullDoc())
    expect(out).toContain('class="article-banner"')
    expect(out).toContain('class="article-image"')
    // 图片为块级并铺满容器，避免与紧跟的文字贴在一起（样式由 .article-img 提供）
    expect(out).toContain('<img class="article-img"')
    expect(out).toContain('<div class="article-image">')
  })

  it('内置模板改用 bold 开关，标题文字里不再写 **…**', () => {
    const sections = collectSections(makeTemplate('kuma-ironai').blocks)
    for (const s of sections) expect(s.title).not.toContain('**')
    // demo-01 的章节原本全部加粗，迁移后应当全部勾上
    expect(sections.length).toBe(10)
    expect(sections.every((s) => s.bold)).toBe(true)
  })

  it('章节标题与目次均由 bold 开关控制加粗', () => {
    const out = generateHtml(
      createDoc({
        toc: { enabled: true, title: '目次', mode: 'auto', items: [] },
        blocks: [
          createSection({ id: 'item1', title: '太字見出し', bold: true, children: [] }),
          createSection({ id: 'item2', title: '通常見出し', children: [] }),
        ],
      })
    )
    expect(out).toContain('<h2 class="article-h2"><strong>太字見出し</strong></h2>')
    expect(out).toContain('<h2 class="article-h2">通常見出し</h2>')
    // 目次跟随章节的加粗设置
    expect(out).toContain('data-target="item1"><strong>太字見出し</strong></p>')
    expect(out).toContain('data-target="item2">通常見出し</p>')
  })

  it('section 标签闭合、id 不重复', () => {
    const html = generateHtml(makeTemplate('kuma-disposal'))
    const open = (html.match(/<section /g) || []).length
    const close = (html.match(/<\/section>/g) || []).length
    expect(open).toBe(close)
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('新增区块：视频 / PDF 弹窗 / CTA 按钮', () => {
  const doc = createDoc({
    toc: { enabled: false, mode: 'auto', items: [] },
    blocks: [
      createSection({
        id: 'item1',
        title: '章',
        children: [
          createVideo({ src: 'https://x.test/a.mp4', mime: 'video/mp4' }),
          createImage({ src: 'https://x.test/p.webp', alt: 'p', width: '1000', height: '750', wrapP: true }),
          createModal({
            modalId: 'pdfModal',
            btnText: '取扱説明書（PDF）',
            title: 'タイトル',
            src: 'https://x.test/doc.pdf',
            size: 'modal-xl',
          }),
        ],
      }),
      createCta({ text: '商品一覧を見る', href: 'https://x.test/cat.html' }),
    ],
  })
  const html = generateHtml(doc)

  it('视频输出 <p><video controls><source></video></p>（demo-01 写法）', () => {
    expect(html).toContain('<p class="article-media"><video class="article-video" controls="controls">')
    expect(html).toContain('<source src="https://x.test/a.mp4" type="video/mp4">')
    expect(html).toContain('</video></p>')
  })

  it('视频可选 poster / 宽高，wrapP=false 时不包 <p>', () => {
    const out = generateHtml(
      createDoc({
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createVideo({ src: 'https://x.test/b.mp4', poster: 'https://x.test/poster.webp', width: '640', wrapP: false })],
      })
    )
    expect(out).toContain('<video class="article-video" controls="controls" poster="https://x.test/poster.webp" width="640">')
    expect(out).not.toContain('<p><video')
  })

  it('空视频地址不产生标签', () => {
    const out = generateHtml(
      createDoc({
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createVideo({ src: '   ' })],
      })
    )
    expect(out).not.toContain('<video')
  })

  it('图片段落包裹模式输出 <p><img …></p>', () => {
    const body = html.slice(html.indexOf('</style>')) // 样式块在正文前，断言只看正文
    expect(body).toContain('<p class="article-media"><img class="article-img" src="https://x.test/p.webp" alt="p" width="1000" height="750"></p>')
    expect(body).not.toContain('article-image')
  })

  it('PDF 弹窗结构完整，按钮调用 showModalById', () => {
    expect(html).toContain(`<button class="article-modal-trigger" type="button" onclick="showModalById('pdfModal')">取扱説明書（PDF）</button>`)
    expect(html).toContain('id="pdfModal" class="modal fade"')
    expect(html).toContain('class="modal-dialog modal-xl modal-dialog-centered"')
    expect(html).toContain('<iframe class="article-modal-pdf pdf-preview" src="https://x.test/doc.pdf" data-src="https://x.test/doc.pdf">')
    // 弹窗触发按钮不再依赖 Bootstrap 的 btn/btn-primary（视觉由内联样式提供）
    expect(html).not.toContain('btn btn-primary')
    // aria-labelledby 与标题 id 必须一致（demo-01 原文此处不一致，生成器已修正）
    expect(html).toContain('aria-labelledby="pdfModalLabel"')
    expect(html).toContain('id="pdfModalLabel"')
  })

  it('CTA 按钮输出 <p><a class="article-cta cta-btn" …></a></p>', () => {
    expect(html).toContain('<p class="article-media"><a class="article-cta cta-btn" href="https://x.test/cat.html">商品一覧を見る</a></p>')
  })

  it('CTA 危险协议被拦截、文字支持行内标记', () => {
    const out = generateHtml(
      createDoc({
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createCta({ text: '**今すぐ**', href: 'javascript:alert(1)' })],
      })
    )
    expect(out).toContain('<a class="article-cta cta-btn"')
    expect(out).toContain('href="#"><strong>今すぐ</strong></a>')
  })

  it('CTA 视觉由 .article-cta 提供，className 只是站点钩子、不再承担样式', () => {
    // 样式规则只认 .article-cta（在 article-style.js 里手写）
    expect(html).toContain('<a class="article-cta cta-btn"')
    expect(html).not.toContain('.cta-btn {')
  })

  it('预览文档注入「点击区块回传 uid」的脚本', () => {
    const doc = generatePreviewDoc(fullDoc(), { preview: true })
    expect(doc).toContain('preview:select-block')
    expect(doc).toContain("closest('[data-block-uid]')")
    // 产出代码里不能出现这些预览用的脚本
    expect(generateHtml(fullDoc())).not.toContain('preview:select-block')
  })

  it('预览文档在含弹窗时注入 showModalById 补齐实现', () => {
    const withModal = generatePreviewDoc(doc)
    expect(withModal).toContain('window.showModalById')
    const plain = generatePreviewDoc(
      createDoc({ toc: { enabled: false, mode: 'auto', items: [] }, blocks: [createParagraph({ text: 'x' })] })
    )
    expect(plain).not.toContain('window.showModalById')
  })
})

describe('旧存档迁移', () => {
  it('标题里的 **…** 自动迁移为 bold 开关', () => {
    const doc = normalizeDoc({
      blocks: [
        { type: 'section', id: 'item1', title: '**太字見出し**', children: [] },
        { type: 'section', id: 'item2', title: '通常見出し', children: [] },
      ],
    })
    expect(doc.blocks[0].title).toBe('太字見出し')
    expect(doc.blocks[0].bold).toBe(true)
    expect(doc.blocks[1].title).toBe('通常見出し')
    expect(doc.blocks[1].bold).toBe(false)
  })
})

describe('工具函数', () => {
  it('nextSectionId 跳过已占用的 id', () => {
    const blocks = [createSection({ id: 'item1' }), createSection({ id: 'item2' })]
    expect(nextSectionId(blocks)).toBe('item3')
  })

  it('nextModalId 保证同页多个弹窗 id 不冲突', () => {
    expect(nextModalId([])).toBe('pdfModal')
    expect(nextModalId([createModal({ modalId: 'pdfModal' })])).toBe('pdfModal2')
    // 嵌套在章节内也能被扫到
    expect(nextModalId([createSection({ id: 'item1', children: [createModal({ modalId: 'pdfModal' })] })])).toBe('pdfModal2')
  })
})

describe('demo-01 内置模板', () => {
  const doc = makeTemplate('kuma-ironai')
  const html = generateHtml(doc)

  it('目次含 10 项，章节 id 连续', () => {
    expect(collectSections(doc.blocks).length).toBe(10)
    for (let i = 1; i <= 10; i++) expect(html).toContain(`data-target="item${i}"`)
  })

  it('同时包含视频、PDF 弹窗、CTA 三种新元素', () => {
    expect(html).toContain('<source src="https://www.kuma-doll.com/video/cup/2026/09/01/6a96706677cf1.mp4" type="video/mp4">')
    expect(html).toContain("showModalById('pdfModal')")
    expect(html).toContain('<a class="article-cta cta-btn" href="https://www.kuma-doll.com/Category-c45553.html">')
  })

  it('section 闭合、章节 id 与弹窗 id 均唯一', () => {
    const open = (html.match(/<section /g) || []).length
    const close = (html.match(/<\/section>/g) || []).length
    expect(open).toBe(close)
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
    const modals = [...html.matchAll(/<div id="(pdfModal\d*)" class="modal/g)].map((m) => m[1])
    expect(new Set(modals).size).toBe(modals.length)
  })
})
