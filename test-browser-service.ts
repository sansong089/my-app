import { PrismaClient } from '@prisma/client'
import { BrowserService } from './src/main/services/BrowserService'

async function testBrowserService() {
  const prisma = new PrismaClient()
  const browserService = new BrowserService(prisma)

  try {
    // 测试列表查询
    console.log('测试列表查询...')
    const listResult = await browserService.list({ page: 1, pageSize: 10 })
    console.log('列表查询结果:', listResult)

    // 测试创建
    console.log('\n测试创建...')
    const createResult = await browserService.create({
      groupId: 1,
      label: '测试浏览器',
      remark: '测试备注'
    })
    console.log('创建结果:', createResult)

    if (createResult.code === 200) {
      const id = createResult.data.id

      // 测试查询单个
      console.log('\n测试查询单个...')
      const getResult = await browserService.getById(id)
      console.log('查询结果:', getResult)

      // 测试更新
      console.log('\n测试更新...')
      const updateResult = await browserService.update({
        id: id,
        groupId: 1,
        label: '更新后的浏览器',
        remark: '更新后的备注'
      })
      console.log('更新结果:', updateResult)

      // 测试启动浏览器（需要先配置Chrome路径和用户数据目录）
      console.log('\n测试启动浏览器...')
      try {
        const startResult = await browserService.start(id)
        console.log('启动结果:', startResult)

        // 测试检查浏览器是否运行
        if (startResult.code === 200) {
          console.log('\n测试检查浏览器是否运行...')
          const isRunningResult = await browserService.isRunning(id)
          console.log('运行状态:', isRunningResult)

          // 测试获取所有运行中的浏览器
          console.log('\n测试获取所有运行中的浏览器...')
          const runningBrowsersResult = await browserService.getRunningBrowsers()
          console.log('运行中的浏览器:', runningBrowsersResult)

          // 测试停止浏览器
          console.log('\n测试停止浏览器...')
          const stopResult = await browserService.stop(id)
          console.log('停止结果:', stopResult)
        }
      } catch (error) {
        console.log('启动浏览器失败（可能需要先配置Chrome路径和用户数据目录）:', error.message)
      }

      // 测试删除
      console.log('\n测试删除...')
      const deleteResult = await browserService.delete(id)
      console.log('删除结果:', deleteResult)
    }

    // 测试查询不存在的记录
    console.log('\n测试查询不存在的记录...')
    const notFoundResult = await browserService.getById(999999)
    console.log('查询不存在记录结果:', notFoundResult)

  } catch (error) {
    console.error('测试过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBrowserService()
