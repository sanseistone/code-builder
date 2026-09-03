// ============================================================
// 浏览器端下载
// 原来 blog 的 downloadFile() 与 campaign 的 download() 是同一份实现
// ============================================================

/** 触发一次文件下载 */
export function downloadFile(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/** 去掉文件名里的非法字符，避免下载失败 */
export function sanitizeFileName(name) {
  return String(name || '').replace(/[\\/:*?"<>|]/g, '_').trim() || 'untitled'
}

/** 下载一段 HTML 源码，自动补 .html 后缀 */
export function downloadHtml(code, fileName = 'template') {
  const name = sanitizeFileName(fileName).replace(/\.html?$/i, '') + '.html'
  downloadFile(name, code, 'text/html;charset=utf-8')
  return name
}

/** 下载配置 JSON */
export function downloadJson(data, fileName = 'config') {
  const name = sanitizeFileName(fileName).replace(/\.json$/i, '') + '.json'
  downloadFile(name, JSON.stringify(data, null, 2), 'application/json')
  return name
}
