<script setup>
import { ref } from 'vue'

// 胶囊标签组编辑器
const props = defineProps({
  model: { type: Object, required: true }, // { items: [] }
})

const bulkText = ref('')

function addItem(m) {
  m.items.push('')
}
function removeItem(m, i) {
  m.items.splice(i, 1)
}
// 批量添加：按空格（含全角空格）拆分文本，自动追加为多个标签
function addBulk() {
  const parts = bulkText.value
    .split(/[\s\u3000]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length) {
    props.model.items.push(...parts)
    bulkText.value = ''
  }
}
</script>

<template>
  <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-emerald-600">🏷️ 标签组</span>
      <button
        class="rounded border border-emerald-300 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-100"
        @click="addItem(model)"
      >
        ＋ 添加标签
      </button>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <div
        v-for="(item, i) in model.items"
        :key="i"
        class="flex items-center gap-1 rounded-full bg-white pl-3 pr-1.5 py-1 border border-emerald-200"
      >
        <input
          v-model="model.items[i]"
          type="text"
          placeholder="标签内容"
          class="w-24 bg-transparent text-xs focus:outline-none"
        />
        <button
          class="rounded-full text-emerald-400 hover:bg-emerald-100 hover:text-red-500 w-4 h-4 text-xs leading-none"
          title="删除标签"
          @click="removeItem(model, i)"
        >
          ✕
        </button>
      </div>
    </div>
    <!-- 批量添加：空格分隔 -->
    <div class="flex items-center gap-1.5">
      <input
        v-model="bulkText"
        type="text"
        placeholder="批量添加：用空格分隔，如「A B C」自动拆成 3 个标签"
        class="min-w-0 flex-1 rounded border border-emerald-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
        @keydown.enter="addBulk"
      />
      <button
        class="shrink-0 rounded border border-emerald-400 bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600"
        @click="addBulk"
      >
        拆分添加
      </button>
    </div>
  </div>
</template>
