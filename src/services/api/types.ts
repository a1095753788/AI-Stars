/**
 * API服务类型定义
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
  | 'deepseek'    // DeepSeek AI
  | 'custom';     // 自定义API格式

/**
 * API配置接口
 */
export interface ApiConfig {
  id: string;
  name: string;
  provider: ApiProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  isActive?: boolean;
  temperature?: number;
  maxTokens?: number;
  organizationId?: string;
  apiVersion?: string;
  supportsStreaming?: boolean;
  supportsMultimodal?: boolean;
  supportsHighResolutionImages?: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * 消息响应接口
 */
export interface MessageResponse {
  content: string;
  error?: string;
  done?: boolean;
}

/**
 * 发送API请求选项
 */
export interface ApiRequestOptions {
  enableCache?: boolean;
  cacheTime?: number;
  timeout?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 流式消息回调函数类型
 */
export type StreamCallback = (response: MessageResponse) => void;

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
 * OpenAI格式消息
 */
export interface OpenAIMessage {
  role: string;
  content: string | ContentItem[];
  name?: string;
} 