import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { alias } from './vite.config.js'

// 单测专用配置（复用主配置的路径别名，不参与 vite build）
export default defineConfig({
  plugins: [vue()],
  resolve: { alias },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
  },
})
