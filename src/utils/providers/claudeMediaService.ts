/**
 * Claude媒体服务实现
 * 处理发送媒体到Anthropic Claude的功能
 */

import { MediaInfo } from '../mediaService';
import { preprocessMedia } from '../mediaUtils';

// Claude响应接口
export interface ClaudeResponse {
  id: string;
  type: string;
  model: string;
  role: string;
  content: {
    type: string;
    text: string;
  }[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason: string;
  stop_sequence: string | null;
}

/**
 * 发送媒体到Claude API
 * @param apiKey API密钥
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns Claude响应
 */
export const sendMediaToClaude = async (
  apiKey: string,
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ content: string; usage?: { total: number; input: number; output: number; } }> => {
  try {
    // 预处理媒体文件
    const processedMedia = await preprocessMedia(mediaInfo, 'claude');

    // 构建请求体
    const requestBody = buildClaudeRequestBody(processedMedia, prompt, options);

    // 发送请求
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API错误: ${errorData.error?.message || response.statusText}`);
    }

    const data: ClaudeResponse = await response.json();

    return {
      content: data.content?.[0]?.text || '',
      usage: {
        total: data.usage?.input_tokens + data.usage?.output_tokens || 0,
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0
      }
    };
  } catch (error) {
    console.error('发送媒体到Claude失败:', error);
    throw error;
  }
};

/**
 * 构建Claude API请求体
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 请求体
 */
export const buildClaudeRequestBody = (
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  // 默认值
  const model = options?.model || 'claude-3-opus-20240229';
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4096;

  // 构建消息内容
  const content = [];

  // 添加文本内容
  content.push({
    type: 'text',
    text: prompt
  });

  // 添加媒体内容
  if (mediaInfo.type === 'image' && mediaInfo.base64) {
    content.push(createImageContent(mediaInfo));
  } else if (mediaInfo.type === 'document' && mediaInfo.base64) {
    // Claude支持一些文档类型，比如PDF
    if (mediaInfo.mimeType?.includes('application/pdf')) {
      content.push(createDocumentContent(mediaInfo));
    } else {
      // 对于其他文档，尝试转为文本
      const textContent = extractTextFromDocument(mediaInfo);
      if (textContent) {
        content.push({
          type: 'text',
          text: textContent
        });
      }
    }
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
export const createImageContent = (mediaInfo: MediaInfo) => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('图像内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'image/jpeg';

  // 为Claude API创建图像内容
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mimeType,
      data: mediaInfo.base64
    }
  };
};

/**
 * 创建文档内容对象
 * @param mediaInfo 媒体信息
 * @returns 文档内容对象
 */
export const createDocumentContent = (mediaInfo: MediaInfo) => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('文档内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'application/octet-stream';

  // 为Claude API创建文档内容
  return {
    type: 'image', // Claude把文档也当作image处理
    source: {
      type: 'base64',
      media_type: mimeType,
      data: mediaInfo.base64
    }
  };
};

/**
 * 从文档中提取文本
 * @param mediaInfo 媒体信息
 * @returns 提取的文本内容
 */
export const extractTextFromDocument = (mediaInfo: MediaInfo): string | null => {
  // 目前仅支持文本类文档
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