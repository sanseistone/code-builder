<script setup>
// 正文段落编辑器
import RichTextarea from '../RichTextarea.vue'

defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-1.5 p-2">
    <RichTextarea
      v-model="model.text"
      :rows="3"
      placeholder="正文内容（支持 **粗体** __下划线__ ==高亮== [文字](链接)）"
    />
  </div>
</template>
