<script setup>
// ============================================================
// 文章模板生成工具 · 主界面
// 左：可视化编辑（目次 + 区块列表，支持拖拽排序）
// 右：实时预览 / HTML 代码
// ============================================================
import { ref, watch, onMounted } from 'vue'
import { TEMPLATES, makeTemplate } from './templates.js'
import { BLOCK_META, TOP_BLOCK_TYPES, createBlock, nextSectionId, nextModalId } from './types.js'
import { normalizeDoc, downloadFile } from './utils.js'
import DragList from './components/DragList.vue'
import BlockCard from './components/BlockCard.vue'
import TocEditor from './components/TocEditor.vue'
import PreviewPane from './components/PreviewPane.vue'

const STORAGE_KEY = 'article-template-doc'

// ---------- 状态 ----------
const templateId = ref(TEMPLATES[0].id)
const doc = ref(makeTemplate(TEMPLATES[0].id))

const toastMsg = ref('')
let toastTimer = null
function toast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastMsg.value = ''), 1800)
}

// ---------- 模板 ----------
function switchTemplate(id) {
  templateId.value = id
  doc.value = makeTemplate(id)
  toast('已切换模板')
}

// ---------- 顶层区块 ----------
function addBlock(type) {
  const block = createBlock(type)
  if (!block) return
  if (block.type === 'section') block.id = nextSectionId(doc.value.blocks)
  if (block.type === 'modal') block.modalId = nextModalId(doc.value.blocks)
  doc.value.blocks.push(block)
}

function onDuplicate(i, dup) {
  const copy = dup(i)
  if (!copy) return
  if (copy.type === 'section') copy.id = nextSectionId(doc.value.blocks)
  if (copy.type === 'modal') copy.modalId = nextModalId(doc.value.blocks)
}

// ---------- 导入 / 导出 ----------
function exportConfig() {
  downloadFile(
    'article-config.json',
    JSON.stringify(doc.value, null, 2),
    'application/json'
  )
  toast('配置已导出')
}

function importConfig(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      doc.value = normalizeDoc(data)
      templateId.value = 'custom'
      toast('配置已导入')
    } catch (err) {
      toast('导入失败：文件格式不正确')
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}

// ---------- 本地自动保存 ----------
let saveTimer = null
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    doc.value = normalizeDoc(JSON.parse(raw))
    templateId.value = 'custom'
    return true
  } catch (err) {
    return false
  }
}

onMounted(() => {
  if (loadSaved()) toast('已恢复上次的编辑内容')
})

watch(
  doc,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc.value))
      } catch (err) {
        /* 存储配额不足时忽略 */
      }
    }, 500)
  },
  { deep: true }
)

function resetAll() {
  doc.value = makeTemplate(templateId.value === 'custom' ? 'blank' : templateId.value)
  templateId.value = 'blank'
  localStorage.removeItem(STORAGE_KEY)
  toast('已重置为空白模板')
}
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50 text-gray-800">
    <!-- 顶栏 -->
    <header class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
      <h1 class="whitespace-nowrap text-base font-bold text-gray-800">📝 文章模板生成工具</h1>
      <select
        v-model="templateId"
        class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="切换模板"
        @change="switchTemplate(templateId)"
      >
        <option v-for="t in TEMPLATES" :key="t.id" :value="t.id">{{ t.name }}</option>
        <option v-if="templateId === 'custom'" value="custom">当前自定义内容</option>
      </select>

      <div class="ml-auto flex items-center gap-2">
        <label class="cursor-pointer rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100">
          📥 导入配置
          <input type="file" accept=".json" class="hidden" @change="importConfig" />
        </label>
        <button class="rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100" @click="exportConfig">
          📤 导出配置
        </button>
        <button class="rounded border border-red-300 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50" @click="resetAll">
          🗑 重置
        </button>
      </div>
    </header>

    <!-- 主体 -->
    <main class="flex min-h-0 flex-1">
      <!-- 左：编辑区 -->
      <aside class="w-[600px] shrink-0 space-y-3 overflow-y-auto border-r border-gray-200 bg-white p-4">
        <!-- 文章设置 -->
        <section class="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
          <h2 class="mb-2 text-xs font-semibold text-gray-600">⓪ 文章设置</h2>
          <div class="flex items-center gap-2">
            <input
              v-model="doc.title"
              type="text"
              placeholder="文章标题（用于下载文件名，不输出到代码）"
              class="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <label class="flex shrink-0 items-center gap-1 text-[11px] text-gray-500" title="生成的代码顶部是否附带全局样式">
              <input v-model="doc.includeStyle" type="checkbox" class="accent-blue-500" />
              输出 &lt;style&gt;
            </label>
          </div>
        </section>

        <!-- 目次 -->
        <TocEditor :doc="doc" />

        <!-- 区块列表 -->
        <section>
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xs font-semibold text-gray-600">② 正文区块（{{ doc.blocks.length }} 项，拖拽 ⠿ 排序）</h2>
          </div>

          <DragList :items="doc.blocks" list-id="root-blocks">
            <template #default="{ item, index, moveBy, remove, duplicate, handleDown }">
              <BlockCard
                :block="item"
                :index="index"
                :doc="doc"
                :move-by="moveBy"
                :remove="remove"
                :duplicate="(i) => onDuplicate(i, duplicate)"
                :handle-down="handleDown"
              />
            </template>
          </DragList>

          <!-- 添加区块 -->
          <div class="mt-3 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 p-3">
            <p class="mb-2 text-center text-xs font-medium text-blue-500">＋ 添加区块</p>
            <div class="flex flex-wrap justify-center gap-1.5">
              <button
                v-for="t in TOP_BLOCK_TYPES"
                :key="t"
                class="rounded border border-blue-300 bg-white px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-100"
                @click="addBlock(t)"
              >
                ＋{{ BLOCK_META[t].name }}
              </button>
            </div>
          </div>
        </section>
      </aside>

      <!-- 右：预览 / 代码 -->
      <section class="min-w-0 flex-1">
        <PreviewPane :doc="doc" @toast="toast" />
      </section>
    </main>

    <!-- Toast -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="toastMsg"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
      >
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>
