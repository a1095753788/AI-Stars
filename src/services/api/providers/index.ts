/**
 * API提供商管理模块
 */
import { ApiProvider } from '../types';

/**
 * 获取所有支持的API提供商列表
 * @returns API提供商列表
 */
export const getApiProviders = (): { value: ApiProvider; label: string }[] => {
  return [
    { value: 'openai', label: 'OpenAI' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'together', label: 'Together AI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'localai', label: 'LocalAI' },
    { value: 'mistral', label: 'Mistral AI' },
    { value: 'moonshot', label: 'MoonShot AI' },
    { value: 'deepseek', label: 'DeepSeek AI' },
    { value: 'huggingface', label: 'Hugging Face' },
    { value: 'qwen', label: '阿里云通义千问' },
    { value: 'baidu', label: '百度文心一言' },
    { value: 'xinghuo', label: '科大讯飞星火' },
    { value: 'minimax', label: 'MiniMax' },
    { value: 'custom', label: '自定义API' },
  ];
};

/**
 * 通过值查找提供商
 * @param value 提供商值
 * @returns 提供商对象或undefined
 */
export const findProviderByValue = (value: ApiProvider): { value: ApiProvider; label: string } | undefined => {
  return getApiProviders().find(provider => provider.value === value);
};

/**
 * 获取提供商显示名称
 * @param value 提供商值
 * @returns 提供商显示名称
 */
export const getProviderLabel = (value: ApiProvider): string => {
  const provider = findProviderByValue(value);
  return provider ? provider.label : value;
}; 