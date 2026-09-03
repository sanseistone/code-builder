<script setup>
// 标签组编辑器（.badge-light，标签可拖拽排序）
import { uid } from '../../types.js'
import { DragList } from '@shared'

const props = defineProps({ model: { type: Object, required: true } })

function addItem() {
  props.model.items.push({ uid: uid('tagItem'), text: '' })
}
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="flex items-center justify-between">
      <span class="text-[11px] text-gray-500">胶囊标签，横向排列</span>
      <button
        class="rounded border border-teal-300 px-2 py-0.5 text-[11px] text-teal-600 hover:bg-teal-50"
        @click="addItem"
      >
        ＋ 添加标签
      </button>
    </div>

    <DragList :items="model.items" :list-id="model.uid + '-items'">
      <template #default="{ item, index, moveBy, remove, duplicate, handleDown }">
        <div class="flex items-center gap-1 rounded border border-teal-100 bg-teal-50/40 p-1">
          <div
            class="cursor-grab select-none px-1 text-xs text-gray-300 hover:text-gray-500 active:cursor-grabbing"
            title="拖拽排序"
            @mousedown="handleDown"
          >
            ⠿
          </div>
          <input
            v-model="item.text"
            type="text"
            placeholder="标签文字"
            class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <div class="flex shrink-0 gap-0.5">
            <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="上移" @click="moveBy(index, -1)">↑</button>
            <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="下移" @click="moveBy(index, 1)">↓</button>
            <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="复制" @click="duplicate(index)">⧉</button>
            <button class="rounded border border-red-200 px-1 text-[10px] text-red-500 hover:bg-red-50" title="删除" @click="remove(index)">✕</button>
          </div>
        </div>
      </template>
    </DragList>
  </div>
</template>
