// ============================================================
// 剪贴板
// 原实现在两处 PreviewPane 中逐字重复，且需要处理 file:// 下 API 不可用
// ============================================================

/**
 * 复制文本到剪贴板；非安全上下文（file:// 等）自动降级到 execCommand
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    /* 继续走降级方案 */
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch (err) {
    return false
  }
}
