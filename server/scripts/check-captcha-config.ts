import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 查询验证码配置...\n');
  
  const configs = await prisma.sysConfig.findMany({
    where: {
      configKey: 'sys.account.captchaEnabled'
    },
    orderBy: {
      tenantId: 'asc'
    }
  });

  console.log('找到的配置记录:\n');
  configs.forEach(config => {
    console.log(`租户ID: ${config.tenantId}`);
    console.log(`配置ID: ${config.configId}`);
    console.log(`配置值: ${config.configValue}`);
    console.log(`状态: ${config.status}`);
    console.log(`删除标记: ${config.delFlag}`);
    console.log('---');
  });

  console.log(`\n总计: ${configs.length} 条记录`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
