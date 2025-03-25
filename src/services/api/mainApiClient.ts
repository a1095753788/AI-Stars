/**
 * 主API客户端
 * 提供统一的API调用接口
 */
import { Message } from '../../types/state';
import { MMKV } from 'react-native-mmkv';
import { ApiConfig, ApiProvider, MessageResponse } from './apiTypes';

// 创建API缓存存储实例
const apiCacheStorage = new MMKV({
  id: 'api-cache',
  encryptionKey: 'api-cache-key'
});

// 缓存键前缀
const API_CACHE_PREFIX = 'api_cache_';

/**
 * 为消息生成缓存键
 */
const getMessageCacheKey = (
  messages: Array<{role: string; content: string}>,
  provider: string,
  model: string,
  endpoint?: string
): string => {
  // 将消息压缩为一个字符串键
  const messagesKey = messages
    .map(msg => `${msg.role}:${typeof msg.content === 'string' ? msg.content.substring(0, 100) : 'non-text'}`)
    .join('|');
  
  // 创建缓存键
  return `${API_CACHE_PREFIX}${provider}_${model}_${endpoint || 'default'}_${messagesKey.substring(0, 100)}`;
};

/**
 * 从缓存获取响应
 */
const getCachedResponse = async (key: string): Promise<string | null> => {
  try {
    const cacheData = apiCacheStorage.getString(key);
    if (!cacheData) return null;
    
    const { text, timestamp, expiry } = JSON.parse(cacheData);
    const now = Date.now();
    
    // 检查缓存是否过期
    if (timestamp + expiry < now) {
      // 清除过期缓存
      apiCacheStorage.delete(key);
      return null;
    }
    
    return text;
  } catch (error) {
    console.warn('Failed to parse cached response:', error);
    return null;
  }
};

/**
 * 保存响应到缓存
 */
const saveCachedResponse = async (key: string, text: string, expiry: number): Promise<void> => {
  const cacheData = JSON.stringify({
    text,
    timestamp: Date.now(),
    expiry
  });
  
  apiCacheStorage.set(key, cacheData);
};

/**
 * 将消息格式化为OpenAI兼容格式
 */
const formatMessages = (messages: Message[]) => {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
  }));
};

/**
 * 获取请求头
 */
const getRequestHeaders = (provider: ApiProvider, apiKey: string, options: {
  organizationId?: string;
  apiVersion?: string;
} = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 根据不同提供商设置认证头
  switch (provider) {
    case 'openai':
    case 'localai':
    case 'together':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'huggingface':
      headers['Authorization'] = `Bearer ${apiKey}`;
      // 添加组织ID（如果有）
      if (options.organizationId && provider === 'openai') {
        headers['OpenAI-Organization'] = options.organizationId;
      }
      break;
    case 'azure':
      headers['api-key'] = apiKey;
      if (options.apiVersion) {
        headers['api-version'] = options.apiVersion;
      }
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = options.apiVersion || '2023-06-01';
      break;
    case 'gemini':
      // Google API使用URL参数进行认证
      break;
    case 'qwen':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
};

/**
 * 使用超时控制的fetch请求
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * 处理API错误
 */
const handleApiError = (error: unknown): MessageResponse => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('API请求失败:', errorMessage);
  return { 
    success: false, 
    error: errorMessage 
  };
};

/**
 * 解析API响应
 */
const parseApiResponse = async (response: Response, provider: ApiProvider): Promise<MessageResponse> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  let content = '';
  
  switch (provider) {
    case 'openai':
    case 'azure':
    case 'localai':
    case 'together':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'huggingface':
      if (data.choices && data.choices[0]) {
        content = data.choices[0].message?.content || '';
      }
      break;
    case 'anthropic':
      content = data.content || '';
      break;
    case 'gemini':
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      break;
    case 'qwen':
      content = data.output?.text || '';
      break;
    default:
      if (data.choices && data.choices[0]) {
        content = data.choices[0].message?.content || '';
      }
  }
  
  return {
    content,
    success: true
  };
};

/**
 * 准备OpenAI兼容的请求体
 */
const createOpenAIRequestBody = (
  messages: Message[], 
  model: string,
  temperature: number = 0.7,
  maxTokens: number = 2048,
  streaming: boolean = false
) => {
  return {
    model,
    messages: formatMessages(messages),
    temperature,
    max_tokens: maxTokens,
    stream: streaming
  };
};

/**
 * 准备Anthropic兼容的请求体
 */
const createAnthropicRequestBody = (
  messages: Message[],
  model: string,
  temperature: number = 0.7,
  maxTokens: number = 2048,
  streaming: boolean = false
) => {
  const system = messages.find(m => m.role === 'system');
  const filteredMessages = messages.filter(m => m.role !== 'system');
  
  const formattedMessages = filteredMessages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content as string
  }));
  
  return {
    model,
    messages: formattedMessages,
    system: system?.content as string,
    max_tokens: maxTokens,
    temperature,
    stream: streaming
  };
};

/**
 * 准备请求体
 */
const createRequestBody = (
  messages: Message[],
  config: ApiConfig,
  streaming: boolean = false
) => {
  const { provider, model, temperature = 0.7, maxTokens = 2048 } = config;
  
  switch (provider) {
    case 'openai':
    case 'azure':
    case 'localai':
    case 'together':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'huggingface':
      return createOpenAIRequestBody(messages, model, temperature, maxTokens, streaming);
      
    case 'anthropic':
      return createAnthropicRequestBody(messages, model, temperature, maxTokens, streaming);
      
    case 'gemini':
    case 'qwen':
    default:
      // 默认使用OpenAI格式
      return createOpenAIRequestBody(messages, model, temperature, maxTokens, streaming);
  }
};

/**
 * 获取API端点URL
 */
const getEndpointUrl = (config: ApiConfig): string => {
  const { provider, endpoint, model } = config;
  
  // 如果提供了自定义端点，直接使用
  if (endpoint) return endpoint;
  
  // 默认端点
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'azure':
      return `${endpoint}/openai/deployments/${model}/chat/completions?api-version=2023-05-15`;
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'gemini':
      return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
      return `https://api-inference.huggingface.co/models/${model}`;
    case 'localai':
      return `${endpoint || 'http://localhost:8080'}/v1/chat/completions`;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

/**
 * 发送消息到API (主函数)
 */
export const sendMessage = async (
  messages: Message[],
  apiConfig: ApiConfig,
  options: {
    enableStreaming?: boolean;
    enableCache?: boolean;
    timeout?: number;
    onUpdate?: (text: string) => void;
  } = {}
): Promise<{ success: boolean; text?: string; error?: string }> => {
  const { 
    provider = 'openai', 
    apiKey,
    organizationId,
    apiVersion
  } = apiConfig;
  
  const {
    enableCache = true,
    timeout = 60000,
    enableStreaming = false,
    onUpdate
  } = options;

  try {
    // 验证API配置
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // 获取端点URL
    const apiEndpoint = getEndpointUrl(apiConfig);
    
    // 处理缓存
    let cacheKey = null;
    if (enableCache && !enableStreaming) {
      cacheKey = getMessageCacheKey(
        messages.map(msg => ({ 
          role: msg.role, 
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) 
        })),
        provider,
        apiConfig.model,
        apiEndpoint
      );
      
      // 尝试从缓存获取响应
      try {
        const cachedResponse = await getCachedResponse(cacheKey);
        if (cachedResponse) {
          return { success: true, text: cachedResponse };
        }
      } catch (error) {
        console.warn('从缓存获取响应失败:', error);
      }
    }
    
    // 创建请求体
    const requestBody = createRequestBody(messages, apiConfig, enableStreaming);
    
    // 准备请求头
    const headers = getRequestHeaders(provider, apiKey, {
      organizationId,
      apiVersion
    });
    
    // 发送请求
    const response = await fetchWithTimeout(
      apiEndpoint,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      },
      timeout
    );
    
    // 处理响应
    if (enableStreaming && onUpdate) {
      // 流式响应处理 (简化版)
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法创建流式响应读取器');
      }
      
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解析流数据 (简化处理)
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]')
          .map(line => line.replace(/^data: /, ''));
        
        for (const line of lines) {
          try {
            if (line && line !== '[DONE]') {
              const json = JSON.parse(line);
              
              let content = '';
              if (provider === 'openai' || provider === 'azure') {
                content = json.choices?.[0]?.delta?.content || '';
              } else if (provider === 'anthropic') {
                content = json.delta?.text || '';
              } else {
                content = json.choices?.[0]?.delta?.content || '';
              }
              
              if (content) {
                accumulatedText += content;
                onUpdate(accumulatedText);
              }
            }
          } catch (e) {
            console.warn('解析流数据失败:', e);
          }
        }
      }
      
      // 保存到缓存
      if (enableCache && cacheKey && accumulatedText) {
        await saveCachedResponse(cacheKey, accumulatedText, 24 * 60 * 60 * 1000); // 缓存1天
      }
      
      return { success: true, text: accumulatedText };
    } else {
      // 处理普通响应
      const result = await parseApiResponse(response, provider);
      
      // 保存到缓存
      if (enableCache && cacheKey && result.content) {
        await saveCachedResponse(cacheKey, result.content, 24 * 60 * 60 * 1000); // 缓存1天
      }
      
      return { 
        success: result.success || false,
        text: result.content,
        error: result.error
      };
    }
  } catch (error) {
    const result = handleApiError(error);
    return {
      success: false,
      error: result.error
    };
  }
}; 