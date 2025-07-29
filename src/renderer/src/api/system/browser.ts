import type {
  BrowserInstance,
  ApiResponse,
  PageResult,
  CreateBrowserInstanceDto,
  UpdateBrowserInstanceDto,
  BrowserQueryParams
} from '@/../../preload/index.d'

export interface ListBrowserParams extends BrowserQueryParams {
  pageNum?: number
  pageSize?: number
}

export function listBrowser(params: ListBrowserParams): Promise<ApiResponse<PageResult<BrowserInstance>>> {
  const { pageNum = 1, pageSize = 10, groupId, label } = params
  const query: BrowserQueryParams = {}
  if (groupId !== undefined && groupId !== null) query.groupId = groupId
  if (label !== undefined && label !== null) query.label = label
  return window.api.browserInstanceService.getBrowserInstancesByPage(pageNum, pageSize, query)
}

export function getBrowser(id: number): Promise<ApiResponse<BrowserInstance | null>> {
  return window.api.browserInstanceService.getBrowserInstance(id)
}

export function delBrowser(id: number): Promise<ApiResponse<BrowserInstance>> {
  return window.api.browserInstanceService.deleteBrowserInstance(id)
}

export function addBrowser(data: CreateBrowserInstanceDto): Promise<ApiResponse<BrowserInstance>> {
  return window.api.browserInstanceService.createBrowserInstance(data)
}

export function updateBrowser(data: UpdateBrowserInstanceDto): Promise<ApiResponse<BrowserInstance>> {
  return window.api.browserInstanceService.updateBrowserInstance(data)
}
