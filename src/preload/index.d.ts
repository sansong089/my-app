import { ElectronAPI } from '@electron-toolkit/preload'
import type { ApiResponse, PageResult } from '../main/typings/common'
import type { BrowserInstance } from '../main/typings/browser'
import type { CreateBrowserInstanceDto, UpdateBrowserInstanceDto, BrowserQueryParams } from '../main/typings/browser'

// 重新导出main中的类型供renderer使用
export type { ApiResponse, PageResult, BrowserInstance, CreateBrowserInstanceDto, UpdateBrowserInstanceDto, BrowserQueryParams }

interface BrowserInstanceService {
  createBrowserInstance: (data: CreateBrowserInstanceDto) => Promise<ApiResponse<BrowserInstance>>
  getBrowserInstances: () => Promise<ApiResponse<BrowserInstance[]>>
  getBrowserInstance: (id: number) => Promise<ApiResponse<BrowserInstance | null>>
  updateBrowserInstance: (data: UpdateBrowserInstanceDto) => Promise<ApiResponse<BrowserInstance>>
  deleteBrowserInstance: (id: number) => Promise<ApiResponse<BrowserInstance>>
  getBrowserInstancesByPage: (
    pageNum: number,
    pageSize: number,
    queryParams?: BrowserQueryParams
  ) => Promise<ApiResponse<PageResult<BrowserInstance>>>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      browserInstanceService: BrowserInstanceService
    }
  }
}
