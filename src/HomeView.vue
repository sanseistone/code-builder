<script setup>
// ============================================================
// 首页：工具索引
// 工具清单由 src/registry.js 单一数据源驱动，新增工具无需改这里
// ============================================================
import { SITE, TOOLS, toolHref } from './registry.js'

const BASE = import.meta.env.BASE_URL
</script>

<template>
  <div class="home">
    <div class="home__inner">
      <header class="home__head">
        <h1 class="home__title">{{ SITE.name }}</h1>
        <p class="home__desc">{{ SITE.description }}</p>
      </header>

      <div class="home__grid">
        <a v-for="tool in TOOLS" :key="tool.id" class="home__card" :href="toolHref(tool, BASE)">
          <div class="home__icon">{{ tool.icon }}</div>
          <h2 class="home__name">{{ tool.name }}</h2>
          <p class="home__summary">{{ tool.summary }}</p>
          <span class="home__cta">立即使用 →</span>
        </a>
      </div>

      <p class="home__foot">共 {{ TOOLS.length }} 个工具 · 数据全部保存在本地浏览器</p>
    </div>
  </div>
</template>
