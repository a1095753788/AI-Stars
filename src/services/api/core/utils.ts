/**
 * API服务核心工具函数
 */
import { Message } from '../../../types/state';
import { OpenAIMessage, ApiProvider } from '../types';

/**
 * 生成UUID
 * 用于为消息和请求生成唯一ID
 * @returns UUID字符串
 */
export const generateUUID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * 将应用消息转换为OpenAI格式消息
 * @param messages 应用消息数组
 * @returns OpenAI格式消息数组
 */
export const convertToOpenAIMessages = (messages: Message[]): OpenAIMessage[] => {
  return messages.map(message => ({
    role: message.role,
    content: message.content || ''
  }));
};

/**
 * 检查API配置有效性
 * @param apiConfig API配置对象部分属性
 * @returns 是否有效
 */
export const isValidApiConfig = (apiConfig: {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}): boolean => {
  return !!(apiConfig.apiKey && apiConfig.endpoint && apiConfig.model);
};

/**
 * 创建超时Promise
 * @param ms 超时毫秒数
 * @returns Promise对象
 */
export const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时(${ms}ms)`)), ms);
  });
};

/**
 * 获取应用-提供商角色映射
 * 不同API提供商可能使用不同的角色名称
 * @param provider API提供商
 * @returns 角色映射对象
 */
export const getRoleMapping = (provider: ApiProvider): Record<string, string> => {
  switch (provider) {
    case 'anthropic':
      // Anthropic使用user/assistant而非user/assistant
      return {
        user: 'user',
        assistant: 'assistant',
        system: 'system'
      };
    default:
      // 大多数提供商遵循OpenAI的命名约定
      return {
        user: 'user',
        assistant: 'assistant',
        system: 'system'
      };
  }
};

/**
 * 安全解析JSON
 * @param text JSON字符串
 * @param fallback 解析失败时的返回值
 * @returns 解析结果或fallback
 */
export const safeParseJSON = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('JSON解析错误:', error);
    return fallback;
  }
}; 