import { describe, it, expect } from 'vitest'
import { makeTemplate } from '../src/templates.js'
import { generateHtml, generatePreviewDoc, inline } from '../src/generator.js'
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
} from '../src/types.js'

// 构造包含全部 8 种区块的文档
function fullDoc(over = {}) {
  return createDoc({
    title: 'test',
    includeStyle: false,
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

  it('includeStyle=false 时不输出 style 块', () => {
    expect(html).not.toContain('<style>')
    expect(generateHtml(fullDoc({ includeStyle: true }))).toContain('<style>')
  })

  it('容器与尾部注释与 demo.html 一致', () => {
    expect(html).toContain('<div class="container">')
    expect(html).toContain('<!-- スムーズスクロール＋目次からのジャンプ（htmlのidに対応） -->')
  })

  it('目次只收录 inToc 的章节', () => {
    expect(html).toContain('data-target="item1"')
    expect(html).not.toContain('data-target="item2"')
  })

  it('头图与非头图两种图片形态', () => {
    expect(html).toContain('<div class="article-banner"><img src="https://x.test/a.webp" alt="alt text" width="1400" height="855">')
    expect(html).toContain('<a href="https://x.test/l"><img src="https://x.test/b.webp"')
  })

  it('章节标题级别与返回目次', () => {
    expect(html).toContain('<h2>章タイトル</h2>')
    expect(html).toContain('<h3>H3章</h3>')
    expect(html).toContain('data-target="list-title">↑ 目次へ')
  })

  it('showBackToToc=false 的章节不输出返回目次', () => {
    const seg = html.slice(html.indexOf('id="item2"'))
    expect(seg).not.toContain('目次へ')
  })

  it('独立子标题渲染为 section-head + h3', () => {
    expect(html).toContain('<div class="section-head">\n            <h3>小見出し</h3>')
  })

  it('列表、引用框、商品网格、标签', () => {
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>A</li>')
    expect(html).toContain('<ol>')
    expect(html).toContain('<div class="insight-box">')
    expect(html).toContain('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')
    expect(html).toContain('<div class="price">15,000 円(税込)</div>')
    expect(html).toContain('<span class="badge-light">タグ1</span>')
  })

  it('空内容区块被跳过，不产生空标签', () => {
    const empty = createDoc({
      includeStyle: false,
      toc: { enabled: false, mode: 'auto', items: [] },
      blocks: [createParagraph({ text: '   ' }), createList({ items: [{ text: '' }] }), createQuote({ text: '' })],
    })
    const out = generateHtml(empty)
    expect(out).not.toContain('<p>')
    expect(out).not.toContain('<ul>')
    expect(out).not.toContain('insight-box')
  })
})

describe('行内标记与安全', () => {
  it('粗体 / 下划线 / 高亮 / 链接', () => {
    expect(inline('**太字**')).toBe('<strong>太字</strong>')
    expect(inline('__下線__')).toBe('<span style="text-decoration: underline;">下線</span>')
    expect(inline('==強調==')).toBe('<span class="highlight">強調</span>')
    expect(inline('[リンク](https://x.test)')).toBe('<a title="リンク" href="https://x.test">リンク</a>')
  })

  it('链接文字内部支持嵌套标记', () => {
    expect(inline('[**太字リンク**](https://x.test)')).toBe(
      '<a title="太字リンク" href="https://x.test"><strong>太字リンク</strong></a>'
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
    includeStyle: true,
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
    expect(html).toContain('<p><video controls="controls">')
    expect(html).toContain('<source src="https://x.test/a.mp4" type="video/mp4">')
    expect(html).toContain('</video></p>')
  })

  it('视频可选 poster / 宽高，wrapP=false 时不包 <p>', () => {
    const out = generateHtml(
      createDoc({
        includeStyle: false,
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createVideo({ src: 'https://x.test/b.mp4', poster: 'https://x.test/poster.webp', width: '640', wrapP: false })],
      })
    )
    expect(out).toContain('<video controls="controls" poster="https://x.test/poster.webp" width="640">')
    expect(out).not.toContain('<p><video')
  })

  it('空视频地址不产生标签', () => {
    const out = generateHtml(
      createDoc({
        includeStyle: false,
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createVideo({ src: '   ' })],
      })
    )
    expect(out).not.toContain('<video')
  })

  it('图片段落包裹模式输出 <p><img …></p>', () => {
    expect(html).toContain('<p><img src="https://x.test/p.webp" alt="p" width="1000" height="750"></p>')
    expect(html).not.toContain('article-image')
  })

  it('PDF 弹窗结构完整，按钮调用 showModalById', () => {
    expect(html).toContain(`<button class="btn btn-primary" onclick="showModalById('pdfModal')">取扱説明書（PDF）</button>`)
    expect(html).toContain('id="pdfModal" class="modal fade"')
    expect(html).toContain('class="modal-dialog modal-xl modal-dialog-centered"')
    expect(html).toContain('<iframe class="pdf-preview aspect-square w-full" src="https://x.test/doc.pdf" data-src="https://x.test/doc.pdf">')
    // aria-labelledby 与标题 id 必须一致（demo-01 原文此处不一致，生成器已修正）
    expect(html).toContain('aria-labelledby="pdfModalLabel"')
    expect(html).toContain('id="pdfModalLabel"')
  })

  it('CTA 按钮输出 <p><a class="cta-btn" …></a></p>', () => {
    expect(html).toContain('<p><a class="cta-btn" href="https://x.test/cat.html">商品一覧を見る</a></p>')
  })

  it('CTA 危险协议被拦截、文字支持行内标记', () => {
    const out = generateHtml(
      createDoc({
        includeStyle: false,
        toc: { enabled: false, mode: 'auto', items: [] },
        blocks: [createCta({ text: '**今すぐ**', href: 'javascript:alert(1)' })],
      })
    )
    expect(out).toContain('<a class="cta-btn" href="#"><strong>今すぐ</strong></a>')
  })

  it('样式块包含 cta-btn 定义', () => {
    expect(html).toContain('.cta-btn {')
    expect(html).toContain('.cta-btn:hover')
  })

  it('预览文档在含弹窗时注入 showModalById 补齐实现', () => {
    const withModal = generatePreviewDoc(doc)
    expect(withModal).toContain('window.showModalById')
    const plain = generatePreviewDoc(
      createDoc({ includeStyle: false, toc: { enabled: false, mode: 'auto', items: [] }, blocks: [createParagraph({ text: 'x' })] })
    )
    expect(plain).not.toContain('window.showModalById')
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
    expect(html).toContain('<a class="cta-btn" href="https://www.kuma-doll.com/Category-c45553.html">')
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
