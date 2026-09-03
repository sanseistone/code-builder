import { describe, it, expect } from 'vitest'
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
