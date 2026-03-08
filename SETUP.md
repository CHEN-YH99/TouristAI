# TouristAI 项目设置指南

## 第一阶段 MVP 实现完成情况

### ✅ Week 1-2: 基础架构搭建
- [x] 前端项目初始化 (Next.js + TypeScript + TailwindCSS)
- [x] 后端服务搭建 (NestJS业务层 + FastAPI AI层)
- [x] 数据库设计与初始化 (PostgreSQL + Redis)
- [x] OpenAI API集成与测试
- [x] 基础认证系统 (注册/登录)

### ✅ Week 3-4: 核心对话功能
- [x] AI对话界面开发 (流式输出)
- [x] Prompt工程优化 (旅游场景)
- [x] 对话历史存储架构
- [x] 基础用户配额管理 (免费版每日5次)

### ✅ Week 5-6: 攻略管理功能
- [x] 攻略保存功能
- [x] Markdown渲染展示
- [x] 攻略列表查看
- [ ] 基础导出功能 (PDF) - 待实现

## 快速启动步骤

### 1. 环境准备

确保已安装：
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15 (如果不使用Docker)
- Redis 7 (如果不使用Docker)

### 2. 配置环境变量

#### 后端服务 (backend/.env)
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tourist_ai

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:8000
```

#### AI服务 (ai-service/.env)
```bash
cd ai-service
cp .env.example .env
```

编辑 `.env` 文件：
```
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### 前端 (frontend/.env.local)
```bash
cd frontend
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. 使用Docker启动 (推荐)

```bash
# 在项目根目录
docker-compose up -d
```

这将启动所有服务：
- PostgreSQL (端口 5432)
- Redis (端口 6379)
- 后端服务 (端口 3001)
- AI服务 (端口 8000)
- 前端 (端口 3000)

访问 http://localhost:3000 查看应用

### 4. 本地开发模式

如果不使用Docker，需要分别启动各个服务：

#### 启动数据库
```bash
# 启动PostgreSQL和Redis
# 使用你的本地安装或Docker单独启动
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# 初始化数据库
psql -U postgres -f database/init.sql
```

#### 启动后端服务
```bash
cd backend
npm install
npm run start:dev
```

#### 启动AI服务
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 启动前端
```bash
cd frontend
npm install
npm run dev
```

## 测试功能

### 1. 注册新用户
访问 http://localhost:3000/register

### 2. 登录
访问 http://localhost:3000/login

### 3. 开始对话
登录后访问 http://localhost:3000/chat

尝试输入：
- "我想去日本玩5天，预算1万元"
- "帮我规划一个北京3日游"
- "推荐一些成都的美食"

### 4. 查看攻略
访问 http://localhost:3000/guides

## 下一步开发任务

### Week 7-8: 对话历史管理
- [ ] 实现对话会话保存
- [ ] 会话列表展示
- [ ] 会话恢复功能
- [ ] 会话删除功能

### Week 9-10: 攻略导出
- [ ] PDF导出功能
- [ ] Word导出功能
- [ ] 图片导出功能
- [ ] 分享链接生成

### Week 11-12: 移动端优化
- [ ] 响应式设计优化
- [ ] 移动端交互优化
- [ ] PWA支持

## 常见问题

### Q: OpenAI API调用失败
A: 检查 `ai-service/.env` 中的 `OPENAI_API_KEY` 是否正确配置

### Q: 数据库连接失败
A: 确保PostgreSQL正在运行，检查 `backend/.env` 中的数据库配置

### Q: 前端无法连接后端
A: 检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置

### Q: 流式输出不工作
A: 确保AI服务正在运行，检查后端的 `AI_SERVICE_URL` 配置

## 项目结构说明

```
TouristAI/
├── frontend/              # Next.js前端
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/   # React组件
│   │   ├── lib/          # 工具函数
│   │   ├── store/        # 状态管理
│   │   ├── types/        # TypeScript类型
│   │   └── hooks/        # 自定义Hooks
│   └── package.json
│
├── backend/              # NestJS后端
│   ├── src/
│   │   ├── modules/      # 功能模块
│   │   │   ├── auth/    # 认证
│   │   │   ├── user/    # 用户
│   │   │   ├── chat/    # 对话
│   │   │   └── guide/   # 攻略
│   │   └── main.ts
│   └── package.json
│
├── ai-service/           # FastAPI AI服务
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   └── services/    # 服务层
│   └── requirements.txt
│
├── database/             # 数据库脚本
│   └── init.sql
│
└── docker-compose.yml    # Docker编排
```

## 技术支持

如有问题，请查看：
- README.md - 项目概述
- 技术文档.md - 详细技术文档
- 需求文档.md - 产品需求文档
