/**
 * API类型定义文件
 * 包含所有API相关的接口和类型
 */
import { Message } from '../../types/state';

/**
 * API提供商类型
 */
export type ApiProvider = 
  | 'openai'      // OpenAI原生API
  | 'azure'       // Azure OpenAI
  | 'together'    // Together AI
  | 'localai'     // LocalAI
  | 'huggingface' // Hugging Face TGI服务
  | 'anthropic'   // Anthropic (Claude)
  | 'gemini'      // Google Gemini
  | 'mistral'     // Mistral AI
  | 'qwen'        // 阿里云通义千问
  | 'baidu'       // 百度文心一言
  | 'xinghuo'     // 科大讯飞星火
  | 'minimax'     // MiniMax
  | 'moonshot'    // MoonShot AI
  | 'deepseek'    // DeepSeek
  | 'custom';     // 自定义API格式

/**
 * API配置接口
 */
export interface ApiConfig {
  id?: string;
  name?: string;
  provider: ApiProvider;
  apiKey: string;
  endpoint?: string;
  model: string;
  isActive?: boolean;
  temperature?: number;
  maxTokens?: number;
  organizationId?: string;
  apiVersion?: string;
  supportsStreaming?: boolean;
  supportsMultimodal?: boolean;
  supportsHighResolutionImages?: boolean;
  supportsVision?: boolean;
  updatedAt?: number;
  createdAt?: number;
  region?: string;
  headers?: Record<string, string>;
}

/**
 * 发送消息参数接口
 */
export interface SendMessageParams {
  messages: Message[];
  apiConfig: ApiConfig;
  stream?: boolean; // 是否使用流式输出
}

/**
 * 消息响应接口
 */
export interface MessageResponse {
  content?: string;
  text?: string;   // 添加text属性兼容旧版本
  error?: string;
  success?: boolean;
}

/**
 * 流式消息响应接口
 */
export interface StreamMessageResponse {
  content: string;
  done: boolean;
  error?: string;
}

/**
 * 流式消息回调函数类型
 * @param fullContent 当前累积的全部内容
 * @param deltaContent 新增的内容部分
 * @param error 可能的错误信息
 */
export type StreamMessageCallback = (
  fullContent: string, 
  deltaContent?: string, 
  error?: Error
) => void;

/**
 * 流式响应处理器类型
 */
export type StreamingResponseHandler = (chunk: string) => void;

/**
 * OpenAI格式的消息
 */
export interface OpenAIMessage {
  role: string;
  content: string | Array<{type: string, [key: string]: any}>;
  name?: string;
}

/**
 * API请求接口
 */
export interface ApiRequest {
  messages: any[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: any; // 其他自定义参数
}

/**
 * API响应接口
 */
export interface ApiResponse {
  message: string;
  error?: string;
}

/**
 * 图像内容类型
 */
export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  }
}

/**
 * 文本内容类型
 */
export interface TextContent {
  type: 'text';
  text: string;
}

/**
 * 多模态内容类型
 */
export type ContentItem = ImageContent | TextContent;

/**
 * 高分辨率图像选项
 */
export interface HighResolutionImageOptions {
  enabled: boolean;
  maxTokens?: number; // 默认为16384
}

/**
 * 流式输出配置
 */
export interface StreamingOptions {
  enabled: boolean;
  incremental?: boolean; // 是否使用增量式输出
}

/**
 * API请求选项
 */
export interface ApiRequestOptions {
  streaming?: {
    enabled: boolean;
  };
  cache?: boolean;
  cacheKey?: string;
  cacheTime?: number;
  timeout?: number;
  highResolutionImages?: {
    enabled: boolean;
  };
}

/**
 * 发送API请求选项
 */
export interface SendApiRequestOptions {
  // API配置信息
  endpoint: string;
  apiKey: string;
  provider?: ApiProvider;
  model: string;
  id?: string;
  name?: string;
  
  // 请求参数
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // 区域和版本信息
  region?: string;
  apiVersion?: string;
  organizationId?: string;
  
  // 流式处理
  enableStreaming?: boolean;
  onUpdate?: (text: string) => void;
  
  // 缓存支持
  enableCache?: boolean;
  cacheTime?: number;
  
  // 超时设置
  timeout?: number;
} 