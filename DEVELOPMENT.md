# TouristAI 开发指南

## 开发环境设置

### 1. 克隆项目
```bash
git clone <repository-url>
cd TouristAI
```

### 2. 安装依赖

#### 前端
```bash
cd frontend
npm install
```

#### 后端
```bash
cd backend
npm install
```

#### AI服务
```bash
cd ai-service
pip install -r requirements.txt
```

### 3. 配置环境变量

参考各服务的 `.env.example` 文件创建 `.env` 文件。

## 开发工作流

### 启动开发服务器

#### 方式一：使用Docker（推荐）
```bash
docker-compose up -d
```

#### 方式二：分别启动各服务

**终端1 - 数据库**
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine
```

**终端2 - 后端**
```bash
cd backend
npm run start:dev
```

**终端3 - AI服务**
```bash
cd ai-service
uvicorn app.main:app --reload
```

**终端4 - 前端**
```bash
cd frontend
npm run dev
```

## 代码规范

### TypeScript/JavaScript

#### 命名规范
- 组件：PascalCase (例：`ChatInput.tsx`)
- 函数：camelCase (例：`handleSubmit`)
- 常量：UPPER_SNAKE_CASE (例：`API_BASE_URL`)
- 类型/接口：PascalCase (例：`User`, `ChatRequest`)

#### 文件组织
```
src/
├── app/          # 页面路由
├── components/   # 可复用组件
├── lib/          # 工具函数
├── hooks/        # 自定义Hooks
├── store/        # 状态管理
└── types/        # TypeScript类型定义
```

### Python

#### 命名规范
- 类：PascalCase (例：`OpenAIService`)
- 函数：snake_case (例：`stream_chat`)
- 常量：UPPER_SNAKE_CASE (例：`SYSTEM_PROMPT`)

#### 文件组织
```
app/
├── api/          # API路由
├── core/         # 核心配置
├── services/     # 服务层
└── models/       # 数据模型
```

## Git工作流

### 分支策略
- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

### 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

示例：
```bash
git commit -m "feat: 添加攻略导出功能"
git commit -m "fix: 修复流式输出中断问题"
```

## 调试技巧

### 前端调试

#### 使用浏览器开发者工具
```javascript
// 在代码中添加断点
debugger;

// 使用console
console.log('Debug info:', data);
console.table(users);
```

#### React DevTools
安装React DevTools浏览器扩展，查看组件状态和props。

### 后端调试

#### NestJS调试
```typescript
// 使用Logger
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(AuthService.name);

this.logger.log('User logged in');
this.logger.error('Login failed', error);
```

#### 使用VSCode调试
创建 `.vscode/launch.json`：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:dev"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### AI服务调试

#### FastAPI调试
```python
# 使用print或logging
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f"Request: {request}")
```

#### 使用uvicorn日志
```bash
uvicorn app.main:app --reload --log-level debug
```

## 测试

### 前端测试
```bash
cd frontend
npm run test
```

### 后端测试
```bash
cd backend
npm run test
```

### API测试
使用Postman或curl测试API：

```bash
# 注册
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'

# 登录
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 对话（需要token）
curl -X POST http://localhost:3001/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"我想去日本玩5天"}'
```

## 常见开发问题

### Q1: 前端无法连接后端
**解决方案：**
1. 检查后端是否启动：`curl http://localhost:3001/api/v1`
2. 检查环境变量：`NEXT_PUBLIC_API_URL`
3. 检查CORS配置

### Q2: OpenAI API调用失败
**解决方案：**
1. 检查API Key是否正确
2. 检查网络连接
3. 查看AI服务日志：`docker-compose logs ai-service`

### Q3: 数据库连接失败
**解决方案：**
1. 检查PostgreSQL是否运行：`docker ps | grep postgres`
2. 检查数据库配置：`backend/.env`
3. 重启数据库：`docker-compose restart postgres`

### Q4: 热重载不工作
**解决方案：**
1. 重启开发服务器
2. 清除缓存：`rm -rf .next` (前端) 或 `rm -rf dist` (后端)
3. 重新安装依赖

## 性能优化

### 前端优化
1. 使用React.memo避免不必要的重渲染
2. 使用useMemo和useCallback优化计算
3. 代码分割和懒加载
4. 图片优化

### 后端优化
1. 添加数据库索引
2. 使用Redis缓存
3. 优化数据库查询
4. 使用连接池

### AI服务优化
1. 缓存常见问题的回答
2. 优化Prompt长度
3. 使用流式输出
4. 错误重试机制

## 数据库管理

### 连接数据库
```bash
docker-compose exec postgres psql -U postgres -d tourist_ai
```

### 常用SQL命令
```sql
-- 查看所有表
\dt

-- 查看表结构
\d users

-- 查询用户
SELECT * FROM users;

-- 查询攻略
SELECT id, title, destination FROM guides;

-- 清空表
TRUNCATE TABLE chat_messages CASCADE;
```

### 数据库迁移
```bash
cd backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 部署

### 开发环境
```bash
docker-compose up -d
```

### 生产环境
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 监控和日志

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ai-service
```

### 监控资源使用
```bash
docker stats
```

## 有用的命令

### Docker
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec backend sh

# 清理
docker-compose down -v
```

### NPM
```bash
# 安装依赖
npm install

# 更新依赖
npm update

# 清除缓存
npm cache clean --force
```

### Python
```bash
# 安装依赖
pip install -r requirements.txt

# 更新依赖
pip install --upgrade -r requirements.txt

# 冻结依赖
pip freeze > requirements.txt
```

## 开发工具推荐

### IDE
- VSCode (推荐)
- WebStorm
- PyCharm

### VSCode扩展
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Python
- Docker
- GitLens

### 浏览器扩展
- React Developer Tools
- Redux DevTools
- JSON Viewer

### API测试工具
- Postman
- Insomnia
- Thunder Client (VSCode扩展)

## 学习资源

### 官方文档
- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [OpenAI API](https://platform.openai.com/docs)

### 教程
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Patterns](https://reactpatterns.com/)
- [Python Best Practices](https://docs.python-guide.org/)

## 贡献指南

1. Fork项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'feat: Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交Pull Request

## 获取帮助

- 查看文档：README.md, SETUP.md
- 查看Issues
- 联系团队

---

祝开发愉快！🚀
