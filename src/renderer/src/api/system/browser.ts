import type { BrowserInstance } from '@/typings/browser'

export function listBrowser(params: {
  pageNum?: number
  pageSize?: number
  groupId?: string | null
  label?: string | null
}): Promise<{data: {rows: BrowserInstance[], total: number}}> {
  return window.api.browserInstanceService.getAll().then(res => {
    // 实现分页逻辑
    const { pageNum = 1, pageSize = 10, ...query } = params
    const filtered = res.filter(item => {
      return Object.entries(query).every(([key, value]) => {
        if (!value) return true
        return String(item[key]).includes(String(value))
      })
    })

    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return {
      data: {
        rows: filtered.slice(start, end),
        total: filtered.length
      }
    }
  })
}

export function getBrowser(id: number): Promise<{data: BrowserInstance | null}> {
  return window.api.browserInstanceService.get(id).then(data => {
    return { data }
  })
}

export function delBrowser(id: number): Promise<BrowserInstance> {
  return window.api.browserInstanceService.delete(id)
}

export function addBrowser(data: {
  group_id: number
  label: string
  remark?: string | null
}): Promise<BrowserInstance> {
  return window.api.browserInstanceService.create(data)
}

export function updateBrowser(data: {
  id: number
  group_id: number
  label: string
  remark?: string | null
}): Promise<BrowserInstance> {
  return window.api.browserInstanceService.update(data)
}
