// ============================================================
// 复制区块：递归重生成 uid，避免 key 冲突
// 原来是 blog 私有的 deepReuid()，对任何「带 uid / children 的树形结构」都适用
// ============================================================
import { clone } from './clone.js'
import { uid } from './id.js'

export function duplicateItem(item) {
  const copy = clone(item)
  if (copy && typeof copy === 'object' && !Array.isArray(copy)) {
    if ('uid' in copy) copy.uid = uid()
    if (Array.isArray(copy.children)) {
      copy.children = copy.children.map(duplicateItem)
    }
  }
  return copy
}
