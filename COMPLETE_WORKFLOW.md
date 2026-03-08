# 🔄 TouristAI 完整功能流程文档

## 📋 文档概述

本文档详细描述TouristAI项目的完整功能流程，包括用户注册、登录、AI对话、攻略管理等核心功能的技术实现和数据流转。

## 📚 文档导航

- [需求文档](./需求文档.md) - 产品定位和功能规划
- [技术文档](./技术文档.md) - 技术架构和技术栈
- [项目状态](./PROJECT_STATUS.md) - 当前开发进度

## 🎯 产品背景

### 项目定位

TouristAI是一个基于AI大语言模型的智能旅游攻略生成平台。用户通过自然对话方式，即时获取个性化的旅游建议和完整攻略。

### 核心价值

- **即时响应**: 无需翻阅大量攻略，直接获得精准答案
- **个性化**: 根据用户偏好、预算、时间定制专属攻略
- **交互式**: 多轮对话深入挖掘用户需求，持续优化方案
- **实用性**: 生成的攻略支持保存、导出、分享

### 典型使用场景

**场景1：周末短途游**
- 用户："我想这个周末去周边玩，有什么推荐吗？"
- AI：询问城市、预算、偏好后生成周边2日游攻略

**场景2：深度旅行规划**
- 用户："我想去日本玩7天，预算2万元"
- AI：生成完整攻略，支持多轮对话细化需求

**场景3：特殊需求定制**
- 用户："我要带父母去三亚，他们都60多岁了"
- AI：生成适合老年人的休闲游攻略

## 📚 目录

1. [系统架构概览](#系统架构概览)
2. [用户认证流程](#用户认证流程)
3. [AI对话流程](#ai对话流程)
4. [攻略管理流程](#攻略管理流程)
5. [配额管理流程](#配额管理流程)
6. [数据流转图](#数据流转图)
7. [API接口详解](#api接口详解)
8. [错误处理机制](#错误处理机制)

---

## 1. 系统架构概览

### 1.1 技术栈

```
┌─────────────────────────────────────────┐
│           前端层 (Frontend)              │
│  Next.js 14 + React 18 + TypeScript     │
│  - 页面渲染                              │
│  - 状态管理 (Zustand)                    │
│  - UI组件库                              │
└─────────────────────────────────────────┘
                    ↓ HTTP/REST
┌─────────────────────────────────────────┐
│         业务层 (Backend - NestJS)        │
│  - 认证服务 (Auth Module)                │
│  - 用户服务 (User Module)                │
│  - 对话服务 (Chat Module)                │
│  - 攻略服务 (Guide Module)               │
└─────────────────────────────────────────┘
         ↓                        ↓
┌──────────────────┐    ┌──────────────────┐
│  AI服务层         │    │  数据层           │
│  FastAPI         │    │  PostgreSQL      │
│  + OpenAI API    │    │  + Redis         │
└──────────────────┘    └──────────────────┘
```

### 1.2 核心模块

- **前端模块**: 页面、组件、状态管理、API调用
- **后端模块**: 认证、用户、对话、攻略
- **AI模块**: OpenAI集成、Prompt管理、流式输出
- **数据模块**: 用户数据、对话历史、攻略存储

---

## 2. 用户认证流程

### 2.1 用户注册流程

#### 流程图
```
用户填写注册表单
    ↓
前端验证输入
    ↓
POST /api/v1/auth/register
    ↓
后端接收请求 (AuthController)
    ↓
AuthService.register()
    ↓
检查邮箱是否已存在
    ↓
密码加密 (bcrypt)
    ↓
创建用户记录 (UserService)
    ↓
生成JWT Token
    ↓
返回 Token + 用户信息
    ↓
前端存储Token
    ↓
跳转到对话页面
```

#### 代码实现

**前端 (register/page.tsx)**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const response = await api.post<AuthResponse>('/auth/register', formData)
    const { access_token, user } = response.data
    
    setToken(access_token)
    setUser(user)
    router.push('/chat')
  } catch (err: any) {
    setError(err.response?.data?.message || '注册失败')
  } finally {
    setLoading(false)
  }
}
```

**后端 (auth.controller.ts)**
```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(
    registerDto.email,
    registerDto.username,
    registerDto.password
  )
}
```

**后端服务 (auth.service.ts)**
```typescript
async register(email: string, username: string, password: string) {
  // 检查邮箱是否已存在
  const existingUser = await this.userService.findByEmail(email)
  if (existingUser) {
    throw new UnauthorizedException('邮箱已被注册')
  }

  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 创建用户
  const user = await this.userService.create({
    email,
    username,
    password: hashedPassword,
  })

  // 生成JWT Token
  return this.login(email, password)
}
```

#### 数据结构

**请求体**
```json
{
  "email": "user@example.com",
  "username": "张三",
  "password": "password123"
}
```

**响应体**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "张三",
    "membershipType": "free",
    "dailyQuota": 5,
    "usedQuota": 0
  }
}
```


### 2.2 用户登录流程

#### 流程图
```
用户填写登录表单
    ↓
前端验证输入
    ↓
POST /api/v1/auth/login
    ↓
后端接收请求 (AuthController)
    ↓
AuthService.login()
    ↓
查找用户 (UserService)
    ↓
验证密码 (bcrypt.compare)
    ↓
生成JWT Token
    ↓
返回 Token + 用户信息
    ↓
前端存储Token到localStorage
    ↓
更新全局用户状态 (Zustand)
    ↓
跳转到对话页面
```

#### 代码实现

**前端 (login/page.tsx)**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const response = await api.post<AuthResponse>('/auth/login', formData)
    const { access_token, user } = response.data
    
    // 存储Token
    setToken(access_token)
    // 更新用户状态
    setUser(user)
    // 跳转
    router.push('/chat')
  } catch (err: any) {
    setError(err.response?.data?.message || '登录失败')
  } finally {
    setLoading(false)
  }
}
```

**后端 (auth.service.ts)**
```typescript
async login(email: string, password: string) {
  // 验证用户
  const user = await this.validateUser(email, password)
  if (!user) {
    throw new UnauthorizedException('邮箱或密码错误')
  }

  // 生成JWT
  const payload = { email: user.email, sub: user.id }
  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      membershipType: user.membershipType,
      dailyQuota: user.dailyQuota,
      usedQuota: user.usedQuota,
    }
  }
}

async validateUser(email: string, password: string) {
  const user = await this.userService.findByEmail(email)
  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...result } = user
    return result
  }
  return null
}
```

#### JWT认证机制

**JWT Payload结构**
```json
{
  "email": "user@example.com",
  "sub": "user-uuid",
  "iat": 1640000000,
  "exp": 1640604800
}
```

**请求头携带Token**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT验证流程**
```
客户端请求 + Token
    ↓
JwtAuthGuard拦截
    ↓
提取Token
    ↓
验证签名
    ↓
检查过期时间
    ↓
解析Payload
    ↓
注入用户信息到Request
    ↓
继续处理请求
```

---

## 3. AI对话流程

### 3.1 完整对话流程

#### 流程图
```
用户输入消息
    ↓
前端验证登录状态
    ↓
添加用户消息到状态
    ↓
POST /api/v1/chat/stream (SSE)
    ↓
后端验证JWT Token
    ↓
检查用户配额
    ↓
配额-1
    ↓
转发到AI服务
    ↓
POST /api/v1/chat/stream (AI服务)
    ↓
构建消息历史
    ↓
调用OpenAI API (流式)
    ↓
接收流式响应
    ↓
逐块返回给后端
    ↓
后端转发给前端
    ↓
前端实时渲染 (打字机效果)
    ↓
完成对话
```

#### 代码实现

**前端 (chat/page.tsx)**
```typescript
const handleSend = async (message: string) => {
  // 1. 添加用户消息
  addMessage({ role: 'user', content: message })
  // 2. 添加空的AI消息
  addMessage({ role: 'assistant', content: '' })
  setLoading(true)

  try {
    let fullContent = ''
    // 3. 开始流式请求
    await startStream(
      `${API_URL}/chat/stream`,
      { message },
      (chunk) => {
        // 4. 实时更新AI消息
        fullContent += chunk
        updateLastMessage(fullContent)
      }
    )
  } catch (error) {
    console.error('Chat error:', error)
    updateLastMessage('抱歉，发生了错误，请稍后重试。')
  } finally {
    setLoading(false)
  }
}
```

**流式处理Hook (useStream.ts)**
```typescript
const startStream = useCallback(async (
  url: string,
  data: any,
  onChunk?: (chunk: string) => void
) => {
  setIsStreaming(true)
  setContent('')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          
          try {
            const json = JSON.parse(data)
            const text = json.content || ''
            setContent(prev => prev + text)
            onChunk?.(text)
          } catch (e) {
            console.error('Parse error:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream error:', error)
    throw error
  } finally {
    setIsStreaming(false)
  }
}, [])
```

**后端 (chat.controller.ts)**
```typescript
@UseGuards(JwtAuthGuard)
@Post('stream')
async streamChat(
  @Request() req,
  @Body() body: { message: string; history?: any[] },
  @Res() res: Response,
) {
  // 1. 检查配额
  const canUse = await this.userService.incrementQuota(req.user.userId)
  if (!canUse) {
    throw new HttpException('今日配额已用完', HttpStatus.TOO_MANY_REQUESTS)
  }

  // 2. 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // 3. 调用AI服务
    const stream = await this.chatService.streamChat(body.message, body.history)
    
    // 4. 转发流式响应
    stream.on('data', (chunk: Buffer) => {
      res.write(chunk)
    })

    stream.on('end', () => {
      res.end()
    })

    stream.on('error', (error: Error) => {
      console.error('Stream error:', error)
      res.write(`data: ${JSON.stringify({ error: '服务暂时不可用' })}\n\n`)
      res.end()
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.write(`data: ${JSON.stringify({ error: '服务暂时不可用' })}\n\n`)
    res.end()
  }
}
```

**AI服务 (chat.py)**
```python
@router.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    # 1. 构建消息历史
    messages = request.history.copy() if request.history else []
    messages.append({
        "role": "user",
        "content": request.message
    })
    
    # 2. 返回流式响应
    return StreamingResponse(
        openai_service.stream_chat(messages),
        media_type="text/event-stream"
    )
```

**OpenAI服务 (openai_service.py)**
```python
async def stream_chat(
    self,
    messages: List[Dict[str, str]],
    temperature: float = 0.7
) -> AsyncGenerator[str, None]:
    try:
        # 1. 添加系统提示词
        full_messages = [
            {"role": "system", "content": get_system_prompt()}
        ] + messages
        
        # 2. 调用OpenAI API
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=temperature,
            stream=True
        )
        
        # 3. 逐块返回
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
                
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        print(f"OpenAI error: {e}")
        yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
```


### 3.2 Prompt工程

#### 系统提示词
```python
SYSTEM_PROMPT = """你是一个专业的旅游规划助手，名字叫"TouristAI"。

你的职责：
1. 根据用户需求生成详细、实用的旅游攻略
2. 提供个性化的景点、美食、住宿推荐
3. 规划合理的行程安排和预算分配
4. 考虑季节、天气、交通等实际因素
5. 提供当地文化、注意事项等实用信息

输出要求：
- 使用Markdown格式，结构清晰
- 包含具体的时间、地点、价格信息
- 提供多个选择方案供用户参考
- 语言友好、专业、易懂

当前日期：{current_date}
"""
```

#### 消息格式
```json
[
  {
    "role": "system",
    "content": "系统提示词..."
  },
  {
    "role": "user",
    "content": "我想去日本玩5天，预算1万元"
  },
  {
    "role": "assistant",
    "content": "好的！我来为您规划一个东京5日深度游..."
  },
  {
    "role": "user",
    "content": "能详细说说第三天的安排吗？"
  }
]
```

### 3.3 流式输出格式

#### SSE数据格式
```
data: {"content":"好"}

data: {"content":"的"}

data: {"content":"！"}

data: {"content":"我"}

data: {"content":"来"}

data: [DONE]
```

#### 前端解析
```typescript
// 解析SSE数据
if (line.startsWith('data: ')) {
  const data = line.slice(6)
  if (data === '[DONE]') continue
  
  const json = JSON.parse(data)
  const text = json.content || ''
  // 累加内容
  fullContent += text
  // 更新UI
  updateLastMessage(fullContent)
}
```

---

## 4. 攻略管理流程

### 4.1 保存攻略流程

#### 流程图
```
用户点击保存按钮
    ↓
前端收集攻略数据
    ↓
POST /api/v1/guides
    ↓
后端验证JWT Token
    ↓
GuideController.create()
    ↓
GuideService.create()
    ↓
保存到PostgreSQL
    ↓
返回攻略信息
    ↓
前端显示成功提示
    ↓
跳转到攻略列表
```

#### 代码实现

**前端**
```typescript
const handleSave = async () => {
  try {
    const response = await api.post('/guides', {
      title: '日本东京5日游',
      content: markdownContent,
      destination: '日本东京',
      days: 5,
      budget: 10000,
      tags: ['日本', '东京', '美食'],
      isPublic: false
    })
    
    toast.success('攻略保存成功！')
    router.push('/guides')
  } catch (error) {
    toast.error('保存失败，请重试')
  }
}
```

**后端 (guide.controller.ts)**
```typescript
@UseGuards(JwtAuthGuard)
@Post()
async create(@Request() req, @Body() body: any) {
  return this.guideService.create({
    ...body,
    userId: req.user.userId,
  })
}
```

**后端服务 (guide.service.ts)**
```typescript
async create(guideData: Partial<Guide>): Promise<Guide> {
  const guide = this.guideRepository.create(guideData)
  return this.guideRepository.save(guide)
}
```

#### 数据结构

**请求体**
```json
{
  "title": "日本东京5日深度游",
  "content": "# 行程概览\n\n## 第一天...",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "tags": ["日本", "东京", "美食", "文化"],
  "isPublic": false
}
```

**响应体**
```json
{
  "id": "uuid-string",
  "userId": "user-uuid",
  "title": "日本东京5日深度游",
  "content": "# 行程概览...",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "tags": ["日本", "东京", "美食", "文化"],
  "isPublic": false,
  "viewCount": 0,
  "likeCount": 0,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### 4.2 查询攻略列表流程

#### 流程图
```
用户访问攻略列表页
    ↓
前端验证登录状态
    ↓
GET /api/v1/guides
    ↓
后端验证JWT Token
    ↓
GuideController.findAll()
    ↓
GuideService.findByUserId()
    ↓
查询数据库
    ↓
返回攻略列表
    ↓
前端渲染卡片列表
```

#### 代码实现

**前端 (guides/page.tsx)**
```typescript
const loadGuides = async () => {
  try {
    const response = await api.get<Guide[]>('/guides')
    setGuides(response.data)
  } catch (error) {
    console.error('Failed to load guides:', error)
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }
  loadGuides()
}, [router])
```

**后端 (guide.controller.ts)**
```typescript
@UseGuards(JwtAuthGuard)
@Get()
async findAll(@Request() req) {
  return this.guideService.findByUserId(req.user.userId)
}
```

**后端服务 (guide.service.ts)**
```typescript
async findByUserId(userId: string): Promise<Guide[]> {
  return this.guideRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' },
  })
}
```

### 4.3 查询攻略详情流程

#### 流程图
```
用户点击攻略卡片
    ↓
跳转到详情页
    ↓
GET /api/v1/guides/:id
    ↓
后端验证JWT Token
    ↓
GuideController.findOne()
    ↓
GuideService.findById()
    ↓
查询数据库
    ↓
返回攻略详情
    ↓
前端Markdown渲染
```

#### 代码实现

**前端 (guides/[id]/page.tsx)**
```typescript
const loadGuide = async () => {
  try {
    const response = await api.get<Guide>(`/guides/${params.id}`)
    setGuide(response.data)
  } catch (error) {
    console.error('Failed to load guide:', error)
  } finally {
    setLoading(false)
  }
}
```

**后端 (guide.controller.ts)**
```typescript
@UseGuards(JwtAuthGuard)
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.guideService.findById(id)
}
```

### 4.4 删除攻略流程

#### 流程图
```
用户点击删除按钮
    ↓
前端确认对话框
    ↓
DELETE /api/v1/guides/:id
    ↓
后端验证JWT Token
    ↓
GuideController.delete()
    ↓
GuideService.delete()
    ↓
从数据库删除
    ↓
返回成功消息
    ↓
前端跳转到列表页
```

#### 代码实现

**前端**
```typescript
const handleDelete = async () => {
  if (!confirm('确定要删除这个攻略吗？')) return

  try {
    await api.delete(`/guides/${params.id}`)
    router.push('/guides')
  } catch (error) {
    console.error('Failed to delete guide:', error)
    alert('删除失败，请稍后重试')
  }
}
```

**后端 (guide.controller.ts)**
```typescript
@UseGuards(JwtAuthGuard)
@Delete(':id')
async delete(@Param('id') id: string) {
  await this.guideService.delete(id)
  return { message: '删除成功' }
}
```

---

## 5. 配额管理流程

### 5.1 配额检查流程

#### 流程图
```
用户发起对话请求
    ↓
后端接收请求
    ↓
UserService.incrementQuota()
    ↓
检查配额重置时间
    ↓
是否需要重置？
  ├─ 是 → 重置配额为0
  └─ 否 → 继续
    ↓
检查已用配额 < 每日配额？
  ├─ 是 → 配额+1，允许请求
  └─ 否 → 拒绝请求，返回429
```

#### 代码实现

**后端 (user.service.ts)**
```typescript
async checkAndResetQuota(userId: string): Promise<void> {
  const user = await this.findById(userId)
  if (!user) return

  const now = new Date()
  // 检查是否需要重置
  if (!user.quotaResetAt || now > user.quotaResetAt) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    user.usedQuota = 0
    user.quotaResetAt = tomorrow
    await this.userRepository.save(user)
  }
}

async incrementQuota(userId: string): Promise<boolean> {
  // 检查并重置配额
  await this.checkAndResetQuota(userId)
  
  const user = await this.findById(userId)
  // 检查是否超限
  if (!user || user.usedQuota >= user.dailyQuota) {
    return false
  }

  // 增加配额
  user.usedQuota += 1
  await this.userRepository.save(user)
  return true
}
```

### 5.2 配额显示

**前端 (Header.tsx)**
```typescript
<span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
  {user.usedQuota}/{user.dailyQuota}
</span>
```

### 5.3 配额限制

**会员类型配额**
```typescript
const QUOTA = {
  FREE_DAILY_LIMIT: 5,      // 免费版：每日5次
  BASIC_DAILY_LIMIT: 30,    // 基础版：每日30次
  PREMIUM_DAILY_LIMIT: -1,  // 高级版：无限制
}
```


---

## 6. 数据流转图

### 6.1 完整数据流

```
┌──────────────┐
│   用户浏览器   │
└──────┬───────┘
       │ 1. 用户操作
       ↓
┌──────────────────────────────┐
│      前端 (Next.js)           │
│  ┌────────────────────────┐  │
│  │  页面组件               │  │
│  │  - page.tsx            │  │
│  │  - 用户交互            │  │
│  └────────┬───────────────┘  │
│           │ 2. 触发事件       │
│  ┌────────▼───────────────┐  │
│  │  状态管理 (Zustand)     │  │
│  │  - userStore           │  │
│  │  - chatStore           │  │
│  └────────┬───────────────┘  │
│           │ 3. API调用        │
│  ┌────────▼───────────────┐  │
│  │  API客户端 (Axios)      │  │
│  │  - 添加Token           │  │
│  │  - 错误处理            │  │
│  └────────┬───────────────┘  │
└───────────┼──────────────────┘
            │ 4. HTTP请求
            ↓
┌──────────────────────────────┐
│    后端 (NestJS)              │
│  ┌────────────────────────┐  │
│  │  控制器 (Controller)    │  │
│  │  - 接收请求            │  │
│  │  - 路由分发            │  │
│  └────────┬───────────────┘  │
│           │ 5. 验证Token      │
│  ┌────────▼───────────────┐  │
│  │  守卫 (JwtAuthGuard)    │  │
│  │  - 验证JWT             │  │
│  │  - 注入用户信息         │  │
│  └────────┬───────────────┘  │
│           │ 6. 业务处理       │
│  ┌────────▼───────────────┐  │
│  │  服务 (Service)         │  │
│  │  - 业务逻辑            │  │
│  │  - 数据操作            │  │
│  └────────┬───────────────┘  │
└───────────┼──────────────────┘
            │
     ┌──────┴──────┐
     │             │
     ↓             ↓
┌─────────┐  ┌──────────────┐
│ AI服务   │  │  数据库       │
│ FastAPI │  │  PostgreSQL  │
│         │  │  + Redis     │
│ OpenAI  │  │              │
└─────────┘  └──────────────┘
```

### 6.2 对话流数据流转

```
用户输入: "我想去日本玩5天"
    ↓
前端状态更新
    messages: [
      { role: 'user', content: '我想去日本玩5天' },
      { role: 'assistant', content: '' }
    ]
    ↓
HTTP POST /api/v1/chat/stream
    Headers: {
      Authorization: Bearer eyJhbGc...
      Content-Type: application/json
    }
    Body: {
      message: "我想去日本玩5天",
      history: []
    }
    ↓
后端验证Token
    JWT解析 → userId: "uuid-123"
    ↓
检查配额
    usedQuota: 2 < dailyQuota: 5 ✓
    usedQuota → 3
    ↓
转发到AI服务
    POST http://ai-service:8000/api/v1/chat/stream
    Body: {
      message: "我想去日本玩5天",
      history: []
    }
    ↓
AI服务处理
    messages = [
      { role: "system", content: "你是专业的旅游规划助手..." },
      { role: "user", content: "我想去日本玩5天" }
    ]
    ↓
调用OpenAI API
    model: gpt-4-turbo-preview
    stream: true
    ↓
流式响应
    data: {"content":"好"}
    data: {"content":"的"}
    data: {"content":"！"}
    ...
    data: [DONE]
    ↓
后端转发
    ↓
前端接收并渲染
    fullContent = "好的！我来为您规划..."
    updateLastMessage(fullContent)
    ↓
显示完整回答
```

### 6.3 攻略保存数据流转

```
用户点击保存
    ↓
前端收集数据
    {
      title: "日本东京5日游",
      content: "# 行程概览\n...",
      destination: "日本东京",
      days: 5,
      budget: 10000,
      tags: ["日本", "东京"]
    }
    ↓
HTTP POST /api/v1/guides
    Headers: { Authorization: Bearer ... }
    Body: { ...攻略数据 }
    ↓
后端验证Token
    userId: "uuid-123"
    ↓
添加userId
    {
      ...攻略数据,
      userId: "uuid-123"
    }
    ↓
保存到数据库
    INSERT INTO guides (...)
    VALUES (...)
    ↓
返回完整数据
    {
      id: "guide-uuid",
      userId: "uuid-123",
      ...攻略数据,
      createdAt: "2025-01-15T10:00:00Z"
    }
    ↓
前端显示成功
    toast.success("保存成功！")
    router.push('/guides')
```

---

## 7. API接口详解

### 7.1 认证接口

#### POST /api/v1/auth/register
**功能**: 用户注册

**请求**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "张三",
  "password": "password123"
}
```

**响应**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "张三",
    "membershipType": "free",
    "dailyQuota": 5,
    "usedQuota": 0
  }
}
```

**错误响应**
```json
{
  "statusCode": 401,
  "message": "邮箱已被注册"
}
```

#### POST /api/v1/auth/login
**功能**: 用户登录

**请求**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**: 同注册接口

**错误响应**
```json
{
  "statusCode": 401,
  "message": "邮箱或密码错误"
}
```

### 7.2 对话接口

#### POST /api/v1/chat/stream
**功能**: 流式AI对话

**请求**
```http
POST /api/v1/chat/stream
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "我想去日本玩5天，预算1万元",
  "history": [
    {
      "role": "user",
      "content": "你好"
    },
    {
      "role": "assistant",
      "content": "你好！我是TouristAI..."
    }
  ]
}
```

**响应** (Server-Sent Events)
```
data: {"content":"好"}

data: {"content":"的"}

data: {"content":"！"}

data: {"content":"我"}

data: {"content":"来"}

data: {"content":"为"}

data: {"content":"您"}

data: {"content":"规"}

data: {"content":"划"}

data: [DONE]
```

**错误响应**
```json
{
  "statusCode": 429,
  "message": "今日配额已用完"
}
```

### 7.3 攻略接口

#### POST /api/v1/guides
**功能**: 创建攻略

**请求**
```http
POST /api/v1/guides
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "日本东京5日深度游",
  "content": "# 行程概览\n\n## 第一天...",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "tags": ["日本", "东京", "美食"],
  "isPublic": false
}
```

**响应**
```json
{
  "id": "uuid-string",
  "userId": "user-uuid",
  "title": "日本东京5日深度游",
  "content": "# 行程概览...",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "tags": ["日本", "东京", "美食"],
  "isPublic": false,
  "viewCount": 0,
  "likeCount": 0,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

#### GET /api/v1/guides
**功能**: 获取攻略列表

**请求**
```http
GET /api/v1/guides
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**
```json
[
  {
    "id": "uuid-1",
    "title": "日本东京5日游",
    "destination": "日本东京",
    "days": 5,
    "budget": 10000,
    "tags": ["日本", "东京"],
    "createdAt": "2025-01-15T10:00:00Z"
  },
  {
    "id": "uuid-2",
    "title": "泰国曼谷3日游",
    "destination": "泰国曼谷",
    "days": 3,
    "budget": 5000,
    "tags": ["泰国", "曼谷"],
    "createdAt": "2025-01-14T10:00:00Z"
  }
]
```

#### GET /api/v1/guides/:id
**功能**: 获取攻略详情

**请求**
```http
GET /api/v1/guides/uuid-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**: 同创建攻略响应

#### DELETE /api/v1/guides/:id
**功能**: 删除攻略

**请求**
```http
DELETE /api/v1/guides/uuid-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**
```json
{
  "message": "删除成功"
}
```

---

## 8. 错误处理机制

### 8.1 前端错误处理

#### API错误拦截
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### 组件错误处理
```typescript
try {
  const response = await api.post('/guides', data)
  toast.success('保存成功！')
} catch (error: any) {
  const message = error.response?.data?.message || '操作失败'
  toast.error(message)
}
```

### 8.2 后端错误处理

#### HTTP异常
```typescript
if (!canUse) {
  throw new HttpException('今日配额已用完', HttpStatus.TOO_MANY_REQUESTS)
}
```

#### 认证异常
```typescript
if (!user) {
  throw new UnauthorizedException('邮箱或密码错误')
}
```

### 8.3 错误码对照表

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理 |
| 401 | 未授权 | 跳转登录页 |
| 429 | 配额超限 | 提示用户升级 |
| 500 | 服务器错误 | 显示错误提示 |

---

## 9. 状态管理

### 9.1 用户状态 (userStore)

```typescript
interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

// 使用
const { user, setUser, logout } = useUserStore()
```

### 9.2 对话状态 (chatStore)

```typescript
interface ChatStore {
  messages: Message[]
  currentSessionId: string | null
  isLoading: boolean
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setSessionId: (id: string | null) => void
}

// 使用
const { messages, addMessage, updateLastMessage } = useChatStore()
```

---

## 10. 总结

### 10.1 核心流程总结

1. **用户认证**: 注册 → 登录 → JWT Token → 存储 → 后续请求携带
2. **AI对话**: 输入 → 验证 → 配额检查 → AI服务 → 流式返回 → 实时渲染
3. **攻略管理**: 保存 → 列表 → 详情 → 删除
4. **配额管理**: 检查 → 重置 → 增加 → 限制

### 10.2 技术特点

- ✅ JWT认证机制
- ✅ 流式输出（SSE）
- ✅ 状态管理（Zustand）
- ✅ TypeScript类型安全
- ✅ 错误处理完善
- ✅ 配额管理系统

### 10.3 数据流特点

- 单向数据流
- 状态集中管理
- API统一封装
- 错误统一处理

---

**文档版本**: v1.0

**创建日期**: 2025年1月

**适用版本**: TouristAI v1.1.0

**维护团队**: TouristAI Team
