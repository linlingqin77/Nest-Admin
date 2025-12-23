#!/usr/bin/env node
/**
 * 测试 demo 账号登录
 * 验证密码修复是否成功
 */

const https = require('https');

const API_URL = 'https://linlingqin.top/prod-api/auth/login';

// 不使用加密的测试数据
const loginData = {
  username: 'demo',
  password: 'demo123',
  tenantId: '000000',
  clientId: 'test-script'
};

console.log('🔍 测试 demo 账号登录...\n');
console.log('API 地址:', API_URL);
console.log('登录信息:', { username: loginData.username, tenantId: loginData.tenantId });
console.log('');

const postData = JSON.stringify(loginData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'tenant-id': '000000',
    'content-language': 'zh_CN',
    'accept': 'application/json'
  }
};

const req = https.request(API_URL, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应状态码:', res.statusCode);
    console.log('响应数据:', data);
    console.log('');

    try {
      const result = JSON.parse(data);
      
      if (result.code === 200 && result.data?.access_token) {
        console.log('✅ 登录成功！');
        console.log('Token:', result.data.access_token.substring(0, 50) + '...');
      } else {
        console.log('❌ 登录失败！');
        console.log('错误信息:', result.msg || result.message);
      }
    } catch (e) {
      console.log('❌ 解析响应失败:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.write(postData);
req.end();
