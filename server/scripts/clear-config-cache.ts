import Redis from 'ioredis';

async function main() {
  console.log('🧹 清理旧的配置缓存...\n');

  // 使用生产环境Redis配置
  const redisConfig = {
    host: 'localhost',
    port: 6379,
    password: '123456',
    db: 2,
  };

  console.log(`连接 Redis: ${redisConfig.host}:${redisConfig.port} (DB: ${redisConfig.db})`);

  const client = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
  });

  try {
    // 查找所有配置缓存键
    const keys = await client.keys('SYS_CONFIG:*');
    
    console.log(`找到 ${keys.length} 个旧缓存键\n`);
    
    if (keys.length > 0) {
      console.log('将删除以下缓存键:');
      keys.forEach(key => console.log(`  - ${key}`));
      
      // 删除所有旧缓存
      const deleted = await client.del(keys);
      console.log(`\n✅ 成功删除 ${deleted} 个缓存键`);
    } else {
      console.log('✅ 没有需要清理的缓存');
    }
  } catch (error) {
    console.error('❌ 清理缓存失败:', error);
  } finally {
    await client.quit();
  }
}

main()
  .then(() => {
    console.log('\n✨ 清理完成！');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ 执行失败:', e);
    process.exit(1);
  });
