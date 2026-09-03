<script setup>
// 图片 / 头图编辑器
defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-2 p-2">
    <input
      v-model="model.src"
      type="text"
      placeholder="图片 URL（src）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
    <input
      v-model="model.alt"
      type="text"
      placeholder="替代文本（alt）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
    <div class="flex items-center gap-2">
      <input
        v-model="model.width"
        type="text"
        placeholder="宽"
        class="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <input
        v-model="model.height"
        type="text"
        placeholder="高"
        class="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <label class="flex items-center gap-1 text-[11px] text-gray-500" title="外层包 <div class='article-banner'>">
        <input v-model="model.banner" type="checkbox" class="accent-sky-500" />
        头图模式
      </label>
      <label
        v-if="!model.banner"
        class="flex items-center gap-1 text-[11px] text-gray-500"
        title="输出 <p><img …></p>，即 demo-01 中正文图片的写法；不勾选则包 <div class='article-image'>"
      >
        <input v-model="model.wrapP" type="checkbox" class="accent-sky-500" />
        段落内包裹（&lt;p&gt;）
      </label>
    </div>
    <input
      v-model="model.link"
      type="text"
      placeholder="包裹链接（可选，仅非头图生效）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
    <img
      v-if="model.src"
      :src="model.src"
      :alt="model.alt"
      class="max-h-28 rounded border border-gray-200 object-contain"
    />
  </div>
</template>
