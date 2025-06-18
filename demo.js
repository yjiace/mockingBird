/**
 * API文档系统演示脚本
 * 展示如何动态添加和管理API配置
 */

// 模拟API配置数据
const demoAPIConfig = {
  "apis": [
    {
      "id": "demo-get-users",
      "method": "GET",
      "path": "/api/users",
      "title": "获取用户列表",
      "description": "获取系统中的所有用户列表，支持分页和筛选。",
      "parameters": [
        {
          "name": "page (query, 可选)",
          "type": "integer",
          "default": "1",
          "description": "页码",
          "example": "1"
        },
        {
          "name": "limit (query, 可选)",
          "type": "integer",
          "default": "20",
          "description": "每页数量",
          "example": "20"
        }
      ],
      "requestExample": {
        "http": "GET /api/users?page=1&limit=20 HTTP/1.1\nHost: api.example.com\nAccept: application/json",
        "curl": "curl -X GET \"https://api.example.com/api/users?page=1&limit=20\" \\\n  -H \"Accept: application/json\""
      },
      "responseExample": {
        "success": {
          "data": [
            {
              "id": 1,
              "name": "John Doe",
              "email": "john@example.com"
            }
          ],
          "pagination": {
            "page": 1,
            "limit": 20,
            "total": 100
          }
        },
        "error": {
          "error": {
            "code": "INVALID_PARAMETER",
            "message": "Invalid page parameter"
          }
        }
      }
    }
  ]
};

/**
 * 演示类：API配置管理器
 */
class APIConfigManager {
  constructor() {
    this.config = demoAPIConfig;
  }

  /**
   * 添加新的API配置
   * @param {Object} apiConfig - API配置对象
   */
  addAPI(apiConfig) {
    // 验证必需的字段
    const requiredFields = ['id', 'method', 'path', 'title', 'description'];
    for (const field of requiredFields) {
      if (!apiConfig[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // 检查ID是否已存在
    if (this.config.apis.find(api => api.id === apiConfig.id)) {
      throw new Error(`API with id '${apiConfig.id}' already exists`);
    }

    // 添加API配置
    this.config.apis.push(apiConfig);
    console.log(`✅ API '${apiConfig.title}' added successfully`);
    
    return this.config;
  }

  /**
   * 更新现有API配置
   * @param {string} apiId - API ID
   * @param {Object} updates - 更新的字段
   */
  updateAPI(apiId, updates) {
    const apiIndex = this.config.apis.findIndex(api => api.id === apiId);
    if (apiIndex === -1) {
      throw new Error(`API with id '${apiId}' not found`);
    }

    // 更新API配置
    this.config.apis[apiIndex] = { ...this.config.apis[apiIndex], ...updates };
    console.log(`✅ API '${apiId}' updated successfully`);
    
    return this.config.apis[apiIndex];
  }

  /**
   * 删除API配置
   * @param {string} apiId - API ID
   */
  deleteAPI(apiId) {
    const apiIndex = this.config.apis.findIndex(api => api.id === apiId);
    if (apiIndex === -1) {
      throw new Error(`API with id '${apiId}' not found`);
    }

    const deletedAPI = this.config.apis.splice(apiIndex, 1)[0];
    console.log(`✅ API '${deletedAPI.title}' deleted successfully`);
    
    return deletedAPI;
  }

  /**
   * 获取所有API配置
   */
  getAllAPIs() {
    return this.config.apis;
  }

  /**
   * 根据ID获取API配置
   * @param {string} apiId - API ID
   */
  getAPI(apiId) {
    return this.config.apis.find(api => api.id === apiId);
  }

  /**
   * 根据HTTP方法筛选API
   * @param {string} method - HTTP方法
   */
  getAPIsByMethod(method) {
    return this.config.apis.filter(api => api.method.toUpperCase() === method.toUpperCase());
  }

  /**
   * 导出配置为JSON字符串
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 验证配置格式
   */
  validateConfig() {
    const errors = [];

    for (const api of this.config.apis) {
      // 检查必需字段
      const requiredFields = ['id', 'method', 'path', 'title', 'description'];
      for (const field of requiredFields) {
        if (!api[field]) {
          errors.push(`API '${api.id}': Missing required field '${field}'`);
        }
      }

      // 检查HTTP方法
      const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
      if (!validMethods.includes(api.method.toUpperCase())) {
        errors.push(`API '${api.id}': Invalid HTTP method '${api.method}'`);
      }

      // 检查参数格式
      if (api.parameters && Array.isArray(api.parameters)) {
        for (const param of api.parameters) {
          if (!param.name || !param.type) {
            errors.push(`API '${api.id}': Parameter missing name or type`);
          }
          // 检查新的参数名格式
          if (!param.name.includes('(') || !param.name.includes(')')) {
            errors.push(`API '${api.id}': Parameter name should include type and required/optional info`);
          }
        }
      }
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      return false;
    }

    console.log('✅ Configuration validation passed');
    return true;
  }
}

/**
 * 演示函数
 */
function runDemo() {
  console.log('🚀 API文档系统演示开始\n');

  const manager = new APIConfigManager();

  // 1. 显示当前配置
  console.log('📋 当前API配置:');
  console.log(manager.exportConfig());
  console.log('\n' + '='.repeat(50) + '\n');

  // 2. 添加新API
  console.log('➕ 添加新API示例:');
  try {
    const newAPI = {
      "id": "demo-create-user",
      "method": "POST",
      "path": "/api/users",
      "title": "创建用户",
      "description": "创建新的用户账户。",
      "parameters": [
        {
          "name": "name (body, 必填)",
          "type": "string",
          "description": "用户姓名",
          "example": "John Doe"
        },
        {
          "name": "email (body, 必填)",
          "type": "string",
          "description": "用户邮箱",
          "example": "john@example.com"
        }
      ],
      "requestExample": {
        "http": "POST /api/users HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\"\n}",
        "curl": "curl -X POST \"https://api.example.com/api/users\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"John Doe\",\n    \"email\": \"john@example.com\"\n  }'"
      },
      "responseExample": {
        "success": {
          "data": {
            "id": 123,
            "name": "John Doe",
            "email": "john@example.com",
            "createdAt": "2023-12-01T10:00:00Z"
          }
        },
        "error": {
          "error": {
            "code": "VALIDATION_ERROR",
            "message": "Invalid email format"
          }
        }
      }
    };

    manager.addAPI(newAPI);
  } catch (error) {
    console.error(`❌ 添加API失败: ${error.message}`);
  }
  console.log('\n' + '='.repeat(50) + '\n');

  // 3. 更新API
  console.log('✏️ 更新API示例:');
  try {
    manager.updateAPI('demo-get-users', {
      description: '获取系统中的所有用户列表，支持分页、筛选和排序。',
      parameters: [
        {
          "name": "page (query, 可选)",
          "type": "integer",
          "default": "1",
          "description": "页码",
          "example": "1"
        },
        {
          "name": "limit (query, 可选)",
          "type": "integer",
          "default": "20",
          "description": "每页数量",
          "example": "20"
        },
        {
          "name": "sort (query, 可选)",
          "type": "string",
          "description": "排序字段",
          "example": "createdAt"
        }
      ]
    });
  } catch (error) {
    console.error(`❌ 更新API失败: ${error.message}`);
  }
  console.log('\n' + '='.repeat(50) + '\n');

  // 4. 筛选API
  console.log('🔍 按方法筛选API:');
  const getAPIs = manager.getAPIsByMethod('GET');
  console.log(`GET方法API数量: ${getAPIs.length}`);
  getAPIs.forEach(api => console.log(`  - ${api.path}`));

  const postAPIs = manager.getAPIsByMethod('POST');
  console.log(`POST方法API数量: ${postAPIs.length}`);
  postAPIs.forEach(api => console.log(`  - ${api.path}`));
  console.log('\n' + '='.repeat(50) + '\n');

  // 5. 验证配置
  console.log('✅ 验证配置:');
  manager.validateConfig();
  console.log('\n' + '='.repeat(50) + '\n');

  // 6. 显示最终配置
  console.log('📋 最终API配置:');
  console.log(manager.exportConfig());

  console.log('\n🎉 演示完成！');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIConfigManager, demoAPIConfig };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.APIConfigManager = APIConfigManager;
  window.demoAPIConfig = demoAPIConfig;
  window.runDemo = runDemo;
}

// 自动运行演示（如果在Node.js环境中）
if (typeof require !== 'undefined' && require.main === module) {
  runDemo();
} 