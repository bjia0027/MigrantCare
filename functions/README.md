# MigrantCare Cloud Functions

## 为什么使用 Serverless 架构

### 成本效益
- **按量计费**：只为实际执行时间付费，无需为空闲服务器资源付费
- **零运维成本**：无需管理服务器、操作系统更新、安全补丁等
- **自动扩缩容**：根据请求量自动调整资源，避免过度配置

### 技术优势
- **冷启动优化**：Firebase Functions 提供预热机制，减少冷启动延迟
- **高可用性**：Google Cloud 基础设施保证 99.95% 可用性
- **全球分布**：自动部署到全球多个区域，降低延迟
- **安全性**：内置身份验证、HTTPS、DDoS 防护

### 开发效率
- **快速部署**：代码提交后几分钟内生效
- **版本管理**：支持蓝绿部署和回滚
- **监控日志**：集成 Cloud Logging 和 Cloud Monitoring

## 云函数架构

### 统一中间件流程
每个函数都遵循统一的处理流程：
1. **CORS 处理** - 跨域请求支持
2. **方法验证** - HTTP 方法检查
3. **身份认证** - ID Token 验证
4. **速率限制** - 防止滥用
5. **输入校验** - Joi schema 验证
6. **业务逻辑** - 核心功能处理
7. **结构化日志** - 审计和监控
8. **错误处理** - 统一错误响应

## 云函数列表

### 1. sendEmail - 邮件发送服务
**端点**: `POST /sendEmail`

**功能特性**:
- ✅ ID Token 身份认证
- ✅ 速率限制 (5封邮件/5分钟)
- ✅ 输入校验 (收件人、主题、正文)
- ✅ 幂等性支持 (requestId)
- ✅ 附件处理 (从 Firebase Storage 获取)
- ✅ 失败重试机制
- ✅ 结构化日志记录

**请求示例**:
```json
{
  "recipient": "user@example.com",
  "subject": "预约确认",
  "body": "<h1>您的预约已确认</h1>",
  "attachments": [
    {
      "filename": "receipt.pdf",
      "path": "uploads/receipts/receipt_123.pdf",
      "type": "application/pdf",
      "size": 1024000
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**响应示例**:
```json
{
  "success": true,
  "messageId": "msg_1703123456789_abc123",
  "timestamp": "2023-12-21T10:30:45.123Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. getAppointmentReports - 预约数据聚合分析
**端点**: `GET /getAppointmentReports`

**功能特性**:
- ✅ 业务数据聚合计算
- ✅ 多维度统计分析
- ✅ 图表友好的数据结构
- ✅ 灵活的过滤条件
- ✅ 性能优化的查询

**查询参数**:
- `startDate`: 开始日期 (ISO 8601)
- `endDate`: 结束日期 (ISO 8601)
- `status`: 状态过滤 (pending/confirmed/completed/cancelled)
- `clinicId`: 诊所ID过滤

**响应数据结构**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAppointments": 150,
      "statusBreakdown": {
        "pending": 20,
        "confirmed": 80,
        "completed": 45,
        "cancelled": 5
      },
      "averageWaitTime": 25,
      "completionRate": 75,
      "topClinics": [
        { "name": "中心医院", "count": 45 },
        { "name": "社区诊所", "count": 32 }
      ]
    },
    "charts": {
      "statusChart": [...],
      "dailyTrendChart": [...],
      "clinicChart": [...]
    }
  }
}
```

### 3. auditLog - 安全审计日志
**端点**: 
- `POST /auditLog` - 创建审计记录
- `GET /auditLog` - 查询审计记录

**功能特性**:
- ✅ 关键操作记录
- ✅ 用户行为追踪
- ✅ 时间范围查询
- ✅ 权限控制 (管理员可查看所有日志)
- ✅ 合规性支持

**支持的操作类型**:
- `login` - 用户登录
- `logout` - 用户登出
- `email_sent` - 邮件发送
- `data_export` - 数据导出
- `data_change` - 数据变更

**创建审计记录**:
```json
{
  "action": "email_sent",
  "details": {
    "recipient": "user@example.com",
    "subject": "预约确认"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**查询审计记录**:
```
GET /auditLog?startDate=2023-12-01&endDate=2023-12-31&action=email_sent&limit=50
```

## 安全特性

### 身份认证
- 所有端点都需要有效的 Firebase ID Token
- Token 验证包括签名、过期时间、受众检查
- 支持自定义声明 (custom claims) 进行角色控制

### 输入校验
- 使用 Joi schema 进行严格的输入验证
- 字段类型、长度、格式检查
- 防止 SQL 注入、XSS 等攻击

### 速率限制
- 基于用户 UID 和 IP 地址的双重限制
- 可配置的时间窗口和请求次数
- 防止 API 滥用和 DDoS 攻击

### 幂等性
- 使用 requestId 确保重复请求不会产生副作用
- 内存缓存 (生产环境建议使用 Redis)
- 支持客户端重试机制

### 审计日志
- 所有请求都记录结构化日志
- 包含时间戳、用户ID、路径、延迟、状态码
- 支持错误追踪和性能监控

## 部署和监控

### 部署命令
```bash
# 安装依赖
cd functions
npm install

# 本地测试
npm run serve

# 部署到生产环境
npm run deploy
```

### 环境变量
```bash
# 设置 SendGrid API Key
firebase functions:config:set sendgrid.api_key="your-sendgrid-api-key"

# 部署配置
firebase deploy --only functions
```

### 监控和日志
- **Cloud Logging**: 查看函数执行日志
- **Cloud Monitoring**: 监控性能指标
- **Error Reporting**: 自动错误聚合和告警
- **Audit Logs**: 业务操作审计追踪

### 性能优化
- **预热配置**: 减少冷启动时间
- **并发控制**: 避免资源竞争
- **内存优化**: 根据函数需求调整内存分配
- **缓存策略**: 合理使用内存缓存和外部缓存

## 验收测试

### 1. 身份认证测试
```bash
# 无 Token 请求 - 应返回 401
curl -X POST https://your-project.cloudfunctions.net/sendEmail

# 无效 Token - 应返回 401
curl -X POST https://your-project.cloudfunctions.net/sendEmail \
  -H "Authorization: Bearer invalid-token"

# 有效 Token - 应返回 200 或业务错误
curl -X POST https://your-project.cloudfunctions.net/sendEmail \
  -H "Authorization: Bearer valid-id-token" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@example.com","subject":"Test","body":"Test","requestId":"test-123"}'
```

### 2. 速率限制测试
```bash
# 快速发送多个请求，应在第6个请求时返回 429
for i in {1..10}; do
  curl -X POST https://your-project.cloudfunctions.net/sendEmail \
    -H "Authorization: Bearer valid-token" \
    -H "Content-Type: application/json" \
    -d '{"recipient":"test@example.com","subject":"Test '$i'","body":"Test","requestId":"test-'$i'"}'
done
```

### 3. 幂等性测试
```bash
# 使用相同 requestId 发送两次请求，应返回相同结果
REQUEST_ID="test-idempotent-123"
curl -X POST https://your-project.cloudfunctions.net/sendEmail \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@example.com","subject":"Test","body":"Test","requestId":"'$REQUEST_ID'"}'

# 第二次请求应返回相同的 messageId
curl -X POST https://your-project.cloudfunctions.net/sendEmail \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@example.com","subject":"Test","body":"Test","requestId":"'$REQUEST_ID'"}'
```

### 4. 业务功能测试
```bash
# 测试预约报告生成
curl -X GET "https://your-project.cloudfunctions.net/getAppointmentReports?startDate=2023-12-01&endDate=2023-12-31" \
  -H "Authorization: Bearer valid-token"

# 测试审计日志查询
curl -X GET "https://your-project.cloudfunctions.net/auditLog?limit=10" \
  -H "Authorization: Bearer valid-token"
```

## 故障排除

### 常见错误
1. **CORS 错误**: 检查域名是否在 CORS 配置中
2. **Token 验证失败**: 确认 ID Token 未过期且来源正确
3. **速率限制**: 等待时间窗口重置或联系管理员
4. **附件处理失败**: 检查 Firebase Storage 权限和文件路径

### 日志查看
```bash
# 查看函数日志
firebase functions:log

# 查看特定函数日志
firebase functions:log --only sendEmail
```

### 本地调试
```bash
# 启动本地模拟器
firebase emulators:start --only functions

# 在另一个终端测试
curl -X POST http://localhost:5001/your-project/us-central1/sendEmail
```