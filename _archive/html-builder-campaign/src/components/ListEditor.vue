<script setup>
// 价格列表编辑器
defineProps({
  model: { type: Object, required: true }, // { items: [{name, price, note, noteColor}] }
})

function addItem(m) {
  m.items.push({ name: '', price: '', note: '', noteColor: 'gray' })
}
function removeItem(m, i) {
  m.items.splice(i, 1)
}
</script>

<template>
  <div class="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-amber-600">📋 价格列表</span>
      <button
        class="rounded border border-amber-300 px-2 py-0.5 text-xs text-amber-600 hover:bg-amber-100"
        @click="addItem(model)"
      >
        ＋ 添加条目
      </button>
    </div>
    <div v-for="(item, i) in model.items" :key="i" class="space-y-1.5 rounded bg-white border border-amber-100 p-2">
      <div class="flex items-center gap-2">
        <input
          v-model="item.name"
          type="text"
          placeholder="名称（如：植毛（人工毛））"
          class="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <input
          v-model="item.price"
          type="text"
          placeholder="价格（如：20,000円）"
          class="w-28 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <button
          class="shrink-0 rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-500"
          title="删除条目"
          @click="removeItem(model, i)"
        >
          ✕
        </button>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="item.note"
          type="text"
          placeholder="备注（如：通常40,000円 → 半額）"
          class="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <label class="flex items-center gap-1 text-[11px] text-gray-500">
          <input v-model="item.noteColor" type="checkbox" class="accent-red-500" true-value="red" false-value="gray" />
          红色加粗
        </label>
      </div>
    </div>
  </div>
</template>
