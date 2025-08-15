import { IpcHandler } from './IpcHandler'
import { dialog } from 'electron'

export function registerDialogIpc(): void {
  IpcHandler.registerHandlers({
    'dialog:select-file': (
      options: {
        defaultPath?: string
        filters?: Electron.FileFilter[]
      } = {}
    ) => {
      console.log('Main: 收到选择文件请求, options:', options)
      return dialog
        .showOpenDialog({
          properties: ['openFile'],
          defaultPath: options.defaultPath,
          filters: options.filters
        })
        .then((result) => {
          console.log('Main: 选择文件结果:', result)
          return result.canceled ? null : result.filePaths[0]
        })
    },
    'dialog:select-folder': (
      options: {
        defaultPath?: string
      } = {}
    ) => {
      console.log('Main: 收到选择目录请求, options:', options)
      return dialog
        .showOpenDialog({
          properties: ['openDirectory'],
          defaultPath: options.defaultPath
        })
        .then((result) => {
          console.log('Main: 选择目录结果:', result)
          return result.canceled ? null : result.filePaths[0]
        })
    }
  })
}
