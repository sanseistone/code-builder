import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DragList from '../src/shared/components/DragList.vue'
import BlockCard from '../src/tools/blog/components/BlockCard.vue'
import { createSection, createParagraph } from '../src/tools/blog/types.js'
import { mockRect, fire, makeItems, testSlot, names } from './helpers.js'

function mountList(items, listId = 'test') {
  return mount(DragList, {
    props: { items, listId },
    slots: { default: testSlot },
  })
}

// 完整拖拽流程：按下手柄 → dragstart → dragover 目标 → drop
async function dragTo(wrapper, fromIndex, toIndex, pos = 'after') {
  const rows = wrapper.findAll('[data-drag-item]')
  const src = rows[fromIndex]
  const dst = rows[toIndex]
  mockRect(src.element, 0, 100)
  mockRect(dst.element, 0, 100)

  await src.find('.handle').trigger('mousedown')
  fire(src.element, 'dragstart')
  await nextTick()
  // 上半 → before，下半 → after
  fire(dst.element, 'dragover', { clientY: pos === 'after' ? 80 : 20 })
  await nextTick()
  fire(dst.element, 'drop', { clientY: pos === 'after' ? 80 : 20 })
  await nextTick()
}

describe('DragList 拖拽排序', () => {
  it('按下手柄后才允许拖拽，输入框内按下不触发', async () => {
    const items = makeItems(['A', 'B'])
    const wrapper = mountList(items)
    const row = wrapper.findAll('[data-drag-item]')[0]

    expect(row.element.draggable).toBe(false)
    await row.find('.handle').trigger('mousedown')
    expect(row.element.draggable).toBe(true)
  })

  it('拖到最后一项之后 → 移动到末尾', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await dragTo(wrapper, 0, 2, 'after')
    expect(names(items)).toBe('B,C,A')
  })

  it('拖到第一项之前 → 移动到开头', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await dragTo(wrapper, 2, 0, 'before')
    expect(names(items)).toBe('C,A,B')
  })

  it('相邻项互换', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await dragTo(wrapper, 0, 1, 'after')
    expect(names(items)).toBe('B,A,C')
  })

  it('拖到自己身上不改变顺序', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await dragTo(wrapper, 1, 1, 'after')
    expect(names(items)).toBe('A,B,C')
  })

  it('上移 / 下移按钮', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await wrapper.findAll('.down')[0].trigger('click')
    expect(names(items)).toBe('B,A,C')
    await wrapper.findAll('.up')[2].trigger('click')
    expect(names(items)).toBe('B,C,A')
  })

  it('首项上移、末项下移均保持不变', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    await wrapper.findAll('.up')[0].trigger('click')
    expect(names(items)).toBe('A,B,C')
    await wrapper.findAll('.down')[2].trigger('click')
    expect(names(items)).toBe('A,B,C')
  })

  it('复制与删除', async () => {
    const items = makeItems(['A', 'B'])
    const wrapper = mountList(items)
    await wrapper.findAll('.dup')[0].trigger('click')
    expect(names(items)).toBe('A,A,B')
    // 复制出的副本应拥有新的 uid，避免 key 冲突
    expect(items[0].uid).not.toBe(items[1].uid)
    await wrapper.findAll('.del')[1].trigger('click')
    expect(names(items)).toBe('A,B')
  })

  it('拖拽过程中显示插入位置指示线（响应式状态生效）', async () => {
    const items = makeItems(['A', 'B', 'C'])
    const wrapper = mountList(items)
    const rows = wrapper.findAll('[data-drag-item]')
    mockRect(rows[0].element, 0, 100)
    mockRect(rows[2].element, 0, 100)

    await rows[0].find('.handle').trigger('mousedown')
    fire(rows[0].element, 'dragstart')
    await nextTick()
    expect(rows[0].classes()).toContain('drag-dragging')

    fire(rows[2].element, 'dragover', { clientY: 80 })
    await nextTick()
    expect(rows[2].classes()).toContain('drag-over-after')

    fire(rows[2].element, 'dragover', { clientY: 20 })
    await nextTick()
    expect(rows[2].classes()).toContain('drag-over-before')

    fire(rows[2].element, 'dragend')
    await nextTick()
    expect(rows[0].classes()).not.toContain('drag-dragging')
  })
})

describe('嵌套列表互不串扰', () => {
  function mountNested() {
    const child = makeItems(['c1', 'c2', 'c3'])
    const parent = [{ uid: 'p1', name: 'P1', child }]
    const wrapper = mount(DragList, {
      props: { items: parent, listId: 'parent' },
      slots: {
        default: ({ item, index }) =>
          h('div', { class: 'wrap' }, [
            h('span', { class: 'pname' }, item.name),
            h(DragList, { items: item.child, listId: `child-${index}` }, { default: testSlot }),
          ]),
      },
    })
    return { wrapper, parent, child }
  }

  it('拖动子列表项，父列表顺序不受影响（dragstart 冒泡防护）', async () => {
    const { wrapper, parent, child } = mountNested()
    // 文档顺序：第 0 个是父项，其后 3 个是嵌套在它内部的子项
    const childRows = wrapper.findAll('[data-drag-item]').slice(1)
    expect(childRows.length).toBe(3)

    const src = childRows[0]
    const dst = childRows[2]
    mockRect(src.element, 0, 100)
    mockRect(dst.element, 0, 100)

    await src.find('.handle').trigger('mousedown')
    fire(src.element, 'dragstart')
    await nextTick()
    // dragstart 冒泡到父项，父 DragList 不应接管
    fire(dst.element, 'dragover', { clientY: 80 })
    await nextTick()
    fire(dst.element, 'drop', { clientY: 80 })
    await nextTick()

    expect(names(child)).toBe('c2,c3,c1')
    expect(names(parent)).toBe('P1')
  })

  it('子列表的拖拽不会改变父列表的元素数量', async () => {
    const { wrapper, parent } = mountNested()
    const childRows = wrapper.findAll('[data-drag-item]').slice(1)
    const src = childRows[0]
    mockRect(src.element, 0, 100)
    await src.find('.handle').trigger('mousedown')
    fire(src.element, 'dragstart')
    fire(src.element, 'dragend')
    await nextTick()
    expect(parent.length).toBe(1)
  })
})

describe('BlockCard 章节内子区块', () => {
  function makeDoc() {
    const section = createSection({
      id: 'item1',
      title: '章タイトル',
      children: [
        createParagraph({ text: 'P1' }),
        createParagraph({ text: 'P2' }),
        createParagraph({ text: 'P3' }),
      ],
    })
    const doc = { blocks: [section], toc: { enabled: true, mode: 'auto', items: [] } }
    return [doc, section]
  }

  const noop = () => {}

  it('章节内子区块可拖拽排序', async () => {
    const [doc, section] = makeDoc()
    const wrapper = mount(BlockCard, {
      props: {
        block: section,
        index: 0,
        doc,
        moveBy: noop,
        remove: noop,
        duplicate: noop,
        handleDown: noop,
      },
    })

    const childRows = wrapper.findAll('[data-drag-item]')
    expect(childRows.length).toBe(3)

    const src = childRows[0]
    const dst = childRows[2]
    mockRect(src.element, 0, 100)
    mockRect(dst.element, 0, 100)

    await src.find('[title="按住拖拽排序"]').trigger('mousedown')
    fire(src.element, 'dragstart')
    await nextTick()
    fire(dst.element, 'dragover', { clientY: 80 })
    await nextTick()
    fire(dst.element, 'drop', { clientY: 80 })
    await nextTick()

    expect(section.children.map((c) => c.text).join(',')).toBe('P2,P3,P1')
    // 顶层顺序不受影响
    expect(doc.blocks.length).toBe(1)
  })

  it('复制子区块后每个都有独立 uid', async () => {
    const [doc, section] = makeDoc()
    const wrapper = mount(BlockCard, {
      props: {
        block: section,
        index: 0,
        doc,
        moveBy: noop,
        remove: noop,
        duplicate: (i) => {
          const copy = JSON.parse(JSON.stringify(section.children[i]))
          copy.uid = 'new-' + i
          section.children.splice(i + 1, 0, copy)
          return copy
        },
        handleDown: noop,
      },
    })
    const dupBtns = wrapper.findAll('button[title="复制"]')
    await dupBtns[0].trigger('click')
    const uids = section.children.map((c) => c.uid)
    expect(new Set(uids).size).toBe(uids.length)
  })
})
