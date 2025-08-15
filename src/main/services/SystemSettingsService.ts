import { PrismaClient } from '@prisma/client'
import type { ApiResponse } from '../../types/api'
import { BaseService } from './BaseService'

export class SystemSettingsService extends BaseService {
  constructor(private prisma: PrismaClient) {
    super()
  }

  async getAll(): Promise<ApiResponse<Record<string, string>>> {
    return this.execute(async () => {
      const settings = await this.prisma.systemSettings.findMany()
      const result: Record<string, string> = {}

      settings.forEach((setting) => {
        if (setting.value !== null) {
          result[setting.varName] = setting.value
        }
      })

      return result
    })
  }

  async get(varName: string): Promise<ApiResponse<string | null>> {
    return this.executeWithNullCheck(
      () =>
        this.prisma.systemSettings
          .findUnique({
            where: { varName },
            select: { value: true }
          })
          .then((result) => result?.value ?? null),
      '设置不存在'
    )
  }

  async set(varName: string, value: string): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      await this.prisma.systemSettings.upsert({
        where: { varName },
        update: { value },
        create: { varName, value }
      })
    })
  }

  async mset(settings: Record<string, string>): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      const promises = Object.entries(settings).map(([varName, value]) =>
        this.prisma.systemSettings.upsert({
          where: { varName },
          update: { value },
          create: { varName, value }
        })
      )
      await Promise.all(promises)
    })
  }
}
