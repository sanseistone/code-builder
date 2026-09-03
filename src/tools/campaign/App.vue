<script setup>
// ============================================================
// 活动页模板生成工具 · 主界面
// 左：可视化编辑（大标题 / 主体模块 / 日期）
// 右：实时预览 / HTML 代码
//
// 页面骨架、Toast、导入导出、预览面板均来自共享层，
// 这里只保留活动页工具自身的业务逻辑。
// ============================================================
import { ref } from 'vue'
import { ToolShell, PreviewPane, useToast, useImportExport, clone } from '@shared'
import { TEMPLATES, createBlankTemplate } from './templates.js'
import { createNote, createSection } from './types.js'
import { generatePreviewDoc, generateHtml } from './generator.js'
import SectionCard from './components/SectionCard.vue'
import NoteEditor from './components/NoteEditor.vue'

const { message: toastMsg, show: toast } = useToast()

// ---------- 状态 ----------
const templateId = ref(TEMPLATES[0].id)
const config = ref(clone(TEMPLATES[0]))

// ---------- 模板切换 ----------
function switchTemplate(id) {
  templateId.value = id
  if (id === 'blank') {
    config.value = createBlankTemplate()
  } else {
    const t = TEMPLATES.find((x) => x.id === id)
    if (t) config.value = clone(t)
  }
}

// ---------- 主体 blocks 管理 ----------
function addBlock(type) {
  if (type === 'note') config.value.blocks.push(createNote(['']))
  else if (type === 'section') config.value.blocks.push(createSection())
}
function removeBlock(i) {
  config.value.blocks.splice(i, 1)
}
function moveBlock(i, dir) {
  const target = i + dir
  if (target < 0 || target >= config.value.blocks.length) return
  const arr = config.value.blocks
  ;[arr[i], arr[target]] = [arr[target], arr[i]]
}

// section 的显示序号（只对 showNumber 的 section 递增）
function sectionNumber(i) {
  let n = 0
  for (let k = 0; k <= i; k++) {
    const b = config.value.blocks[k]
    if (b.type === 'section' && b.showNumber) n++
  }
  return n
}

// ---------- 尾部可选模块（date / footerNote / link） ----------
function moduleEnabled(key) {
  return !!config.value[key]
}
function toggleModule(key, on) {
  if (on && !config.value[key]) config.value[key] = { text: '' }
  if (!on) config.value[key] = null
}

// ---------- 导出 / 导入 ----------
const { exportConfig, importConfig } = useImportExport({
  getData: () => config.value,
  setData: (data) => {
    config.value = data
    templateId.value = 'blank'
  },
  validate: (data) => !!data.header && Array.isArray(data.blocks),
  fileName: 'template-config',
  messages: { imported: '配置已导入（已切换为自定义模板）' },
})
</script>

<template>
  <ToolShell
    title="🎨 HTML 模板生成工具"
    hint="选择母版后内容会自动填入，可自由增删模块"
    aside-width="35rem"
    :message="toastMsg"
  >
    <template #actions>
      <select
        v-model="templateId"
        class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="切换母版"
        @change="switchTemplate(templateId)"
      >
        <option v-for="t in TEMPLATES" :key="t.id" :value="t.id">{{ t.name }}</option>
        <option value="blank">空白模板（自定义）</option>
      </select>

      <label class="btn btn--ghost cursor-pointer">
        📥 导入配置
        <input type="file" accept=".json" class="hidden" @change="importConfig($event, toast)" />
      </label>
      <button class="btn btn--ghost" @click="exportConfig(toast)">📤 导出配置</button>
    </template>

    <template #aside>
      <div class="space-y-3 p-4">
        <!-- ① 大标题 -->
        <section class="panel panel--sunken">
          <h2 class="panel__title">① 大标题（固定第一位）</h2>
          <div class="flex items-center gap-2">
            <input
              v-model="config.header.icon"
              type="text"
              title="图标（可自定义，默认 🎉）"
              class="field field--lg w-12 text-center"
            />
            <input
              v-model="config.header.title"
              type="text"
              placeholder="标题文本"
              class="field field--lg flex-1"
            />
          </div>
        </section>

        <!-- ② 主体模块 -->
        <section>
          <div class="mb-2 flex items-center justify-between">
            <h2 class="panel__title mb-0">② 主体模块（说明 / 小标题块）</h2>
            <div class="flex gap-1">
              <button class="btn btn--sm btn--primary" @click="addBlock('note')">＋ 说明文字</button>
              <button class="btn btn--sm btn--danger" @click="addBlock('section')">＋ 小标题块</button>
            </div>
          </div>

          <div class="space-y-3">
            <!-- 每张模块卡片：编辑器 + 底部工具栏（上移/下移/删除） -->
            <div
              v-for="(block, i) in config.blocks"
              :key="i"
              class="space-y-1.5 rounded-lg border border-dashed border-gray-300 bg-white p-1.5"
            >
              <NoteEditor v-if="block.type === 'note'" :model="block" />
              <SectionCard
                v-else-if="block.type === 'section'"
                :model="block"
                :number="sectionNumber(i)"
              />

              <!-- 卡片工具栏 -->
              <div class="flex items-center justify-between border-t border-gray-100 pt-1.5">
                <span class="text-[10px] text-gray-400">
                  {{ block.type === 'note' ? '说明文字' : '小标题块' }} 第 {{ i + 1 }} 个
                </span>
                <div class="flex items-center gap-1">
                  <button class="btn btn--xs" :disabled="i === 0" title="上移" @click="moveBlock(i, -1)">
                    ↑ 上移
                  </button>
                  <button
                    class="btn btn--xs"
                    :disabled="i === config.blocks.length - 1"
                    title="下移"
                    @click="moveBlock(i, 1)"
                  >
                    ↓ 下移
                  </button>
                  <button class="btn btn--xs btn--danger" title="删除该模块" @click="removeBlock(i)">
                    ✕ 删除
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <p v-if="!config.blocks.length" class="dashed-zone text-center text-xs text-gray-400">
              暂无主体模块，点击下方按钮添加
            </p>

            <!-- 底部醒目的添加区 -->
            <div class="dashed-zone">
              <p class="dashed-zone__hint">＋ 添加模块（可随时增删、上下排序）</p>
              <div class="flex justify-center gap-2">
                <button class="btn btn--primary" @click="addBlock('note')">＋ 说明文字</button>
                <button class="btn btn--danger" @click="addBlock('section')">＋ 小标题块</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ③ 日期 -->
        <section>
          <h2 class="panel__title">③ 日期（固定位置）</h2>
          <div class="panel">
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                class="accent-blue-500"
                :checked="moduleEnabled('date')"
                @change="toggleModule('date', $event.target.checked)"
              />
              📅 日期
            </label>
            <input
              v-if="moduleEnabled('date')"
              v-model="config.date.text"
              type="text"
              placeholder="期間：…"
              class="field mt-2"
            />
          </div>
        </section>
      </div>
    </template>

    <!-- 右：预览 / 代码 -->
    <PreviewPane
      :source="config"
      :generate-preview-doc="generatePreviewDoc"
      :generate-html="generateHtml"
      file-name="campaign"
      @toast="toast"
    />
  </ToolShell>
</template>
