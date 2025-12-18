/**
 * 验证URL生成逻辑
 */

const path = require('path');

// 模拟配置
const config = {
    'app.file.domain': 'http://localhost:8080',
    'app.file.serveRoot': '/profile'
};

// 模拟文件路径
const relativeFilePath = '/test.jpeg_1765956498931.jpeg';

console.log('=== URL生成测试 ===\n');

// ❌ 错误的方式（使用 path.posix.join）
const fileName1 = path.posix.join(config['app.file.serveRoot'], relativeFilePath);
const wrongUrl = path.posix.join(config['app.file.domain'], fileName1);
console.log('❌ 使用 path.posix.join:');
console.log('   fileName:', fileName1);
console.log('   URL:', wrongUrl);
console.log('   问题: http:// 被破坏为 http:/\n');

// ✅ 正确的方式（使用字符串拼接）
const fileName2 = path.posix.join(config['app.file.serveRoot'], relativeFilePath);
const correctUrl = `${config['app.file.domain']}${fileName2}`;
console.log('✅ 使用字符串拼接:');
console.log('   fileName:', fileName2);
console.log('   URL:', correctUrl);
console.log('   正确! ✓\n');

// 测试不同的 domain 格式
const testCases = [
    { domain: 'http://localhost:8080', name: '标准格式（无尾斜杠）' },
    { domain: 'http://localhost:8080/', name: '带尾斜杠' },
    { domain: 'https://cdn.example.com', name: 'HTTPS域名' },
    { domain: 'https://cdn.example.com/', name: 'HTTPS域名带尾斜杠' }
];

console.log('=== 不同 domain 格式测试 ===\n');

testCases.forEach(({ domain, name }) => {
    const fileName = path.posix.join('/profile', '/test.jpg');
    const url = `${domain}${fileName}`;
    const hasDoubleSlash = url.includes('://') && url.split('://')[1].includes('//');

    console.log(`${name}:`);
    console.log(`  Domain: ${domain}`);
    console.log(`  FileName: ${fileName}`);
    console.log(`  结果: ${url}`);
    console.log(`  状态: ${hasDoubleSlash ? '❌ 有双斜杠问题' : '✅ 正确'}\n`);
});

console.log('=== 推荐实践 ===');
console.log('1. 配置中的 domain 不要以斜杠结尾');
console.log('2. fileName 总是以斜杠开头（通过 path.posix.join 确保）');
console.log('3. URL拼接: `${domain}${fileName}`');
