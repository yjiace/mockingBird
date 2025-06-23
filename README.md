# Mock Flow API

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/mocking-bird-template)

## 项目简介

Mock Flow API 是一个基于 Cloudflare Workers 构建的现代化 API 模拟服务平台，专为开发者和测试人员设计。该平台提供了完整的用户管理 API、文件上传下载功能，并支持多种协议（HTTP、SSE），让您能够快速构建和测试应用程序的数据交互逻辑。

### 🌟 核心特性

- **多协议支持**：同时支持 HTTP、Server-Sent Events (SSE)
- **完整的用户管理 API**：包含用户的增删改查、分页查询、条件筛选等功能
- **文件管理系统**：支持文件上传、下载，包含 MD5 校验
- **实时数据流**：通过 SSE 提供实时数据推送能力
- **智能响应**：根据请求头自动判断返回 JSON 或 SSE 格式
- **现代化 UI**：提供美观的 Web 界面，包含 API 文档和在线测试工具
- **数据库集成**：使用 Cloudflare D1 数据库，支持读写分离和会话一致性
- **高性能部署**：基于 Cloudflare Workers 的边缘计算架构

## 🛠️ 技术栈

### 后端技术
- **运行时**：Cloudflare Workers
- **Web 框架**：Hono.js
- **数据库**：Cloudflare D1 (SQLite)
- **语言**：TypeScript
- **部署工具**：Wrangler

### 前端技术
- **原生技术**：HTML5、CSS3、JavaScript ES6+
- **UI 设计**：现代化暗色主题设计
- **代码高亮**：Highlight.js
- **字体**：Google Fonts (Inter)

### 开发工具
- **包管理器**：npm
- **测试框架**：Vitest
- **类型检查**：TypeScript
- **代码质量**：ESLint 兼容

## 📁 项目结构

```
mocking-bird/
├── src/
│   └── index.ts              # 主要 API 路由和业务逻辑
├── public/                   # 静态资源文件
│   ├── index.html           # 主页
│   ├── api-doc.html         # API 文档页面
│   ├── test.html            # 在线测试页面
│   ├── css/                 # 样式文件
│   ├── js/                  # JavaScript 库
│   ├── img/                 # 图片资源
│   └── fonts/               # 字体文件
├── package.json             # 项目依赖和脚本
├── wrangler.jsonc           # Cloudflare Workers 配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目文档
```

## 🚀 API 接口文档

### 用户管理 API

#### 1. 获取用户列表
```http
GET /api/user
```

**查询参数：**
- `size` (可选): 每页数量，默认 10
- `name` (可选): 按姓名筛选
- `email` (可选): 按邮箱筛选
- `mobile` (可选): 按手机号筛选

**支持协议：** HTTP、SSE

#### 2. 获取用户详情
```http
GET /api/user/{id}
```

**路径参数：**
- `id`: 用户 ID

**支持协议：** HTTP、SSE

#### 3. 创建用户
```http
POST /api/user
```

**请求体：**
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 25,
  "mobile": "13800138000",
  "balance": 1000.00,
  "is_active": true
}
```

**支持协议：** HTTP、SSE

#### 4. 更新用户信息
```http
PUT /api/user/{id}
```

**支持协议：** HTTP、SSE

#### 5. 部分更新用户
```http
PATCH /api/user/{id}
```

**支持协议：** HTTP、SSE

#### 6. 删除用户
```http
DELETE /api/user/{id}
```

**支持协议：** HTTP、SSE

### 文件管理 API

#### 1. 文件上传
```http
POST /api/upload
```

**请求格式：** multipart/form-data
**支持协议：** HTTP、SSE

#### 2. 文件下载
```http
GET /api/download/{id}
```

**支持协议：** 仅 HTTP

### 协议说明

#### HTTP 协议
标准的 RESTful API 调用，返回 JSON 格式数据。

#### SSE (Server-Sent Events) 协议
通过设置请求头 `Accept: text/event-stream` 启用 SSE 模式，服务器将以事件流的形式推送数据。

## 🎯 功能页面

### 1. 主页 (`/`)
- 项目介绍和功能概览
- 快速开始指南
- 技术特性展示

### 2. API 文档 (`/api-doc.html`)
- 完整的 API 接口文档
- 支持多种编程语言的代码示例
- 交互式 API 浏览器

### 3. 在线测试 (`/test.html`)
- 可视化 API 测试工具
- 支持 HTTP、SSE 协议切换
- 实时查看请求和响应数据
- 参数配置和结果展示

## 🔧 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户（用于部署）

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:8787 查看应用。

### 类型检查
```bash
npm run check
```

### 运行测试
```bash
npm test
```

## 🚀 部署指南

### 部署到 Cloudflare Workers

1. **安装 Wrangler CLI**
```bash
npm install -g wrangler
```

2. **登录 Cloudflare**
```bash
wrangler auth login
```

3. **创建 D1 数据库**
```bash
wrangler d1 create mocking-bird
```

4. **更新 wrangler.jsonc**
将生成的数据库 ID 更新到配置文件中。

5. **部署应用**
```bash
npm run deploy
```

### 环境变量配置

在 `wrangler.jsonc` 中配置必要的环境变量：

```json
{
  "d1_databases": [
    {
      "binding": "DB01",
      "database_name": "mocking-bird",
      "database_id": "your-database-id"
    }
  ]
}
```

## 📊 数据库设计

### 用户表 (t_user)
```sql
CREATE TABLE t_user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  email TEXT UNIQUE,
  mobile TEXT,
  balance REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1
);
```

### 地址表 (t_address)
```sql
CREATE TABLE t_address (
  id INTEGER PRIMARY KEY,
  province TEXT,
  city TEXT,
  district TEXT,
  street TEXT,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES t_user(id)
);
```

## 🔍 使用示例

### JavaScript/Fetch 示例
```javascript
// HTTP 请求
const response = await fetch('/api/user', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// SSE 请求
const eventSource = new EventSource('/api/user');
eventSource.onmessage = function(event) {
  const userData = JSON.parse(event.data);
  console.log('收到用户数据:', userData);
};
```

### cURL 示例
```bash
# 获取用户列表
curl -X GET "https://your-domain.workers.dev/api/user?size=5"

# 创建用户
curl -X POST "https://your-domain.workers.dev/api/user" \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com"}'

# SSE 请求
curl -X GET "https://your-domain.workers.dev/api/user" \
  -H "Accept: text/event-stream"
```

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🚀 支持完整的用户管理 API
- 📡 集成 SSE 实时数据流
- 🌐 提供现代化 Web 界面
- 📁 文件上传下载功能
- 🔧 在线 API 测试工具

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙋‍♂️ 支持与反馈

如果您在使用过程中遇到问题或有改进建议，请通过以下方式联系我们：

- 提交 [GitHub Issue](https://github.com/your-username/mocking-bird/issues)
- 发送邮件至：support@example.com
- 加入我们的社区讨论

---

**Mock Flow API** - 让 API 开发和测试变得更加简单高效！ 🚀
