/**
 * 媒体处理服务
 * 
 * 支持发送图片、文件、视频到各种AI服务提供商，包括：
 * - OpenAI (GPT-4o)
 * - Claude (Claude 3)
 * - Google Gemini
 * - Mistral AI
 * - 通义千问
 */

import { preprocessMedia } from './mediaUtils';
import { sendMediaToOpenAI } from './providers/openaiMediaService';
import { sendMediaToClaude } from './providers/claudeMediaService';
import { sendMediaToGemini } from './providers/geminiMediaService';
import { sendMediaToMistral } from './providers/mistralMediaService';
import { sendMediaToQwen } from './providers/qwenMediaService';

/**
 * 支持的AI服务提供商
 */
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'mistral' | 'qwen';

/**
 * 支持的媒体类型
 */
export type MediaType = 'image' | 'document' | 'video';

/**
 * 媒体信息接口
 */
export interface MediaInfo {
  // 基本信息
  type: MediaType;
  uri?: string;
  base64?: string;
  mimeType?: string;
  
  // 媒体属性
  width?: number;
  height?: number;
  fileSize?: number;
  fileName?: string;
  
  // 视频特有属性
  duration?: number;
  frames?: MediaInfo[]; // 用于视频帧
}

/**
 * AI选项接口
 */
export interface AIOptions {
  model?: string;
  maxTokens?: number;
  apiKey: string;
  temperature?: number;
  highResolution?: boolean; // 主要用于Qwen高分辨率设置
  [key: string]: any; // 其他特定提供商的选项
}

/**
 * AI响应接口
 */
export interface AIResponse {
  content: string;
  usage?: {
    total: number;
    prompt?: number;
    completion?: number;
    input?: number;
    output?: number;
  };
  [key: string]: any; // 其他特定提供商的响应字段
}

/**
 * 发送媒体到AI
 * @param provider AI服务提供商
 * @param mediaInfo 媒体信息
 * @param prompt 提示文本
 * @param options 选项
 * @returns AI响应
 */
export const sendMediaToAI = async (
  provider: AIProvider,
  mediaInfo: MediaInfo,
  prompt: string,
  options: AIOptions
): Promise<AIResponse> => {
  try {
    // 预处理媒体
    const processedMedia = await preprocessMedia(mediaInfo, provider);
    
    // 根据提供商发送媒体
    switch (provider) {
      case 'openai':
        return await sendMediaToOpenAI(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      case 'claude':
        return await sendMediaToClaude(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      case 'gemini':
        return await sendMediaToGemini(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      case 'mistral':
        return await sendMediaToMistral(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      case 'qwen':
        return await sendMediaToQwen(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          highResolution: options.highResolution
        });
      default:
        // 默认使用OpenAI
        return await sendMediaToOpenAI(options.apiKey, processedMedia, prompt, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
    }
  } catch (error) {
    console.error('媒体发送失败:', error);
    throw error;
  }
}; 