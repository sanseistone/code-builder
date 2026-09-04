// ============================================================
// 模块类型定义与工厂函数
// 模板 = header + blocks(note/section) + date + footerNote + link
// section 内部 children 可包含: note / tags / list
// ============================================================

// 空 note（蓝色说明文字，多行）
export function createNote(lines = [''], bold = false) {
  return { type: 'note', bold, lines: [...lines] }
}

// 空 tags（成组胶囊标签）
export function createTags(items = ['']) {
  return { type: 'tags', items: [...items] }
}

// 空 list（价格列表项）
export function createListItem(item = {}) {
  return {
    name: item.name || '',
    price: item.price || '',
    note: item.note || '',
    // note 颜色: gray(默认灰色备注) / red(红色加粗备注)
    noteColor: item.noteColor || 'gray',
  }
}

export function createList(items = [createListItem()]) {
  return { type: 'list', items: items.map((i) => createListItem(i)) }
}

// 空 section（序号小标题块）
export function createSection(over = {}) {
  return {
    type: 'section',
    showNumber: true,
    title: '',
    link: '', // 为空渲染为 <p>，非空渲染为 <a>
    discount: '',
    children: [], // note / tags / list
    ...over,
  }
}

// 空 note 块（用于顶层 blocks 与 section children 通用）
export function createNoteBlock(over = {}) {
  return { type: 'note', bold: false, lines: [''], ...over }
}

// 子模块中文名（用于 UI 展示）
export const CHILD_LABELS = {
  note: '说明文字',
  tags: '标签组',
  list: '价格列表',
}

export function createEmptyChild(type) {
  if (type === 'note') return createNoteBlock()
  if (type === 'tags') return createTags()
  if (type === 'list') return createList()
  return null
}
