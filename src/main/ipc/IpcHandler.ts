import { ipcMain } from 'electron'

/**
 * IPC处理器工具类
 * 提供统一的IPC注册和错误处理机制
 */
export class IpcHandler {
  /**
   * 注册IPC处理器
   */
  static handle<T extends (...args: any[]) => Promise<any>>(channel: string, handler: T): void {
    ipcMain.handle(channel, async (_, ...args: Parameters<T>) => {
      console.log(`IPC调用开始 [${channel}], 参数:`, args)
      try {
        const result = await handler(...args)
        console.log(`IPC调用成功 [${channel}], 结果:`, result)
        return result
      } catch (error) {
        console.error(`IPC调用失败 [${channel}]:`, error)
        return {
          code: 500,
          message: error instanceof Error ? error.message : '服务器内部错误'
        }
      }
    })
  }

  /**
   * 注册多个IPC处理器
   */
  static registerHandlers(handlers: Record<string, (...args: any[]) => Promise<any>>): void {
    Object.entries(handlers).forEach(([channel, handler]) => {
      this.handle(channel, handler)
    })
  }
}
