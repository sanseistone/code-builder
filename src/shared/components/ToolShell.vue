<script setup>
// ============================================================
// 工具页骨架：顶栏 + 左编辑区 + 右预览区 + Toast
// 两个工具的页面结构完全一致，抽成骨架后各自只关心内容
// ============================================================
import ToastHost from './ToastHost.vue'

defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  asideWidth: { type: String, default: '' },
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="app-shell">
    <!-- 顶栏 -->
    <header class="tool-header">
      <h1 class="tool-header__title">{{ title }}</h1>
      <span v-if="hint" class="tool-header__hint">{{ hint }}</span>
      <div class="tool-header__actions">
        <!-- 模板切换 / 导入导出等工具专属操作 -->
        <slot name="actions" />
      </div>
    </header>

    <!-- 主体：左编辑 / 右预览 -->
    <div class="app-shell__body">
      <aside
        v-if="$slots.aside"
        class="app-shell__aside"
        :style="asideWidth ? { width: asideWidth } : null"
      >
        <slot name="aside" />
      </aside>
      <section class="app-shell__main">
        <slot />
      </section>
    </div>

    <ToastHost :message="message" />
  </div>
</template>
