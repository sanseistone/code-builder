<script setup>
// 视频编辑器：<p><video controls><source src type></video></p>
defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-2 p-2">
    <input
      v-model="model.src"
      type="text"
      placeholder="视频 URL（如 https://.../demo.mp4）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
    <div class="flex items-center gap-2">
      <input
        v-model="model.mime"
        type="text"
        placeholder="video/mp4"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <input
        v-model="model.width"
        type="text"
        placeholder="宽"
        class="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <input
        v-model="model.height"
        type="text"
        placeholder="高"
        class="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
    <input
      v-model="model.poster"
      type="text"
      placeholder="封面图 URL（poster，可选）"
      class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
    <label class="flex items-center gap-1 text-[11px] text-gray-500" title="勾选后输出 <p><video …></video></p>，与 demo-01 写法一致">
      <input v-model="model.wrapP" type="checkbox" class="accent-indigo-500" />
      段落内包裹（&lt;p&gt;）
    </label>
    <video
      v-if="model.src"
      :src="model.src"
      :poster="model.poster || undefined"
      controls
      class="max-h-36 w-full rounded border border-gray-200 bg-black"
    ></video>
  </div>
</template>
