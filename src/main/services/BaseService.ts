import type { ApiResponse } from '../../types/api'

/**
 * 基础服务类
 * 提供统一的返回值转换和错误处理机制
 */
export class BaseService {
  /**
   * 成功响应
   */
  protected success<T>(data: T, message = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data
    }
  }

  /**
   * 成功响应（无数据）
   */
  protected successNoData<T = unknown>(message = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message
    }
  }

  /**
   * 错误响应
   */
  protected error<T = unknown>(message = '操作失败', code = 500): ApiResponse<T> {
    return {
      code,
      message
    }
  }

  /**
   * 404错误响应
   */
  protected notFound<T = unknown>(message = '资源不存在'): ApiResponse<T> {
    return {
      code: 404,
      message
    }
  }

  /**
   * 处理Prisma错误
   */
  protected handlePrismaError<T = unknown>(error: unknown): ApiResponse<T> {
    if (error instanceof Error) {
      if (
        error.message.includes('Record to update not found') ||
        error.message.includes('Record to delete does not exist')
      ) {
        return this.notFound('资源不存在')
      }
      return this.error(error.message)
    }
    return this.error('操作失败')
  }

  /**
   * 执行服务方法并自动处理错误
   */
  protected async execute<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
      const result = await fn()
      return this.success(result)
    } catch (error) {
      return this.handlePrismaError(error)
    }
  }

  /**
   * 执行可能返回空值的服务方法
   */
  protected async executeWithNullCheck<T>(
    fn: () => Promise<T>,
    notFoundMessage = '资源不存在'
  ): Promise<ApiResponse<T>> {
    try {
      const result = await fn()
      if (result === null) {
        return this.notFound(notFoundMessage)
      }
      return this.success(result)
    } catch (error) {
      return this.handlePrismaError(error)
    }
  }
}
