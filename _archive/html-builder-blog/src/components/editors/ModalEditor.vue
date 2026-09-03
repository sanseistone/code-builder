<script setup>
// PDF 弹窗编辑器：触发按钮 + Bootstrap modal 结构
defineProps({ model: { type: Object, required: true } })

const SIZES = ['modal-xl', 'modal-lg', 'modal-sm', '']
const SIZE_LABEL = {
  'modal-xl': 'modal-xl（超大）',
  'modal-lg': 'modal-lg（大）',
  'modal-sm': 'modal-sm（小）',
  '': '默认宽度',
}
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0 text-[11px] text-gray-500">触发按钮</span>
      <input
        v-model="model.btnText"
        type="text"
        placeholder="按钮文字（如：取扱説明書（PDF））"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0 text-[11px] text-gray-500">按钮类名</span>
      <input
        v-model="model.btnClass"
        type="text"
        placeholder="btn btn-primary"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0 text-[11px] text-gray-500">弹窗标题</span>
      <input
        v-model="model.title"
        type="text"
        placeholder="弹窗内标题（留空则用按钮文字）"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0 text-[11px] text-gray-500">PDF 地址</span>
      <input
        v-model="model.src"
        type="text"
        placeholder="https://…/xxx.pdf"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0 text-[11px] text-gray-500">弹窗 id</span>
      <input
        v-model="model.modalId"
        type="text"
        placeholder="pdfModal"
        class="w-32 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      />
      <select
        v-model="model.size"
        class="min-w-0 flex-1 rounded border border-gray-200 px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-200"
      >
        <option v-for="s in SIZES" :key="s" :value="s">{{ SIZE_LABEL[s] }}</option>
      </select>
    </div>
    <p class="text-[10px] leading-relaxed text-gray-400">
      触发依赖站点全局函数 <code>showModalById('{{ model.modalId || 'pdfModal' }}')</code>，预览面板已内置等价实现可直接点开验证。
    </p>
  </div>
</template>
