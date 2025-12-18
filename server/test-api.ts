/**
 * Nest-Admin-Soybean 接口自动化测试脚本
 * 
 * 功能：
 * - 测试所有主要 API 接口
 * - 自动登录获取 token
 * - 生成测试报告
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// 测试配置
const CONFIG = {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    testUser: {
        userName: 'admin',
        password: 'admin123',
        tenantId: '000000',
    },
};

// 测试结果类型
interface TestResult {
    module: string;
    endpoint: string;
    method: string;
    status: 'success' | 'failed' | 'skipped';
    statusCode?: number;
    message: string;
    duration: number;
    timestamp: string;
}

// 测试报告
class TestReport {
    private results: TestResult[] = [];
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    addResult(result: TestResult) {
        this.results.push(result);
    }

    getStatistics() {
        const total = this.results.length;
        const success = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const skipped = this.results.filter(r => r.status === 'skipped').length;
        const successRate = total > 0 ? ((success / total) * 100).toFixed(2) : '0';

        return { total, success, failed, skipped, successRate };
    }

    generateReport() {
        const stats = this.getStatistics();
        const endTime = new Date();
        const duration = ((endTime.getTime() - this.startTime.getTime()) / 1000).toFixed(2);

        let report = '\n';
        report += '╔═══════════════════════════════════════════════════════════════════════╗\n';
        report += '║          Nest-Admin-Soybean API 接口测试报告                          ║\n';
        report += '╚═══════════════════════════════════════════════════════════════════════╝\n\n';

        report += `测试时间: ${this.startTime.toLocaleString('zh-CN')}\n`;
        report += `测试耗时: ${duration}s\n\n`;

        report += '测试统计:\n';
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `  总测试数:   ${stats.total}\n`;
        report += `  ✓ 成功:     ${stats.success}\n`;
        report += `  ✗ 失败:     ${stats.failed}\n`;
        report += `  ⊘ 跳过:     ${stats.skipped}\n`;
        report += `  成功率:     ${stats.successRate}%\n`;
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // 按模块分组显示结果
        const groupedResults = this.groupByModule();

        for (const [module, results] of Object.entries(groupedResults)) {
            report += `\n【${module}】\n`;
            report += '─'.repeat(70) + '\n';

            for (const result of results) {
                const statusIcon = result.status === 'success' ? '✓' : result.status === 'failed' ? '✗' : '⊘';
                const statusColor = result.status === 'success' ? '\x1b[32m' : result.status === 'failed' ? '\x1b[31m' : '\x1b[33m';
                const resetColor = '\x1b[0m';

                report += `  ${statusColor}${statusIcon}${resetColor} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} `;
                report += `[${result.statusCode || '---'}] ${result.duration}ms\n`;

                if (result.status === 'failed') {
                    report += `    └─ ${result.message}\n`;
                }
            }
        }

        // 失败详情
        const failedResults = this.results.filter(r => r.status === 'failed');
        if (failedResults.length > 0) {
            report += '\n\n失败详情:\n';
            report += '═'.repeat(70) + '\n';

            failedResults.forEach((result, index) => {
                report += `\n${index + 1}. ${result.module} - ${result.method} ${result.endpoint}\n`;
                report += `   错误: ${result.message}\n`;
                report += `   状态码: ${result.statusCode || 'N/A'}\n`;
            });
        }

        return report;
    }

    private groupByModule(): Record<string, TestResult[]> {
        return this.results.reduce((acc, result) => {
            if (!acc[result.module]) {
                acc[result.module] = [];
            }
            acc[result.module].push(result);
            return acc;
        }, {} as Record<string, TestResult[]>);
    }

    saveToFile() {
        const stats = this.getStatistics();
        const reportData = {
            summary: {
                startTime: this.startTime.toISOString(),
                endTime: new Date().toISOString(),
                statistics: stats,
            },
            results: this.results,
        };

        const filePath = path.join(process.cwd(), `test-report-${Date.now()}.json`);
        fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 详细报告已保存至: ${filePath}`);
    }
}

// 测试执行器
class ApiTester {
    private client: AxiosInstance;
    private report: TestReport;
    private token: string = '';

    constructor() {
        this.client = axios.create({
            baseURL: CONFIG.baseURL,
            timeout: CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.report = new TestReport();
    }

    // 执行单个测试
    private async executeTest(
        module: string,
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        options: {
            data?: any;
            params?: any;
            requireAuth?: boolean;
            skipTest?: boolean;
            skipReason?: string;
        } = {}
    ): Promise<void> {
        const startTime = Date.now();

        if (options.skipTest) {
            this.report.addResult({
                module,
                endpoint,
                method,
                status: 'skipped',
                message: options.skipReason || '已跳过',
                duration: 0,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        try {
            const headers: any = {
                'tenant-id': CONFIG.testUser.tenantId,
            };

            if (options.requireAuth !== false && this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const config = {
                method,
                url: endpoint,
                headers,
                data: options.data,
                params: options.params,
            };

            const response = await this.client.request(config);
            const duration = Date.now() - startTime;

            this.report.addResult({
                module,
                endpoint,
                method,
                status: 'success',
                statusCode: response.status,
                message: '测试通过',
                duration,
                timestamp: new Date().toISOString(),
            });

            console.log(`✓ ${method.padEnd(6)} ${endpoint.padEnd(40)} [${response.status}] ${duration}ms`);
        } catch (error) {
            const duration = Date.now() - startTime;
            const axiosError = error as AxiosError;

            this.report.addResult({
                module,
                endpoint,
                method,
                status: 'failed',
                statusCode: axiosError.response?.status,
                message: axiosError.message,
                duration,
                timestamp: new Date().toISOString(),
            });

            console.log(`✗ ${method.padEnd(6)} ${endpoint.padEnd(40)} [${axiosError.response?.status || 'ERR'}] ${duration}ms`);
        }
    }

    // 登录获取 token
    async login(): Promise<boolean> {
        console.log('\n━━━ 执行登录 ━━━');
        try {
            // 先获取验证码 (尝试不带 token)
            try {
                const captchaRes = await this.client.get('/captchaImage', {
                    headers: {
                        'tenant-id': CONFIG.testUser.tenantId,
                    },
                });

                if (captchaRes.data?.code === 200 && captchaRes.data?.data) {
                    const uuid = captchaRes.data.data.uuid;
                    console.log('✓ 获取验证码成功, UUID:', uuid);

                    // 登录
                    const loginRes = await this.client.post(
                        '/login',
                        {
                            userName: CONFIG.testUser.userName,
                            password: CONFIG.testUser.password,
                            code: '1234',  // 测试环境可能会跳过验证
                            uuid: uuid,
                        },
                        {
                            headers: {
                                'tenant-id': CONFIG.testUser.tenantId,
                            },
                        }
                    );

                    if (loginRes.data?.code === 200 && loginRes.data?.data?.token) {
                        this.token = loginRes.data.data.token;
                        console.log('✓ 登录成功，已获取 token');
                        return true;
                    } else {
                        console.log('✗ 登录失败:', loginRes.data?.msg);
                        return false;
                    }
                } else {
                    console.log('✗ 获取验证码失败:', captchaRes.data?.msg);
                    // 尝试直接登录（如果验证码被禁用）
                    console.log('━ 尝试不使用验证码登录...');
                    const loginRes = await this.client.post(
                        '/login',
                        {
                            userName: CONFIG.testUser.userName,
                            password: CONFIG.testUser.password,
                        },
                        {
                            headers: {
                                'tenant-id': CONFIG.testUser.tenantId,
                            },
                        }
                    );

                    if (loginRes.data?.code === 200 && loginRes.data?.data?.token) {
                        this.token = loginRes.data.data.token;
                        console.log('✓ 登录成功（无验证码），已获取 token');
                        return true;
                    } else {
                        console.log('✗ 登录失败:', loginRes.data?.msg);
                        return false;
                    }
                }
            } catch (error) {
                const axiosError = error as AxiosError;
                console.log('✗ 验证码请求失败，状态码:', axiosError.response?.status);
                console.log('  尝试直接登录...');

                // 尝试直接登录
                const loginRes = await this.client.post(
                    '/login',
                    {
                        userName: CONFIG.testUser.userName,
                        password: CONFIG.testUser.password,
                    },
                    {
                        headers: {
                            'tenant-id': CONFIG.testUser.tenantId,
                        },
                    }
                );

                if (loginRes.data?.code === 200 && loginRes.data?.data?.token) {
                    this.token = loginRes.data.data.token;
                    console.log('✓ 登录成功，已获取 token');
                    return true;
                } else {
                    console.log('✗ 登录失败:', loginRes.data?.msg);
                    return false;
                }
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.log('✗ 登录异常:', axiosError.message);
            if (axiosError.response?.data) {
                console.log('  详情:', JSON.stringify(axiosError.response.data, null, 2));
            }
            return false;
        }
    }

    // 测试基础接口（无需认证）
    async testBasicEndpoints() {
        console.log('\n━━━ 测试基础接口（无需认证）━━━');

        await this.executeTest('基础', '/captchaImage', 'GET', { requireAuth: false });
        await this.executeTest('基础', '/health', 'GET', { requireAuth: false });
        await this.executeTest('基础', '/health/liveness', 'GET', { requireAuth: false });
        await this.executeTest('基础', '/health/readiness', 'GET', { requireAuth: false });
        await this.executeTest('基础', '/metrics', 'GET', { requireAuth: false });
    }

    // 测试认证相关接口
    async testAuthEndpoints() {
        console.log('\n━━━ 测试认证相关接口 ━━━');

        await this.executeTest('认证', '/getInfo', 'GET');
        await this.executeTest('认证', '/getRouters', 'GET');
    }

    // 测试系统管理-用户管理
    async testUserEndpoints() {
        console.log('\n━━━ 测试系统管理-用户管理 ━━━');

        await this.executeTest('用户管理', '/system/user/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('用户管理', '/system/user/1', 'GET');
        await this.executeTest('用户管理', '/system/user/authRole/1', 'GET');
        await this.executeTest('用户管理', '/system/user/deptTree', 'GET');

        // 创建测试（需要完整数据，这里跳过）
        await this.executeTest('用户管理', '/system/user', 'POST', {
            skipTest: true,
            skipReason: '需要完整用户数据'
        });
    }

    // 测试系统管理-角色管理
    async testRoleEndpoints() {
        console.log('\n━━━ 测试系统管理-角色管理 ━━━');

        await this.executeTest('角色管理', '/system/role/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('角色管理', '/system/role/optionselect', 'GET');
        await this.executeTest('角色管理', '/system/role/1', 'GET', {
            skipTest: true,
            skipReason: '需要有效角色ID'
        });
    }

    // 测试系统管理-菜单管理
    async testMenuEndpoints() {
        console.log('\n━━━ 测试系统管理-菜单管理 ━━━');

        await this.executeTest('菜单管理', '/system/menu/list', 'GET');
        await this.executeTest('菜单管理', '/system/menu/treeselect', 'GET');
        await this.executeTest('菜单管理', '/system/menu/roleMenuTreeselect/1', 'GET', {
            skipTest: true,
            skipReason: '需要有效角色ID'
        });
    }

    // 测试系统管理-部门管理
    async testDeptEndpoints() {
        console.log('\n━━━ 测试系统管理-部门管理 ━━━');

        await this.executeTest('部门管理', '/system/dept/list', 'GET');
        await this.executeTest('部门管理', '/system/dept/list/exclude/1', 'GET', {
            skipTest: true,
            skipReason: '需要有效部门ID'
        });
    }

    // 测试系统管理-岗位管理
    async testPostEndpoints() {
        console.log('\n━━━ 测试系统管理-岗位管理 ━━━');

        await this.executeTest('岗位管理', '/system/post/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统管理-字典管理
    async testDictEndpoints() {
        console.log('\n━━━ 测试系统管理-字典管理 ━━━');

        await this.executeTest('字典管理', '/system/dict/type/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('字典管理', '/system/dict/data/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('字典管理', '/system/dict/data/type/sys_normal_disable', 'GET');
    }

    // 测试系统管理-参数配置
    async testConfigEndpoints() {
        console.log('\n━━━ 测试系统管理-参数配置 ━━━');

        await this.executeTest('参数配置', '/system/config/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('参数配置', '/system/config/configKey/sys.index.skinName', 'GET');
    }

    // 测试系统管理-通知公告
    async testNoticeEndpoints() {
        console.log('\n━━━ 测试系统管理-通知公告 ━━━');

        await this.executeTest('通知公告', '/system/notice/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统管理-租户管理
    async testTenantEndpoints() {
        console.log('\n━━━ 测试系统管理-租户管理 ━━━');

        await this.executeTest('租户管理', '/system/tenant/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('租户管理', '/system/tenant/package/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试文件管理
    async testFileManagerEndpoints() {
        console.log('\n━━━ 测试文件管理 ━━━');

        await this.executeTest('文件管理', '/system/file-manager/file/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统监控-在线用户
    async testOnlineEndpoints() {
        console.log('\n━━━ 测试系统监控-在线用户 ━━━');

        await this.executeTest('在线用户', '/monitor/online/list', 'GET', {
            params: { pageNum: '1', pageSize: '10' }
        });
    }

    // 测试系统监控-定时任务
    async testJobEndpoints() {
        console.log('\n━━━ 测试系统监控-定时任务 ━━━');

        await this.executeTest('定时任务', '/monitor/job/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
        await this.executeTest('定时任务', '/monitor/jobLog/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统监控-操作日志
    async testOperlogEndpoints() {
        console.log('\n━━━ 测试系统监控-操作日志 ━━━');

        await this.executeTest('操作日志', '/monitor/operlog/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统监控-登录日志
    async testLoginlogEndpoints() {
        console.log('\n━━━ 测试系统监控-登录日志 ━━━');

        await this.executeTest('登录日志', '/monitor/logininfor/list', 'GET', { params: { pageNum: 1, pageSize: 10 } });
    }

    // 测试系统监控-缓存监控
    async testCacheEndpoints() {
        console.log('\n━━━ 测试系统监控-缓存监控 ━━━');

        await this.executeTest('缓存监控', '/monitor/cache', 'GET');
        await this.executeTest('缓存监控', '/monitor/cache/getNames', 'GET');
    }

    // 测试系统监控-服务器监控
    async testServerEndpoints() {
        console.log('\n━━━ 测试系统监控-服务器监控 ━━━');

        await this.executeTest('服务器监控', '/monitor/server', 'GET');
    }

    // 测试系统工具
    async testToolEndpoints() {
        console.log('\n━━━ 测试系统工具 ━━━');

        await this.executeTest('系统工具', '/tool/gen/list', 'GET', {
            params: { pageNum: 1, pageSize: 10 },
            skipTest: true,
            skipReason: '代码生成功能可选'
        });
    }

    // 执行所有测试
    async runAllTests() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║       开始执行 Nest-Admin-Soybean API 接口自动化测试                 ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝');

        // 1. 测试基础接口
        await this.testBasicEndpoints();

        // 2. 登录获取 token
        const loginSuccess = await this.login();

        if (!loginSuccess) {
            console.log('\n⚠️  登录失败，跳过需要认证的接口测试');
            return;
        }

        // 3. 测试认证接口
        await this.testAuthEndpoints();

        // 4. 测试系统管理模块
        await this.testUserEndpoints();
        await this.testRoleEndpoints();
        await this.testMenuEndpoints();
        await this.testDeptEndpoints();
        await this.testPostEndpoints();
        await this.testDictEndpoints();
        await this.testConfigEndpoints();
        await this.testNoticeEndpoints();
        await this.testTenantEndpoints();
        await this.testFileManagerEndpoints();

        // 5. 测试系统监控模块
        await this.testOnlineEndpoints();
        await this.testJobEndpoints();
        await this.testOperlogEndpoints();
        await this.testLoginlogEndpoints();
        await this.testCacheEndpoints();
        await this.testServerEndpoints();

        // 6. 测试系统工具
        await this.testToolEndpoints();

        // 生成并显示报告
        const report = this.report.generateReport();
        console.log(report);

        // 保存报告到文件
        this.report.saveToFile();
    }
}

// 主函数
async function main() {
    const tester = new ApiTester();
    await tester.runAllTests();
}

// 执行测试
main().catch(console.error);
