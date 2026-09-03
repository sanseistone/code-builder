import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { TOOLS } from './src/registry.js'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

/** 相对项目根解析绝对路径 */
export const r = (p) => resolve(rootDir, p)

/** 路径别名：工具代码统一用 @shared 引用公共层 */
export const alias = {
  '@shared': r('src/shared'),
  '@': r('src'),
}

/**
 * 生成 Vite 配置
 *
 * @param {object}  options
 * @param {boolean} [options.offline=false]
 *   false → 多页在线版：产物为 dist/，共享代码抽成公共 chunk，可直接部署
 *   true  → 单文件离线版：产物为 dist-offline/，每个页面内联全部资源，可双击打开
 */
export function createConfig({ offline = false } = {}) {
  return defineConfig({
    // 在线版用绝对路径（适配任意静态服务器 / Workers）；
    // 部署到子目录时通过 BASE_PATH=/sub/ 覆盖。离线版必须相对路径才能 file:// 打开。
    base: offline ? './' : process.env.BASE_PATH || '/',

    // 多页应用：关闭 SPA 兜底，避免未知路径被改写成首页
    appType: 'mpa',

    resolve: { alias },

    plugins: [vue(), tailwindcss(), ...(offline ? [viteSingleFile()] : [])],

    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      emptyOutDir: true,
      // 0 = 不内联小资源；离线版依赖 singlefile 插件做整页内联
      assetsInlineLimit: 0,
      rollupOptions: {
        // 多页入口：首页 + 注册表里声明的每个工具
        input: {
          index: r('index.html'),
          ...Object.fromEntries(TOOLS.map((t) => [t.id, r(t.entry)])),
        },
        output: offline
          ? {}
          : {
              // 在线版：把 vue 与公共层抽成共享 chunk，多个工具页复用同一份缓存
              manualChunks(id) {
                if (id.includes('node_modules')) return 'vendor'
                if (id.includes('/src/shared/')) return 'shared'
                return undefined
              },
            },
      },
    },
  })
}

export default createConfig()
