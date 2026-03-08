#!/bin/bash

echo "🔍 TouristAI 项目验证脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (缺失)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (缺失)"
        return 1
    fi
}

# 检查项目结构
echo "📁 检查项目结构..."
check_dir "frontend"
check_dir "backend"
check_dir "ai-service"
check_dir "database"
echo ""

# 检查配置文件
echo "⚙️  检查配置文件..."
check_file "docker-compose.yml"
check_file "frontend/package.json"
check_file "backend/package.json"
check_file "ai-service/requirements.txt"
check_file "database/init.sql"
echo ""

# 检查环境变量示例文件
echo "🔐 检查环境变量配置..."
check_file "frontend/.env.example"
check_file "backend/.env.example"
check_file "ai-service/.env.example"
echo ""

# 检查文档
echo "📚 检查文档..."
check_file "README.md"
check_file "QUICKSTART.md"
check_file "SETUP.md"
check_file "DEVELOPMENT.md"
check_file "ARCHITECTURE.md"
check_file "PROJECT_STATUS.md"
check_file "INDEX.md"
echo ""

# 检查Docker
echo "🐳 检查Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker已安装"
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker正在运行"
    else
        echo -e "${RED}✗${NC} Docker未运行"
    fi
else
    echo -e "${RED}✗${NC} Docker未安装"
fi
echo ""

# 检查Docker Compose
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose已安装"
else
    echo -e "${RED}✗${NC} Docker Compose未安装"
fi
echo ""

# 检查环境变量文件
echo "🔍 检查环境变量文件..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env 已配置"
else
    echo -e "${YELLOW}⚠${NC} backend/.env 未配置 (需要从 .env.example 复制)"
fi

if [ -f "ai-service/.env" ]; then
    echo -e "${GREEN}✓${NC} ai-service/.env 已配置"
    if grep -q "OPENAI_API_KEY=your-openai-api-key" "ai-service/.env"; then
        echo -e "${YELLOW}⚠${NC} 请配置 OPENAI_API_KEY"
    fi
else
    echo -e "${YELLOW}⚠${NC} ai-service/.env 未配置 (需要从 .env.example 复制)"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.local 已配置"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.local 未配置 (需要从 .env.example 复制)"
fi
echo ""

# 检查服务状态
echo "🚀 检查服务状态..."
if docker-compose ps &> /dev/null; then
    echo "Docker Compose服务状态："
    docker-compose ps
else
    echo -e "${YELLOW}⚠${NC} 服务未启动"
fi
echo ""

# 总结
echo "================================"
echo "✅ 验证完成！"
echo ""
echo "📝 下一步："
echo "1. 如果环境变量未配置，请运行："
echo "   cp backend/.env.example backend/.env"
echo "   cp ai-service/.env.example ai-service/.env"
echo "   cp frontend/.env.example frontend/.env.local"
echo ""
echo "2. 编辑 ai-service/.env 配置 OPENAI_API_KEY"
echo ""
echo "3. 启动服务："
echo "   ./start.sh"
echo ""
echo "4. 访问应用："
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo "   AI服务: http://localhost:8000"
echo ""
