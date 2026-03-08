@echo off
echo 🚀 启动 TouristAI 项目...
echo.

REM 检查环境变量文件
if not exist "backend\.env" (
    echo ⚠️  backend\.env 不存在，从示例文件复制...
    copy backend\.env.example backend\.env
    echo 请编辑 backend\.env 配置数据库和JWT密钥
)

if not exist "ai-service\.env" (
    echo ⚠️  ai-service\.env 不存在，从示例文件复制...
    copy ai-service\.env.example ai-service\.env
    echo ⚠️  请编辑 ai-service\.env 配置 OPENAI_API_KEY
    pause
)

if not exist "frontend\.env.local" (
    echo ⚠️  frontend\.env.local 不存在，从示例文件复制...
    copy frontend\.env.example frontend\.env.local
)

REM 启动Docker服务
echo 📦 启动Docker容器...
docker-compose up -d

echo.
echo ✅ 服务启动完成！
echo.
echo 📍 访问地址：
echo    前端: http://localhost:3000
echo    后端API: http://localhost:3001
echo    AI服务: http://localhost:8000
echo.
echo 📊 查看日志：
echo    docker-compose logs -f
echo.
echo 🛑 停止服务：
echo    docker-compose down
echo.
pause
