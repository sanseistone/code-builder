<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { generatePreviewDoc, generateHtml } from '../generator.js'

const props = defineProps({
  config: { type: Object, required: true },
})
const emit = defineEmits(['toast'])

const tab = ref('preview')
const previewDoc = ref('')
const code = ref('')

let timer = null
function update() {
  previewDoc.value = generatePreviewDoc(props.config)
  code.value = generateHtml(props.config)
}
watch(
  () => props.config,
  () => {
    clearTimeout(timer)
    timer = setTimeout(update, 250)
  },
  { deep: true, immediate: true }
)

onBeforeUnmount(() => clearTimeout(timer))

async function copyCode() {
  try {
    await navigator.clipboard.writeText(code.value)
    emit('toast', '代码已复制到剪贴板')
  } catch (e) {
    // file:// 等环境 clipboard API 不可用时降级
    const ta = document.createElement('textarea')
    ta.value = code.value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    emit('toast', ok ? '代码已复制到剪贴板' : '复制失败，请手动选择复制')
  }
}

function downloadHtml() {
  const blob = new Blob([code.value], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'campaign.html'
  a.click()
  URL.revokeObjectURL(url)
  emit('toast', 'HTML 文件已下载')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 工具栏 -->
    <div class="flex items-center gap-1 border-b border-gray-200 bg-white px-3 py-2">
      <button
        class="rounded px-3 py-1 text-sm"
        :class="tab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="tab = 'preview'"
      >
        实时预览
      </button>
      <button
        class="rounded px-3 py-1 text-sm"
        :class="tab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="tab = 'code'"
      >
        HTML 代码
      </button>
      <div class="ml-auto flex gap-2">
        <button
          class="rounded border border-blue-300 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50"
          @click="copyCode"
        >
          📋 复制代码
        </button>
        <button
          class="rounded border border-green-300 px-2.5 py-1 text-xs text-green-600 hover:bg-green-50"
          @click="downloadHtml"
        >
          ⬇ 下载 HTML
        </button>
      </div>
    </div>

    <!-- 预览 -->
    <div v-if="tab === 'preview'" class="min-h-0 flex-1 bg-gray-100 p-4">
      <iframe
        :srcdoc="previewDoc"
        class="h-full w-full rounded-lg border border-gray-200 bg-white shadow"
      ></iframe>
    </div>

    <!-- 代码 -->
    <div v-else class="min-h-0 flex-1 overflow-auto bg-gray-900 p-4">
      <pre class="text-xs leading-relaxed text-gray-100 whitespace-pre-wrap break-all"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
