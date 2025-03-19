/**
 * API相关类型定义
 */

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 消息类型
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageUrl?: string;  // 图片消息的URL
  filePath?: string;  // 文件消息的路径
}

// API配置类型
export interface ApiConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  isActive: boolean;
  maxContextLength?: number;
  temperature?: number;
  systemPrompt?: string;
  createdAt?: number;
  updatedAt?: number;
}

// API请求参数
export interface ApiRequest {
  messages: Message[];
  apiKey: string;
  endpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// API响应类型
export interface ApiResponse {
  message: string;
  error?: string;
}

// API模型类型
export enum ApiModelType {
  GPT = 'gpt',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OTHER = 'other'
}

// API提供商类型
export enum ApiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom'
}

// 根据API端点获取提供商
export const getProviderFromEndpoint = (endpoint: string): ApiProvider => {
  if (endpoint.includes('openai')) {
    return ApiProvider.OPENAI;
  } else if (endpoint.includes('anthropic')) {
    return ApiProvider.ANTHROPIC;
  } else if (endpoint.includes('google') || endpoint.includes('gemini')) {
    return ApiProvider.GOOGLE;
  } else {
    return ApiProvider.CUSTOM;
  }
};

// 根据模型名称获取模型类型
export const getModelTypeFromName = (modelName: string): ApiModelType => {
  const lowerName = modelName.toLowerCase();
  if (lowerName.includes('gpt')) {
    return ApiModelType.GPT;
  } else if (lowerName.includes('claude')) {
    return ApiModelType.CLAUDE;
  } else if (lowerName.includes('gemini')) {
    return ApiModelType.GEMINI;
  } else {
    return ApiModelType.OTHER;
  }
}; 