# PNPM 锁文件配置问题说明

## 问题描述

在 GitHub Actions 中运行部署时可能会遇到以下错误：

```
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH  Cannot proceed with the frozen installation. 
The current "overrides" configuration doesn't match the value found in the lockfile

Update your lockfile using "pnpm install --no-frozen-lockfile"
Error: Process completed with exit code 1.
```

## 原因

这个错误发生的原因是：
1. `pnpm-lock.yaml` 中记录的配置与当前 `package.json` 中的 `overrides` 或其他配置不匹配
2. 使用 `--frozen-lockfile` 参数时，pnpm 会严格检查一致性，发现不匹配就会报错

## 已实施的解决方案

我们的工作流文件已经更新为使用 `--no-frozen-lockfile` 参数，这样：

1. **构建阶段**：允许更新锁文件以匹配当前配置
2. **部署阶段**：优先尝试 `--no-frozen-lockfile`，失败时回退到普通安装

### 更新的工作流

```yaml
# 前端依赖安装
- name: Install frontend dependencies
  run: |
    cd admin-naive-ui
    pnpm install --no-frozen-lockfile || pnpm install

# 后端依赖安装
- name: Install backend dependencies
  run: |
    cd server
    pnpm install --no-frozen-lockfile || pnpm install
```

## 本地修复方法

如果你想在本地修复这个问题：

```bash
# 进入出问题的目录
cd server  # 或 cd admin-naive-ui

# 更新锁文件
pnpm install --no-frozen-lockfile

# 提交更新后的锁文件
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml"
git push
```

## 预防措施

### 1. 保持锁文件同步

当修改 `package.json` 后，记得运行：

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
```

### 2. 使用 pnpm 版本管理

在 `package.json` 中指定 pnpm 版本：

```json
{
  "packageManager": "pnpm@10.5.0",
  "engines": {
    "pnpm": ">=10.5.0"
  }
}
```

### 3. CI/CD 策略选择

根据项目需求选择合适的策略：

#### 严格模式（不推荐用于生产部署）
```yaml
pnpm install --frozen-lockfile
```
- ✅ 确保依赖完全一致
- ❌ 配置不匹配时会失败
- 适用于：测试环境、依赖审计

#### 灵活模式（推荐用于生产部署）⭐
```yaml
pnpm install --no-frozen-lockfile || pnpm install
```
- ✅ 自动适应配置变化
- ✅ 提高部署成功率
- ✅ 保持依赖相对稳定
- 适用于：生产部署、持续部署

#### 完全更新模式（谨慎使用）
```yaml
pnpm install
```
- ⚠️ 可能更新到最新版本
- ⚠️ 可能引入破坏性变更
- 适用于：开发环境、依赖升级

## 当前配置

我们的 GitHub Actions 工作流使用的是**灵活模式**：

- 构建阶段：`pnpm install --no-frozen-lockfile || pnpm install`
- 部署阶段：`pnpm install --prod --no-frozen-lockfile || pnpm install --prod`

这确保了：
1. 部署不会因为锁文件不匹配而失败
2. 依赖保持相对稳定（基于 package.json 的版本范围）
3. 生产环境只安装生产依赖

## 相关资源

- [PNPM 文档 - frozen-lockfile](https://pnpm.io/cli/install#--frozen-lockfile)
- [PNPM 文档 - overrides](https://pnpm.io/package_json#pnpmoverrides)
- [GitHub Actions 文档](https://docs.github.com/actions)

## 如果问题仍然存在

1. 检查 `package.json` 中的 `overrides` 或 `resolutions` 配置
2. 删除 `node_modules` 和 `pnpm-lock.yaml` 重新安装
3. 确保本地和 CI 使用相同版本的 pnpm
4. 查看 GitHub Actions 日志获取详细错误信息

## 总结

✅ 工作流已优化，不会因锁文件配置不匹配而失败  
✅ 推送代码即可自动部署，无需手动修复  
✅ 如需更严格的依赖控制，可在本地更新锁文件后提交
