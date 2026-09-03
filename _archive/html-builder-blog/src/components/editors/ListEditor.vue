<script setup>
// 列表编辑器（有序 / 无序，条目可拖拽排序）
import { uid } from '../../types.js'
import DragList from '../DragList.vue'
import RichTextarea from '../RichTextarea.vue'

const props = defineProps({ model: { type: Object, required: true } })

function addItem() {
  props.model.items.push({ uid: uid('li'), text: '' })
}
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-1 text-[11px] text-gray-500">
        <input v-model="model.ordered" type="checkbox" class="accent-amber-500" />
        有序列表（ol）
      </label>
      <button
        class="rounded border border-amber-300 px-2 py-0.5 text-[11px] text-amber-600 hover:bg-amber-50"
        @click="addItem"
      >
        ＋ 添加条目
      </button>
    </div>

    <DragList :items="model.items" :list-id="model.uid + '-items'">
      <template #default="{ item, index, moveBy, remove, duplicate, handleDown }">
        <div class="flex items-start gap-1 rounded border border-amber-100 bg-amber-50/40 p-1">
          <div
            class="mt-1.5 cursor-grab select-none px-1 text-xs text-gray-300 hover:text-gray-500 active:cursor-grabbing"
            title="拖拽排序"
            @mousedown="handleDown"
          >
            ⠿
          </div>
          <span class="mt-1.5 w-4 shrink-0 text-center text-[10px] text-gray-400">{{ index + 1 }}</span>
          <div class="min-w-0 flex-1">
            <RichTextarea v-model="item.text" :rows="2" placeholder="列表项内容（换行 = <br>）" />
          </div>
          <div class="mt-1 flex shrink-0 flex-col gap-0.5">
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
