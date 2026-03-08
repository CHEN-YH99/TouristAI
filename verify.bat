@echo off
echo 🔍 TouristAI 项目验证脚本
echo ================================
echo.

REM 检查项目结构
echo 📁 检查项目结构...
if exist "frontend\" (echo ✓ frontend\) else (echo ✗ frontend\ ^(缺失^))
if exist "backend\" (echo ✓ backend\) else (echo ✗ backend\ ^(缺失^))
if exist "ai-service\" (echo ✓ ai-service\) else (echo ✗ ai-service\ ^(缺失^))
if exist "database\" (echo ✓ database\) else (echo ✗ database\ ^(缺失^))
echo.

REM 检查配置文件
echo ⚙️  检查配置文件...
if exist "docker-compose.yml" (echo ✓ docker-compose.yml) else (echo ✗ docker-compose.yml ^(缺失^))
if exist "frontend\package.json" (echo ✓ frontend\package.json) else (echo ✗ frontend\package.json ^(缺失^))
if exist "backend\package.json" (echo ✓ backend\package.json) else (echo ✗ backend\package.json ^(缺失^))
if exist "ai-service\requirements.txt" (echo ✓ ai-service\requirements.txt) else (echo ✗ ai-service\requirements.txt ^(缺失^))
if exist "database\init.sql" (echo ✓ database\init.sql) else (echo ✗ database\init.sql ^(缺失^))
echo.

REM 检查环境变量示例文件
echo 🔐 检查环境变量配置...
if exist "frontend\.env.example" (echo ✓ frontend\.env.example) else (echo ✗ frontend\.env.example ^(缺失^))
if exist "backend\.env.example" (echo ✓ backend\.env.example) else (echo ✗ backend\.env.example ^(缺失^))
if exist "ai-service\.env.example" (echo ✓ ai-service\.env.example) else (echo ✗ ai-service\.env.example ^(缺失^))
echo.

REM 检查文档
echo 📚 检查文档...
if exist "README.md" (echo ✓ README.md) else (echo ✗ README.md ^(缺失^))
if exist "QUICKSTART.md" (echo ✓ QUICKSTART.md) else (echo ✗ QUICKSTART.md ^(缺失^))
if exist "SETUP.md" (echo ✓ SETUP.md) else (echo ✗ SETUP.md ^(缺失^))
if exist "DEVELOPMENT.md" (echo ✓ DEVELOPMENT.md) else (echo ✗ DEVELOPMENT.md ^(缺失^))
if exist "ARCHITECTURE.md" (echo ✓ ARCHITECTURE.md) else (echo ✗ ARCHITECTURE.md ^(缺失^))
if exist "PROJECT_STATUS.md" (echo ✓ PROJECT_STATUS.md) else (echo ✗ PROJECT_STATUS.md ^(缺失^))
if exist "INDEX.md" (echo ✓ INDEX.md) else (echo ✗ INDEX.md ^(缺失^))
echo.

REM 检查Docker
echo 🐳 检查Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker已安装
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Docker正在运行
    ) else (
        echo ✗ Docker未运行
    )
) else (
    echo ✗ Docker未安装
)
echo.

REM 检查Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker Compose已安装
) else (
    echo ✗ Docker Compose未安装
)
echo.

REM 检查环境变量文件
echo 🔍 检查环境变量文件...
if exist "backend\.env" (
    echo ✓ backend\.env 已配置
) else (
    echo ⚠ backend\.env 未配置 ^(需要从 .env.example 复制^)
)

if exist "ai-service\.env" (
    echo ✓ ai-service\.env 已配置
    findstr /C:"OPENAI_API_KEY=your-openai-api-key" "ai-service\.env" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠ 请配置 OPENAI_API_KEY
    )
) else (
    echo ⚠ ai-service\.env 未配置 ^(需要从 .env.example 复制^)
)

if exist "frontend\.env.local" (
    echo ✓ frontend\.env.local 已配置
) else (
    echo ⚠ frontend\.env.local 未配置 ^(需要从 .env.example 复制^)
)
echo.

REM 检查服务状态
echo 🚀 检查服务状态...
docker-compose ps >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker Compose服务状态：
    docker-compose ps
) else (
    echo ⚠ 服务未启动
)
echo.

REM 总结
echo ================================
echo ✅ 验证完成！
echo.
echo 📝 下一步：
echo 1. 如果环境变量未配置，请运行：
echo    copy backend\.env.example backend\.env
echo    copy ai-service\.env.example ai-service\.env
echo    copy frontend\.env.example frontend\.env.local
echo.
echo 2. 编辑 ai-service\.env 配置 OPENAI_API_KEY
echo.
echo 3. 启动服务：
echo    start.bat
echo.
echo 4. 访问应用：
echo    前端: http://localhost:3000
echo    后端: http://localhost:3001
echo    AI服务: http://localhost:8000
echo.
pause
