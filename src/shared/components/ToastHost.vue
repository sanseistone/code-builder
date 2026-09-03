<script setup>
// ============================================================
// 全站统一的轻提示
// 原来两个 App.vue 各有一份 transition 包裹的 toast 结构，逐字相同
// ============================================================
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div v-if="message" class="toast-host" role="status" aria-live="polite">
      {{ message }}
    </div>
  </transition>
</template>
