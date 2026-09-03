<script setup>
// 商品卡片网格编辑器（卡片可拖拽排序）
import { createProductItem, uid } from '../../types.js'
import { DragList } from '@shared'

const props = defineProps({ model: { type: Object, required: true } })

function addItem() {
  props.model.items.push({ ...createProductItem(), uid: uid('prdItem') })
}
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="flex items-center justify-between">
      <span class="text-[11px] text-gray-500">卡片按 2 / 3 / 4 列响应式排布</span>
      <button
        class="rounded border border-emerald-300 px-2 py-0.5 text-[11px] text-emerald-600 hover:bg-emerald-50"
        @click="addItem"
      >
        ＋ 添加卡片
      </button>
    </div>

    <DragList :items="model.items" :list-id="model.uid + '-items'">
      <template #default="{ item, index, moveBy, remove, duplicate, handleDown }">
        <div class="rounded border border-emerald-100 bg-emerald-50/40 p-2">
          <div class="mb-1.5 flex items-center gap-1">
            <div
              class="cursor-grab select-none px-1 text-xs text-gray-300 hover:text-gray-500 active:cursor-grabbing"
              title="拖拽排序"
              @mousedown="handleDown"
            >
              ⠿
            </div>
            <span class="text-[10px] text-gray-400">卡片 {{ index + 1 }}</span>
            <div class="ml-auto flex gap-0.5">
              <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="上移" @click="moveBy(index, -1)">↑</button>
              <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="下移" @click="moveBy(index, 1)">↓</button>
              <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="复制" @click="duplicate(index)">⧉</button>
              <button class="rounded border border-red-200 px-1 text-[10px] text-red-500 hover:bg-red-50" title="删除" @click="remove(index)">✕</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <input v-model="item.img" type="text" placeholder="图片 URL" class="col-span-2 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.title" type="text" placeholder="商品标题" class="col-span-2 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.href" type="text" placeholder="链接 URL" class="col-span-2 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.price" type="text" placeholder="价格（如 15,000 円(税込)）" class="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.alt" type="text" placeholder="alt" class="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.width" type="text" placeholder="宽" class="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <input v-model="item.height" type="text" placeholder="高" class="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </div>
        </div>
      </template>
    </DragList>
  </div>
</template>
