import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { PageParams, PageResult } from '../types/page'
import type { BrowserQuery, BrowserCreateDTO, BrowserUpdateDTO, BrowserVO } from '../types/browser'
import type { ApiResponse } from '../types/api'

// Custom APIs for renderer
const api = {
  browser: {
    list: (page: PageParams, query?: BrowserQuery): Promise<ApiResponse<PageResult<BrowserVO>>> =>
      ipcRenderer.invoke('browser:list', page, query),
    getById: (id: number): Promise<ApiResponse<BrowserVO>> =>
      ipcRenderer.invoke('browser:getById', id),
    create: (data: BrowserCreateDTO): Promise<ApiResponse<BrowserVO>> =>
      ipcRenderer.invoke('browser:create', data),
    update: (data: BrowserUpdateDTO): Promise<ApiResponse<BrowserVO>> =>
      ipcRenderer.invoke('browser:update', data),
    delete: (id: number): Promise<ApiResponse<void>> => ipcRenderer.invoke('browser:delete', id)
  },
  systemSettings: {
    getAll: (): Promise<ApiResponse<Record<string, string>>> =>
      ipcRenderer.invoke('systemSettings:getAll'),
    get: (data: string): Promise<ApiResponse<string | null>> =>
      ipcRenderer.invoke('systemSettings:get', data),
    set: (varName: string, value: string): Promise<ApiResponse<never>> =>
      ipcRenderer.invoke('systemSettings:set', varName, value),
    mset: (data: Record<string, string>): Promise<ApiResponse<never>> =>
      ipcRenderer.invoke('systemSettings:mset', data)
  },
  dialog: {
    selectFolder: (options?: { defaultPath?: string }) => {
      console.log('Preload: 调用 selectFolder, options:', options)
      return ipcRenderer.invoke('dialog:select-folder', options)
    },
    selectFile: (options?: {
      defaultPath?: string
      filters?: Array<{ name: string; extensions: string[] }>
    }) => {
      console.log('Preload: 调用 selectFile, options:', options)
      return ipcRenderer.invoke('dialog:select-file', options)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
