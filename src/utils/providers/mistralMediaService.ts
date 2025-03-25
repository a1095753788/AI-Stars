/**
 * Mistral媒体服务实现
 * 处理发送媒体到Mistral AI的功能
 */

import { MediaInfo } from '../mediaService';
import { preprocessMedia } from '../mediaUtils';

// Mistral响应接口
export interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Mistral内容项接口
export interface MistralContentItem {
  type: 'text' | 'image';
  text?: string;
  image?: string;
}

/**
 * 发送媒体到Mistral API
 * @param apiKey API密钥
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns Mistral响应
 */
export const sendMediaToMistral = async (
  apiKey: string,
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ content: string; usage?: { total: number; prompt: number; completion: number } }> => {
  try {
    // 预处理媒体文件
    const processedMedia = await preprocessMedia(mediaInfo, 'mistral');

    // 构建请求体
    const requestBody = buildMistralRequestBody(processedMedia, prompt, options);

    // 发送请求
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mistral API错误: ${errorData.error?.message || response.statusText}`);
    }

    const data: MistralResponse = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        total: data.usage?.total_tokens || 0,
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0
      }
    };
  } catch (error) {
    console.error('发送媒体到Mistral失败:', error);
    throw error;
  }
};

/**
 * 构建Mistral API请求体
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 请求体
 */
export const buildMistralRequestBody = (
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  // 默认值
  const model = options?.model || 'mistral-large-latest';
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4096;

  // 构建内容数组
  const content: MistralContentItem[] = [
    { type: 'text', text: prompt }
  ];

  // 添加媒体内容（仅支持图像）
  if (mediaInfo.type === 'image' && mediaInfo.base64) {
    content.push(createImageContent(mediaInfo));
  }

  // 返回完整请求体
  return {
    model,
    messages: [
      {
        role: 'user',
        content
      }
    ],
    temperature,
    max_tokens: maxTokens
  };
};

/**
 * 创建图像内容对象
 * @param mediaInfo 媒体信息
 * @returns 图像内容对象
 */
export const createImageContent = (mediaInfo: MediaInfo): MistralContentItem => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('图像内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'image/jpeg';

  // 为Mistral API创建图像内容
  return {
    type: 'image',
    image: `data:${mimeType};base64,${mediaInfo.base64}`
  };
}; 