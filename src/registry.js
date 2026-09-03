// ============================================================
// 工具注册表（单一数据源）
// 首页索引、Vite 多页构建入口、离线构建入口 全部由这里驱动，
// 新增一个工具只需：建目录 → 加 index.html → 在此追加一项。
//
// 注意：本文件同时被浏览器端（首页）和 Node 端（vite.config）引用，
// 只能包含纯数据，不要引入任何浏览器 API 或 node API。
// ============================================================

export const SITE = {
  name: 'HTML 工具集',
  description: '一组离线可用的 HTML 模板生成工具，统一入口、共享组件与样式。',
}

export const TOOLS = [
  {
    id: 'blog',
    name: '文章模板生成工具',
    icon: '📝',
    summary: '可视化编辑博客文章结构，支持目次、11 种内容区块、拖拽排序，实时预览并导出单文件 HTML。',
    tags: ['文章', '目次', '拖拽排序'],
    // 线上访问路径（相对站点根，最终会拼接 BASE_URL）
    route: 'tools/blog/',
    // Vite 构建入口 HTML（相对项目根）
    entry: 'tools/blog/index.html',
  },
  {
    id: 'campaign',
    name: '活动页模板生成工具',
    icon: '🎨',
    summary: '快速拼装活动 / 促销页：大标题、说明文字、带序号小标题块、价格列表与日期模块。',
    tags: ['活动页', '模板母版', '价格列表'],
    route: 'tools/campaign/',
    entry: 'tools/campaign/index.html',
  },
]

/** 取工具的线上访问地址（自动适配 base 与部署子路径） */
export function toolHref(tool, base = '/') {
  return `${base}${tool.route}`
}
