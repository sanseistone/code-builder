<script setup>
// 引用框编辑器（.insight-box）
import RichTextarea from '../RichTextarea.vue'

defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-1.5 p-2">
    <RichTextarea v-model="model.text" :rows="3" placeholder="引用框内容（可多行）" />
  </div>
</template>
