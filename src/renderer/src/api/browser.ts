import type { BrowserVO } from '@root/types/browser'
import type { PageResult } from '@root/types/page'

// 前端API适配层，将前端参数转换为后端参数格式

export function listBrowser(
  page: { pageNum: number; pageSize: number },
  query?: { groupId?: number | null; label?: string | null }
): Promise<PageResult<BrowserVO>> {
  return window.api.browser
    .list(
      {
        page: page.pageNum,
        pageSize: page.pageSize
      },
      query
        ? {
            groupId: query.groupId ?? undefined,
            label: query.label ?? undefined
          }
        : undefined
    )
    .then((res) => {
      if (res.code !== 200) throw new Error(res.message)
      return res.data!
    })
}

export function getBrowser(id: number): Promise<BrowserVO> {
  return window.api.browser.getById(id).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data!
  })
}

export function addBrowser(data: {
  groupId: number
  label: string
  remark?: string
}): Promise<BrowserVO> {
  return window.api.browser.create(data).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data!
  })
}

export function updateBrowser(data: {
  id: number
  groupId: number
  label: string
  remark?: string
}): Promise<BrowserVO> {
  return window.api.browser.update(data).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data!
  })
}

export function delBrowser(id: number): Promise<void> {
  return window.api.browser.delete(id).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data
  })
}
