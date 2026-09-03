<script setup>
// 行动按钮编辑器：<p><a class="cta-btn" href="…">文字</a></p>
defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-2 p-2">
    <input
      v-model="model.text"
      type="text"
      placeholder="按钮文字（如：Irontech Dollの商品一覧を見る）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
    />
    <input
      v-model="model.href"
      type="text"
      placeholder="跳转链接（href）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
    />
    <div class="flex items-center gap-2">
      <input
        v-model="model.className"
        type="text"
        placeholder="样式类名（默认 cta-btn）"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
      <label class="flex shrink-0 items-center gap-1 text-[11px] text-gray-500" title="勾选后包一层 <p>">
        <input v-model="model.wrapP" type="checkbox" class="accent-pink-500" />
        段落包裹
      </label>
    </div>
    <p v-if="model.text" class="pt-1">
      <a :class="model.className || 'cta-btn'" :href="model.href || '#'" class="cta-preview">{{ model.text }}</a>
    </p>
  </div>
</template>

<style scoped>
/* 仅在编辑器内预览按钮外观（站点样式由生成的 <style> 提供） */
.cta-preview.cta-btn {
  display: inline-block;
  margin-top: 0;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #ff4d7a, #ff7aa2);
}
.cta-preview:not(.cta-btn) {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid #d6d3d1;
  border-radius: 6px;
  font-size: 12px;
  color: #44403c;
  text-decoration: none;
  background: #fafaf9;
}
</style>
