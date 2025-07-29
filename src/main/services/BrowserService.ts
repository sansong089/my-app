import { PrismaClient } from '@prisma/client'
import type {
  BrowserEntity,
  BrowserQuery,
  BrowserCreateDTO,
  BrowserUpdateDTO
} from '../../types/browser'
import type { PageParams, PageResult } from '../../types/page'
import type { ApiResponse } from '../../types/api'
import { BaseService } from './BaseService'

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
        rows: rows,
        total
      },
      '查询成功'
    )
  }

  async getById(id: number): Promise<ApiResponse<BrowserEntity>> {
    return this.executeWithNullCheck(
      () =>
        this.prisma.browserInstance.findUnique({
          where: { id }
        }),
      '浏览器实例不存在'
    )
  }

  async create(data: BrowserCreateDTO): Promise<ApiResponse<BrowserEntity>> {
    return this.execute(() => this.prisma.browserInstance.create({ data }))
  }

  async update(data: BrowserUpdateDTO): Promise<ApiResponse<BrowserEntity>> {
    return this.executeWithNullCheck(
      () =>
        this.prisma.browserInstance.update({
          where: { id: data.id },
          data
        }),
      '浏览器实例不存在'
    )
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      await this.prisma.browserInstance.delete({
        where: { id }
      })
      return undefined
    })
  }
}
