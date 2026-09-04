# HTML 工具集

把原本分散的 `html-builder-blog` / `html-builder-campaign` 两个独立项目，合并为一个统一管理的多工具工程。

- 一个仓库、一份依赖、一套构建配置
- 共享层（组件 / 逻辑 / 样式）集中维护，工具目录只保留自身业务
- 构建产物是一个多页站点：**一个索引首页 + 各工具子页面**
- 支持部署到任意静态服务器或 Cloudflare Workers
- 保留离线能力：可另外产出单文件 HTML，双击即用

## 目录结构

```
.
├── index.html                  # 索引首页入口
├── tools/<id>/index.html       # 各工具页入口（新增工具时在此建目录）
├── src/
│   ├── main.js                 # 首页入口
│   ├── HomeView.vue            # 工具索引页
│   ├── registry.js             # ★ 工具注册表（首页 + 构建入口的唯一数据源）
│   ├── shared/                 # ★ 公共层
│   │   ├── index.js
│   │   ├── dnd.js
│   │   ├── styles/             # Tailwind 入口 + SCSS 分层
│   │   ├── utils/              # clone / download / html转义 / 剪贴板 / 本地存储 ...
│   │   ├── composables/        # useToast / useImportExport / usePersistentState
│   │   └── components/         # ToolShell / PreviewPane / DragList / ToastHost
│   └── tools/
│       ├── blog/               # 文章模板生成工具
│       └── campaign/           # 活动页模板生成工具
├── public/vendor/              # 预览区运行时（Tailwind 浏览器版，campaign 预览用）
├── worker/index.js             # Cloudflare Worker（静态资源托管 + 缓存头）
└── test/                       # 单元测试
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发，首页 `http://localhost:5173/` |
| `npm run build` | 多页在线版 → `dist/`，可部署 |
| `npm run build:offline` | 单文件离线版 → `dist-offline/`，可双击打开 |
| `npm run preview` | 预览 `dist/` |
| `npm test` | 单元测试 |

开发时各工具地址：

- 首页：`/`
- 文章模板生成工具：`/tools/blog/`
- 活动页模板生成工具：`/tools/campaign/`

## 新增一个工具

1. 在 `src/tools/<id>/` 下写业务代码，`main.js` 里 `import '@shared/styles/index.js'`
2. 新建入口 `tools/<id>/index.html`，脚本指向 `/src/tools/<id>/main.js`
3. 在 `src/registry.js` 的 `TOOLS` 里追加一项（`id` / `name` / `icon` / `summary` / `route` / `entry`）

首页卡片与构建入口会自动生成，无需改动 `vite.config.js`。

## 部署

### 任意静态服务器（Nginx / Pages / OSS）

```bash
npm run build     # 产物在 dist/
```

把 `dist/` 整个目录作为站点根目录。关键要求：目录路径要能回落到 `index.html`
（即 `/tools/blog/` → `/tools/blog/index.html`），Nginx 默认即支持。

部署到子目录时用 `BASE_PATH` 覆盖：

```bash
BASE_PATH=/tools/ npm run build
```

### Cloudflare Workers

```bash
npx wrangler login     # 首次使用需登录
npm run deploy         # 构建 + 上传 dist/ 到 Workers 静态资源
npm run cf:dev         # 本地以 Workers 环境预览
```

`wrangler.toml` 中改 `name` 即可更换 Worker 名称。

## 共享层约定

- 工具代码统一 `import { ... } from '@shared'`，不要写深层相对路径
- 两个及以上工具都在用的逻辑，才下沉到 `src/shared/`；仅单个工具使用的留在本工具目录
- 样式分两层：Tailwind 原子类处理布局，`src/shared/styles/*.scss` 处理组件级样式
- 变量集中在 `_variables.scss`，mixin 集中在 `_mixins.scss`，不要在组件里硬编码色值
- 预览用 `PreviewPane`：它会在注入 iframe 前补一个 `<base href>`，
  让文档里的 `vendor/...` 等相对路径正确指回站点根。
  生成器保持纯函数、只输出相对路径，不要在里面写死绝对 URL
- 文章工具的产出代码自带一份普通 CSS：视觉全部由 `.article-*` 语义类表达，
  规则手写在 `src/tools/blog/article-style.js`（`ARTICLE_CSS`），生成时内联到
  代码开头的 `<style>`。自包含、零依赖：
  - 不需要站点带 Tailwind / Bootstrap，也不需要执行 JS / 上传文件 ——
    OpenCart 这类会过滤 `<script>` 的 CMS 后台也适用
  - 无 `@layer` 的普通规则优先级最高，不会被站点样式冲掉；
    `.article-*` 命名空间也只影响文章内容，不和站点全局类（.btn / .title 等）撞车
- 改样式只需编辑 `article-style.js`，无需跑任何编译步骤
  （`npm run article-css` 已移除）
