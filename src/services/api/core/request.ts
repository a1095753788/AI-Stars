/**
 * API请求处理模块
 */
import { Message } from '../../../types/state';
import { ApiConfig, ApiRequestOptions, MessageResponse, OpenAIMessage } from '../types';
import { getRequestHeaders } from '../providers/endpoints';
import { convertToOpenAIMessages, createTimeout, isValidApiConfig } from './utils';

/**
 * 构建OpenAI兼容的API请求体
 * @param messages 消息数组
 * @param config API配置
 * @returns 请求体对象
 */
export const buildOpenAIRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  const openAIMessages = convertToOpenAIMessages(messages);
  
  return {
    model: config.model,
    messages: openAIMessages,
    temperature: config.temperature || 0.7,
    max_tokens: config.maxTokens || 2048,
    stream: config.supportsStreaming
  };
};

/**
 * 根据提供商构建请求体
 * @param messages 消息数组
 * @param config API配置
 * @returns 请求体对象
 */
export const buildRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  // 不同提供商的请求格式可能不同
  switch (config.provider) {
    case 'anthropic':
      return buildAnthropicRequestBody(messages, config);
    case 'gemini':
      return buildGeminiRequestBody(messages, config);
    case 'qwen':
      return buildQwenRequestBody(messages, config);
    case 'baidu':
      return buildBaiduRequestBody(messages, config);
    case 'openai':
    case 'azure':
    case 'together':
    case 'mistral':
    case 'moonshot':
    case 'deepseek':
    case 'localai':
    default:
      // 默认使用OpenAI兼容格式
      return buildOpenAIRequestBody(messages, config);
  }
};

/**
 * 构建Anthropic格式请求体
 */
const buildAnthropicRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  const openAIMessages = convertToOpenAIMessages(messages);
  
  // Anthropic API格式不同，需要特殊处理
  return {
    model: config.model,
    messages: openAIMessages,
    max_tokens: config.maxTokens || 2048,
    temperature: config.temperature || 0.7
  };
};

/**
 * 构建Google Gemini格式请求体
 */
const buildGeminiRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  // 转换消息格式为Gemini兼容格式
  const contents: any[] = [];
  let currentRole = '';
  let currentParts: any[] = [];
  
  messages.forEach(msg => {
    if (msg.role !== currentRole && currentParts.length > 0) {
      contents.push({
        role: currentRole === 'user' ? 'user' : 'model',
        parts: currentParts
      });
      currentParts = [];
    }
    
    currentRole = msg.role;
    currentParts.push({ text: msg.content || '' });
  });
  
  if (currentParts.length > 0) {
    contents.push({
      role: currentRole === 'user' ? 'user' : 'model',
      parts: currentParts
    });
  }
  
  return {
    contents,
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxTokens || 2048
    }
  };
};

/**
 * 构建阿里云通义千问格式请求体
 */
const buildQwenRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  return {
    model: config.model,
    input: {
      messages: convertToOpenAIMessages(messages)
    },
    parameters: {
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048
    }
  };
};

/**
 * 构建百度文心一言格式请求体
 */
const buildBaiduRequestBody = (
  messages: Message[], 
  config: ApiConfig
): Record<string, any> => {
  const baidiuMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content || ''
  }));
  
  return {
    messages: baidiuMessages,
    temperature: config.temperature || 0.7,
    top_p: 0.8
  };
};

/**
 * 构建包含图片的OpenAI请求体
 * @param messages 消息数组
 * @param base64Image 图片的base64编码字符串
 * @param config API配置
 * @returns 请求体对象
 */
export const buildOpenAIImageRequestBody = (
  messages: Message[], 
  base64Image: string,
  config: ApiConfig
): Record<string, any> => {
  // 转换消息为OpenAI格式
  const openAIMessages: OpenAIMessage[] = [];
  
  // 处理常规消息
  for (const msg of messages.slice(0, -1)) {
    openAIMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || ''
    });
  }
  
  // 最后一条消息（带图片）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    // 创建带图片的多模态消息
    const content: any[] = [];
    
    // 添加文本部分(如果有)
    if (lastMessage.content && lastMessage.content.trim() !== '') {
      content.push({
        type: "text",
        text: lastMessage.content
      });
    }
    
    // 添加图片部分
    content.push({
      type: "image_url",
      image_url: {
        url: base64Image,
        detail: config.supportsHighResolutionImages ? "high" : "auto"
      }
    });
    
    // 添加到消息数组
    openAIMessages.push({
      role: lastMessage.role === 'user' ? 'user' : 'assistant',
      content: content
    });
  }
  
  return {
    model: config.model,
    messages: openAIMessages,
    temperature: config.temperature || 0.7,
    max_tokens: config.maxTokens || 2048,
    stream: false // 多模态消息目前不支持流式输出
  };
};

/**
 * 构建包含图片的Anthropic Claude请求体
 * @param messages 消息数组
 * @param base64Image 图片的base64编码字符串
 * @param config API配置
 * @returns 请求体对象
 */
export const buildClaudeImageRequestBody = (
  messages: Message[], 
  base64Image: string,
  config: ApiConfig
): Record<string, any> => {
  // 转换消息为Claude格式
  const claudeMessages: any[] = [];
  
  // 处理常规消息
  for (const msg of messages.slice(0, -1)) {
    claudeMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || ''
    });
  }
  
  // 最后一条消息（带图片）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    // 创建带图片的多模态消息
    const content: any[] = [];
    
    // 获取MIME类型
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';
    const base64Data = base64Image.split('base64,')[1];
    
    // 添加图片部分
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType,
        data: base64Data
      }
    });
    
    // 添加文本部分(如果有)
    if (lastMessage.content && lastMessage.content.trim() !== '') {
      content.push({
        type: "text",
        text: lastMessage.content
      });
    }
    
    // 添加到消息数组
    claudeMessages.push({
      role: lastMessage.role === 'user' ? 'user' : 'assistant',
      content: content
    });
  }
  
  return {
    model: config.model,
    messages: claudeMessages,
    temperature: config.temperature || 0.7,
    max_tokens: config.maxTokens || 2048,
  };
};

/**
 * 构建包含图片的Google Gemini请求体
 * @param messages 消息数组
 * @param base64Image 图片的base64编码字符串
 * @param config API配置
 * @returns 请求体对象
 */
export const buildGeminiImageRequestBody = (
  messages: Message[], 
  base64Image: string,
  config: ApiConfig
): Record<string, any> => {
  // 转换消息为Gemini格式
  const contents: any[] = [];
  let currentRole = '';
  let currentParts: any[] = [];
  
  // 处理常规消息
  for (const msg of messages.slice(0, -1)) {
    if (msg.role !== currentRole && currentParts.length > 0) {
      contents.push({
        role: currentRole === 'user' ? 'user' : 'model',
        parts: currentParts
      });
      currentParts = [];
    }
    
    currentRole = msg.role;
    currentParts.push({ text: msg.content || '' });
  }
  
  if (currentParts.length > 0) {
    contents.push({
      role: currentRole === 'user' ? 'user' : 'model',
      parts: currentParts
    });
  }
  
  // 最后一条消息（带图片）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    const parts: any[] = [];
    
    // 添加文本部分(如果有)
    if (lastMessage.content && lastMessage.content.trim() !== '') {
      parts.push({ text: lastMessage.content });
    }
    
    // 添加图片部分
    parts.push({
      inline_data: {
        mime_type: base64Image.split(';')[0].split(':')[1] || 'image/jpeg',
        data: base64Image.split('base64,')[1]
      }
    });
    
    contents.push({
      role: lastMessage.role === 'user' ? 'user' : 'model',
      parts: parts
    });
  }
  
  return {
    contents,
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxTokens || 2048
    }
  };
};

/**
 * 构建包含图片的Mistral AI请求体
 * @param messages 消息数组
 * @param base64Image 图片的base64编码字符串
 * @param config API配置
 * @returns 请求体对象
 */
export const buildMistralImageRequestBody = (
  messages: Message[], 
  base64Image: string,
  config: ApiConfig
): Record<string, any> => {
  // 转换消息为Mistral格式
  const mistralMessages: any[] = [];
  
  // 处理常规消息
  for (const msg of messages.slice(0, -1)) {
    mistralMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || ''
    });
  }
  
  // 最后一条消息（带图片）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    // 创建带图片的多模态消息
    const content: any[] = [];
    
    // 添加文本部分(如果有)
    if (lastMessage.content && lastMessage.content.trim() !== '') {
      content.push({
        type: "text",
        text: lastMessage.content
      });
    }
    
    // 添加图片部分
    content.push({
      type: "image_url",
      image_url: base64Image
    });
    
    // 添加到消息数组
    mistralMessages.push({
      role: lastMessage.role === 'user' ? 'user' : 'assistant',
      content: content
    });
  }
  
  return {
    model: config.model,
    messages: mistralMessages,
    temperature: config.temperature || 0.7,
    max_tokens: config.maxTokens || 2048
  };
};

/**
 * 根据提供商构建图片请求体
 * @param messages 消息数组
 * @param base64Image 图片的base64编码字符串
 * @param config API配置
 * @returns 请求体对象
 */
export const buildImageRequestBody = (
  messages: Message[], 
  base64Image: string,
  config: ApiConfig
): Record<string, any> => {
  // 不同提供商的请求格式可能不同
  switch (config.provider) {
    case 'anthropic':
      return buildClaudeImageRequestBody(messages, base64Image, config);
    case 'gemini':
      return buildGeminiImageRequestBody(messages, base64Image, config);
    case 'mistral':
      return buildMistralImageRequestBody(messages, base64Image, config);
    case 'openai':
    case 'azure':
    default:
      // 默认使用OpenAI兼容格式
      return buildOpenAIImageRequestBody(messages, base64Image, config);
  }
};

/**
 * 发送API请求
 * @param messages 消息数组
 * @param config API配置
 * @param options 请求选项
 * @returns 消息响应
 */
export const sendApiRequest = async (
  messages: Message[],
  config: ApiConfig,
  options?: ApiRequestOptions
): Promise<MessageResponse> => {
  try {
    if (!isValidApiConfig(config)) {
      throw new Error('API配置不完整');
    }
    
    const requestBody = buildRequestBody(messages, config);
    const headers = getRequestHeaders(config.provider, config.apiKey);
    
    // 设置超时
    const timeoutMs = options?.timeout || 30000;
    const fetchPromise = fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    // 添加超时处理
    const response = await Promise.race([
      fetchPromise,
      createTimeout(timeoutMs)
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // 解析不同提供商的响应格式
    let content = '';
    
    switch (config.provider) {
      case 'openai':
      case 'azure':
      case 'together':
      case 'mistral':
      case 'localai':
        content = data.choices?.[0]?.message?.content || '';
        break;
      case 'anthropic':
        content = data.content?.[0]?.text || '';
        break;
      case 'gemini':
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        break;
      case 'qwen':
        content = data.output?.text || '';
        break;
      default:
        content = data.message || data.content || '';
    }
    
    return { content };
  } catch (error) {
    console.error('API请求错误:', error);
    return {
      error: error instanceof Error ? error.message : '未知错误',
      content: ''
    };
  }
};

/**
 * 发送带图片的API请求
 * @param messages 消息数组
 * @param base64Image 图片base64编码
 * @param config API配置
 * @param options 请求选项
 * @returns 消息响应
 */
export const sendImageApiRequest = async (
  messages: Message[],
  base64Image: string,
  config: ApiConfig,
  options?: ApiRequestOptions
): Promise<MessageResponse> => {
  try {
    if (!isValidApiConfig(config)) {
      throw new Error('API配置不完整');
    }
    
    if (!config.supportsMultimodal) {
      throw new Error(`${config.provider} 不支持多模态输入`);
    }
    
    // 构建请求体
    const requestBody = buildImageRequestBody(messages, base64Image, config);
    const headers = getRequestHeaders(config.provider, config.apiKey);
    
    // 设置超时
    const timeoutMs = options?.timeout || 90000; // 图片处理可能需要更长时间
    const fetchPromise = fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    // 添加超时处理
    const response = await Promise.race([
      fetchPromise,
      createTimeout(timeoutMs)
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // 解析不同提供商的响应格式
    let content = '';
    
    switch (config.provider) {
      case 'openai':
      case 'azure':
      case 'together':
      case 'localai':
        content = data.choices?.[0]?.message?.content || '';
        break;
      case 'anthropic':
        content = data.content?.[0]?.text || '';
        break;
      case 'gemini':
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        break;
      case 'mistral':
        content = data.choices?.[0]?.message?.content || '';
        break;
      default:
        content = data.message || data.content || '';
    }
    
    return { content };
  } catch (error) {
    console.error('带图片的API请求错误:', error);
    return {
      error: error instanceof Error ? error.message : '未知错误',
      content: ''
    };
  }
}; 