@echo off
REM Nest Admin 本地部署脚本 (Windows)
REM 使用方法: scripts\deploy-local.bat [environment]
REM 环境选项: dev (开发环境), test (测试环境), prod (生产环境)

setlocal enabledelayedexpansion

REM 设置环境变量
set ENV=%1
if "%ENV%"=="" set ENV=dev

REM 转换环境变量
if "%ENV%"=="dev" set NODE_ENV=development
if "%ENV%"=="development" set NODE_ENV=development
if "%ENV%"=="test" set NODE_ENV=test
if "%ENV%"=="prod" set NODE_ENV=production
if "%ENV%"=="production" set NODE_ENV=production

if "%NODE_ENV%"=="" (
    echo [ERROR] 无效的环境: %ENV% (可选: dev, test, prod)
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║     Nest Admin 本地部署脚本                ║
echo ║     Local Deployment Script                ║
echo ╚════════════════════════════════════════════╝
echo.

echo [INFO] 部署环境: %NODE_ENV%
echo.

REM 检查依赖
echo [INFO] 检查依赖...

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js ^>= 20.x
    exit /b 1
)
echo [SUCCESS] Node.js 版本: 
node -v

where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pnpm 未安装，请运行: npm install -g pnpm
    exit /b 1
)
echo [SUCCESS] pnpm 版本:
pnpm -v

where pm2 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PM2 未安装，将跳过 PM2 部署
    set USE_PM2=false
) else (
    echo [SUCCESS] PM2 已安装
    set USE_PM2=true
)

echo.

REM 询问是否清理旧构建
if "%NODE_ENV%"=="production" (
    set /p CLEAN="是否清理旧的构建产物？(y/n): "
    if /i "!CLEAN!"=="y" (
        echo [INFO] 清理旧的构建产物...
        if exist "admin-naive-ui\dist" rmdir /s /q "admin-naive-ui\dist"
        if exist "server\dist" rmdir /s /q "server\dist"
        echo [SUCCESS] 清理完成
    )
)

REM 询问是否安装依赖
set /p INSTALL="是否安装/更新依赖？(y/n): "
if /i "%INSTALL%"=="y" (
    echo [INFO] 安装项目依赖...
    
    echo [INFO] 安装前端依赖...
    cd admin-naive-ui
    call pnpm install
    cd ..
    echo [SUCCESS] 前端依赖安装完成
    
    echo [INFO] 安装后端依赖...
    cd server
    call pnpm install
    cd ..
    echo [SUCCESS] 后端依赖安装完成
)

echo.

if "%NODE_ENV%"=="production" (
    REM 生产环境：构建
    echo [INFO] 开始构建前端...
    cd admin-naive-ui
    call pnpm run build
    cd ..
    
    if not exist "admin-naive-ui\dist" (
        echo [ERROR] 前端构建失败
        exit /b 1
    )
    echo [SUCCESS] 前端构建完成
    
    echo.
    echo [INFO] 开始构建后端...
    cd server
    echo [INFO] 生成 Prisma Client...
    call pnpm run prisma:generate
    call pnpm run build
    cd ..
    
    if not exist "server\dist" (
        echo [ERROR] 后端构建失败
        exit /b 1
    )
    echo [SUCCESS] 后端构建完成
    
    echo.
    echo [INFO] 启动后端服务...
    cd server
    
    if "%USE_PM2%"=="true" (
        echo [INFO] 使用 PM2 启动后端...
        pm2 list | findstr "nest_admin_server" >nul
        if errorlevel 1 (
            call pm2 start ecosystem.config.cjs --env production
            echo [SUCCESS] 后端服务已启动 (PM2)
        ) else (
            call pm2 reload ecosystem.config.cjs --env production
            echo [SUCCESS] 后端服务已重启 (PM2)
        )
        call pm2 save
        call pm2 logs nest_admin_server --lines 20
    ) else (
        start "Nest Admin Server" cmd /k "pnpm run start:prod"
        echo [SUCCESS] 后端服务已启动
    )
    
    cd ..
) else (
    REM 开发/测试环境：启动开发服务器
    echo [INFO] 启动前端开发服务器...
    cd admin-naive-ui
    
    if "%NODE_ENV%"=="development" (
        start "Frontend Dev Server" cmd /k "pnpm dev"
    ) else if "%NODE_ENV%"=="test" (
        start "Frontend Test Server" cmd /k "pnpm run dev:test"
    )
    
    cd ..
    echo [SUCCESS] 前端开发服务器已启动
    
    echo.
    echo [INFO] 启动后端服务...
    cd server
    
    if "%NODE_ENV%"=="development" (
        start "Backend Dev Server" cmd /k "pnpm run start:dev"
    ) else if "%NODE_ENV%"=="test" (
        start "Backend Test Server" cmd /k "pnpm run start:test"
    )
    
    cd ..
    echo [SUCCESS] 后端服务已启动
)

echo.
echo [SUCCESS] ═══════════════════════════════════════════
echo [SUCCESS]   部署完成！
echo [SUCCESS] ═══════════════════════════════════════════
echo.
echo [INFO] 环境: %NODE_ENV%
echo.

if not "%NODE_ENV%"=="production" (
    echo [INFO] 前端地址: http://localhost:5173
    echo [INFO] 后端地址: http://localhost:3000
    echo [INFO] API 文档: http://localhost:3000/api
    echo.
    echo [WARNING] 已在新窗口中启动服务，关闭窗口即可停止服务
) else (
    if "%USE_PM2%"=="true" (
        echo [INFO] 后端服务已使用 PM2 启动
        echo.
        echo [INFO] 查看服务状态: pm2 list
        echo [INFO] 查看日志: pm2 logs nest_admin_server
        echo [INFO] 重启服务: pm2 restart nest_admin_server
        echo [INFO] 停止服务: pm2 stop nest_admin_server
    )
)

echo.
pause
