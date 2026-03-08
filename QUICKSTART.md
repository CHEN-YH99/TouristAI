# TouristAI 快速开始指南

## 🎯 5分钟快速启动

### 前置要求
- Docker Desktop (推荐) 或
- Node.js 20+ 和 Python 3.11+

### 方法一：使用Docker（推荐）

#### Windows用户
```bash
# 1. 配置OpenAI API Key
copy ai-service\.env.example ai-service\.env
# 编辑 ai-service\.env，填入你的 OPENAI_API_KEY

# 2. 启动所有服务
start.bat
```

#### Mac/Linux用户
```bash
# 1. 配置OpenAI API Key
cp ai-service/.env.example ai-service/.env
# 编辑 ai-service/.env，填入你的 OPENAI_API_KEY

# 2. 启动所有服务
chmod +x start.sh
./start.sh
```

#### 手动启动
```bash
# 1. 配置环境变量
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
cp frontend/.env.example frontend/.env.local

# 编辑 ai-service/.env，填入 OPENAI_API_KEY

# 2. 启动Docker容器
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

### 方法二：本地开发模式

#### 1. 启动数据库
```bash
# PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tourist_ai \
  postgres:15-alpine

# Redis
docker run -d -p 6379:6379 redis:7-alpine

# 初始化数据库
psql -U postgres -h localhost -f database/init.sql
```

#### 2. 启动后端服务
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 配置
npm run start:dev
```

#### 3. 启动AI服务
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY
uvicorn app.main:app --reload
```

#### 4. 启动前端
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 🌐 访问应用

启动成功后，访问：
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001/api/v1
- **AI服务**: http://localhost:8000

## 🧪 测试功能

### 1. 注册账号
访问 http://localhost:3000/register
- 邮箱：test@example.com
- 用户名：测试用户
- 密码：password123

### 2. 登录
使用刚注册的账号登录

### 3. 开始对话
在对话页面输入：
```
我想去日本东京玩5天，预算1万元，喜欢美食和文化
```

### 4. 保存攻略
对话生成攻略后，点击"保存攻略"按钮

### 5. 查看攻略列表
访问 http://localhost:3000/guides

## 🔧 常见问题

### Q1: Docker启动失败
```bash
# 检查Docker是否运行
docker info

# 查看错误日志
docker-compose logs

# 重新启动
docker-compose down
docker-compose up -d
```

### Q2: OpenAI API调用失败
检查 `ai-service/.env` 中的 `OPENAI_API_KEY` 是否正确

### Q3: 前端无法连接后端
检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL` 是否为 `http://localhost:3001/api/v1`

### Q4: 数据库连接失败
```bash
# 检查PostgreSQL是否运行
docker ps | grep postgres

# 重启数据库
docker-compose restart postgres
```

### Q5: 端口被占用
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3002:3000"  # 前端改为3002
  - "3003:3001"  # 后端改为3003
```

## 📊 服务状态检查

```bash
# 查看所有容器状态
docker-compose ps

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ai-service

# 进入容器
docker-compose exec backend sh
docker-compose exec ai-service sh
```

## 🛑 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

## 📝 下一步

1. 查看 [README.md](README.md) 了解项目详情
2. 查看 [SETUP.md](SETUP.md) 了解详细配置
3. 查看 [PROJECT_STATUS.md](PROJECT_STATUS.md) 了解开发进度
4. 查看 [技术文档.md](技术文档.md) 了解技术架构

## 💡 开发提示

### 热重载
- 前端：修改代码自动刷新
- 后端：修改代码自动重启
- AI服务：修改代码自动重启

### 调试
```bash
# 前端调试
cd frontend
npm run dev

# 后端调试
cd backend
npm run start:dev

# AI服务调试
cd ai-service
uvicorn app.main:app --reload --log-level debug
```

### 数据库管理
```bash
# 连接数据库
docker-compose exec postgres psql -U postgres -d tourist_ai

# 查看表
\dt

# 查看用户
SELECT * FROM users;

# 查看攻略
SELECT * FROM guides;
```

## 🎉 开始使用

现在你可以开始使用TouristAI了！尝试生成你的第一个旅游攻略吧！

如有问题，请查看详细文档或提交Issue。
