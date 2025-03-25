/**
 * API配置工具函数
 * 提供与API配置相关的函数和默认值
 */

import { ApiConfig, ApiProvider } from '../types';
import { getApiProviders } from './index';
import { getDefaultEndpoint } from './endpoints';
import { getDefaultModel, getAvailableModels } from './models';

/**
 * 获取默认的API配置
 * @param provider 可选的API提供商
 * @returns 默认API配置
 */
export const getDefaultApiConfig = (provider?: ApiProvider): ApiConfig => {
  const providers = getApiProviders();
  const defaultProvider = providers[0].value as ApiProvider;
  
  const selectedProvider = provider || defaultProvider;
  
  return {
    id: `default-${Date.now()}`,
    name: `Default ${selectedProvider.toUpperCase()} Config`,
    provider: selectedProvider,
    endpoint: getDefaultEndpoint(selectedProvider),
    model: getDefaultModel(selectedProvider),
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    supportsStreaming: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

/**
 * 获取指定提供商支持的API模型列表
 * @param provider API提供商
 * @returns 模型列表
 */
export const getApiModels = (provider: ApiProvider): string[] => {
  return getAvailableModels(provider);
};

/**
 * 根据API配置创建请求选项
 * @param config API配置
 * @returns 请求选项对象
 */
export const createRequestOptions = (config: ApiConfig): Record<string, any> => {
  return {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: config.supportsStreaming
  };
};

/**
 * 验证API配置完整性
 * @param config API配置
 * @returns 是否有效
 */
export const validateApiConfig = (config: ApiConfig): boolean => {
  if (!config) return false;
  
  return !!(
    config.provider &&
    config.endpoint &&
    config.model &&
    config.apiKey
  );
};

export {
  getApiProviders
}; 