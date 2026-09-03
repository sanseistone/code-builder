<script>
// 显式声明组件名，保证模板中可自引用（章节内递归嵌套子区块）
export default { name: 'BlockCard' }
</script>

<script setup>
// ============================================================
// 区块卡片：拖拽把手 + 类型标识 + 工具按钮 + 对应编辑器
// section 类型在此直接渲染子区块列表（组件自引用实现递归嵌套）
// ============================================================
import { computed, inject } from 'vue'
import {
  BLOCK_META,
  TONE_CLASS,
  CHILD_BLOCK_TYPES,
  createBlock,
  nextSectionId,
  nextModalId,
} from '../types.js'
import { DragList } from '@shared'
import SectionEditor from './editors/SectionEditor.vue'
import ParagraphEditor from './editors/ParagraphEditor.vue'
import SubheadingEditor from './editors/SubheadingEditor.vue'
import ImageEditor from './editors/ImageEditor.vue'
import VideoEditor from './editors/VideoEditor.vue'
import ListEditor from './editors/ListEditor.vue'
import QuoteEditor from './editors/QuoteEditor.vue'
import ProductsEditor from './editors/ProductsEditor.vue'
import BadgeEditor from './editors/BadgeEditor.vue'
import ModalEditor from './editors/ModalEditor.vue'
import CtaEditor from './editors/CtaEditor.vue'

const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, default: 0 },
  doc: { type: Object, required: true }, // 整篇文档，用于生成唯一章节 id
  childTypes: { type: Array, default: () => CHILD_BLOCK_TYPES },
  moveBy: { type: Function, required: true },
  remove: { type: Function, required: true },
  duplicate: { type: Function, required: true },
  handleDown: { type: Function, required: true },
})

const EDITOR_MAP = {
  section: SectionEditor,
  paragraph: ParagraphEditor,
  subheading: SubheadingEditor,
  image: ImageEditor,
  video: VideoEditor,
  list: ListEditor,
  quote: QuoteEditor,
  products: ProductsEditor,
  badge: BadgeEditor,
  modal: ModalEditor,
  cta: CtaEditor,
}

const meta = computed(() => BLOCK_META[props.block.type] || { name: props.block.type, tone: 'slate' })
const tone = computed(() => TONE_CLASS[meta.value.tone] || TONE_CLASS.slate)
const editor = computed(() => EDITOR_MAP[props.block.type])
const isSection = computed(() => props.block.type === 'section')

// ---------- 编辑区 ↔ 预览联动 ----------
// 由 App.vue 注入：点击卡片或聚焦字段时，通知右侧预览滚动到对应区块并高亮
const focusBlock = inject('focusBlock', null)
const activeUid = inject('activeUid', null)
const isActive = computed(() => !!activeUid && activeUid.value === props.block.uid)

function activate() {
  if (focusBlock) focusBlock(props.block.uid)
}

// 字段获得焦点即联动。必须阻止冒泡，否则聚焦「章节内的子区块」会一路冒到外层
// 章节卡片，把选中态错误地记到父章节上。
function onFocusIn(e) {
  e.stopPropagation()
  activate()
}

// 点击卡片头部空白处也联动；头部按钮（上移/复制/删除等）除外
function onHeaderClick(e) {
  if (e.target.closest('button, a, label, input, select, textarea')) return
  activate()
}

// 向章节内追加子区块
function addChild(type) {
  const child = createBlock(type)
  if (!child) return
  props.block.children.push(child)
}

// 复制后重分配章节锚点 / 弹窗 id，避免与原文冲突
function onDuplicate() {
  const copy = props.duplicate(props.index)
  if (!copy) return
  if (copy.type === 'section') {
    copy.id = nextSectionId(props.doc.blocks)
  } else if (copy.type === 'modal') {
    copy.modalId = nextModalId(props.doc.blocks)
  }
}
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow"
    :class="[tone.bar, isActive ? 'ring-2 ring-blue-400' : '']"
    style="border-left-width: 4px; border-left-style: solid;"
    @focusin="onFocusIn"
  >
    <!-- 卡片头部 -->
    <header class="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50/70 px-2 py-1" @click="onHeaderClick">
      <div
        class="cursor-grab select-none px-0.5 text-sm text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        title="按住拖拽排序"
        @mousedown="handleDown"
      >
        ⠿
      </div>
      <span class="rounded border px-1.5 py-0.5 text-[10px] font-medium" :class="tone.chip">
        {{ meta.name }}
      </span>
      <span class="truncate text-[10px] text-gray-400">第 {{ index + 1 }} 个</span>
      <div class="ml-auto flex shrink-0 gap-0.5">
        <button class="rounded border border-gray-200 bg-white px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="上移" @click="moveBy(index, -1)">↑</button>
        <button class="rounded border border-gray-200 bg-white px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="下移" @click="moveBy(index, 1)">↓</button>
        <button class="rounded border border-gray-200 bg-white px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="复制" @click="onDuplicate">⧉</button>
        <button class="rounded border border-red-200 bg-white px-1 text-[10px] text-red-500 hover:bg-red-50" title="删除" @click="remove(index)">✕</button>
      </div>
    </header>

    <!-- 字段编辑器 -->
    <component :is="editor" :model="block" />

    <!-- 章节：子区块列表（递归嵌套，同样支持拖拽排序） -->
    <div v-if="isSection" class="border-t border-gray-100 bg-gray-50/40 p-2">
      <div class="mb-1.5 flex items-center justify-between">
        <span class="text-[11px] text-gray-500">章节内容（{{ block.children.length }} 项，可拖拽排序）</span>
      </div>

      <DragList :items="block.children" :list-id="block.uid + '-children'">
        <template #default="{ item, index: ci, moveBy: cmove, remove: cremove, duplicate: cdup, handleDown: cdown }">
          <BlockCard
            :block="item"
            :index="ci"
            :doc="doc"
            :move-by="cmove"
            :remove="cremove"
            :duplicate="cdup"
            :handle-down="cdown"
          />
        </template>
      </DragList>

      <div class="mt-2 flex flex-wrap gap-1 border-t border-dashed border-gray-200 pt-2">
        <button
          v-for="t in childTypes"
          :key="t"
          class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-100"
          @click="addChild(t)"
        >
          ＋{{ BLOCK_META[t].name }}
        </button>
      </div>
    </div>
  </div>
</template>
