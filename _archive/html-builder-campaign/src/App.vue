<script setup>
import { ref } from 'vue'
import { TEMPLATES, createBlankTemplate } from './templates.js'
import { createNote, createSection } from './types.js'
import SectionCard from './components/SectionCard.vue'
import NoteEditor from './components/NoteEditor.vue'
import PreviewPane from './components/PreviewPane.vue'

// ---------- 状态 ----------
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const templateId = ref(TEMPLATES[0].id)
const config = ref(clone(TEMPLATES[0]))

const toastMsg = ref('')
let toastTimer = null
function toast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastMsg.value = ''), 1800)
}

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
function download(name, content, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
function exportConfig() {
  download('template-config.json', JSON.stringify(config.value, null, 2))
  toast('配置已导出')
}
function importConfig(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      if (!data.header || !Array.isArray(data.blocks)) throw new Error('bad format')
      config.value = data
      templateId.value = 'blank'
      toast('配置已导入（已切换为自定义模板）')
    } catch (err) {
      toast('导入失败：文件格式不正确')
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50 text-gray-800">
    <!-- 顶栏 -->
    <header class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
      <h1 class="whitespace-nowrap text-base font-bold text-gray-800">🎨 HTML 模板生成工具</h1>
      <select
        v-model="templateId"
        class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="切换母版"
        @change="switchTemplate(templateId)"
      >
        <option v-for="t in TEMPLATES" :key="t.id" :value="t.id">{{ t.name }}</option>
        <option value="blank">空白模板（自定义）</option>
      </select>
      <span class="hidden text-[11px] text-gray-400 md:inline">选择母版后内容会自动填入，可自由增删模块</span>
      <div class="ml-auto flex items-center gap-2">
        <label class="cursor-pointer rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100">
          📥 导入配置
          <input type="file" accept=".json" class="hidden" @change="importConfig" />
        </label>
        <button
          class="rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
          @click="exportConfig"
        >
          📤 导出配置
        </button>
      </div>
    </header>

    <!-- 主体 -->
    <main class="flex min-h-0 flex-1">
      <!-- 左：编辑区 -->
      <aside class="w-[560px] shrink-0 space-y-3 overflow-y-auto border-r border-gray-200 bg-white p-4">
        <!-- ① 大标题 -->
        <section class="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
          <h2 class="mb-2 text-xs font-semibold text-gray-600">① 大标题（固定第一位）</h2>
          <div class="flex items-center gap-2">
            <input
              v-model="config.header.icon"
              type="text"
              title="图标（可自定义，默认 🎉）"
              class="w-12 rounded border border-gray-300 px-1.5 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              v-model="config.header.title"
              type="text"
              placeholder="标题文本"
              class="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </section>

        <!-- ② 主体模块 -->
        <section>
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xs font-semibold text-gray-600">② 主体模块（说明 / 小标题块）</h2>
            <div class="flex gap-1">
              <button
                class="rounded border border-blue-300 px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50"
                @click="addBlock('note')"
              >
                ＋ 说明文字
              </button>
              <button
                class="rounded border border-red-300 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                @click="addBlock('section')"
              >
                ＋ 小标题块
              </button>
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
              <SectionCard v-else-if="block.type === 'section'" :model="block" :number="sectionNumber(i)" />

              <!-- 卡片工具栏 -->
              <div class="flex items-center justify-between border-t border-gray-100 pt-1.5">
                <span class="text-[10px] text-gray-400">
                  {{ block.type === 'note' ? '说明文字' : '小标题块' }} 第 {{ i + 1 }} 个
                </span>
                <div class="flex items-center gap-1">
                  <button
                    class="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    :disabled="i === 0"
                    title="上移"
                    @click="moveBlock(i, -1)"
                  >
                    ↑ 上移
                  </button>
                  <button
                    class="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    :disabled="i === config.blocks.length - 1"
                    title="下移"
                    @click="moveBlock(i, 1)"
                  >
                    ↓ 下移
                  </button>
                  <button
                    class="rounded border border-red-300 bg-white px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50"
                    title="删除该模块"
                    @click="removeBlock(i)"
                  >
                    ✕ 删除
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <p v-if="!config.blocks.length" class="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
              暂无主体模块，点击下方按钮添加
            </p>

            <!-- 底部醒目的添加区 -->
            <div class="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 p-3 text-center">
              <p class="mb-2 text-xs font-medium text-blue-500">＋ 添加模块（可随时增删、上下排序）</p>
              <div class="flex justify-center gap-2">
                <button
                  class="rounded border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                  @click="addBlock('note')"
                >
                  ＋ 说明文字
                </button>
                <button
                  class="rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  @click="addBlock('section')"
                >
                  ＋ 小标题块
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ③ 日期 -->
        <section>
          <h2 class="mb-2 text-xs font-semibold text-gray-600">③ 日期（固定位置）</h2>
          <div class="rounded-lg border border-gray-200 p-3">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" class="accent-blue-500" :checked="moduleEnabled('date')" @change="toggleModule('date', $event.target.checked)" />
              📅 日期
            </label>
            <input
              v-if="moduleEnabled('date')"
              v-model="config.date.text"
              type="text"
              placeholder="期間：…"
              class="mt-2 w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </section>
      </aside>

      <!-- 右：预览 / 代码 -->
      <section class="min-w-0 flex-1">
        <PreviewPane :config="config" @toast="toast" />
      </section>
    </main>

    <!-- Toast -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-2"
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
