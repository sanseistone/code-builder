var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var IMMUTABLE = "public, max-age=31536000, immutable";
var NO_CACHE = "no-cache";
function isHashed(pathname) {
  return /\/assets\/.*-[A-Za-z0-9_]{8,}\.(js|css|woff2?|svg|png|webp)$/.test(pathname);
}
__name(isHashed, "isHashed");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname.endsWith("/")) {
      pathname += "index.html";
    } else if (!pathname.split("/").pop().includes(".")) {
      pathname += "/index.html";
    }
    if (pathname !== url.pathname) {
      url.pathname = pathname;
      request = new Request(url, request);
    }
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404) {
      return new Response("Not Found", { status: 404 });
    }
    const headers = new Headers(res.headers);
    headers.set("Cache-Control", isHashed(pathname) ? IMMUTABLE : NO_CACHE);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
