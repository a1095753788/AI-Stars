/**
 * API提供商端点配置模块
 */
import { ApiProvider } from '../types';

/**
 * 获取提供商默认端点
 * @param provider API提供商
 * @returns 默认API端点URL
 */
export const getDefaultEndpoint = (provider: ApiProvider): string => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'azure':
      return 'https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version=2024-02-01';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent';
    case 'together':
      return 'https://api.together.xyz/v1/chat/completions';
    case 'mistral':
      return 'https://api.mistral.ai/v1/chat/completions';
    case 'moonshot':
      return 'https://api.moonshot.cn/v1/chat/completions';
    case 'deepseek':
      return 'https://api.deepseek.com/v1/chat/completions';
    case 'qwen':
      return 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    case 'huggingface':
      return 'https://api-inference.huggingface.co/models/{model}';
    case 'localai':
      return 'http://localhost:8080/v1/chat/completions';
    case 'baidu':
      return 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{model}';
    case 'xinghuo':
      return 'https://spark-api.xf-yun.com/v3.5/chat';
    case 'minimax':
      return 'https://api.minimax.chat/v1/text/chatcompletion_v2';
    case 'custom':
    default:
      return '';
  }
};

/**
 * 获取API请求的标准头部
 * @param provider API提供商
 * @param apiKey API密钥
 * @returns 请求头部对象
 */
export const getRequestHeaders = (provider: ApiProvider, apiKey: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (provider) {
    case 'openai':
    case 'azure':
    case 'together':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'localai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'gemini':
      // Google API通常使用URL参数而非头部传递key
      break;
    case 'qwen':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'baidu':
      // 百度API使用特殊授权方式
      break;
    case 'xinghuo':
      // 讯飞星火API使用特殊授权方式
      break;
    case 'huggingface':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'minimax':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'custom':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
  }

  return headers;
}; 