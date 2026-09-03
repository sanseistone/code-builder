<script setup>
// ============================================================
// 带行内标记工具栏的多行文本框
// 支持：**粗体** / __下划线__ / ==高亮== / [文字](链接)
// ============================================================
import { ref, nextTick } from 'vue'
import { wrapSelection } from '../utils.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const ta = ref(null)

function apply(before, after, placeholder) {
  const el = ta.value
  if (!el) return
  const res = wrapSelection(
    props.modelValue,
    el.selectionStart,
    el.selectionEnd,
    before,
    after,
    placeholder
  )
  emit('update:modelValue', res.text)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(res.start, res.end)
  })
}

const TOOLS = [
  { label: 'B', title: '粗体 **文字**', cls: 'font-bold', before: '**', after: '**', ph: '文字' },
  {
    label: 'U',
    title: '下划线 __文字__',
    cls: 'underline',
    before: '__',
    after: '__',
    ph: '文字',
  },
  { label: 'H', title: '高亮 ==文字==', cls: '', before: '==', after: '==', ph: '文字' },
  { label: '🔗', title: '链接 [文字](URL)', cls: '', before: '[', after: '](https://)', ph: '文字' },
]
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div class="flex items-center gap-1 border-b border-gray-100 px-2 py-1">
      <button
        v-for="t in TOOLS"
        :key="t.label"
        type="button"
        class="flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        :class="t.cls"
        :title="t.title"
        @click="apply(t.before, t.after, t.ph)"
      >
        {{ t.label }}
      </button>
      <span class="ml-auto text-[10px] text-gray-300">换行 = &lt;br&gt;</span>
    </div>
    <textarea
      ref="ta"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full resize-y rounded-b-lg px-2.5 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-200"
      @input="emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>
