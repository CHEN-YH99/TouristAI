# TouristAI - AI智能旅游攻略生成平台

基于AI大语言模型的智能旅游攻略生成平台，用户通过对话方式获取个性化旅游建议和完整攻略。

## 项目结构

```
TouristAI/
├── frontend/          # Next.js前端应用
├── backend/           # NestJS业务服务
├── ai-service/        # FastAPI AI服务
├── database/          # 数据库初始化脚本
└── docker-compose.yml # Docker编排配置
```

## 技术栈

### 前端
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Zustand (状态管理)

### 后端
- NestJS (业务服务)
- FastAPI (AI服务)
- PostgreSQL (主数据库)
- Redis (缓存)
- OpenAI API

## 快速开始

### 前置要求
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- OpenAI API Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd TouristAI
```

### 2. 配置环境变量

```bash
# 后端服务
cp backend/.env.example backend/.env
# 编辑 backend/.env 配置数据库和JWT密钥

# AI服务
cp ai-service/.env.example ai-service/.env
# 编辑 ai-service/.env 配置OpenAI API Key
```

### 3. 使用Docker启动所有服务

```bash
docker-compose up -d
```

服务将在以下端口启动：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- AI服务: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. 本地开发模式

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 后端开发
```bash
cd backend
npm install
npm run start:dev
```

#### AI服务开发
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 核心功能

### MVP阶段 (Week 1-6)

#### Week 1-2: 基础架构
- ✅ 前端项目初始化 (Next.js + TypeScript + TailwindCSS)
- ✅ 后端服务搭建 (NestJS + FastAPI)
- ✅ 数据库设计与初始化 (PostgreSQL + Redis)
- ✅ OpenAI API集成
- ✅ 基础认证系统 (注册/登录)

#### Week 3-4: 核心对话功能
- ✅ AI对话界面开发 (流式输出)
- ✅ Prompt工程优化 (旅游场景)
- 对话历史存储
- 基础用户配额管理 (免费版每日5次)

#### Week 5-6: 攻略管理功能
- ✅ 攻略保存功能
- ✅ Markdown渲染展示
- ✅ 攻略列表查看
- 基础导出功能 (PDF)

## API文档

### 认证接口

#### 注册
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "张三",
  "password": "password123"
}
```

#### 登录
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 对话接口

#### 流式对话
```
POST /api/v1/chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "我想去日本玩5天，预算1万元",
  "history": []
}
```

### 攻略接口

#### 保存攻略
```
POST /api/v1/guides
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "日本东京5日游",
  "content": "# 攻略内容...",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "tags": ["日本", "东京"]
}
```

#### 获取攻略列表
```
GET /api/v1/guides
Authorization: Bearer <token>
```

## 数据库结构

### 主要表
- `users` - 用户信息
- `chat_sessions` - 对话会话
- `chat_messages` - 对话消息
- `guides` - 攻略内容
- `user_favorites` - 用户收藏

详细结构见 `database/init.sql`

## 开发计划

### 第一阶段：MVP核心功能 (4-6周) ✅
- 基础架构搭建
- 核心对话功能
- 攻略管理功能

### 第二阶段：功能完善 (Week 7-12)
- 对话历史管理
- 攻略导出功能
- 地图集成
- 移动端适配

### 第三阶段：高级功能 (Week 13-18)
- 会员体系
- 攻略社区
- 多模型支持
- 数据分析后台

## 📚 完整文档

查看 **[INDEX.md](INDEX.md)** 获取完整文档导航。

### 快速链接
- [快速开始指南](QUICKSTART.md) - 5分钟启动项目
- [详细设置指南](SETUP.md) - 完整配置说明
- [开发者指南](DEVELOPMENT.md) - 开发规范和技巧
- [系统架构文档](ARCHITECTURE.md) - 技术架构详解
- [完整功能流程](COMPLETE_WORKFLOW.md) - 功能流程详解 ⭐
- [项目状态](PROJECT_STATUS.md) - 开发进度追踪
- [第一阶段总结](PHASE1_COMPLETE.md) - MVP完成情况
- [前端优化改进](FRONTEND_IMPROVEMENTS.md) - 前端优化详情 ✨

## 🎉 最新更新

### v1.1.0 - 前端优化版本
- ✨ 使用senior-frontend skill优化前端
- 🎨 新增完整的UI组件库
- 🔧 添加实用工具函数集
- 🪝 实现强大的自定义Hooks
- 📱 优化响应式布局
- 🎯 改善用户体验

详见：[FRONTEND_IMPROVEMENTS.md](FRONTEND_IMPROVEMENTS.md)

## 贡献指南

欢迎提交Issue和Pull Request！

详细的贡献指南请查看 [DEVELOPMENT.md](DEVELOPMENT.md)

## 许可证

MIT License
