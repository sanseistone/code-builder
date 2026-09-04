<script setup>
// 独立子标题编辑器（输出标签可选，默认 h3）
import { SUBHEADING_TAGS } from '../../types.js'

defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="p-2">
    <div class="flex items-center gap-2">
      <input
        v-model="model.text"
        type="text"
        placeholder="子标题文字"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
      />
      <select
        v-model="model.tag"
        class="rounded border border-gray-200 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
        title="输出的 HTML 标签"
      >
        <option v-for="t in SUBHEADING_TAGS" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
  </div>
</template>
