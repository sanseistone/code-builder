<script setup>
// 章节字段编辑器（标题 / 加粗 / 锚点 id / 级别 / 目次开关）
defineProps({ model: { type: Object, required: true } })
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="flex items-center gap-2">
      <input
        v-model="model.title"
        type="text"
        placeholder="章节标题（如：自治体サービスでの処分）"
        class="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
      <select
        v-model.number="model.level"
        class="rounded border border-gray-200 px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
        title="标题级别"
      >
        <option :value="2">H2</option>
        <option :value="3">H3</option>
      </select>
      <label
        class="flex shrink-0 items-center gap-1 text-[11px] text-gray-500"
        title="标题是否加粗输出（标题文字里无需再写 **…**）"
      >
        <input v-model="model.bold" type="checkbox" class="accent-rose-500" />
        加粗
      </label>
    </div>
    <div class="flex items-center gap-2">
      <input
        v-model="model.id"
        type="text"
        placeholder="锚点 id（如 item1）"
        class="w-32 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
      <label class="flex items-center gap-1 text-[11px] text-gray-500" title="是否出现在目次列表中">
        <input v-model="model.inToc" type="checkbox" class="accent-rose-500" />
        加入目次
      </label>
      <label class="flex items-center gap-1 text-[11px] text-gray-500" title="标题右侧显示「↑ 目次へ」">
        <input v-model="model.showBackToToc" type="checkbox" class="accent-rose-500" />
        显示返回目次
      </label>
    </div>
  </div>
</template>
