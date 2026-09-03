// ============================================================
// 文件读取：两个工具的「导入配置」是同一套 FileReader 流程
// ============================================================

/**
 * 从 <input type="file"> 的 change 事件里读取并解析 JSON。
 * 解析失败会抛错，由调用方决定提示文案。
 * 无论成功失败都会清空 input.value，保证同一个文件能重复选择。
 *
 * @param {Event} event change 事件
 * @returns {Promise<any>} 解析后的对象
 */
export function readJsonFromEvent(event) {
  const input = event.target
  const file = input.files && input.files[0]
  if (!file) return Promise.reject(new Error('no file'))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (err) {
        reject(err)
      } finally {
        input.value = ''
      }
    }
    reader.onerror = () => {
      input.value = ''
      reject(new Error('read error'))
    }
    reader.readAsText(file)
  })
}
