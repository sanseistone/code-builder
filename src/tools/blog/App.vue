<script setup>
// ============================================================
// 文章模板生成工具 · 主界面
// 左：可视化编辑（目次 + 区块列表，支持拖拽排序）
// 右：实时预览 / HTML 代码
//
// 页面骨架、Toast、导入导出、本地自动保存、预览面板均来自共享层，
// 这里只保留文章工具自身的业务逻辑。
// ============================================================
import { ref, provide, onMounted } from 'vue'
import {
  ToolShell,
  PreviewPane,
  DragList,
  useToast,
  useImportExport,
  usePersistentState,
} from '@shared'
import { TEMPLATES, makeTemplate } from './templates.js'
import { BLOCK_META, TOP_BLOCK_TYPES, createBlock, nextSectionId, nextModalId } from './types.js'
import { generatePreviewDoc, generateHtml } from './generator.js'
import { normalizeDoc } from './doc.js'
import BlockCard from './components/BlockCard.vue'
import TocEditor from './components/TocEditor.vue'

const STORAGE_KEY = 'article-template-doc'

// toastMsg 供模板绑定，toast 是显示提示的函数
const { message: toastMsg, show: toast } = useToast()

// ---------- 状态（含本地自动保存 / 恢复）----------
const templateId = ref(TEMPLATES[0].id)
const { state: doc, restore, clearStorage } = usePersistentState(
  STORAGE_KEY,
  () => makeTemplate(TEMPLATES[0].id),
  normalizeDoc
)

onMounted(() => {
  if (restore()) toast('已恢复上次的编辑内容')
})

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
const { exportConfig, importConfig } = useImportExport({
  getData: () => doc.value,
  setData: (data) => {
    doc.value = normalizeDoc(data)
    templateId.value = 'custom'
  },
  validate: (data) => Array.isArray(data.blocks),
  fileName: 'article-config',
})

function resetAll() {
  doc.value = makeTemplate(templateId.value === 'custom' ? 'blank' : templateId.value)
  templateId.value = 'blank'
  clearStorage()
  toast('已重置为空白模板')
}

// ---------- 编辑区 ↔ 预览联动 ----------
// 区块卡片可递归嵌套（章节内含子区块），用 provide/inject 让任意深度的卡片
// 都能直接通知预览滚动定位，无需层层 emit。
const previewRef = ref(null)
const activeUid = ref('') // 当前正在编辑的区块，用于左侧卡片高亮

function focusBlock(uid) {
  activeUid.value = uid
  previewRef.value?.focusBlock(uid)
}

provide('focusBlock', focusBlock)
provide('activeUid', activeUid)
</script>

<template>
  <ToolShell title="📝 文章模板生成工具" :message="toastMsg">
    <template #actions>
      <select
        v-model="templateId"
        class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="切换模板"
        @change="switchTemplate(templateId)"
      >
        <option v-for="t in TEMPLATES" :key="t.id" :value="t.id">{{ t.name }}</option>
        <option v-if="templateId === 'custom'" value="custom">当前自定义内容</option>
      </select>

      <label class="btn btn--ghost cursor-pointer">
        📥 导入配置
        <input type="file" accept=".json" class="hidden" @change="importConfig($event, toast)" />
      </label>
      <button class="btn btn--ghost" @click="exportConfig(toast)">📤 导出配置</button>
      <button class="btn btn--danger" @click="resetAll">🗑 重置</button>
    </template>

    <template #aside>
      <div class="space-y-3 p-4">
        <!-- 文章设置 -->
        <section class="panel panel--sunken">
          <h2 class="panel__title">⓪ 文章设置</h2>
          <div class="flex items-center gap-2">
            <input
              v-model="doc.title"
              type="text"
              placeholder="文章标题（用于下载文件名，不输出到代码）"
              class="field min-w-0 flex-1"
            />
            <label
              class="flex shrink-0 items-center gap-1 text-[11px] text-gray-500"
              title="生成的代码顶部是否附带全局样式"
            >
              <input v-model="doc.includeStyle" type="checkbox" class="accent-blue-500" />
              输出 &lt;style&gt;
            </label>
          </div>
        </section>

        <!-- 目次 -->
        <TocEditor :doc="doc" />

        <!-- 区块列表 -->
        <section>
          <h2 class="panel__title">② 正文区块（{{ doc.blocks.length }} 项，拖拽 ⠿ 排序）</h2>

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
          <div class="dashed-zone mt-3">
            <p class="dashed-zone__hint">＋ 添加区块</p>
            <div class="flex flex-wrap justify-center gap-1.5">
              <button
                v-for="t in TOP_BLOCK_TYPES"
                :key="t"
                class="btn btn--sm btn--primary"
                @click="addBlock(t)"
              >
                ＋{{ BLOCK_META[t].name }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- 右：预览 / 代码 -->
    <PreviewPane
      ref="previewRef"
      :source="doc"
      :generate-preview-doc="generatePreviewDoc"
      :generate-html="generateHtml"
      :file-name="(d) => d.title || 'article'"
      @toast="toast"
    />
  </ToolShell>
</template>
