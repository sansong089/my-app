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

interface SystemSettingsApi {
  getAll: () => Promise<ApiResponse<Record<string, string>>>
  get: (data: string) => Promise<ApiResponse<string | null>>
  set: (varName: string, value: string) => Promise<ApiResponse<void>>
  mset: (data: Record<string, string>) => Promise<ApiResponse<void>>
}

interface DialogApi {
  selectFile: (options?: {
    defaultPath?: string
    filters?: Array<{
      name: string
      extensions: string[]
    }>
  }) => Promise<string | null>
  selectFolder: (options?: {
    defaultPath?: string
  }) => Promise<string | null>
}

declare global {
  interface Window {
    api: {
      browser: BrowserApi
      systemSettings: SystemSettingsApi
      dialog: DialogApi
    }
  }
}
