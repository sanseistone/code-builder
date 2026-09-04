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
// select-block：预览中被点击的区块 uid（用于左侧编辑区反向定位）
const emit = defineEmits(['toast', 'select-block'])

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

// 常驻高亮的区块：与左侧编辑区的激活态一致，预览重载后要补发
let activeUid = ''

function postActive(uid) {
  const win = readFrameWindow()
  if (win) win.postMessage({ type: 'preview:set-active', uid: uid || '' }, '*')
}

// 供父级调用：把「当前正在编辑的区块」同步到预览，持续高亮
function setActiveBlock(uid) {
  activeUid = uid || ''
  postActive(activeUid)
}

// srcdoc 变化会触发 load。若高亮请求恰在重载期间发出（例如刚新增区块、预览尚未渲染），在此补发
function onFrameLoad() {
  restoreScrollY()
  if (activeUid) postActive(activeUid)
  if (pendingUid && Date.now() - pendingAt < FOCUS_WINDOW) postFocus(pendingUid)
}

function onMessage(e) {
  const d = e.data
  if (!d) return
  // 点击预览里的区块 → 交给工具页把左侧编辑区滚到对应卡片
  if (d.type === 'preview:select-block' && d.uid) {
    emit('select-block', d.uid)
    return
  }
  if (d.type !== 'preview:focus-result' || d.uid !== pendingUid) return
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

defineExpose({ focusBlock, setActiveBlock })

// ---------- 预览重建时保持滚动位置 ----------
// srcdoc 一变，iframe 就是一次整页重载，滚动位置会归零 ——
// 表现为「刚编辑两下，预览就跳回顶部的目次」。
// 因此重建前记下 scrollY，加载完成后还原。
// 主动定位（focusBlock）后预览已滚到目标区块，此时记下的是目标位置，
// 还原同样正确；若定位请求仍在窗口期内，onFrameLoad 会先还原、再补发定位。
let savedScrollY = null

function readFrameWindow() {
  return frame.value && frame.value.contentWindow
}

function saveScrollY() {
  const win = readFrameWindow()
  savedScrollY = win ? win.scrollY : null
}

function restoreScrollY() {
  if (savedScrollY == null) return
  const y = savedScrollY
  savedScrollY = null
  const win = readFrameWindow()
  if (!win) return
  win.scrollTo(0, y)
  // 运行时 Tailwind 注入样式后文档高度会变，下一帧再校正一次
  if (win.requestAnimationFrame) win.requestAnimationFrame(() => win.scrollTo(0, y))
}

let timer = null
function update() {
  saveScrollY()
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
