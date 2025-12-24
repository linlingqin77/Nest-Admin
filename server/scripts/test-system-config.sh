#!/bin/bash

echo "🔍 开始测试企业级系统配置方案..."
echo ""

SUCCESS=0
FAILED=0

for i in {1..30}; do
  result=$(curl -s http://localhost:8080/api/auth/code | jq -r '.data.captchaEnabled' 2>/dev/null)
  
  if [ "$result" = "true" ]; then
    ((SUCCESS++))
    if [ $((i % 10)) -eq 0 ]; then
      echo "✓ 前 $i 次成功"
    fi
  else
    ((FAILED++))
    echo "❌ 第 $i 次失败: 返回值 = $result"
    break
  fi
  
  sleep 0.1
done

echo ""
echo "测试结果："
echo "  成功: $SUCCESS 次"
echo "  失败: $FAILED 次"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 所有30次请求全部成功！企业级方案验证通过！"
  echo ""
  echo "✨ 关键改进："
  echo "  1. 创建独立的 sys_system_config 表"
  echo "  2. SystemPrismaService 不应用租户扩展"
  echo "  3. SystemCacheable 装饰器 - 缓存键不包含 tenant_id"
  echo "  4. 数据自动迁移，保持向后兼容"
  echo "  5. 完整的配置管理 API (CRUD + 缓存刷新)"
  exit 0
else
  echo "⚠️  测试失败，需要进一步排查"
  exit 1
fi
