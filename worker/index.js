// ============================================================
// Cloudflare Worker：托管 dist/ 静态资源
// 只做三件事：目录路径补 index.html、按资源类型设置缓存头、404 兜底
// 工具本身是纯前端应用，全部逻辑在浏览器里跑，Worker 不处理业务数据
// ============================================================

const IMMUTABLE = 'public, max-age=31536000, immutable'
const NO_CACHE = 'no-cache'

/** 带 hash 的构建产物可永久缓存 */
function isHashed(pathname) {
  return /\/assets\/.*-[A-Za-z0-9_]{8,}\.(js|css|woff2?|svg|png|webp)$/.test(pathname)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    let pathname = url.pathname

    // /tools/blog 或 /tools/blog/ → /tools/blog/index.html
    if (pathname.endsWith('/')) {
      pathname += 'index.html'
    } else if (!pathname.split('/').pop().includes('.')) {
      pathname += '/index.html'
    }

    if (pathname !== url.pathname) {
      url.pathname = pathname
      request = new Request(url, request)
    }

    const res = await env.ASSETS.fetch(request)

    // 静态资源未命中（例如刷新了旧 hash）→ 回落到首页，由前端决定
    if (res.status === 404) {
      return new Response('Not Found', { status: 404 })
    }

    const headers = new Headers(res.headers)
    headers.set('Cache-Control', isHashed(pathname) ? IMMUTABLE : NO_CACHE)
    headers.set('X-Content-Type-Options', 'nosniff')

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
  },
}
