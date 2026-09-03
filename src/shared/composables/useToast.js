// ============================================================
// Toast 提示
// 两个工具的 App.vue 里各有一份完全相同的 toast 实现，收敛为 composable
// ============================================================
import { ref, onBeforeUnmount } from 'vue'

/**
 * @param {number} [duration=1800] 显示时长（毫秒）
 */
export function useToast(duration = 1800) {
  const message = ref('')
  let timer = null

  function show(msg) {
    message.value = msg
    clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
    }, duration)
  }

  function clear() {
    clearTimeout(timer)
    message.value = ''
  }

  onBeforeUnmount(clear)

  return { message, show, clear }
}
