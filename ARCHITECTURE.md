# TouristAI 系统架构文档

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                               │
│                    Web浏览器 (PC/Mobile)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      前端应用层                              │
│              Next.js 14 + React + TypeScript                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  首页    │  │  登录    │  │  对话    │  │  攻略    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           状态管理 (Zustand)                         │  │
│  │  - 用户状态  - 对话状态  - 攻略状态                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                      业务服务层                              │
│                    NestJS + TypeORM                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 认证模块 │  │ 用户模块 │  │ 对话模块 │  │ 攻略模块 │   │
│  │  Auth    │  │  User    │  │  Chat    │  │  Guide   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              中间件层                                 │  │
│  │  - JWT认证  - 配额检查  - 错误处理  - 日志记录      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    │                        │
                    ▼                        ▼
    ┌───────────────────────┐    ┌───────────────────────┐
    │    AI服务层           │    │    数据存储层         │
    │  FastAPI + OpenAI     │    │  PostgreSQL + Redis   │
    │                       │    │                       │
    │  ┌─────────────────┐ │    │  ┌─────────────────┐ │
    │  │ OpenAI Service  │ │    │  │  用户表         │ │
    │  │ - 流式输出      │ │    │  │  对话表         │ │
    │  │ - Prompt管理    │ │    │  │  攻略表         │ │
    │  └─────────────────┘ │    │  └─────────────────┘ │
    │                       │    │                       │
    │  ┌─────────────────┐ │    │  ┌─────────────────┐ │
    │  │ Prompt工程      │ │    │  │  Redis缓存      │ │
    │  │ - 系统提示词    │ │    │  │  - 会话缓存     │ │
    │  │ - 场景模板      │ │    │  │  - 配额缓存     │ │
    │  └─────────────────┘ │    │  └─────────────────┘ │
    └───────────────────────┘    └───────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────┐
    │         第三方服务                     │
    │  - OpenAI API (GPT-4)                │
    │  - 高德地图API (可选)                 │
    │  - 天气API (可选)                     │
    └───────────────────────────────────────┘
```

## 数据流图

### 1. 用户注册/登录流程

```
用户 → 前端 → 后端Auth模块 → 数据库
                    ↓
              生成JWT Token
                    ↓
              返回Token + 用户信息
                    ↓
              前端存储Token
```

### 2. AI对话流程

```
用户输入
    ↓
前端Chat页面
    ↓
发送消息到后端 (POST /api/v1/chat/stream)
    ↓
后端Chat模块
    ↓ 检查配额
配额管理 (UserService)
    ↓ 转发请求
AI服务 (FastAPI)
    ↓ 调用OpenAI
OpenAI API (流式响应)
    ↓ 流式返回
AI服务 → 后端 → 前端
    ↓
实时渲染 (打字机效果)
```

### 3. 攻略保存流程

```
用户点击保存
    ↓
前端收集攻略数据
    ↓
发送到后端 (POST /api/v1/guides)
    ↓
后端Guide模块
    ↓ 验证数据
数据验证
    ↓ 保存
PostgreSQL数据库
    ↓
返回保存结果
    ↓
前端更新状态
```

## 技术栈详解

### 前端技术栈

```
Next.js 14
├── React 18 (UI框架)
├── TypeScript (类型系统)
├── TailwindCSS (样式)
├── Zustand (状态管理)
├── Axios (HTTP客户端)
├── react-markdown (Markdown渲染)
└── lucide-react (图标)
```

### 后端技术栈

```
NestJS
├── TypeORM (ORM)
├── PostgreSQL (数据库)
├── Redis (缓存)
├── JWT (认证)
├── bcrypt (密码加密)
└── Passport (认证策略)
```

### AI服务技术栈

```
FastAPI
├── OpenAI SDK (AI集成)
├── Pydantic (数据验证)
├── uvicorn (ASGI服务器)
└── python-dotenv (环境变量)
```

## 模块详解

### 前端模块

#### 1. 页面模块
- `app/page.tsx` - 首页
- `app/login/page.tsx` - 登录页
- `app/register/page.tsx` - 注册页
- `app/chat/page.tsx` - 对话页
- `app/guides/page.tsx` - 攻略列表
- `app/guides/[id]/page.tsx` - 攻略详情

#### 2. 组件模块
- `components/chat/ChatInput.tsx` - 对话输入
- `components/chat/MessageList.tsx` - 消息列表
- `components/chat/MessageItem.tsx` - 消息项
- `components/guide/MarkdownRenderer.tsx` - Markdown渲染

#### 3. 状态管理
- `store/userStore.ts` - 用户状态
- `store/chatStore.ts` - 对话状态

#### 4. 工具库
- `lib/api.ts` - API封装
- `lib/auth.ts` - 认证工具
- `hooks/useStream.ts` - 流式处理Hook

### 后端模块

#### 1. 认证模块 (Auth)
- `auth.controller.ts` - 认证控制器
- `auth.service.ts` - 认证服务
- `jwt.strategy.ts` - JWT策略
- `jwt-auth.guard.ts` - JWT守卫

#### 2. 用户模块 (User)
- `user.controller.ts` - 用户控制器
- `user.service.ts` - 用户服务
- `user.entity.ts` - 用户实体

#### 3. 对话模块 (Chat)
- `chat.controller.ts` - 对话控制器
- `chat.service.ts` - 对话服务

#### 4. 攻略模块 (Guide)
- `guide.controller.ts` - 攻略控制器
- `guide.service.ts` - 攻略服务
- `guide.entity.ts` - 攻略实体

### AI服务模块

#### 1. API路由
- `api/v1/chat.py` - 对话接口

#### 2. 核心模块
- `core/config.py` - 配置管理
- `core/prompts.py` - Prompt模板

#### 3. 服务层
- `services/openai_service.py` - OpenAI服务

## 数据库设计

### 表结构

#### users (用户表)
```sql
- id: UUID (主键)
- email: VARCHAR (邮箱)
- username: VARCHAR (用户名)
- password: VARCHAR (密码哈希)
- membership_type: VARCHAR (会员类型)
- daily_quota: INTEGER (每日配额)
- used_quota: INTEGER (已用配额)
- quota_reset_at: TIMESTAMP (配额重置时间)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### chat_sessions (对话会话表)
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- title: VARCHAR (标题)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### chat_messages (对话消息表)
```sql
- id: UUID (主键)
- session_id: UUID (外键)
- role: VARCHAR (角色: user/assistant)
- content: TEXT (内容)
- tokens_used: INTEGER (使用的Token数)
- created_at: TIMESTAMP
```

#### guides (攻略表)
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- session_id: UUID (外键)
- title: VARCHAR (标题)
- content: TEXT (内容)
- destination: VARCHAR (目的地)
- days: INTEGER (天数)
- budget: DECIMAL (预算)
- tags: TEXT[] (标签数组)
- is_public: BOOLEAN (是否公开)
- view_count: INTEGER (浏览次数)
- like_count: INTEGER (点赞次数)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## API接口设计

### 认证接口
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录

### 用户接口
- `GET /api/v1/user/profile` - 获取用户信息

### 对话接口
- `POST /api/v1/chat/stream` - 流式对话

### 攻略接口
- `POST /api/v1/guides` - 创建攻略
- `GET /api/v1/guides` - 获取攻略列表
- `GET /api/v1/guides/:id` - 获取攻略详情
- `PUT /api/v1/guides/:id` - 更新攻略
- `DELETE /api/v1/guides/:id` - 删除攻略

## 部署架构

### Docker容器架构

```
Docker Host
├── tourist-ai-frontend (端口 3000)
├── tourist-ai-backend (端口 3001)
├── tourist-ai-ai-service (端口 8000)
├── tourist-ai-postgres (端口 5432)
└── tourist-ai-redis (端口 6379)

Network: tourist-ai-network (bridge)
```

### 容器通信

```
frontend → backend (HTTP)
backend → ai-service (HTTP)
backend → postgres (TCP)
backend → redis (TCP)
ai-service → redis (TCP)
```

## 安全设计

### 1. 认证安全
- JWT Token认证
- 密码bcrypt加密
- Token过期机制

### 2. API安全
- CORS配置
- 请求验证
- 错误处理

### 3. 数据安全
- 环境变量管理
- 敏感信息加密
- SQL注入防护

## 性能优化

### 1. 前端优化
- Next.js SSR/SSG
- 代码分割
- 图片懒加载
- 状态管理优化

### 2. 后端优化
- 数据库索引
- Redis缓存
- 连接池管理
- 异步处理

### 3. AI服务优化
- 流式输出
- 响应缓存
- 错误重试

## 扩展性设计

### 水平扩展
- 前端：CDN + 负载均衡
- 后端：多实例 + 负载均衡
- 数据库：主从复制 + 读写分离

### 垂直扩展
- 增加服务器资源
- 优化数据库配置
- 调整缓存策略

---

更新时间：2025年1月
版本：v1.0
