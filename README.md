# MigrantCare 移民关怀平台

## 项目概述

MigrantCare是一个为移民提供健康信息、资源查找、社区交流和预约管理的综合平台。该项目使用Vue 3、Firebase和其他现代Web技术构建，旨在为移民提供便捷的服务和支持。

## 在线演示

**公网URL**: [https://migrant-care.vercel.app](https://migrant-care.vercel.app)

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@migrantcare.com | Admin123! |
| 普通用户 | user@example.com | User123! |

## 主要功能

1. **外部认证 (External Authentication)**
   - 使用Firebase Authentication实现安全、用户友好的认证系统
   - 支持邮箱/密码和Google OAuth登录
   - 提供密码重置功能
   - 会话持久化和显式登出
   - 登录事件记录和审计

2. **邮件发送 (Email Sending)**
   - 使用SendGrid API实现带附件的邮件发送
   - 支持多文件上传和大小限制
   - 显示上传进度和发送状态
   - 发送历史记录
   - 失败重试和幂等性保证

3. **交互式表格 (Interactive Tables)**
   - 两个交互式表格：预约列表和社区帖子
   - 支持排序、搜索、分页（10条/页）
   - 全局搜索和按列筛选
   - 状态可分享（URL查询参数同步）
   - 响应式设计

4. **云端部署 (Cloud Deployment)**
   - 部署在Vercel平台
   - CI/CD自动构建和部署
   - 环境变量管理
   - 全站HTTPS
   - 安全头和CORS配置

## 技术栈

### 前端
- Vue 3 (Composition API)
- Pinia (状态管理)
- Vue Router
- Bootstrap 5

### 后端服务
- Firebase Authentication
- Firebase Cloud Functions
- Firebase Storage
- SendGrid Email API

## 本地开发

### 环境要求
- Node.js 16+
- npm 8+

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 环境变量

项目需要以下环境变量：

```
# Firebase配置（前端可见）
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# 仅在服务端/云函数中使用的密钥
SENDGRID_API_KEY=your_sendgrid_api_key
```

## 部署步骤

1. Fork或克隆此仓库
2. 在Vercel上创建新项目并连接到您的仓库
3. 配置环境变量
4. 部署！

## 功能入口

- **健康信息**: `/health`
- **资源查找**: `/resources`
- **社区论坛**: `/forum`
- **预约管理**: `/appointments`
- **交互式表格**: `/tables`
- **部署信息**: `/deployment`
- **登录页面**: `/login`

## 许可证

MIT
