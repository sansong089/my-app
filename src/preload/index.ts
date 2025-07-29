import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { CreateBrowserInstanceDto, UpdateBrowserInstanceDto, BrowserQueryParams } from '../main/typings/browser'

// Custom APIs for renderer
const api = {
  browserInstanceService: {
    createBrowserInstance: (data: CreateBrowserInstanceDto) => ipcRenderer.invoke('db:createBrowserInstance', data),
    getBrowserInstances: () => ipcRenderer.invoke('db:getBrowserInstances'),
    getBrowserInstance: (id: number) => ipcRenderer.invoke('db:getBrowserInstance', id),
    updateBrowserInstance: (data: UpdateBrowserInstanceDto) => ipcRenderer.invoke('db:updateBrowserInstance', data),
    deleteBrowserInstance: (id: number) => ipcRenderer.invoke('db:deleteBrowserInstance', id),
    getBrowserInstancesByPage: (
      pageNum: number,
      pageSize: number,
      queryParams?: BrowserQueryParams
    ) => ipcRenderer.invoke('db:getBrowserInstancesByPage', { pageNum, pageSize, queryParams })
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
