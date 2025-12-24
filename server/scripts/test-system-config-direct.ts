import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();

  try {
    console.log('测试系统配置表查询...\n');

    // 测试1: 直接查询
    const config = await prisma.$queryRaw`
      SELECT config_key, config_value 
      FROM sys_system_config 
      WHERE config_key = 'sys.account.captchaEnabled'
        AND del_flag = '0'
        AND status = '0'
      LIMIT 1
    `;

    console.log('查询结果:', config);

    // 测试2: 多次查询验证稳定性
    console.log('\n稳定性测试:');
    for (let i = 1; i <= 10; i++) {
      const result = await prisma.$queryRaw<Array<{ config_value: string }>>`
        SELECT config_value 
        FROM sys_system_config 
        WHERE config_key = 'sys.account.captchaEnabled'
          AND del_flag = '0'
          AND status = '0'
        LIMIT 1
      `;
      console.log(`  请求 ${i}: ${result[0]?.config_value || 'null'}`);
    }

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
