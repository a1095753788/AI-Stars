/**
 * API提供商能力配置模块
 */
import { ApiProvider } from '../types';

/**
 * 检查API提供商是否支持流式输出
 * @param provider API提供商
 * @returns 是否支持流式输出
 */
export const supportsStreaming = (provider: ApiProvider): boolean => {
  switch (provider) {
    case 'openai':
    case 'azure':
    case 'anthropic':
    case 'gemini':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'together':
    case 'localai':
      return true;
    case 'qwen':
    case 'baidu':
    case 'xinghuo':
    case 'minimax':
    case 'huggingface':
    case 'custom':
    default:
      return false;
  }
};

/**
 * 检查API提供商是否支持多模态输入
 * @param provider API提供商
 * @returns 是否支持多模态输入(图像+文本)
 */
export const supportsMultimodal = (provider: ApiProvider): boolean => {
  switch (provider) {
    case 'openai':
    case 'azure':
    case 'anthropic':
    case 'gemini':
    case 'qwen':
    case 'baidu':
    case 'minimax':
    case 'deepseek':
      return true;
    case 'mistral':
    case 'moonshot':
    case 'together':
    case 'huggingface':
    case 'localai':
    case 'xinghuo':
    case 'custom':
    default:
      return false;
  }
};

/**
 * 检查API提供商是否支持高分辨率图像
 * @param provider API提供商
 * @returns 是否支持高分辨率图像
 */
export const supportsHighResolutionImages = (provider: ApiProvider): boolean => {
  switch (provider) {
    case 'openai':
    case 'anthropic':
    case 'gemini':
      return true;
    case 'azure':
    case 'qwen':
    case 'baidu':
    case 'minimax':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'together':
    case 'huggingface':
    case 'localai':
    case 'xinghuo':
    case 'custom':
    default:
      return false;
  }
};

/**
 * 获取提供商能力配置对象
 * @param provider API提供商
 * @returns 提供商能力配置对象
 */
export const getProviderCapabilities = (provider: ApiProvider) => {
  return {
    streaming: supportsStreaming(provider),
    multimodal: supportsMultimodal(provider),
    highResolutionImages: supportsHighResolutionImages(provider)
  };
}; 