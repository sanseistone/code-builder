<script setup>
// ============================================================
// 目次编辑器
// auto   模式：目次条目由文档中的章节自动派生（推荐）
// manual 模式：可手动增删、改文字、拖拽排序
// ============================================================
import { uid, collectSections } from '../types.js'
import { DragList } from '@shared'

const props = defineProps({ doc: { type: Object, required: true } })

// 从当前章节快照生成手动条目
function syncFromSections() {
  props.doc.toc.items = collectSections(props.doc.blocks).map((s) => ({
    uid: uid('toc'),
    id: s.id,
    text: s.title,
  }))
}

function addItem() {
  props.doc.toc.items.push({ uid: uid('toc'), id: '', text: '' })
}
</script>

<template>
  <section class="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-xs font-semibold text-gray-600">① 目次（TOC）</h2>
      <label class="flex items-center gap-1 text-[11px] text-gray-500">
        <input v-model="doc.toc.enabled" type="checkbox" class="accent-blue-500" />
        启用
      </label>
    </div>

    <div v-if="doc.toc.enabled" class="space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model="doc.toc.title"
          type="text"
          placeholder="目次标题"
          class="w-28 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          v-model="doc.toc.mode"
          class="rounded border border-gray-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
          title="auto：跟随章节自动生成；manual：手动维护"
        >
          <option value="auto">自动（跟随章节）</option>
          <option value="manual">手动</option>
        </select>
      </div>

      <!-- 手动模式：条目可编辑 + 拖拽 -->
      <div v-if="doc.toc.mode === 'manual'" class="space-y-2">
        <DragList :items="doc.toc.items" :list-id="'toc-items'">
          <template #default="{ item, index, moveBy, remove, handleDown }">
            <div class="flex items-center gap-1 rounded border border-blue-100 bg-white p-1">
              <div
                class="cursor-grab select-none px-1 text-xs text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                title="拖拽排序"
                @mousedown="handleDown"
              >
                ⠿
              </div>
              <input
                v-model="item.id"
                type="text"
                placeholder="锚点 id"
                class="w-20 rounded border border-gray-200 px-1.5 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                v-model="item.text"
                type="text"
                placeholder="目次文字"
                class="min-w-0 flex-1 rounded border border-gray-200 px-1.5 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div class="flex shrink-0 gap-0.5">
                <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="上移" @click="moveBy(index, -1)">↑</button>
                <button class="rounded border border-gray-200 px-1 text-[10px] text-gray-500 hover:bg-gray-100" title="下移" @click="moveBy(index, 1)">↓</button>
                <button class="rounded border border-red-200 px-1 text-[10px] text-red-500 hover:bg-red-50" title="删除" @click="remove(index)">✕</button>
              </div>
            </div>
          </template>
        </DragList>

        <div class="flex gap-1">
          <button class="rounded border border-blue-300 px-2 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50" @click="addItem">
            ＋ 添加条目
          </button>
          <button class="rounded border border-gray-300 px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100" @click="syncFromSections">
            ↻ 从章节生成
          </button>
        </div>
      </div>

      <!-- 自动模式：只读预览 -->
      <div v-else class="rounded border border-blue-100 bg-blue-50/50 p-2">
        <ol class="space-y-0.5 text-[11px] text-gray-600">
          <li v-for="(s, i) in collectSections(doc.blocks)" :key="s.uid || i">
            {{ i + 1 }}. {{ s.title || '（未命名章节）' }}
            <span class="text-gray-400">→ #{{ s.id }}</span>
          </li>
          <li v-if="!collectSections(doc.blocks).length" class="text-gray-400">
            暂无章节（添加「章节（H2/H3）」区块后自动生成）
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
