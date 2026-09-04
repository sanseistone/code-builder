import { describe, it, expect, vi, afterEach } from 'vitest'
// 本文件已有一个同名的 nextTick(win) 辅助函数，这里改名避免冲突
import { nextTick as flushDom, onMounted, onBeforeUnmount } from 'vue'
import { mount } from '@vue/test-utils'
import { JSDOM } from 'jsdom'
import { createDoc, createParagraph, createSection, createSubheading } from '../src/tools/blog/types.js'
import { generateHtml, generatePreviewDoc } from '../src/tools/blog/generator.js'
import PreviewPane from '../src/shared/components/PreviewPane.vue'
import BlogApp from '../src/tools/blog/App.vue'

// 「点击左侧编辑 → 右侧预览滚动定位并高亮」的回归护栏。
// 分两层验证：
//   ① 生成器：预览文档带 data-block-uid 标记，而下载出去的代码必须保持干净
//   ② 交互：点击卡片 / 聚焦字段会带上正确的 uid 通知预览面板

function sampleDoc() {
  const doc = createDoc({})
  doc.blocks = [
    createParagraph({ uid: 'p1', text: '第一段' }),
    createSection({
      uid: 'sec1',
      id: 'item1',
      title: '章节标题',
      children: [createParagraph({ uid: 'p2', text: '章节内段落' })],
    }),
    createSubheading({ uid: 'sub1', text: '子标题' }),
  ]
  return doc
}

describe('预览定位标记', () => {
  it('默认输出（下载的代码）不带 data-block-uid', () => {
    const html = generateHtml(sampleDoc())
    expect(html).not.toContain('data-block-uid')
  })

  it('预览模式下每个区块的最外层元素都带上 uid', () => {
    const html = generateHtml(sampleDoc(), { preview: true })
    expect(html).toContain('data-block-uid="p1"')
    expect(html).toContain('data-block-uid="sec1"')
    expect(html).toContain('data-block-uid="p2"')
    expect(html).toContain('data-block-uid="sub1"')
  })

  it('标记落在真实标签上，不会插到章节注释行里', () => {
    const html = generateHtml(sampleDoc(), { preview: true })
    // 章节前有一行 <!-- セクション1 --> 注释，标记必须落在 <section> 上
    expect(html).toMatch(/<section data-block-uid="sec1" id="item1" class="article-section">/)
    expect(html).not.toMatch(/<!--[^>]*data-block-uid/)
  })

  it('预览文档包含定位高亮脚本，并能找到全部区块', () => {
    const doc = generatePreviewDoc(sampleDoc())
    expect(doc).toContain('preview:focus-block')
    expect(doc).toContain('scrollIntoView')
    // 预览走 preview 模式，标记应当存在
    expect(doc).toContain('data-block-uid="p1"')
  })
})

// PreviewPane 的替身：组件内部通过 ref 拿到的是 exposeProxy，用 vi.spyOn 打不到
// defineExpose 出来的方法，因此这里换成记录调用的替身来验证「App → 预览面板」的接线。
function makePreviewStub(calls, active = []) {
  return {
    name: 'PreviewPane',
    props: ['source', 'generatePreviewDoc', 'generateHtml', 'fileName'],
    // 与真实面板保持一致：监听 message，把预览里的点击转成 select-block
    emits: ['toast', 'select-block'],
    setup(props, { emit }) {
      function onMessage(e) {
        const d = e.data
        if (d && d.type === 'preview:select-block' && d.uid) emit('select-block', d.uid)
      }
      onMounted(() => window.addEventListener('message', onMessage))
      onBeforeUnmount(() => window.removeEventListener('message', onMessage))
      return {
        focusBlock: (uid) => calls.push(uid),
        setActiveBlock: (uid) => active.push(uid),
      }
    },
    template: '<div class="pane-stub" />',
  }
}

function mountApp() {
  const calls = [] // 请求预览定位的 uid
  const active = [] // 同步给预览做常驻高亮的 uid
  const wrapper = mount(BlogApp, {
    global: { stubs: { PreviewPane: makePreviewStub(calls, active) } },
  })
  return { wrapper, calls, active }
}

describe('编辑区 → 预览联动', () => {
  it('点击卡片头部会请求预览定位到该区块', async () => {
    const { wrapper, calls } = mountApp()
    const cards = wrapper.findAllComponents({ name: 'BlockCard' })
    expect(cards.length).toBeGreaterThan(0)

    await cards[0].find('header').trigger('click')
    expect(calls).toEqual([cards[0].props('block').uid])
  })

  it('点击卡片头部的操作按钮不会触发定位', async () => {
    const { wrapper, calls } = mountApp()
    const card = wrapper.findAllComponents({ name: 'BlockCard' })[0]

    await card.find('button[title="复制"]').trigger('click')
    expect(calls).toEqual([])
  })

  it('聚焦章节内的子区块，定位与激活的都是子区块而非外层章节', async () => {
    const { wrapper, calls } = mountApp()
    // 取嵌套在章节里的子区块，验证 focusin 冒泡不会把选中态记到父章节上
    const cards = wrapper.findAllComponents({ name: 'BlockCard' })
    const section = cards.find((c) => c.props('block').type === 'section')
    // 用 DOM 包含关系挑出真正嵌在章节里的段落，不依赖渲染顺序
    const nested = cards.filter(
      (c) => c.props('block').type === 'paragraph' && section.element.contains(c.element)
    )
    expect(nested.length).toBeGreaterThan(0)

    const target = nested[0]
    await target.find('textarea, input').trigger('focusin')
    expect(calls).toEqual([target.props('block').uid])
    // 激活态也必须落在子区块上，不能被外层章节抢走
    expect(target.classes()).toContain('ring-blue-400')
    expect(section.classes()).not.toContain('ring-blue-400')
  })

  it('当前编辑的卡片带激活态', async () => {
    const { wrapper } = mountApp()
    const card = wrapper.findAllComponents({ name: 'BlockCard' })[0]
    expect(card.classes()).not.toContain('ring-blue-400')

    await card.find('header').trigger('click')
    expect(card.classes()).toContain('ring-blue-400')
  })

  it('激活态同步给预览，供预览常驻高亮同一区块', async () => {
    const { wrapper, active } = mountApp()
    const card = wrapper.findAllComponents({ name: 'BlockCard' })[0]

    await card.find('header').trigger('click')
    await flushDom()

    expect(active).toEqual([card.props('block').uid])
  })
})

describe('预览 → 编辑区联动', () => {
  // jsdom 没实现 scrollIntoView，这里打桩后验证「点预览 → 左侧滚动 + 高亮」
  afterEach(() => {
    delete Element.prototype.scrollIntoView
  })

  it('点击预览中的区块，左侧滚动到对应卡片并高亮', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll

    const { wrapper } = mountApp()
    const target = wrapper
      .findAllComponents({ name: 'BlockCard' })
      .find((c) => c.props('block').type === 'section')
    expect(target).toBeTruthy()

    window.postMessage({ type: 'preview:select-block', uid: target.props('block').uid }, '*')
    await new Promise((r) => setTimeout(r, 10)) // postMessage 是异步派发的
    await flushDom()

    expect(scroll).toHaveBeenCalled()
    expect(target.classes()).toContain('ring-blue-400') // 常驻激活态
    expect(target.classes()).toContain('bg-blue-50') // 滚动到位后闪一下
  })

  it('uid 找不到卡片时不会报错', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll

    mountApp()
    window.postMessage({ type: 'preview:select-block', uid: 'not-exist' }, '*')
    await new Promise((r) => setTimeout(r, 10))

    expect(scroll).not.toHaveBeenCalled()
  })

  it('装得下的卡片居中滚动', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll

    const { wrapper } = mountApp()
    const target = wrapper
      .findAllComponents({ name: 'BlockCard' })
      .find((c) => c.props('block').type === 'section')

    window.postMessage({ type: 'preview:select-block', uid: target.props('block').uid }, '*')
    await new Promise((r) => setTimeout(r, 10))
    await flushDom()

    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
  })

  it('整章卡片比可视区高时对齐顶部，从章节标题开始看', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll

    const { wrapper } = mountApp()
    const aside = wrapper.find('.app-shell__aside').element
    aside.style.overflowY = 'auto'
    Object.defineProperty(aside, 'clientHeight', { value: 600, configurable: true })
    const scrollTo = vi.fn()
    aside.scrollTo = scrollTo

    const target = wrapper
      .findAllComponents({ name: 'BlockCard' })
      .find((c) => c.props('block').type === 'section')
    // 卡片比可视区高
    Object.defineProperty(target.element, 'offsetHeight', { value: 900, configurable: true })

    window.postMessage({ type: 'preview:select-block', uid: target.props('block').uid }, '*')
    await new Promise((r) => setTimeout(r, 10))
    await flushDom()

    // 走的是容器滚动（顶部对齐），不再用 scrollIntoView 居中
    expect(scroll).not.toHaveBeenCalled()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})

// ------------------------------------------------------------
// 注入到预览文档里的那段脚本，单元测试覆盖不到（它只在真实 iframe 中执行）。
// 这里用 JSDOM 把它原样跑起来，验证语法与定位/滚动/回传逻辑真实可用。
// ------------------------------------------------------------

// 从预览文档里取出真正会进入页面的那段脚本（而不是另抄一份，避免与源码脱节）
function extractHighlightScript() {
  return extractPreviewScript('preview:focus-block')
}

function extractPreviewScript(marker) {
  const doc = generatePreviewDoc(createDoc())
  const blocks = [...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  const script = blocks.find((s) => s.includes(marker))
  expect(script).toBeTruthy()
  return script
}

function runInJsdom(bodyHtml) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body>${bodyHtml}
     <script>${extractHighlightScript()}<\/script></body></html>`,
    { runScripts: 'dangerously', pretendToBeVisual: true }
  )
  const win = dom.window
  // jsdom 不实现 scrollIntoView，用计数器代替
  const scrolled = []
  win.HTMLElement.prototype.scrollIntoView = function (opts) {
    scrolled.push({ uid: this.getAttribute('data-block-uid'), opts })
  }
  return { win, scrolled }
}

function nextTick(win) {
  // postMessage 在 jsdom 中是异步投递的，等一轮宏任务
  return new Promise((resolve) => win.setTimeout(resolve, 20))
}

describe('预览文档内的定位脚本', () => {
  it('收到定位消息后滚动到目标区块并加上高亮类', async () => {
    const { win, scrolled } = runInJsdom('<p data-block-uid="p1">正文</p>')
    const results = []
    win.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'preview:focus-result') results.push(e.data)
    })

    win.postMessage({ type: 'preview:focus-block', uid: 'p1' }, '*')
    await nextTick(win)

    expect(results).toEqual([{ type: 'preview:focus-result', uid: 'p1', found: true }])
    expect(scrolled).toHaveLength(1)
    expect(scrolled[0].uid).toBe('p1')
    expect(scrolled[0].opts).toEqual({ behavior: 'smooth', block: 'center' })
    expect(win.document.querySelector('[data-block-uid="p1"]').classList.contains('block-flash')).toBe(true)
  })

  it('目标不存在时回传 found: false，不报错', async () => {
    const { win, scrolled } = runInJsdom('<p data-block-uid="p1">正文</p>')
    const results = []
    win.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'preview:focus-result') results.push(e.data)
    })

    win.postMessage({ type: 'preview:focus-block', uid: 'not-exist' }, '*')
    await nextTick(win)

    expect(results).toEqual([{ type: 'preview:focus-result', uid: 'not-exist', found: false }])
    expect(scrolled).toHaveLength(0)
  })

  it('连续定位只保留最后一个高亮', async () => {
    const { win } = runInJsdom(
      '<p data-block-uid="p1">一</p><p data-block-uid="p2">二</p>'
    )

    win.postMessage({ type: 'preview:focus-block', uid: 'p1' }, '*')
    await nextTick(win)
    win.postMessage({ type: 'preview:focus-block', uid: 'p2' }, '*')
    await nextTick(win)

    const flashed = win.document.querySelectorAll('.block-flash')
    expect(flashed).toHaveLength(1)
    expect(flashed[0].getAttribute('data-block-uid')).toBe('p2')
  })

  it('无关消息被忽略', async () => {
    const { win, scrolled } = runInJsdom('<p data-block-uid="p1">正文</p>')

    win.postMessage({ type: 'something-else', uid: 'p1' }, '*')
    win.postMessage('plain string', '*')
    await nextTick(win)

    expect(scrolled).toHaveLength(0)
    expect(win.document.querySelectorAll('.block-flash')).toHaveLength(0)
  })
})

describe('预览内的常驻高亮', () => {
  const activeCount = (win) => win.document.querySelectorAll('.block-active').length
  const isActive = (win, uid) =>
    win.document.querySelector(`[data-block-uid="${uid}"]`).classList.contains('block-active')

  it('set-active 常驻高亮目标区块', async () => {
    const { win } = runInJsdom('<p data-block-uid="p1">A</p>')
    win.postMessage({ type: 'preview:set-active', uid: 'p1' }, '*')
    await nextTick(win)

    expect(isActive(win, 'p1')).toBe(true)
    expect(activeCount(win)).toBe(1)
  })

  it('切换区块时只保留最新一个高亮', async () => {
    const { win } = runInJsdom('<p data-block-uid="p1">A</p><p data-block-uid="p2">B</p>')
    win.postMessage({ type: 'preview:set-active', uid: 'p1' }, '*')
    await nextTick(win)
    win.postMessage({ type: 'preview:set-active', uid: 'p2' }, '*')
    await nextTick(win)

    expect(isActive(win, 'p1')).toBe(false)
    expect(isActive(win, 'p2')).toBe(true)
    expect(activeCount(win)).toBe(1)
  })

  it('uid 为空时清除高亮', async () => {
    const { win } = runInJsdom('<p data-block-uid="p1">A</p>')
    win.postMessage({ type: 'preview:set-active', uid: 'p1' }, '*')
    await nextTick(win)
    win.postMessage({ type: 'preview:set-active', uid: '' }, '*')
    await nextTick(win)

    expect(activeCount(win)).toBe(0)
  })

  it('高亮不会被定位动画清掉', async () => {
    // 常驻高亮是 class，block-flash 动画结束后应回到常驻状态
    const { win } = runInJsdom('<p data-block-uid="p1">A</p>')
    win.postMessage({ type: 'preview:set-active', uid: 'p1' }, '*')
    win.postMessage({ type: 'preview:focus-block', uid: 'p1' }, '*')
    await nextTick(win)

    expect(isActive(win, 'p1')).toBe(true)
    expect(win.document.querySelector('[data-block-uid="p1"]').classList.contains('block-flash')).toBe(
      true
    )
  })
})

// 点击预览里的区块 → 回传 uid，父页面据此定位左侧卡片
function runSelectInJsdom(bodyHtml) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body>${bodyHtml}
     <script>${extractPreviewScript('preview:select-block')}<\/script></body></html>`,
    { runScripts: 'dangerously', pretendToBeVisual: true }
  )
  const sent = []
  dom.window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'preview:select-block') sent.push(e.data)
  })
  return { win: dom.window, sent }
}

describe('预览文档内的点击回传脚本', () => {
  it('点击区块回传它的 uid', async () => {
    const { win, sent } = runSelectInJsdom('<p data-block-uid="p1">正文</p>')
    win.document.querySelector('[data-block-uid="p1"]').click()
    await new Promise((r) => setTimeout(r, 20))

    expect(sent).toEqual([{ type: 'preview:select-block', uid: 'p1' }])
  })

  it('点嵌套区块回传最内层的 uid', async () => {
    const { win, sent } = runSelectInJsdom(
      '<section data-block-uid="sec1"><p data-block-uid="p2">正文</p></section>'
    )
    win.document.querySelector('[data-block-uid="p2"]').click()
    await new Promise((r) => setTimeout(r, 20))

    expect(sent).toEqual([{ type: 'preview:select-block', uid: 'p2' }])
  })

  it('点击链接不跳转，但仍定位到它所在的区块', async () => {
    const { win, sent } = runSelectInJsdom(
      '<p data-block-uid="cta1"><a href="https://x.test">去看看</a></p>'
    )
    const ev = new win.MouseEvent('click', { bubbles: true, cancelable: true })
    win.document.querySelector('a').dispatchEvent(ev)
    await new Promise((r) => setTimeout(r, 20))

    expect(sent).toEqual([{ type: 'preview:select-block', uid: 'cta1' }])
    // 预览里点了链接不该真的跳走
    expect(ev.defaultPrevented).toBe(true)
  })

  it('表单控件的点击被忽略', async () => {
    const { win, sent } = runSelectInJsdom(
      '<p data-block-uid="p1"><input data-block-uid="in1"></p>'
    )
    win.document.querySelector('input').click()
    await new Promise((r) => setTimeout(r, 20))

    expect(sent).toEqual([])
  })
})

describe('预览面板的定位接口', () => {
  it('focusBlock 会向预览 iframe 投递定位消息', async () => {
    const wrapper = mount(PreviewPane, {
      props: {
        source: {},
        generatePreviewDoc: () => '<!DOCTYPE html><html><head></head><body></body></html>',
        generateHtml: () => '<p>x</p>',
      },
      attachTo: document.body,
    })
    // jsdom 不会真的加载 srcdoc，用假的 contentWindow 捕获投递
    const fakeWin = { postMessage: vi.fn() }
    const frame = wrapper.find('iframe').element
    Object.defineProperty(frame, 'contentWindow', { value: fakeWin, configurable: true })

    wrapper.vm.focusBlock('p1')
    expect(fakeWin.postMessage).toHaveBeenCalledWith(
      { type: 'preview:focus-block', uid: 'p1' },
      '*'
    )

    wrapper.unmount()
  })

  it('setActiveBlock 会向预览 iframe 投递 set-active 消息', async () => {
    const wrapper = mount(PreviewPane, {
      props: {
        source: {},
        generatePreviewDoc: () => '<!DOCTYPE html><html><head></head><body></body></html>',
        generateHtml: () => '<p>x</p>',
      },
      attachTo: document.body,
    })
    const fakeWin = { postMessage: vi.fn() }
    const frame = wrapper.find('iframe').element
    Object.defineProperty(frame, 'contentWindow', { value: fakeWin, configurable: true })

    wrapper.vm.setActiveBlock('sec1')
    expect(fakeWin.postMessage).toHaveBeenCalledWith(
      { type: 'preview:set-active', uid: 'sec1' },
      '*'
    )

    wrapper.unmount()
  })

  it('预览重建后补发常驻高亮，不会掉高亮', async () => {
    const wrapper = mount(PreviewPane, {
      props: {
        source: {},
        generatePreviewDoc: () => '<!DOCTYPE html><html><head></head><body></body></html>',
        generateHtml: () => '<p>x</p>',
      },
      attachTo: document.body,
    })
    const fakeWin = { postMessage: vi.fn() }
    const frame = wrapper.find('iframe').element
    Object.defineProperty(frame, 'contentWindow', { value: fakeWin, configurable: true })

    wrapper.vm.setActiveBlock('sec1')
    fakeWin.postMessage.mockClear()
    // 编辑导致 srcdoc 重建 → iframe 重载
    await wrapper.find('iframe').trigger('load')

    expect(fakeWin.postMessage).toHaveBeenCalledWith(
      { type: 'preview:set-active', uid: 'sec1' },
      '*'
    )

    wrapper.unmount()
  })
})
