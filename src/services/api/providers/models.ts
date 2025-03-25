/**
 * API提供商模型配置模块
 */
import { ApiProvider } from '../types';

/**
 * 获取提供商默认模型
 * @param provider API提供商
 * @returns 默认模型名称
 */
export const getDefaultModel = (provider: ApiProvider): string => {
  switch (provider) {
    case 'openai':
      return 'gpt-3.5-turbo';
    case 'azure':
      return 'gpt-35-turbo';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'gemini':
      return 'gemini-1.5-pro';
    case 'mistral':
      return 'mistral-small-latest';
    case 'qwen':
      return 'qwen-turbo';
    case 'baidu':
      return 'ernie-bot-4';
    case 'xinghuo':
      return 'v3.5';
    case 'minimax':
      return 'abab6-chat';
    case 'moonshot':
      return 'moonshot-v1-8k';
    case 'deepseek':
      return 'deepseek-chat';
    case 'together':
      return 'togethercomputer/llama-3-70b-instruct';
    case 'huggingface':
      return 'meta-llama/Llama-2-70b-chat-hf';
    case 'localai':
      return 'llama3';
    case 'custom':
    default:
      return '';
  }
};

/**
 * 获取提供商支持的模型列表
 * @param provider API提供商
 * @returns 模型列表
 */
export const getAvailableModels = (provider: ApiProvider): string[] => {
  switch (provider) {
    case 'openai':
      return [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4-vision-preview',
        'gpt-4o'
      ];
    case 'azure':
      return [
        'gpt-35-turbo',
        'gpt-35-turbo-16k',
        'gpt-4',
        'gpt-4-32k',
        'gpt-4-turbo'
      ];
    case 'anthropic':
      return [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
      ];
    case 'gemini':
      return [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ];
    case 'mistral':
      return [
        'mistral-tiny',
        'mistral-small-latest',
        'mistral-medium-latest',
        'mistral-large-latest'
      ];
    case 'qwen':
      return [
        'qwen-turbo',
        'qwen-plus',
        'qwen-max',
        'qwen-max-longcontext'
      ];
    case 'deepseek':
      return [
        'deepseek-chat',
        'deepseek-coder'
      ];
    case 'together':
      return [
        'togethercomputer/llama-3-70b-instruct',
        'togethercomputer/llama-3-8b-instruct',
        'meta-llama/Llama-2-70b-chat-hf',
        'mistralai/Mixtral-8x7B-Instruct-v0.1'
      ];
    default:
      return [];
  }
}; 