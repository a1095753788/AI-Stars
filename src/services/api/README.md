# API服务模块

本目录包含应用程序的API服务相关代码，已进行模块化拆分，便于维护和扩展。

## 目录结构

```
src/services/api/
  ├── index.ts              // 主导出文件，统一API接口
  ├── types.ts              // 类型定义文件
  ├── README.md             // 本说明文档
  │
  ├── providers/            // API提供商相关
  │   ├── index.ts          // 提供商列表和管理
  │   ├── endpoints.ts      // 提供商端点配置
  │   ├── models.ts         // 提供商模型配置
  │   └── capabilities.ts   // 提供商能力配置
  │
  └── core/                 // 核心API功能
      ├── request.ts        // API请求处理
      ├── response.ts       // API响应处理
      └── utils.ts          // 辅助工具函数
```

## 模块说明

### 主模块

- **index.ts**: 统一导出所有API相关函数和类型，是使用API服务的主入口点
- **types.ts**: 包含所有API相关的类型定义和接口

### 提供商模块 (providers/)

- **index.ts**: 导出提供商列表和提供商选择功能
- **endpoints.ts**: 定义各提供商的默认API端点
- **models.ts**: 定义各提供商支持的默认模型
- **capabilities.ts**: 定义各提供商支持的能力（流式输出、多模态等）

### 核心模块 (core/)

- **request.ts**: 处理API请求的构造和发送
- **response.ts**: 处理API响应的解析和转换
- **utils.ts**: 提供API相关的工具函数

## 使用方法

应用代码应始终从主导出文件导入所需的函数和类型：

```typescript
import { sendMessage, ApiConfig, getApiProviders } from '../services/api';
```

## 扩展方法

添加新的API提供商:

1. 在`types.ts`中扩展`ApiProvider`类型
2. 在`providers/index.ts`中添加新提供商到列表
3. 在`providers/endpoints.ts`添加新提供商的默认端点
4. 在`providers/models.ts`添加新提供商的默认模型
5. 在`providers/capabilities.ts`更新新提供商的能力支持 