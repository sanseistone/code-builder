// ============================================================
// 唯一 id 生成
// 区块 uid / Vue key 等场景共用，避免各工具各写一份计数器
// ============================================================

let seq = 0

/**
 * 生成局部唯一 id
 * @param {string} [prefix='b']
 */
export function uid(prefix = 'b') {
  seq += 1
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`
}
