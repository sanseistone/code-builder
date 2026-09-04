import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../src/HomeView.vue'
import BlogApp from '../src/tools/blog/App.vue'
import CampaignApp from '../src/tools/campaign/App.vue'
import PreviewPane from '../src/shared/components/PreviewPane.vue'
import { TOOLS } from '../src/registry.js'

// 合并后的回归护栏：三个页面都要能真实挂载并渲染出关键结构，
// 防止共享层（ToolShell / PreviewPane / DragList / composables）改动破坏任一工具。

describe('首页', () => {
  it('渲染出注册表里的全部工具卡片', () => {
    const wrapper = mount(HomeView)
    const cards = wrapper.findAll('.home__card')
    expect(cards).toHaveLength(TOOLS.length)
    TOOLS.forEach((tool, i) => {
      expect(cards[i].text()).toContain(tool.name)
      expect(cards[i].attributes('href')).toContain(tool.route)
    })
  })
})

describe('文章模板生成工具', () => {
  it('挂载成功并显示编辑区与预览区', () => {
    const wrapper = mount(BlogApp)
    expect(wrapper.text()).toContain('文章模板生成工具')
    expect(wrapper.text()).toContain('文章设置')
    expect(wrapper.text()).toContain('正文区块')
    // 共享预览面板的两个页签
    expect(wrapper.text()).toContain('实时预览')
    expect(wrapper.text()).toContain('HTML 代码')
    // 共享骨架：顶栏 + 左编辑区 + 右预览区
    expect(wrapper.find('.tool-header').exists()).toBe(true)
    expect(wrapper.find('.app-shell__aside').exists()).toBe(true)
    expect(wrapper.find('.app-shell__main').exists()).toBe(true)
  })
})

describe('共享预览面板', () => {
  // 工具页在 tools/<id>/ 子目录下，而 vendor/ 在站点根。
  // srcdoc iframe 继承父页 URL，若不注入 <base>，
  // 预览文档里的 src="vendor/tailwindcss.browser.js" 会 404 导致预览无样式。
  it('给预览文档注入 <base>，修正相对资源路径', async () => {
    const previewDoc =
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<script src="vendor/tailwindcss.browser.js"></script></head><body></body></html>'
    const wrapper = mount(PreviewPane, {
      props: {
        source: {},
        generatePreviewDoc: () => previewDoc,
        generateHtml: () => '<p>x</p>',
      },
    })
    await new Promise((r) => setTimeout(r, 300)) // 等防抖的 update()

    const srcdoc = wrapper.find('iframe').attributes('srcdoc')
    expect(srcdoc).toContain('<base href=')
    expect(srcdoc.indexOf('<base href=')).toBeLessThan(
      srcdoc.indexOf('vendor/tailwindcss.browser.js')
    )
    // 生成器的原始输出不应被改写（只有注入 iframe 时会补 base）
    expect(previewDoc).not.toContain('<base href=')
  })

  // srcdoc 一变就是一次整页重载，滚动位置会归零。
  // 目次在文档最前面，位置一归零看起来就是「编辑时跳回目录」。
  it('因编辑而重建预览时保持滚动位置', async () => {
    const wrapper = mount(PreviewPane, {
      props: {
        source: { n: 1 },
        generatePreviewDoc: (s) => `<html><head></head><body>v${s.n}</body></html>`,
        generateHtml: () => '<p>x</p>',
      },
    })
    await new Promise((r) => setTimeout(r, 300)) // 等首次 update()

    // jsdom 不会真的载入 iframe 内容，这里给 contentWindow 打桩
    const frame = wrapper.find('iframe').element
    const fakeWin = { scrollY: 320, scrollTo: vi.fn() }
    Object.defineProperty(frame, 'contentWindow', { get: () => fakeWin, configurable: true })

    // 模拟编辑：source 变化 → 防抖后重建 srcdoc → iframe 重载
    await wrapper.setProps({ source: { n: 2 } })
    await new Promise((r) => setTimeout(r, 300))
    await wrapper.find('iframe').trigger('load')

    expect(fakeWin.scrollTo).toHaveBeenCalledWith(0, 320)
  })

  it('预览里点击区块时会向工具页抛出 select-block', async () => {
    const wrapper = mount(PreviewPane, {
      props: {
        source: {},
        generatePreviewDoc: () => '<html><head></head><body></body></html>',
        generateHtml: () => '<p>x</p>',
      },
    })
    await new Promise((r) => setTimeout(r, 300))

    window.postMessage({ type: 'preview:select-block', uid: 'sec-1' }, '*')
    await new Promise((r) => setTimeout(r, 10)) // postMessage 是异步派发的

    expect(wrapper.emitted('select-block')).toEqual([['sec-1']])
  })
})

describe('活动页模板生成工具', () => {
  it('挂载成功并显示编辑区与预览区', () => {
    const wrapper = mount(CampaignApp)
    expect(wrapper.text()).toContain('HTML 模板生成工具')
    expect(wrapper.text()).toContain('大标题')
    expect(wrapper.text()).toContain('主体模块')
    expect(wrapper.find('.tool-header').exists()).toBe(true)
    expect(wrapper.find('.pane').exists()).toBe(true)
  })
})
