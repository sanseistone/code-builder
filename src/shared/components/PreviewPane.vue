<script setup>
// ============================================================
// 右侧面板：实时预览 / HTML 代码 / 复制 / 下载
// 两个工具的 PreviewPane 实现逐字相同，仅「数据来源」与「文件名策略」不同，
// 这里把差异抽象成 props，生成器由各工具注入，组件本身不再依赖任何具体工具。
// ============================================================
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { downloadHtml } from '../utils/download.js'
import { copyText } from '../utils/clipboard.js'

// 预览文档用 srcdoc 注入 iframe，它会继承「父页面 URL」作为基准 URL。
// 工具页位于 <root>/tools/<id>/，而 vendor/ 在站点根，
// 直接写 src="vendor/..." 会被解析成 /tools/<id>/vendor/... → 404。
// 因此显式注入 <base>，把基准统一指回站点根。
//   在线构建：BASE_URL 即站点根（'/' 或子路径部署的 '/xxx/'）
//   离线构建：base 为 './'，产物固定在 <root>/tools/<id>/index.html，需回退两级
//             （布局由 scripts/build-offline.mjs 决定，改动时需同步此处）
const PREVIEW_BASE = import.meta.env.BASE_URL === './' ? '../../' : import.meta.env.BASE_URL

const props = defineProps({
  // 当前编辑的数据（doc / config 等任意对象）
  source: { type: Object, required: true },
  // 生成器：由各工具注入，保持组件通用
  generatePreviewDoc: { type: Function, required: true },
  generateHtml: { type: Function, required: true },
  // 下载文件名：字符串，或根据 source 计算的函数
  fileName: { type: [String, Function], default: 'template' },
})
const emit = defineEmits(['toast'])

const tab = ref('preview')
const previewDoc = ref('')
const code = ref('')
const frame = ref(null)

// 在 <head> 后插入 <base>，修正 srcdoc 里的相对路径解析
const framedDoc = computed(() =>
  previewDoc.value.replace(/<head\b[^>]*>/i, (tag) => `${tag}<base href="${PREVIEW_BASE}">`)
)

// ---------- 编辑区 ↔ 预览联动 ----------
// 预览文档内注入的脚本监听 preview:focus-block，定位到目标元素后滚动并高亮，
// 再回传 preview:focus-result。预览文档没有该脚本时（如其它工具）消息无人接收，无副作用。
const FOCUS_WINDOW = 1500 // srcdoc 重载后仍可补发的时间窗口
const RETRY_DELAY = 600 // 未找到时等待「预览重渲染」的判定时间

let pendingUid = ''
let pendingAt = 0

function postFocus(uid) {
  const win = frame.value && frame.value.contentWindow
  if (!win) return
  win.postMessage({ type: 'preview:focus-block', uid }, '*')
}

// 供父级通过 ref 调用：切到预览页签，把指定元素滚动到可视区域并高亮
function focusBlock(uid) {
  if (!uid) return
  tab.value = 'preview'
  pendingUid = uid
  pendingAt = Date.now()
  postFocus(uid)
}

// srcdoc 变化会触发 load。若高亮请求恰在重载期间发出（例如刚新增区块、预览尚未渲染），在此补发
function onFrameLoad() {
  if (pendingUid && Date.now() - pendingAt < FOCUS_WINDOW) postFocus(pendingUid)
}

function onMessage(e) {
  const d = e.data
  if (!d || d.type !== 'preview:focus-result' || d.uid !== pendingUid) return
  if (d.found) {
    pendingUid = ''
    return
  }
  // 未找到：可能是预览正在重渲染，等补发一轮再判定，避免误报
  setTimeout(() => {
    if (pendingUid !== d.uid) return // 期间已补发成功
    pendingUid = ''
    emit('toast', '该区块暂无可预览的内容')
  }, RETRY_DELAY)
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

defineExpose({ focusBlock })

let timer = null
function update() {
  previewDoc.value = props.generatePreviewDoc(props.source)
  code.value = props.generateHtml(props.source)
}

watch(
  () => props.source,
  () => {
    clearTimeout(timer)
    timer = setTimeout(update, 250)
  },
  { deep: true, immediate: true }
)

onBeforeUnmount(() => clearTimeout(timer))

function resolveFileName() {
  return typeof props.fileName === 'function' ? props.fileName(props.source) : props.fileName
}

async function copyCode() {
  const ok = await copyText(code.value)
  emit('toast', ok ? '代码已复制到剪贴板' : '复制失败，请手动选择复制')
}

function onDownloadHtml() {
  const name = downloadHtml(code.value, resolveFileName())
  emit('toast', `已下载 ${name}`)
}
</script>

<template>
  <div class="pane">
    <div class="pane__bar">
      <button
        class="pane__tab"
        :class="{ 'pane__tab--active': tab === 'preview' }"
        @click="tab = 'preview'"
      >
        实时预览
      </button>
      <button class="pane__tab" :class="{ 'pane__tab--active': tab === 'code' }" @click="tab = 'code'">
        HTML 代码
      </button>
      <div class="pane__actions">
        <button class="btn btn--primary" @click="copyCode">📋 复制代码</button>
        <button class="btn btn--success" @click="onDownloadHtml">⬇ 下载 HTML</button>
      </div>
    </div>

    <div v-show="tab === 'preview'" class="pane__stage">
      <iframe
        ref="frame"
        :srcdoc="framedDoc"
        class="pane__frame"
        title="预览"
        @load="onFrameLoad"
      ></iframe>
    </div>

    <div v-show="tab === 'code'" class="pane__code">
      <pre><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
