import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BlogApp from '../src/tools/blog/App.vue'
import { makeTemplate } from '../src/tools/blog/templates.js'
import { createParagraph } from '../src/tools/blog/types.js'

// 顶部的模板下拉必须如实反映「当前这篇文档是什么」。
// 曾经只存档文档、没存档模板选择，刷新后内容恢复了、下拉却回到列表第一项，
// 看起来就像选错模板。这里把它固化成回归护栏。

const DOC_KEY = 'article-template-doc'
const TPL_KEY = 'article-template-id'

/** 往 localStorage 里写一份「上次选择的模板 = docId」的存档 */
function seed(docId, mutate) {
  const doc = makeTemplate(docId)
  if (mutate) mutate(doc)
  localStorage.setItem(DOC_KEY, JSON.stringify(doc))
  localStorage.setItem(TPL_KEY, JSON.stringify(docId))
}

/** 挂载工具页，读出模板下拉当前选中的值 */
async function templateSelectValue() {
  const wrapper = mount(BlogApp)
  await nextTick() // onMounted 里改了 templateId，等 DOM 跟上
  return wrapper.find('select[title="切换模板"]').element.value
}

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('模板下拉与本地存档', () => {
  it('刷新后仍显示上次选择的模板', async () => {
    seed('kuma-ironai')
    expect(await templateSelectValue()).toBe('kuma-ironai')
  })

  it('模板内容被改动过，刷新后归为「当前自定义内容」', async () => {
    seed('kuma-ironai', (doc) => doc.blocks.push(createParagraph({ text: 'あとから追加' })))
    expect(await templateSelectValue()).toBe('custom')
  })

  it('改动后又改回原样，仍识别为原模板', async () => {
    // 加一个空段落再删掉：内容指纹与模板一致
    seed('kuma-disposal', (doc) => {
      doc.blocks.push(createParagraph({ text: '' }))
      doc.blocks.pop()
    })
    expect(await templateSelectValue()).toBe('kuma-disposal')
  })

  it('没有存档时显示列表第一个模板', async () => {
    expect(await templateSelectValue()).toBe('blank')
  })

  it('重置后回到空白模板', async () => {
    seed('kuma-ironai')
    const wrapper = mount(BlogApp)
    const reset = wrapper.findAll('button').find((b) => b.text().includes('重置'))
    expect(reset).toBeTruthy()

    await reset.trigger('click')
    expect(wrapper.find('select[title="切换模板"]').element.value).toBe('blank')
  })
})
