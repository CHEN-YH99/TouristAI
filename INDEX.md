# TouristAI 项目文档索引

欢迎来到TouristAI项目！这是一个基于AI的智能旅游攻略生成平台。

## 📚 文档导航

### 🚀 快速开始
- **[QUICKSTART.md](QUICKSTART.md)** - 5分钟快速启动指南
  - Docker一键启动
  - 本地开发环境配置
  - 常见问题解决

### 📖 项目概述
- **[README.md](README.md)** - 项目总览
  - 项目介绍
  - 核心功能
  - 技术栈
  - API文档

### ⚙️ 安装配置
- **[SETUP.md](SETUP.md)** - 详细设置指南
  - 环境准备
  - 配置步骤
  - 测试功能
  - 下一步开发任务

### 💻 开发指南
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 开发者指南
  - 开发环境设置
  - 代码规范
  - 调试技巧
  - 测试方法
  - 常见问题

### 🏗️ 架构设计
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 系统架构文档
  - 系统架构图
  - 数据流图
  - 技术栈详解
  - 模块详解
  - 数据库设计
  - API接口设计

### 📋 项目管理
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - 项目状态
  - 当前阶段
  - 已完成功能
  - 进行中任务
  - 待开发功能
  - 技术债务

- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - 第一阶段总结
  - 交付成果
  - 功能清单
  - 技术亮点
  - 下一步计划

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 项目总结
  - 项目概览
  - 技术架构
  - 核心功能
  - 项目成就

- **[CHECKLIST.md](CHECKLIST.md)** - 检查清单
  - 功能完成情况
  - 测试清单
  - 部署检查
  - 质量标准

### 📝 需求与设计
- **[需求文档.md](需求文档.md)** - 产品需求文档
  - 项目概述
  - 核心功能模块
  - 技术架构设计
  - 用户体验优化
  - 商业模式规划

- **[技术文档.md](技术文档.md)** - 技术实现文档
  - 技术架构总览
  - 前端技术方案
  - 后端技术方案
  - 数据库设计
  - API接口设计

- **[COMPLETE_WORKFLOW.md](COMPLETE_WORKFLOW.md)** - 完整功能流程文档 ⭐
  - 系统架构概览
  - 用户认证流程
  - AI对话流程
  - 攻略管理流程
  - 配额管理流程
  - 数据流转图
  - API接口详解
  - 错误处理机制

## 🎯 按角色查看文档

### 👨‍💼 产品经理
1. [需求文档.md](需求文档.md) - 了解产品需求
2. [README.md](README.md) - 了解项目概况
3. [PROJECT_STATUS.md](PROJECT_STATUS.md) - 查看开发进度

### 👨‍💻 开发人员
1. [QUICKSTART.md](QUICKSTART.md) - 快速启动项目
2. [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
3. [ARCHITECTURE.md](ARCHITECTURE.md) - 理解架构
4. [技术文档.md](技术文档.md) - 技术实现细节

### 🧪 测试人员
1. [QUICKSTART.md](QUICKSTART.md) - 启动测试环境
2. [README.md](README.md) - 了解功能
3. [SETUP.md](SETUP.md) - 测试功能

### 🚀 运维人员
1. [SETUP.md](SETUP.md) - 部署配置
2. [ARCHITECTURE.md](ARCHITECTURE.md) - 系统架构
3. [DEVELOPMENT.md](DEVELOPMENT.md) - 监控和日志

## 📂 项目结构

```
TouristAI/
├── 📄 文档
│   ├── README.md              # 项目总览
│   ├── QUICKSTART.md          # 快速开始
│   ├── SETUP.md               # 设置指南
│   ├── DEVELOPMENT.md         # 开发指南
│   ├── ARCHITECTURE.md        # 架构文档
│   ├── PROJECT_STATUS.md      # 项目状态
│   ├── PHASE1_COMPLETE.md     # 阶段总结
│   ├── 需求文档.md            # 产品需求
│   ├── 技术文档.md            # 技术文档
│   └── INDEX.md               # 本文件
│
├── 💻 前端
│   └── frontend/              # Next.js应用
│
├── 🔧 后端
│   ├── backend/               # NestJS服务
│   └── ai-service/            # FastAPI服务
│
├── 🗄️ 数据库
│   └── database/              # SQL脚本
│
└── 🐳 部署
    ├── docker-compose.yml     # Docker编排
    ├── start.sh               # Linux/Mac启动脚本
    └── start.bat              # Windows启动脚本
```

## 🎓 学习路径

### 新手入门
1. 阅读 [README.md](README.md) 了解项目
2. 按照 [QUICKSTART.md](QUICKSTART.md) 启动项目
3. 体验核心功能
4. 阅读 [需求文档.md](需求文档.md) 了解产品设计

### 开发者进阶
1. 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) 理解架构
2. 阅读 [技术文档.md](技术文档.md) 了解实现
3. 按照 [DEVELOPMENT.md](DEVELOPMENT.md) 配置开发环境
4. 开始贡献代码

### 深入研究
1. 研究各模块源码
2. 优化性能
3. 添加新功能
4. 编写测试

## 🔗 快速链接

### 启动项目
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### 访问地址
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- AI服务: http://localhost:8000

### 常用命令
```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

## 📞 获取帮助

### 文档问题
- 查看相关文档
- 搜索已有Issues

### 技术问题
- 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 常见问题
- 查看项目Issues
- 联系开发团队

### 功能建议
- 提交Feature Request
- 参与讨论

## 🎉 开始使用

选择适合你的文档开始吧！

- 想快速体验？→ [QUICKSTART.md](QUICKSTART.md)
- 想了解项目？→ [README.md](README.md)
- 想开始开发？→ [DEVELOPMENT.md](DEVELOPMENT.md)
- 想理解架构？→ [ARCHITECTURE.md](ARCHITECTURE.md)

---

**项目状态**: 第一阶段MVP完成 ✅

**最后更新**: 2025年1月

**版本**: v1.0
