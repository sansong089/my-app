import type { BrowserVO } from '@root/types/browser'
import type { PageResult, PageParams } from '@root/types/page'
import type { BrowserQuery, BrowserCreateDTO, BrowserUpdateDTO } from '@root/types/browser'
import type { ApiResponse } from '@root/types/api'

interface BrowserApi {
  list: (page: PageParams, query?: BrowserQuery) => Promise<ApiResponse<PageResult<BrowserVO>>>
  getById: (id: number) => Promise<ApiResponse<BrowserVO>>
  create: (data: BrowserCreateDTO) => Promise<ApiResponse<BrowserVO>>
  update: (data: BrowserUpdateDTO) => Promise<ApiResponse<BrowserVO>>
  delete: (id: number) => Promise<ApiResponse<void>>
}

declare global {
  interface Window {
    api: {
      browser: BrowserApi
    }
  }
}
