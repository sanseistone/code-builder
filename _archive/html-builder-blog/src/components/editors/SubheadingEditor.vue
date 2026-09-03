<script setup>
// 独立子标题编辑器（H3，不带 section 容器）
defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="p-2">
    <input
      v-model="model.text"
      type="text"
      placeholder="子标题文字（H3）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
    />
  </div>
</template>
