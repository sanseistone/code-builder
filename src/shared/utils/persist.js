// ============================================================
// localStorage 读写
// blog 原有的「自动保存 + 恢复」逻辑抽成通用能力，其他工具可直接复用
// ============================================================

/** 读取并解析 JSON，失败返回 fallback */
export function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (err) {
    return fallback
  }
}

/** 写入 JSON，配额不足时静默失败（不影响编辑） */
export function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    return false
  }
}

/** 删除指定键 */
export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    /* 忽略 */
  }
}
