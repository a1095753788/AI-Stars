/**
 * API服务
 * 提供与AI模型交互的主要功能
 */
import { Message } from '../types/state';
import { 
  ApiConfig, 
  MessageResponse, 
  StreamMessageCallback,
  ApiProvider,
  sendApiRequest as coreSendApiRequest,
  sendMultimodalApiRequest as coreSendMultimodalApiRequest,
  sendStreamApiRequest as coreSendStreamApiRequest
} from './api'; // 使用别名导入避免冲突
import { generateUUID } from '../utils/commonUtils';

// 重新导出类型
export type { ApiConfig, ApiProvider, MessageResponse };

/**
 * 向API发送请求
 */
export const sendApiRequest = async (
  messages: Message[],
  apiConfig: ApiConfig,
  options?: {
    enableCache?: boolean;
    cacheTime?: number;
  }
): Promise<{ content: string; error?: string }> => {
  try {
    const result = await coreSendApiRequest(messages, apiConfig, options);
    
    return {
      content: result.text || '',
      error: result.error
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * 发送多模态请求
 */
export const sendMultimodalApiRequest = async (
  messages: Message[],
  apiConfig: ApiConfig,
  options?: {
    enableCache?: boolean;
    cacheTime?: number;
    multimodal?: {
      enabled: boolean;
      imageUrl: string;
      highResolution?: boolean;
    };
  }
): Promise<{ content: string; error?: string }> => {
  try {
    const result = await coreSendMultimodalApiRequest(messages, apiConfig, options);
    
    return {
      content: result.text || '',
      error: result.error
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * 发送流式请求
 */
export const sendStreamApiRequest = async (
  messages: Message[],
  apiConfig: ApiConfig,
  callback: (response: { content: string; done: boolean; error?: string }) => void,
  options?: {
    enableCache?: boolean;
    cacheTime?: number;
    multimodal?: {
      enabled: boolean;
      imageUrl: string;
      highResolution?: boolean;
    };
  }
): Promise<{ content: string; error?: string }> => {
  try {
    // 适配回调函数
    const onUpdate = (text: string) => {
      callback({
        content: text,
        done: false
      });
    };
    
    const result = await coreSendStreamApiRequest(messages, apiConfig, callback, options);
    
    // 发送完成回调
    callback({
      content: result.text || '',
      done: true,
      error: result.error
    });
    
    return {
      content: result.text || '',
      error: result.error
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // 发送错误回调
    callback({
      content: '',
      done: true,
      error: errorMsg
    });
    
    return {
      content: '',
      error: errorMsg
    };
  }
};

/**
 * 检查API可用性（兼容原有调用）
 */
export const checkApiAvailability = async (
  apiConfig: ApiConfig
): Promise<boolean> => {
  try {
    // 简单实现，发送一个短消息测试API是否可用
    const testMessage: Message = { 
      role: 'user', 
      content: 'Hello', 
      id: '1', 
      timestamp: Date.now(), 
      chatId: '1' 
    };
    const result = await sendApiRequest([testMessage], apiConfig);
    return !result.error;
  } catch (error) {
    console.error('API可用性检查失败:', error);
    return false;
  }
};

/**
 * 检查API配置有效性
 */
export const checkApiConfigValidity = (apiConfig: ApiConfig): boolean => {
  return !!(apiConfig && apiConfig.apiKey && apiConfig.endpoint && apiConfig.model);
};

/**
 * 获取所有支持的API提供商
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
 * 获取提供商默认端点
 */
export const getDefaultEndpoint = (provider: ApiProvider): string => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'azure':
      return 'https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}';
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
    case 'custom-openai':
      return 'https://your-custom-api-url.com/v1/chat/completions';
    default:
      return '';
  }
};

/**
 * 向API发送消息
 * @param message 用户消息内容
 * @param apiConfig API配置
 * @param chatId 对话ID
 * @param options 请求选项
 * @returns 返回AI回复的消息
 */
export const sendMessage = async (
  message: string,
  apiConfig: ApiConfig,
  chatId: string,
  options?: {
    streaming?: boolean;
    enableCache?: boolean;
    cacheTime?: number;
    onUpdate?: (content: string) => void;
  }
): Promise<Message> => {
  try {
    if (!apiConfig || !apiConfig.apiKey || !apiConfig.endpoint || !apiConfig.model) {
      throw new Error('API配置不完整');
    }
    
    // 创建用户消息
    const userMessage: Message = {
      id: generateUUID(),
      content: message,
      role: 'user',
      timestamp: Date.now(),
      chatId
    };
    
    // 创建消息历史（在实际应用中应该包含之前的消息）
    // 这里为简单起见只包含当前用户消息
    const messages = [userMessage];
    
    let responseContent = '';
    
    // 处理流式响应回调
    const handleStreamUpdate = (response: { content: string, done: boolean, error?: string }) => {
      if (response.error) {
        throw new Error(response.error);
      }
      
      responseContent = response.content;
      if (options?.onUpdate) {
        options.onUpdate(responseContent);
      }
    };
    
    // 如果启用了流式输出且API支持流式输出
    if (options?.streaming && apiConfig.supportsStreaming) {
      await sendStreamApiRequest(
        messages, 
        apiConfig, 
        handleStreamUpdate, 
        { enableCache: options.enableCache, cacheTime: options.cacheTime }
      );
    } else {
      // 普通请求
      const response = await sendApiRequest(
        messages, 
        apiConfig, 
        { 
          enableCache: options?.enableCache,
          cacheTime: options?.cacheTime
        }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      responseContent = response.content;
    }
    
    // 创建AI回复消息
    const aiMessage: Message = {
      id: generateUUID(),
      content: responseContent,
      role: 'assistant',
      timestamp: Date.now(),
      chatId
    };
    
    return aiMessage;
  } catch (error) {
    console.error('发送消息失败:', error);
    
    // 返回一个错误消息
    return {
      id: generateUUID(),
      content: error instanceof Error ? error.message : '发送消息失败',
      role: 'assistant',
      timestamp: Date.now(),
      chatId,
      isError: true
    };
  }
};

/**
 * 向API发送带图片的消息
 * @param imageUrl 图片URL
 * @param caption 可选的图片说明
 * @param apiConfig API配置
 * @param chatId 对话ID
 * @returns 返回AI回复的消息
 */
export const sendImageMessage = async (
  imageUrl: string,
  caption: string = '',
  apiConfig: ApiConfig,
  chatId: string
): Promise<Message> => {
  try {
    // 在实际应用中，这里应该调用支持图片分析的API
    // 例如：使用OpenAI的multimodal API或其他支持图片理解的模型
    
    // 模拟API调用的延迟
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 模拟API响应
    return {
      id: generateUUID(),
      role: 'assistant',
      content: `我已收到您发送的图片${caption ? `（${caption}）` : ''}。在实际应用中，${apiConfig.provider} API会分析图片内容并给出相关回复。`,
      timestamp: Date.now(),
      chatId,
    };
  } catch (error) {
    console.error('发送图片消息到API失败:', error);
    throw new Error('无法发送图片到API');
  }
};

/**
 * 向API发送带文件的消息
 * @param filePath 文件路径
 * @param fileName 文件名
 * @param apiConfig API配置
 * @param chatId 对话ID
 * @returns 返回AI回复的消息
 */
export const sendFileMessage = async (
  filePath: string,
  fileName: string,
  apiConfig: ApiConfig,
  chatId: string
): Promise<Message> => {
  try {
    // 在实际应用中，这里应该调用支持文件分析的API
    // 或者先将文件内容提取后再发送到文本API
    
    // 模拟API调用的延迟
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 模拟API响应
    return {
      id: generateUUID(),
      role: 'assistant',
      content: `我已收到您发送的文件"${fileName}"。在实际应用中，${apiConfig.provider} API会处理文件内容并给出相关回复。`,
      timestamp: Date.now(),
      chatId,
    };
  } catch (error) {
    console.error('发送文件消息到API失败:', error);
    throw new Error('无法发送文件到API');
  }
};

/**
 * 获取API支持的模型列表
 * @param apiConfig API配置
 * @returns 模型列表
 */
export const getAvailableModels = async (apiConfig: ApiConfig): Promise<string[]> => {
  try {
    // 在实际应用中，这里应该调用API获取支持的模型列表
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟模型列表
    if (apiConfig.name.toLowerCase().includes('openai')) {
      return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    } else if (apiConfig.name.toLowerCase().includes('anthropic')) {
      return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
    } else {
      return ['default-model'];
    }
  } catch (error) {
    console.error('获取可用模型失败:', error);
    throw new Error('无法获取可用模型');
  }
};

/**
 * 发送带图片的消息到AI模型
 * @param messages 消息历史
 * @param imageUrl 图片URL
 * @param apiConfig API配置
 * @param useHighResolution 是否使用高分辨率图片
 * @returns 消息响应
 */
export const sendImageMessageToModel = async (
  messages: Message[],
  imageUrl: string,
  apiConfig: ApiConfig,
  useHighResolution: boolean = false
): Promise<MessageResponse> => {
  if (!apiConfig.supportsMultimodal) {
    return {
      content: '',
      error: `${apiConfig.provider} 不支持多模态输入`
    };
  }

  // 检查是否支持高分辨率图片
  const options = {
    enableCache: true, // 设置默认缓存选项
    multimodal: { // 添加多模态选项
      enabled: true,
      imageUrl,
      highResolution: useHighResolution && apiConfig.supportsHighResolutionImages
    }
  };

  return sendMultimodalApiRequest(messages, apiConfig, options);
};

/**
 * 使用流式输出发送消息到AI模型
 * @param messages 消息历史
 * @param apiConfig API配置
 * @param callback 流式消息回调函数
 * @returns 消息响应
 */
export const sendStreamMessage = async (
  messages: Message[],
  apiConfig: ApiConfig,
  callback: (response: { content: string; done: boolean; error?: string }) => void
): Promise<MessageResponse> => {
  if (!apiConfig.supportsStreaming) {
    return {
      content: '',
      error: `${apiConfig.provider} 不支持流式输出`
    };
  }

  return sendStreamApiRequest(messages, apiConfig, callback);
};

/**
 * 发送带图片的流式消息到AI模型
 */
export const sendStreamImageMessage = async (
  messages: Message[],
  imageUrl: string,
  apiConfig: ApiConfig,
  callback: (response: { content: string; done: boolean; error?: string }) => void,
  useHighResolution: boolean = false
): Promise<MessageResponse> => {
  if (!apiConfig.supportsMultimodal) {
    return {
      content: '',
      error: `${apiConfig.provider} 不支持多模态输入`
    };
  }

  if (!apiConfig.supportsStreaming) {
    return {
      content: '',
      error: `${apiConfig.provider} 不支持流式输出`
    };
  }

  // 使用更新后的选项格式
  const options = {
    enableCache: true,
    multimodal: {
      enabled: true,
      imageUrl,
      highResolution: useHighResolution && apiConfig.supportsHighResolutionImages
    }
  };

  return sendStreamApiRequest(messages, apiConfig, callback, options);
};

/**
 * 获取可用的API提供商
 * @returns API提供商列表
 */
export const getAvailableProviders = () => {
  return getApiProviders();
};

/**
 * 获取提供商的默认端点
 * @param provider API提供商
 * @returns 默认端点URL
 */
export const getProviderDefaultEndpoint = (provider: ApiProvider) => {
  return getDefaultEndpoint(provider);
};

/**
 * 获取提供商的默认模型
 * @param provider API提供商
 * @returns 默认模型名称
 */
export const getProviderDefaultModel = (provider: ApiProvider) => {
  // 创建临时apiConfig以获取默认模型
  const apiConfig = {
    id: 'temp',
    name: provider,
    provider: provider,
    apiKey: '',
    endpoint: getDefaultEndpoint(provider),
    model: getDefaultModel(provider),
    supportsStreaming: supportStreaming(provider),
    supportsMultimodal: supportMultimodal(provider),
    supportsHighResolutionImages: supportHighResolutionImages(provider)
  };
  return apiConfig.model;
};

/**
 * 检查提供商是否支持流式输出
 * @param provider API提供商
 * @returns 是否支持流式输出
 */
export const isStreamingSupported = (provider: ApiProvider): boolean => {
  // 创建临时apiConfig以检查是否支持流式输出
  const apiConfig = {
    id: 'temp',
    name: provider,
    provider: provider,
    apiKey: '',
    endpoint: getDefaultEndpoint(provider),
    model: getDefaultModel(provider),
    supportsStreaming: supportStreaming(provider),
    supportsMultimodal: supportMultimodal(provider),
    supportsHighResolutionImages: supportHighResolutionImages(provider)
  };
  return apiConfig.supportsStreaming;
};

/**
 * 检查提供商是否支持多模态输入
 * @param provider API提供商
 * @returns 是否支持多模态输入
 */
export const isMultimodalSupported = (provider: ApiProvider): boolean => {
  // 创建临时apiConfig以检查是否支持多模态输入
  const apiConfig = {
    id: 'temp',
    name: provider,
    provider: provider,
    apiKey: '',
    endpoint: getDefaultEndpoint(provider),
    model: getDefaultModel(provider),
    supportsStreaming: supportStreaming(provider),
    supportsMultimodal: supportMultimodal(provider),
    supportsHighResolutionImages: supportHighResolutionImages(provider)
  };
  return apiConfig.supportsMultimodal;
};

/**
 * 检查提供商是否支持高分辨率图片
 * @param provider API提供商
 * @returns 是否支持高分辨率图片
 */
export const isHighResolutionSupported = (provider: ApiProvider): boolean => {
  // 创建临时apiConfig以检查是否支持高分辨率图片
  const apiConfig = {
    id: 'temp',
    name: provider,
    provider: provider,
    apiKey: '',
    endpoint: getDefaultEndpoint(provider),
    model: getDefaultModel(provider),
    supportsStreaming: supportStreaming(provider),
    supportsMultimodal: supportMultimodal(provider),
    supportsHighResolutionImages: supportHighResolutionImages(provider)
  };
  return apiConfig.supportsHighResolutionImages;
};

/**
 * 获取提供商默认端点
 * @param provider API提供商
 * @returns 默认API端点
 */
// 这个函数已在上方定义，此处移除重复定义
// export const getDefaultEndpoint = (provider: ApiProvider): string => {
//   switch (provider) {
//     case 'openai':
//       return 'https://api.openai.com/v1/chat/completions';
//     case 'azure':
//       return 'https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version=2024-02-01';
//     case 'anthropic':
//       return 'https://api.anthropic.com/v1/messages';
//     case 'gemini':
//       return 'https://generativelanguage.googleapis.com/v1/models/{model}:generateContent';
//     case 'mistral':
//       return 'https://api.mistral.ai/v1/chat/completions';
//     case 'qwen':
//       return 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
//     case 'baidu':
//       return 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{model}';
//     case 'xinghuo':
//       return 'https://spark-api.xf-yun.com/v3.5/chat';
//     case 'minimax':
//       return 'https://api.minimax.chat/v1/text/chatcompletion_v2';
//     case 'moonshot':
//       return 'https://api.moonshot.cn/v1/chat/completions';
//     case 'deepseek':
//       return 'https://api.deepseek.com/v1/chat/completions';
//     case 'together':
//       return 'https://api.together.xyz/v1/chat/completions';
//     case 'huggingface':
//       return 'https://api-inference.huggingface.co/models/{model}';
//     case 'localai':
//       return 'http://localhost:8080/v1/chat/completions';
//     case 'custom':
//     default:
//       return '';
//   }
// };

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
 * 检查API提供商是否支持流式输出
 * @param provider API提供商
 * @returns 是否支持流式输出
 */
export const supportStreaming = (provider: ApiProvider): boolean => {
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
export const supportMultimodal = (provider: ApiProvider): boolean => {
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
    case 'xinghuo':
    case 'moonshot':
    case 'together':
    case 'huggingface':
    case 'localai':
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
export const supportHighResolutionImages = (provider: ApiProvider): boolean => {
  switch (provider) {
    case 'openai':
    case 'azure':
    case 'anthropic':
      return true;
    case 'gemini':
    case 'mistral':
    case 'qwen':
    case 'baidu':
    case 'xinghuo':
    case 'minimax':
    case 'moonshot':
    case 'deepseek':
    case 'together':
    case 'huggingface':
    case 'localai':
    case 'custom':
    default:
      return false;
  }
};

/**
 * 获取API请求头
 * @param apiConfig API配置
 * @returns 请求头对象
 */
export const getRequestHeaders = (apiConfig: ApiConfig): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 添加自定义请求头
  if (apiConfig.headers) {
    Object.assign(headers, apiConfig.headers);
  }
  
  // 根据不同提供商添加认证头
  switch (apiConfig.provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      if (apiConfig.organizationId) {
        headers['OpenAI-Organization'] = apiConfig.organizationId;
      }
      break;
    case 'azure':
      headers['api-key'] = apiConfig.apiKey;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiConfig.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'gemini':
      // Gemini API使用URL参数而非头部认证
      break;
    case 'mistral':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'qwen':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'baidu':
      // 百度API使用URL参数认证
      break;
    case 'moonshot':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'deepseek':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'together':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'huggingface':
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      break;
    case 'custom':
      // 自定义API可能使用不同的认证方式，使用headers参数传入
      break;
    default:
      // 默认使用Bearer认证
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
  }
  
  return headers;
}; 