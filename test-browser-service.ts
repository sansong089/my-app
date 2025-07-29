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
