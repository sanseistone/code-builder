<script setup>
// ============================================================
// 文章模板生成工具 · 主界面
// 左：可视化编辑（目次 + 区块列表，支持拖拽排序）
// 右：实时预览 / HTML 代码
//
// 页面骨架、Toast、导入导出、本地自动保存、预览面板均来自共享层，
// 这里只保留文章工具自身的业务逻辑。
// ============================================================
import { ref, provide, watch, onMounted, onBeforeUnmount } from 'vue'
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
const TEMPLATE_KEY = 'article-template-id'

// toastMsg 供模板绑定，toast 是显示提示的函数
const { message: toastMsg, show: toast } = useToast()

// ---------- 状态（含本地自动保存 / 恢复）----------
// 当前选中的模板也要一起存档：只存文档的话，刷新后内容恢复了、
// 顶部的模板下拉却回到列表第一项，看起来就像「选错模板」。
const {
  state: templateId,
  restore: restoreTemplateId,
  clearStorage: clearTemplateId,
} = usePersistentState(TEMPLATE_KEY, () => TEMPLATES[0].id)
const { state: doc, restore, clearStorage } = usePersistentState(
  STORAGE_KEY,
  () => makeTemplate(TEMPLATES[0].id),
  normalizeDoc
)

// 内容指纹：忽略 uid（每次创建区块都会变），只比对真实内容
function fingerprint(d) {
  return JSON.stringify(d, (key, value) => (key === 'uid' ? undefined : value))
}

onMounted(() => {
  const hadTemplate = restoreTemplateId()
  const hadDoc = restore()

  if (!hadDoc) {
    // 只有模板记录、没有文档（极少见）：按记录重建，避免两者各说各话
    if (hadTemplate && templateId.value !== TEMPLATES[0].id && TEMPLATES.some((t) => t.id === templateId.value)) {
      doc.value = makeTemplate(templateId.value)
    }
    return
  }

  toast('已恢复上次的编辑内容')
  // 自模板加载后内容被改过 → 归到「当前自定义内容」，别再显示原模板名。
  // 两边都过一遍 normalizeDoc，保证字段与键顺序一致，比较才有意义。
  const id = templateId.value
  const pristine = TEMPLATES.some((t) => t.id === id)
    ? fingerprint(normalizeDoc(makeTemplate(id)))
    : null
  if (pristine !== null && fingerprint(doc.value) !== pristine) {
    templateId.value = 'custom'
  }
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
  // 先清存档（会一并取消挂起的防抖保存），再重置界面，避免重置后又被写回
  clearStorage()
  clearTemplateId()
  templateId.value = 'blank'
  doc.value = makeTemplate('blank')
  toast('已重置为空白模板')
}

// ---------- 编辑区 ↔ 预览联动 ----------
// 区块卡片可递归嵌套（章节内含子区块），用 provide/inject 让任意深度的卡片
// 都能直接通知预览滚动定位，无需层层 emit。
//
// 两个工具共用：点击卡片头部、聚焦字段都会定位到预览对应区块。
// 预览因编辑而重建时，PreviewPane 会自己保持滚动位置，不会跳回顶部。
const previewRef = ref(null)
const activeUid = ref('') // 当前正在编辑的区块，用于左侧卡片高亮

function focusBlock(uid) {
  activeUid.value = uid
  previewRef.value?.focusBlock(uid)
}

provide('focusBlock', focusBlock)
provide('activeUid', activeUid)

// 激活态同步到预览：左侧正在编辑的区块，在预览里也保持常驻高亮边框
watch(activeUid, (uid) => previewRef.value?.setActiveBlock(uid))

// ---------- 预览 → 编辑区（反向联动）----------
// 点预览里的某个区块时，把左侧编辑区滚到对应卡片。
// 卡片挂载时把自己的根元素登记进这里，定位时直接查表，不必递归组件树。
const cardEls = new Map() // uid → 卡片根元素
provide('cardRegistry', cardEls)

// 滚动到位后再闪一下，给出「就是这一块」的即时反馈
const flashUid = ref('')
provide('flashUid', flashUid)

/** 向上找第一个可滚动的祖先（左侧编辑面板） */
function scrollableAncestor(el) {
  let node = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

// 整章卡片常常比可视区还高，此时居中滚动会把章节标题顶出视口，
// 看起来就像只定位到了标题。所以：装得下就居中，装不下就对齐顶部，
// 从章节标题开始，能连着看到下面的内容。
function scrollCardIntoView(el) {
  const container = scrollableAncestor(el)
  if (!container || el.offsetHeight <= container.clientHeight) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const top =
    el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  container.scrollTo({ top: Math.max(top - 12, 0), behavior: 'smooth' })
}

let flashTimer = null
function selectBlockFromPreview(uid) {
  if (!uid) return
  activeUid.value = uid // 只记激活态：预览本来就停在那儿，不必再滚一次
  const el = cardEls.get(uid)
  if (el) scrollCardIntoView(el)
  flashUid.value = uid
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashUid.value = ''
  }, 1200)
}

onBeforeUnmount(() => clearTimeout(flashTimer))
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
          </div>
          <p class="mt-1.5 text-[10px] leading-relaxed text-gray-400">
            产出代码开头自带一段内联样式（普通 CSS，.article-* 前缀，只作用于本文内容），自包含、零依赖，直接粘到站点即可生效。
          </p>
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
      @select-block="selectBlockFromPreview"
    />
  </ToolShell>
</template>
