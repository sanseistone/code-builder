// ============================================================
// 文本处理
// ============================================================

/**
 * 在 textarea 光标处包裹/插入标记，并返还新的文本与选区位置
 *
 * @param {string} text 原文本
 * @param {number} start 选区起点
 * @param {number} end 选区终点
 * @param {string} before 前缀标记
 * @param {string} [after] 后缀标记，默认同 before
 * @param {string} [placeholder] 无选区时填入的占位内容
 */
export function wrapSelection(text, start, end, before, after = before, placeholder = '') {
  const selected = text.slice(start, end) || placeholder
  return {
    text: text.slice(0, start) + before + selected + after + text.slice(end),
    start: start + before.length,
    end: start + before.length + selected.length,
  }
}
