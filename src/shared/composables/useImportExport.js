// ============================================================
// 配置导入 / 导出
// 两边都是「导出 JSON 下载 + 选择文件解析 + 失败提示」，仅校验与提示文案不同
// ============================================================
import { downloadJson } from '../utils/download.js'
import { readJsonFromEvent } from '../utils/file.js'

/**
 * @param {object} options
 * @param {() => object} options.getData 导出时取当前数据
 * @param {(data: object) => void} options.setData 导入成功后写回数据
 * @param {(data: object) => boolean} [options.validate] 结构校验，返回 false 视为格式错误
 * @param {object} [options.messages] 提示文案
 */
export function useImportExport({
  getData,
  setData,
  validate = () => true,
  fileName = 'config',
  messages = {},
} = {}) {
  const text = {
    exported: '配置已导出',
    imported: '配置已导入',
    failed: '导入失败：文件格式不正确',
    ...messages,
  }

  /** 由调用方传入 toast.show */
  function exportConfig(toast) {
    downloadJson(getData(), fileName)
    toast?.(text.exported)
  }

  /** 直接绑在 <input type="file" @change> 上 */
  function importConfig(event, toast) {
    readJsonFromEvent(event)
      .then((data) => {
        if (!data || typeof data !== 'object' || validate(data) === false) {
          throw new Error('bad format')
        }
        setData(data)
        toast?.(text.imported)
      })
      .catch(() => {
        toast?.(text.failed)
      })
  }

  return { exportConfig, importConfig }
}
