<script setup>
// ============================================================
// 通用拖拽排序容器（所有工具共用）
// - 通过 listId 区分作用域，支持多层嵌套互不干扰
// - 只有从手柄 / 卡片空白处按下才允许拖动，输入框内不影响文本选择
// - 通过作用域插槽暴露 moveBy（上移/下移），供卡片内的按钮调用
// - 复制行为可通过 cloneItem 定制（默认递归重生成 uid）
// ============================================================
import { ref } from 'vue'
import { dnd, resetDnd } from '../dnd.js'
import { duplicateItem } from '../utils/duplicate.js'

const props = defineProps({
  items: { type: Array, required: true },
  listId: { type: String, required: true },
  // 复制一项时的钩子：可用于重分配业务 id（如章节锚点 id、弹窗 id）
  cloneItem: { type: Function, default: duplicateItem },
  emptyText: { type: String, default: '暂无内容，点击下方按钮添加' },
})

// 本列表内的拖拽视觉状态（必须是响应式，否则拖拽过程中的插入指示线不会渲染）
const dragIndex = ref(-1) // 正在被拖动的项
const hoverIndex = ref(-1) // 当前悬停的项
const hoverPos = ref('before') // 插入到悬停项之前 / 之后

// 鼠标按下时决定是否允许拖拽：命中表单控件则禁用
function onMouseDown(e) {
  const el = e.currentTarget
  const inField = e.target.closest('input, textarea, select, button, a, label')
  el.draggable = !inField
}

// 从手柄按下：强制允许拖拽
function armFromHandle(e) {
  const el = e.currentTarget.closest('[data-drag-item]')
  if (el) el.draggable = true
}

function onDragStart(e, i) {
  // dragstart 会冒泡：拖章节内的子区块时，外层区块也会收到该事件，
  // 必须只处理「自己发起」的拖拽，否则会被外层列表覆盖拖拽源
  if (e.target !== e.currentTarget) return
  dnd.listId = props.listId
  dnd.index = i
  dragIndex.value = i
  e.dataTransfer.effectAllowed = 'move'
  try {
    e.dataTransfer.setData('text/plain', String(i))
  } catch (err) {
    /* 某些浏览器限制 setData，忽略即可 */
  }
}

function onDragEnd(e) {
  e.currentTarget.draggable = false
  if (e.target !== e.currentTarget) return // 冒泡上来的，不处理
  dragIndex.value = -1
  hoverIndex.value = -1
  resetDnd()
}

function onDragOver(e, i) {
  if (dnd.listId !== props.listId) return // 忽略其它列表的拖拽
  e.preventDefault()
  e.stopPropagation()
  const rect = e.currentTarget.getBoundingClientRect()
  hoverIndex.value = i
  hoverPos.value = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
}

function onDrop(e, i) {
  if (dnd.listId !== props.listId) return
  e.preventDefault()
  e.stopPropagation()
  moveTo(dnd.index, hoverPos.value === 'after' ? i + 1 : i)
  e.currentTarget.draggable = false
  dragIndex.value = -1
  hoverIndex.value = -1
  resetDnd()
}

// 从 from 移动到插入点 to（to 为插入位置，非目标索引）
function moveTo(from, to) {
  if (from < 0) return
  let target = to
  if (from < target) target -= 1
  if (target === from || target < 0 || target > props.items.length) return
  const [it] = props.items.splice(from, 1)
  props.items.splice(target, 0, it)
}

// 上移 / 下移（dir = -1 | 1）
function moveBy(i, dir) {
  moveTo(i, dir === -1 ? i - 1 : i + 2)
}

function removeAt(i) {
  props.items.splice(i, 1)
}

// 复制当前项并插入到其后，返回副本供调用方改写（如重分配章节 id）
function duplicateAt(i) {
  const copy = props.cloneItem(props.items[i])
  props.items.splice(i + 1, 0, copy)
  return copy
}

function isDragging(i) {
  return dragIndex.value === i
}
function overClass(i) {
  if (hoverIndex.value !== i || dragIndex.value === i) return ''
  return hoverPos.value === 'before' ? 'drag-over-before' : 'drag-over-after'
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(item, i) in items"
      :key="item.uid || i"
      data-drag-item
      draggable="false"
      class="relative rounded-lg"
      :class="[isDragging(i) ? 'drag-dragging' : '', overClass(i)]"
      @mousedown="onMouseDown"
      @dragstart="onDragStart($event, i)"
      @dragend="onDragEnd"
      @dragover="onDragOver($event, i)"
      @drop="onDrop($event, i)"
    >
      <slot
        :item="item"
        :index="i"
        :move-by="moveBy"
        :remove="removeAt"
        :duplicate="duplicateAt"
        :handle-down="armFromHandle"
      />
    </div>

    <p v-if="!items.length" class="rounded-lg border border-dashed border-gray-300 p-3 text-center text-xs text-gray-400">
      {{ emptyText }}
    </p>
  </div>
</template>
