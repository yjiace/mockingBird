# API 文档多语言代码示例

## 概述

本项目为API文档提供了多语言的代码示例，支持以下编程语言：

- **JavaScript** - 浏览器和Node.js环境
- **Java** - OkHttp和HttpRequest (Java 11+)
- **Go** - 标准库net/http
- **PHP** - cURL和file_get_contents
- **Python** - requests库
- **cURL** - 命令行工具

## 支持的HTTP方法

每种语言都提供了以下HTTP方法的示例：

- **GET** - 获取数据
- **POST** - 创建数据
- **PUT** - 完整更新数据
- **PATCH** - 部分更新数据
- **DELETE** - 删除数据

## 特殊功能支持

### 1. SSE (Server-Sent Events) 支持

部分API支持SSE协议，用于实时数据推送：

```javascript
// JavaScript SSE示例
const eventSource = new EventSource('/api/user');
eventSource.onmessage = function(event) {
  const userData = JSON.parse(event.data);
  console.log('收到用户数据:', userData);
};
```

### 2. 文件上传

支持文件上传功能：

```javascript
// JavaScript文件上传
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### 3. 文件下载

支持文件下载功能：

```javascript
// JavaScript文件下载
fetch('/api/download/1')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'downloaded_file';
    a.click();
  });
```

## 配置文件结构

API配置存储在JSON文件中，结构如下：

```json
{
  "apiDefinitions": [
    {
      "id": "api-id",
      "path": "/api/path",
      "method": "GET",
      "summary": "API摘要",
      "description": "API描述",
      "parameters": {
        "query": [...],
        "path": [...],
        "body": [...],
        "headers": [...]
      },
      "responses": {
        "200": {
          "description": "成功响应",
          "example": "JSON示例"
        }
      },
      "codeSamples": {
        "javascript": "JS代码示例",
        "java": "Java代码示例",
        "go": "Go代码示例",
        "php": "PHP代码示例",
        "python": "Python代码示例",
        "curl": "cURL命令示例"
      }
    }
  ]
}
```

## 添加新的代码示例

### 1. 添加新的编程语言

在`codeSamples`对象中添加新的语言键：

```json
"codeSamples": {
  "javascript": "...",
  "java": "...",
  "csharp": "// C#代码示例\nusing System.Net.Http;\n\nvar client = new HttpClient();\nvar response = await client.GetAsync(\"https://yourdomain.com/api/user\");\nvar content = await response.Content.ReadAsStringAsync();\nConsole.WriteLine(content);"
}
```

### 2. 添加新的API接口

在`apiDefinitions`数组中添加新的API定义：

```json
{
  "id": "new-api",
  "path": "/api/new",
  "method": "POST",
  "summary": "新API",
  "description": "新API描述",
  "parameters": {...},
  "responses": {...},
  "codeSamples": {...}
}
```

## 代码示例特点

### 1. 实用性
- 所有代码示例都是可以直接运行的
- 包含必要的导入语句和依赖
- 提供完整的错误处理

### 2. 一致性
- 统一的代码风格和格式
- 一致的变量命名规范
- 相同的API调用模式

### 3. 可读性
- 清晰的注释说明
- 合理的代码结构
- 易于理解的示例

## 浏览器兼容性

- **JavaScript**: 支持现代浏览器 (ES6+)
- **cURL**: 支持所有操作系统
- **其他语言**: 需要相应的运行时环境

## 依赖要求

### Java
- OkHttp 4.x 或 Java 11+ (HttpRequest)

### Go
- Go 1.16+

### PHP
- PHP 7.4+ (支持cURL扩展)

### Python
- Python 3.6+
- requests库: `pip install requests`

## 更新和维护

1. 修改配置文件中的代码示例
2. 确保所有语言的示例都保持一致
3. 测试代码示例的正确性
4. 更新文档说明

## 贡献指南

欢迎贡献新的代码示例或改进现有示例：

1. Fork项目
2. 创建功能分支
3. 添加或修改代码示例
4. 提交Pull Request

## 许可证

本项目采用MIT许可证。 