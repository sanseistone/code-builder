// ============================================================
// 本地自动保存 / 恢复
// 把 blog 里手写的 localStorage 防抖保存抽成通用 composable，
// 任何工具只要传入 storageKey 即可获得「刷新不丢内容」的能力
// ============================================================
import { ref, watch, onBeforeUnmount } from 'vue'
import { loadJson, saveJson, removeKey } from '../utils/persist.js'

/**
 * @param {string} storageKey localStorage 键名
 * @param {() => any} createDefault 无存档时的默认值工厂
 * @param {(raw: object) => any} [normalize] 存档结构补全（字段升级时保证兼容）
 * @param {number} [delay=500] 防抖延迟（毫秒）
 */
export function usePersistentState(storageKey, createDefault, normalize = (x) => x, delay = 500) {
  const state = ref(createDefault())
  let timer = null

  /** 读取存档，返回是否恢复成功 */
  function restore() {
    const saved = loadJson(storageKey)
    if (!saved) return false
    try {
      state.value = normalize(saved)
      return true
    } catch (err) {
      return false
    }
  }

  function persistNow() {
    saveJson(storageKey, state.value)
  }

  // 必须同时清掉挂起的防抖保存，否则清完又被 watch 写回去，重置会失效
  function clearStorage() {
    clearTimeout(timer)
    timer = null
    removeKey(storageKey)
  }

  const stop = watch(
    state,
    () => {
      clearTimeout(timer)
      timer = setTimeout(persistNow, delay)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    clearTimeout(timer)
    stop()
  })

  return { state, restore, persistNow, clearStorage }
}
