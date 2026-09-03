// ============================================================
// HTML 生成相关的通用转义 / 校验
// esc() 原来在 blog 与 campaign 的 generator.js 里各有一份，逐字相同
// ============================================================

/** HTML 转义：文本内容插入源码时防止破坏结构 */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * URL 白名单：只允许安全协议，避免 javascript: 之类的注入
 * 非安全协议一律降级为 '#'
 */
export function safeUrl(url) {
  const s = String(url || '').trim()
  return /^(https?:\/\/|\/|#|mailto:)/i.test(s) ? s : '#'
}
