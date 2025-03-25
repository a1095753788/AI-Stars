/**
 * API响应处理模块
 */
import { ApiConfig, MessageResponse, StreamCallback } from '../types';
import { getRequestHeaders } from '../providers/endpoints';
import { buildRequestBody } from './request';
import { Message } from '../../../types/state';
import { isValidApiConfig, createTimeout, safeParseJSON } from './utils';

/**
 * 处理流式响应
 * @param response 响应对象
 * @param provider API提供商类型
 * @param callback 回调函数
 */
export const handleStreamResponse = async (
  response: Response,
  provider: ApiConfig['provider'],
  callback: StreamCallback
): Promise<void> => {
  if (!response.body) {
    callback({ content: '', error: '无法获取响应流', done: true });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        callback({ content: fullContent, done: true });
        break;
      }

      // 解码二进制数据
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 根据不同提供商处理数据
      switch (provider) {
        case 'openai':
        case 'azure':
        case 'together':
        case 'mistral':
        case 'localai':
          fullContent = processOpenAIStreamChunk(buffer, fullContent, callback);
          break;
        case 'anthropic':
          fullContent = processAnthropicStreamChunk(buffer, fullContent, callback);
          break;
        default:
          // 对于不明确的提供商，尝试通用的处理方法
          fullContent = processGenericStreamChunk(buffer, fullContent, callback);
      }
    }
  } catch (error) {
    console.error('处理流式响应错误:', error);
    callback({
      content: fullContent,
      error: error instanceof Error ? error.message : '流式解析错误',
      done: true
    });
  }
};

/**
 * 处理OpenAI格式的流式响应块
 * 格式: 'data: {...}\n\ndata: {...}\n\n'
 */
const processOpenAIStreamChunk = (
  buffer: string,
  fullContent: string,
  callback: StreamCallback
): string => {
  // 按行分割
  const lines = buffer.split('\n\n');
  let newContent = fullContent;
  
  // 处理每一行
  for (const line of lines) {
    if (!line.trim() || !line.startsWith('data: ')) continue;
    
    // 提取JSON部分
    const jsonStr = line.replace(/^data: /, '').trim();
    if (jsonStr === '[DONE]') {
      callback({ content: newContent, done: true });
      continue;
    }
    
    try {
      const json = JSON.parse(jsonStr);
      const content = json.choices?.[0]?.delta?.content || '';
      if (content) {
        newContent += content;
        callback({ content: newContent, done: false });
      }
    } catch (e) {
      // 忽略解析错误，继续处理下一行
      console.error('解析OpenAI流式数据错误:', e);
    }
  }
  
  return newContent;
};

/**
 * 处理Anthropic格式的流式响应块
 */
const processAnthropicStreamChunk = (
  buffer: string,
  fullContent: string,
  callback: StreamCallback
): string => {
  const lines = buffer.split('\n\n');
  let newContent = fullContent;
  
  for (const line of lines) {
    if (!line.trim() || !line.startsWith('data: ')) continue;
    
    const jsonStr = line.replace(/^data: /, '').trim();
    try {
      const json = JSON.parse(jsonStr);
      
      if (json.type === 'content_block_delta') {
        const content = json.delta?.text || '';
        if (content) {
          newContent += content;
          callback({ content: newContent, done: false });
        }
      } else if (json.type === 'message_stop') {
        callback({ content: newContent, done: true });
      }
    } catch (e) {
      console.error('解析Anthropic流式数据错误:', e);
    }
  }
  
  return newContent;
};

/**
 * 处理通用流式响应块
 * 尝试通用方法处理未知格式的流
 */
const processGenericStreamChunk = (
  buffer: string,
  fullContent: string,
  callback: StreamCallback
): string => {
  try {
    // 尝试直接作为JSON解析
    const data = safeParseJSON<any>(buffer, null);
    if (data) {
      // 尝试常见的字段名
      const content = 
        data.content || 
        data.text || 
        data.message?.content || 
        data.choices?.[0]?.text || 
        data.choices?.[0]?.message?.content || 
        data.output || 
        '';
      
      if (content) {
        const newContent = fullContent + content;
        callback({ content: newContent, done: false });
        return newContent;
      }
    }
    
    // 作为纯文本处理
    if (buffer.trim()) {
      const newContent = fullContent + buffer;
      callback({ content: newContent, done: false });
      return newContent;
    }
  } catch (e) {
    console.error('通用流式处理错误:', e);
  }
  
  return fullContent;
};

/**
 * 发送流式API请求
 * @param messages 消息数组
 * @param config API配置
 * @param callback 回调函数
 * @param options 请求选项
 */
export const sendStreamApiRequest = async (
  messages: Message[],
  config: ApiConfig,
  callback: StreamCallback,
  options?: { timeout?: number }
): Promise<void> => {
  try {
    if (!isValidApiConfig(config)) {
      callback({ content: '', error: 'API配置不完整', done: true });
      return;
    }
    
    // 构建请求体，确保stream=true
    const requestBody = {
      ...buildRequestBody(messages, config),
      stream: true
    };
    
    // 获取请求头
    const headers = getRequestHeaders(config.provider, config.apiKey);
    
    // 设置超时
    const timeoutMs = options?.timeout || 60000;
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
      callback({ 
        content: '', 
        error: `API请求失败: ${response.status} ${errorText}`, 
        done: true 
      });
      return;
    }
    
    // 处理流式响应
    await handleStreamResponse(response, config.provider, callback);
  } catch (error) {
    console.error('流式API请求错误:', error);
    callback({
      content: '',
      error: error instanceof Error ? error.message : '未知错误',
      done: true
    });
  }
}; 