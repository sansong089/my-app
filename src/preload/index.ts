import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  browserInstanceService: {
    create: (data) => ipcRenderer.invoke('db:createBrowserInstance', data),
    getAll: () => ipcRenderer.invoke('db:getBrowserInstances'),
    update: (data) => ipcRenderer.invoke('db:updateBrowserInstance', data),
    delete: (id) => ipcRenderer.invoke('db:deleteBrowserInstance', id)
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
