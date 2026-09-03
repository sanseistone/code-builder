import { h } from 'vue'

// jsdom 不实现布局，这里给元素一个可控的矩形，用于判断插入位置（上半 / 下半）
export function mockRect(el, top = 0, height = 100) {
  el.getBoundingClientRect = () => ({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
  })
}

// jsdom 没有 DragEvent，用普通 Event 补齐拖拽所需字段
export function fire(el, type, props = {}) {
  const ev = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(
    ev,
    {
      dataTransfer: { effectAllowed: '', setData() {}, getData: () => '' },
      clientY: 0,
      clientX: 0,
    },
    props
  )
  el.dispatchEvent(ev)
  return ev
}

// 构造一个可拖拽的测试项（含手柄 / 上下移 / 删除按钮）
export function makeItems(names) {
  return names.map((name, i) => ({ uid: `u${i}`, name }))
}

// DragList 的测试用插槽
export function testSlot({ item, index, moveBy, remove, duplicate, handleDown }) {
  return h('div', { class: 'row' }, [
    h('span', { class: 'handle', onMousedown: handleDown }, '⠿'),
    h('span', { class: 'label' }, item.name),
    h('button', { class: 'up', onClick: () => moveBy(index, -1) }, '↑'),
    h('button', { class: 'down', onClick: () => moveBy(index, 1) }, '↓'),
    h('button', { class: 'dup', onClick: () => duplicate(index) }, '⧉'),
    h('button', { class: 'del', onClick: () => remove(index) }, '✕'),
  ])
}

export function names(items) {
  return items.map((i) => i.name).join(',')
}
