/**
 * OpenAI媒体服务实现
 * 处理发送媒体到OpenAI的功能
 */

import { MediaInfo } from '../mediaService';
import { preprocessMedia } from '../mediaUtils';

// OpenAI响应接口
export interface OpenAIResponse {
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

// OpenAI内容项类型
export type OpenAIContentItem = 
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: string } };

/**
 * 发送媒体到OpenAI API
 * @param apiKey API密钥
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns OpenAI响应
 */
export const sendMediaToOpenAI = async (
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
    const processedMedia = await preprocessMedia(mediaInfo, 'openai');

    // 构建请求体
    const requestBody = buildOpenAIRequestBody(processedMedia, prompt, options);

    // 发送请求
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        total: data.usage?.total_tokens || 0,
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0
      }
    };
  } catch (error) {
    console.error('发送媒体到OpenAI失败:', error);
    throw error;
  }
};

/**
 * 构建OpenAI API请求体
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 请求体
 */
export const buildOpenAIRequestBody = (
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  // 默认值
  const model = options?.model || 'gpt-4-vision-preview';
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4096;

  // 构建消息内容数组
  const contentItems: OpenAIContentItem[] = [
    { type: 'text', text: prompt }
  ];

  // 添加媒体内容
  if (mediaInfo.type === 'image' && mediaInfo.base64) {
    // 添加图像内容
    contentItems.push(createImageContent(mediaInfo));
  } else if (mediaInfo.type === 'document' && mediaInfo.base64) {
    // 对于文档，先转为文本
    const textContent = createDocumentContent(mediaInfo);
    if (textContent) {
      contentItems.push({ type: 'text', text: textContent });
    }
  }

  // 返回完整请求体
  return {
    model,
    messages: [
      {
        role: 'user',
        content: contentItems
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
export const createImageContent = (mediaInfo: MediaInfo): OpenAIContentItem => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('图像内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'image/jpeg';

  // 为OpenAI API创建图像内容
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${mediaInfo.base64}`,
      detail: 'high' // 可以是 'low', 'high', 'auto'
    }
  };
};

/**
 * 创建文档内容
 * @param mediaInfo 媒体信息
 * @returns 文档内容文本
 */
export const createDocumentContent = (mediaInfo: MediaInfo): string | null => {
  // 目前仅支持文本类文档
  // 对于PDF等复杂文档，需要额外的处理逻辑
  if (mediaInfo.mimeType?.includes('text/') && mediaInfo.base64) {
    try {
      // 将base64转为文本
      const text = Buffer.from(mediaInfo.base64, 'base64').toString('utf8');
      return text;
    } catch (error) {
      console.error('解析文档内容失败:', error);
      return null;
    }
  }
  return null;
}; 