import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 单测专用配置（不影响 vite build）
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
  },
})
