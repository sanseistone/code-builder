<script setup>
// 蓝色说明文字编辑器（多行）
defineProps({
  model: { type: Object, required: true }, // { bold, lines: [] }
})

function addLine(m) {
  m.lines.push('')
}
function removeLine(m, i) {
  m.lines.splice(i, 1)
}
</script>

<template>
  <div class="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-blue-600">💬 说明文字</span>
      <label class="flex items-center gap-1 text-xs text-gray-600">
        <input v-model="model.bold" type="checkbox" class="accent-blue-500" />
        加粗
      </label>
    </div>
    <div v-for="(line, i) in model.lines" :key="i" class="flex items-center gap-2">
      <input
        v-model="model.lines[i]"
        type="text"
        placeholder="※ 输入说明内容…"
        class="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        class="shrink-0 rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-500"
        title="删除此行"
        @click="removeLine(model, i)"
      >
        ✕
      </button>
    </div>
    <button
      class="rounded border border-dashed border-blue-300 px-2 py-1 text-xs text-blue-500 hover:bg-blue-100"
      @click="addLine(model)"
    >
      ＋ 添加一行
    </button>
  </div>
</template>
