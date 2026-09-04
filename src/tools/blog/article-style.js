// ============================================================
// 产出代码的固定样式（普通 CSS，无 @layer / @import / JS 依赖）
//
// 产物 HTML 里的视觉类全部使用 .article-* 语义类（部分元素同时保留
// 后台模板脚本 / Bootstrap 所需的结构钩子类，如 modal fade、toggle-list）。
// 这些规则直接内联在生成代码开头的 <style> 中，粘到任何页面即可生效：
//   - 与 Tailwind 无关：不需要站点带 Tailwind / Bootstrap / 任何构建产物
//   - 无层普通规则优先级最高，不会被站点原有样式冲掉
//   - 选择器只认 .article-*（弹窗结构类被约束在 .article-modal-wrap 内），
//     不会波及页面里其它区域
//
// 视觉规格沿自原 Tailwind 原子类（stone 系暖灰 + rose 点缀 + amber 高亮），
// 色阶：50 #fafaf9 / 100 #f5f5f4 / 200 #e7e5e4 / 300 #d6d3d1 /
//       400 #a8a29e / 500 #78716c / 600 #57534e / 700 #44403c / 800 #292524
// ============================================================

export const ARTICLE_CSS = `/* ============================================================
   文章自包含样式（普通 CSS）—— 只作用于 .article-* 区域
   ============================================================ */

/* ---------- 容器 / 章节 ---------- */
.article-container {
  margin: 0 auto;
  width: 100%;
  max-width: 56rem;
  padding: 0 1rem;
}
@media (min-width: 640px) {
  .article-container { padding: 0 1.5rem; }
}
.article-section {
  margin: 0 0 1.75rem;
  scroll-margin-top: 1.5rem;
}
.article-section-head,
.article-subhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 2px solid #e7e5e4;
  padding-bottom: 0.5rem;
}
.article-section-head { margin: 1.5rem 0; }
.article-subhead { margin: 1.75rem 0 0.75rem; }

.article-h2,
.article-h3,
.article-h4 { margin: 0; }
.article-h2 {
  font-size: 1.875rem;
  font-weight: 300;
  letter-spacing: 0.025em;
  line-height: 1.3;
  color: #44403c;
}
.article-h3 {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.4;
  color: #57534e;
}
.article-h4 {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5;
  color: #57534e;
}

/* 章节头右上角的「↑ 目次へ」 */
.article-back-to-toc {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.75rem;
  line-height: 1.75;
  color: #78716c;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;
}
.article-back-to-toc:hover { color: #be123c; }

/* ---------- 正文文字 ---------- */
.article-text {
  margin: 0 0 1.25rem;
  line-height: 2;
  color: #44403c;
}
.article-link {
  color: #be123c;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-mark-underline { text-decoration: underline; }
.article-mark-highlight {
  background: linear-gradient(to top, #fef3c7, transparent);
  font-weight: 500;
}

/* ---------- 列表 ---------- */
ul.article-list,
ol.article-list {
  margin: 0 0 1.25rem;
  padding-left: 1.25rem;
  line-height: 2;
  color: #44403c;
}
ul.article-list { list-style: disc; }
ol.article-list { list-style: decimal; }
ul.article-list > li::marker,
ol.article-list > li::marker { color: #a8a29e; }
ul.article-list > li + li,
ol.article-list > li + li { margin-top: 0.375rem; }

/* ---------- 图片 / 视频 ---------- */
.article-banner { margin: 0 0 1.75rem; }
.article-image { margin: 1.5rem 0; }
.article-image-link { display: block; }
.article-img {
  display: block;
  width: 100%;
  height: auto;
  border: 0;
}
/* <p class="article-media">…</p>：图片 / 视频 / CTA 的段落包裹写法 */
.article-media { margin: 0 0 1.75rem; }
.article-video {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 0 1.5rem;
}

/* ---------- 引用框 ---------- */
.article-quote {
  margin: 1.75rem 0;
  border-left: 4px solid #a8a29e;
  border-radius: 0 0.75rem 0.75rem 0;
  background: #fafaf9;
  padding: 1.25rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
@media (min-width: 640px) {
  .article-quote { padding: 1.25rem 1.5rem; }
}
.article-quote-text {
  margin: 0;
  line-height: 2;
  color: #44403c;
}

/* ---------- 标签组 ---------- */
.article-badge {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem;
}
.article-badge-item {
  display: inline-block;
  border-radius: 9999px;
  background: #e7e5e4;
  padding: 0.125rem 0.875rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #292524;
}

/* ---------- CTA 按钮 ---------- */
.article-cta {
  display: inline-block;
  margin-top: 0.625rem;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #fb7185, #fda4af);
  font-size: 0.875rem;
  line-height: 1.5;
  color: #fff;
  text-decoration: none;
  box-shadow: 0 10px 15px -3px rgb(251 113 133 / 0.25), 0 4px 6px -4px rgb(251 113 133 / 0.1);
  transition: opacity 0.15s ease;
}
/* hover / focus 时锁死文字颜色：站点常见的 a:hover 规则优先级高于 .article-cta，
   不显式声明会被它盖掉，导致悬停时文字变色 */
.article-cta:hover,
.article-cta:focus,
.article-cta:visited {
  color: #fff;
  text-decoration: none;
  opacity: 0.9;
}

/* ---------- 商品网格 ---------- */
.article-products {
  margin: 0 0 1.25rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
  padding: 0.75rem;
}
.article-products-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .article-products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .article-products-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
}
@media (min-width: 1280px) {
  .article-products-grid { gap: 1.25rem; }
}
.article-products-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}
.article-products-img { display: block; }
.article-products-title {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #57534e;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}
a.article-products-title:hover { color: #be123c; }
.article-products-price {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5;
  color: #ef4444;
}

/* ---------- 目次 ---------- */
.article-toc {
  margin: 0 0 1.5rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: #f5f5f4;
  padding: 1rem;
}
@media (min-width: 640px) {
  .article-toc { padding: 1.5rem; }
}
.article-toc-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  line-height: 1.6;
  color: #44403c;
  text-align: center;
}
.article-toc-list {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1.25rem;
  row-gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 640px) {
  .article-toc-list { grid-template-columns: 1fr 1fr; }
}
.article-toc-link {
  margin: 0;
  padding: 0.375rem 0;
  border-bottom: 1px dotted #d6d3d1;
  font-size: 1rem;
  line-height: 1.6;
  color: #57534e;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.article-toc-link:hover {
  color: #be123c;
  border-color: #be123c;
}

/* ---------- PDF 弹窗（Bootstrap 结构钩子保留，视觉自包含） ----------
   以下规则全部限制在 .article-modal-wrap 内，不会影响页面其它弹窗。
   display / 显示状态与后台模板脚本（showModalById）配合。 */
.article-modal-wrap { margin: 0 0 1.25rem; }
.article-modal-wrap .article-modal-trigger {
  display: inline-block;
  border: 0;
  border-radius: 0.375rem;
  background: #2563eb;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.article-modal-wrap .article-modal-trigger:hover,
.article-modal-wrap .article-modal-trigger:focus {
  background: #1d4ed8;
  color: #fff;
}
.article-modal-wrap .modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1055;
  overflow-y: auto;
  padding: 28px 14px;
}
.article-modal-wrap .modal.show { display: block; }
.article-modal-wrap .modal-dialog {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}
.article-modal-wrap .modal-dialog.modal-sm { max-width: 300px; }
.article-modal-wrap .modal-dialog.modal-lg { max-width: 800px; }
.article-modal-wrap .modal-dialog.modal-xl { max-width: 1140px; }
.article-modal-wrap .modal-content {
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
.article-modal-wrap .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.875rem 1rem;
}
.article-modal-wrap .modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  color: #1f2937;
}
.article-modal-wrap .btn-close {
  margin: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  font-size: 1.25rem;
  line-height: 1;
  color: #6b7280;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.article-modal-wrap .btn-close:hover { opacity: 1; }
.article-modal-wrap .modal-body { padding: 0.875rem 1rem; }
.article-modal-wrap .modal-body .article-modal-pdf {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 0;
}
/* 遮罩由站点脚本 / 预览补齐逻辑插到 <body>，这里给一个不依赖 Bootstrap 的兜底 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgb(0 0 0 / 0.5);
}
`
