import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  // base: './' + viteSingleFile：构建产物可双击 dist/index.html 离线使用（file:// 协议）
  base: './',
  plugins: [vue(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
