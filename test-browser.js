const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const browser = await prisma.browserInstance.create({
    data: {
      group_id: 1,
      label: '测试浏览器',
      remark: '这是一个测试浏览器实例'
    }
  });
  console.log('Created browser:', browser);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
