// ============================================================
// 文章文档结构补全
// 导入配置 / 读取本地存档时保证字段齐全，兼容旧版本存档
// ============================================================

import { uid } from '@shared'
import { createBlock } from './types.js'

// 需要补全字段的区块类型 → 默认值合并
function ensureBlock(b) {
  if (!b || !b.type) return null
  const fresh = createBlock(b.type) || {}
  const merged = { ...fresh, ...b }
  if (!merged.uid) merged.uid = uid('b')
  if (b.type === 'section') {
    merged.children = (b.children || []).map(ensureBlock).filter(Boolean)
    // 旧存档迁移：标题曾用 **…** 表示加粗，现在改由 bold 开关控制
    const m = /^\*\*(.+)\*\*$/.exec(String(merged.title || ''))
    if (m) {
      merged.title = m[1]
      merged.bold = true
    }
  }
  return merged
}

export function normalizeDoc(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('bad doc')
  const d = {
    title: doc.title || '新規記事',
    // 样式已固定为「代码开头内联一份普通 CSS」（见 generator.js），
    // 旧存档里的 tailwindMode / includeTailwind 字段不再生效，这里不迁移。
    toc: {
      enabled: true,
      title: '目次',
      mode: 'auto',
      items: [],
      ...(doc.toc || {}),
    },
    blocks: [],
  }
  d.blocks = (doc.blocks || []).map(ensureBlock).filter(Boolean)
  return d
}
