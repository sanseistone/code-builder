<script setup>
import { createEmptyChild, CHILD_LABELS } from '../types.js'
import NoteEditor from './NoteEditor.vue'
import TagsEditor from './TagsEditor.vue'
import ListEditor from './ListEditor.vue'

const props = defineProps({
  model: { type: Object, required: true }, // section 对象
  number: { type: Number, default: 0 }, // 自动序号（无序号时传 null）
})

function addChild(type) {
  const child = createEmptyChild(type)
  if (child) props.model.children.push(child)
}
function removeChild(i) {
  props.model.children.splice(i, 1)
}
function moveChild(i, dir) {
  const target = i + dir
  if (target < 0 || target >= props.model.children.length) return
  const arr = props.model.children
  ;[arr[i], arr[target]] = [arr[target], arr[i]]
}
</script>

<template>
  <div class="rounded-lg border border-red-200 bg-white p-3 space-y-3 shadow-sm">
    <!-- 头部：序号 + 标题行 -->
    <div class="flex items-center gap-2">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        {{ number || '—' }}
      </span>
      <div class="flex items-center gap-1.5">
        <label class="flex items-center gap-1 text-[11px] text-gray-500" title="显示/隐藏序号圆标">
          <input v-model="model.showNumber" type="checkbox" class="accent-red-500" />
          序号
        </label>
      </div>
      <span class="text-xs font-medium text-red-500">小标题块</span>
    </div>

    <!-- 标题 -->
    <div class="space-y-1.5">
      <label class="text-[11px] text-gray-500">标题（必填）</label>
      <input
        v-model="model.title"
        type="text"
        placeholder="如：割引 / 無料特典 / オプション割引"
        class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
      />
    </div>

    <!-- 链接（可选，填写后标题变为可点击链接） -->
    <div class="space-y-1.5">
      <label class="text-[11px] text-gray-500">链接 URL（可选，填写后标题渲染为 <code>&lt;a&gt;</code>）</label>
      <input
        v-model="model.link"
        type="text"
        placeholder="https://…"
        class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-200"
      />
    </div>

    <!-- 折扣（可选） -->
    <div class="space-y-1.5">
      <label class="text-[11px] text-gray-500">折扣标签（可选，如 10%OFF，留空则不显示）</label>
      <input
        v-model="model.discount"
        type="text"
        placeholder="10%OFF"
        class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-200"
      />
    </div>

    <!-- 子内容 -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-gray-500">子内容（标签组 / 价格列表 / 说明）</span>
        <div class="flex gap-1">
          <button
            v-for="(label, type) in CHILD_LABELS"
            :key="type"
            class="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
            @click="addChild(type)"
          >
            ＋{{ label }}
          </button>
        </div>
      </div>
      <div v-for="(child, i) in model.children" :key="i" class="relative">
        <!-- 子内容操作：上移 / 下移 / 删除 -->
        <div class="absolute -top-2 right-2 z-10 flex items-center gap-1">
          <span class="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-400">
            {{ CHILD_LABELS[child.type] }}
          </span>
          <button
            class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            :disabled="i === 0"
            title="上移"
            @click="moveChild(i, -1)"
          >
            ↑
          </button>
          <button
            class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            :disabled="i === model.children.length - 1"
            title="下移"
            @click="moveChild(i, 1)"
          >
            ↓
          </button>
          <button
            class="flex h-5 w-5 items-center justify-center rounded border border-red-300 bg-white text-xs text-red-500 hover:bg-red-50"
            title="删除该子内容"
            @click="removeChild(i)"
          >
            ✕
          </button>
        </div>
        <NoteEditor v-if="child.type === 'note'" :model="child" />
        <TagsEditor v-else-if="child.type === 'tags'" :model="child" />
        <ListEditor v-else-if="child.type === 'list'" :model="child" />
      </div>
    </div>
  </div>
</template>
