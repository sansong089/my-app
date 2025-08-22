import { PrismaClient } from '@prisma/client'
import { spawn } from 'child_process'
import type {
  BrowserEntity,
  BrowserQuery,
  BrowserCreateDTO,
  BrowserUpdateDTO
} from '../../types/browser'
import type { PageParams, PageResult } from '../../types/page'
import type { ApiResponse } from '../../types/api'
import { BaseService } from './BaseService'
import { SystemSettingsService } from './SystemSettingsService'

// 用于类型转换的辅助函数
function toBrowserEntity(data: any): BrowserEntity {
  return {
    ...data,
    status: data.status as 'stopped' | 'running'
  }
}

export class BrowserService extends BaseService {
  constructor(private prisma: PrismaClient) {
    super()
  }

  async list(
    page: PageParams,
    query?: BrowserQuery
  ): Promise<ApiResponse<PageResult<BrowserEntity>>> {
    const where = {
      groupId: query?.groupId,
      label: query?.label ? { contains: query.label } : undefined
    }

    const [rows, total] = await Promise.all([
      this.prisma.browserInstance.findMany({
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.browserInstance.count({ where })
    ])

    return this.success(
      {
        rows: rows.map(toBrowserEntity),
        total
      },
      '查询成功'
    )
  }

  async getById(id: number): Promise<ApiResponse<BrowserEntity | null>> {
    return this.executeWithNullCheck(async () => {
      const result = await this.prisma.browserInstance.findUnique({
        where: { id }
      })
      return result ? toBrowserEntity(result) : null
    }, '浏览器实例不存在')
  }

  async create(data: BrowserCreateDTO): Promise<ApiResponse<BrowserEntity>> {
    return this.execute(async () => {
      const result = await this.prisma.browserInstance.create({ data })
      return toBrowserEntity(result)
    })
  }

  async update(data: BrowserUpdateDTO): Promise<ApiResponse<BrowserEntity>> {
    return this.executeWithNullCheck(async () => {
      const result = await this.prisma.browserInstance.update({
        where: { id: data.id },
        data
      })
      return toBrowserEntity(result)
    }, '浏览器实例不存在')
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 先检查浏览器是否在运行，如果在运行则先停止
      const browser = await this.prisma.browserInstance.findUnique({
        where: { id }
      })

      if (browser && browser.status === 'running') {
        await this.stop(id)
      }

      await this.prisma.browserInstance.delete({
        where: { id }
      })
      return undefined
    })
  }

  /**
   * 启动浏览器实例
   * @param id 浏览器实例ID
   * @returns 启动结果
   */
  async start(id: number): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 获取浏览器实例信息
      const browser = await this.prisma.browserInstance.findUnique({
        where: { id }
      })

      if (!browser) {
        throw new Error('浏览器实例不存在')
      }

      // 检查浏览器是否已经在运行
      if (browser.status === 'running' && browser.pid) {
        // 验证进程是否真的在运行
        if (this.isProcessRunning(browser.pid)) {
          return
        } else {
          // 进程已退出但状态未更新，更新状态
          await this.prisma.browserInstance.update({
            where: { id },
            data: { status: 'stopped', pid: null }
          })
        }
      }

      // 获取系统设置
      const settingsService = new SystemSettingsService(this.prisma)

      const chromePathResponse = await settingsService.get('chrome_path')
      const userDataPathResponse = await settingsService.get('user_data_path')

      if (!chromePathResponse.data || !userDataPathResponse.data) {
        throw new Error('请先配置Chrome路径和用户数据目录')
      }

      // 构建用户数据目录路径
      const instanceUserDataDir = `${userDataPathResponse.data}/${id}`

      // 启动浏览器进程
      const browserProcess = spawn(chromePathResponse.data, [
        `--user-data-dir=${instanceUserDataDir}`,
        '--no-first-run',
        '--no-default-browser-check'
      ])

      // 监听进程事件
      browserProcess.on('error', (error) => {
        console.error(`浏览器实例 ${id} 启动失败:`, error)
        // 更新数据库状态
        this.prisma.browserInstance
          .update({
            where: { id },
            data: { status: 'stopped', pid: null }
          })
          .catch((err) => console.error('更新浏览器状态失败:', err))
      })

      browserProcess.on('exit', (code, signal) => {
        console.log(`浏览器实例 ${id} 已退出，退出码: ${code}, 信号: ${signal}`)
        // 更新数据库状态
        this.prisma.browserInstance
          .update({
            where: { id },
            data: { status: 'stopped', pid: null }
          })
          .catch((err) => console.error('更新浏览器状态失败:', err))
      })

      // 更新数据库中的进程信息
      await this.prisma.browserInstance.update({
        where: { id },
        data: {
          status: 'running',
          pid: browserProcess.pid
        }
      })
    })
  }

  /**
   * 停止浏览器实例
   * @param id 浏览器实例ID
   * @returns 停止结果
   */
  async stop(id: number): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 获取浏览器实例信息
      const browser = await this.prisma.browserInstance.findUnique({
        where: { id }
      })

      if (!browser) {
        throw new Error('浏览器实例不存在')
      }

      // 如果浏览器未运行，直接返回
      if (browser.status !== 'running' || !browser.pid) {
        return
      }

      // 直接通过PID终止进程
      if (browser.pid) {
        try {
          process.kill(browser.pid, 'SIGTERM')
        } catch {
          /* empty */
        }
      }

      // 更新数据库状态
      await this.prisma.browserInstance.update({
        where: { id },
        data: { status: 'stopped', pid: null }
      })
    })
  }

  /**
   * 检查浏览器是否正在运行
   * @param id 浏览器实例ID
   * @returns 运行状态
   */
  async isRunning(id: number): Promise<ApiResponse<boolean>> {
    return this.execute(async () => {
      const browser = await this.prisma.browserInstance.findUnique({
        where: { id }
      })

      if (!browser || browser.status !== 'running' || !browser.pid) {
        return false
      }

      // 验证进程是否真的在运行
      const isRunning = this.isProcessRunning(browser.pid)

      // 如果进程未运行但状态显示为运行中，更新状态
      if (!isRunning) {
        await this.prisma.browserInstance.update({
          where: { id },
          data: { status: 'stopped', pid: null }
        })
      }

      return isRunning
    })
  }

  /**
   * 检查进程是否正在运行
   * @param pid 进程ID
   * @returns 是否运行
   */
  private isProcessRunning(pid: number): boolean {
    try {
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取所有运行中的浏览器实例
   * @returns 运行中的浏览器实例列表
   */
  async getRunningBrowsers(): Promise<ApiResponse<BrowserEntity[]>> {
    return this.execute(async () => {
      const browsers = await this.prisma.browserInstance.findMany({
        where: { status: 'running' }
      })

      // 验证每个浏览器的实际运行状态
      const runningBrowsers: BrowserEntity[] = []
      for (const browser of browsers) {
        if (browser.pid && this.isProcessRunning(browser.pid)) {
          runningBrowsers.push(toBrowserEntity(browser))
        } else {
          // 进程已退出但状态未更新，更新状态
          await this.prisma.browserInstance.update({
            where: { id: browser.id },
            data: { status: 'stopped', pid: null }
          })
        }
      }

      return runningBrowsers
    })
  }

  /**
   * 更新所有浏览器实例的状态
   * 用于启动时同步数据库状态与实际进程状态
   */
  async syncAllBrowserStatus(): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      const browsers = await this.prisma.browserInstance.findMany({
        where: { status: 'running' }
      })

      for (const browser of browsers) {
        if (!browser.pid || !this.isProcessRunning(browser.pid)) {
          // 进程未运行，更新状态
          await this.prisma.browserInstance.update({
            where: { id: browser.id },
            data: { status: 'stopped', pid: null }
          })
        }
      }

      return undefined
    })
  }
}
