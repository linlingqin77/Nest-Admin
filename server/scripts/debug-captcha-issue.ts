import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 测试多租户验证码配置问题...\n');
  
  // 检查是否有多个租户的配置
  const allConfigs = await prisma.sysConfig.findMany({
    select: {
      tenantId: true
    },
    distinct: ['tenantId'],
    orderBy: {
      tenantId: 'asc'
    }
  });
  
  console.log('所有有配置的租户:', allConfigs.map(c => c.tenantId));
  console.log('');
  
  // 查询所有验证码配置
  const configs = await prisma.sysConfig.findMany({
    where: {
      configKey: 'sys.account.captchaEnabled'
    },
    orderBy: {
      tenantId: 'asc'
    }
  });

  console.log('验证码配置:\n');
  configs.forEach(config => {
    console.log(`  租户: ${config.tenantId}, 值: ${config.configValue}, 状态: ${config.status}`);
  });
  
  console.log('\n📋 缓存键分析:');
  console.log('  当前缓存键格式: SYS_CONFIG:{configKey}');
  console.log('  问题: 没有包含 tenantId，导致不同租户共享同一个缓存');
  console.log('  建议: 改为 SYS_CONFIG:{tenantId}:{configKey}');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
