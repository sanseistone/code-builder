// ============================================================
// 通用工具
// ============================================================

import { uid, createBlock } from './types.js'

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 复制区块时递归重生成 uid，避免 key 冲突
export function deepReuid(block) {
  const out = clone(block)
  out.uid = uid('b')
  if (out.type === 'section') {
    out.children = (out.children || []).map(deepReuid)
  }
  return out
}

export function downloadFile(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

// 在 textarea 光标处包裹/插入标记，并返还新的文本
export function wrapSelection(text, start, end, before, after = before, placeholder = '') {
  const selected = text.slice(start, end) || placeholder
  return {
    text: text.slice(0, start) + before + selected + after + text.slice(end),
    start: start + before.length,
    end: start + before.length + selected.length,
  }
}

// 需要补全字段的区块类型 → 默认值合并
function ensureBlock(b) {
  if (!b || !b.type) return null
  const fresh = createBlock(b.type) || {}
  const merged = { ...fresh, ...b }
  if (!merged.uid) merged.uid = uid('b')
  if (b.type === 'section') {
    merged.children = (b.children || []).map(ensureBlock).filter(Boolean)
  }
  return merged
}

// 导入 / 读取本地存储时做结构补全，保证字段齐全
export function normalizeDoc(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('bad doc')
  const d = {
    title: doc.title || '新規記事',
    includeStyle: doc.includeStyle !== false,
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
