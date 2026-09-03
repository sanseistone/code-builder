// ============================================================
// 离线单文件构建
//
// vite-plugin-singlefile 要求 output.inlineDynamicImports = true，
// 这与多入口（MPA）互斥；且它会在 generateBundle 里把「所有」JS/CSS
// 内联进「每一个」HTML。因此这里按入口逐个构建，每个页面单独产出一份
// 自包含的 HTML，最后合并到 dist-offline/。
//
// 产物：dist-offline/index.html + dist-offline/tools/<id>/index.html
// 可直接双击用浏览器打开（file:// 协议）
// ============================================================
import { rmSync } from 'node:fs'
import { build } from 'vite'
import { createConfig, r } from '../vite.config.js'
import { TOOLS } from '../src/registry.js'

const OUT_DIR = 'dist-offline'

const entries = [
  { id: 'index', file: 'index.html' },
  ...TOOLS.map((t) => ({ id: t.id, file: t.entry })),
]

// 只在第一次构建时清空目录，避免清掉前面已经产出的页面
rmSync(OUT_DIR, { recursive: true, force: true })

let isFirst = true
for (const entry of entries) {
  const config = createConfig({ offline: true })
  // 关键：不加载磁盘上的 vite.config.js。
  // 否则 Vite 会把文件里的多入口与本处的单入口「合并」，singlefile 再次失效。
  config.configFile = false
  config.build.rollupOptions.input = { [entry.id]: r(entry.file) }
  config.build.emptyOutDir = isFirst

  console.log(`\n[offline] building ${entry.file}`)
  await build(config)
  isFirst = false
}

console.log(`\n[offline] done → ${OUT_DIR}/`)
