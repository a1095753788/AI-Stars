/**
 * Google Gemini媒体服务实现
 * 处理发送媒体到Google Gemini API的功能
 */

import { MediaInfo } from '../mediaService';
import { preprocessMedia } from '../mediaUtils';

// Gemini响应接口
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text?: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: any[];
  }[];
  promptFeedback: {
    safetyRatings: any[];
  };
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// Gemini内容部分接口
export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

/**
 * 发送媒体到Google Gemini API
 * @param apiKey API密钥
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns Gemini响应
 */
export const sendMediaToGemini = async (
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
    const processedMedia = await preprocessMedia(mediaInfo, 'gemini');

    // 构建请求体
    const requestBody = buildGeminiRequestBody(processedMedia, prompt, options);

    // 确定模型名称
    const model = options?.model || 'gemini-pro-vision';
    
    // 构建API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API错误: ${errorData.error?.message || response.statusText}`);
    }

    const data: GeminiResponse = await response.json();

    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: {
        total: data.usageMetadata?.totalTokenCount || 0,
        prompt: data.usageMetadata?.promptTokenCount || 0,
        completion: data.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error('发送媒体到Gemini失败:', error);
    throw error;
  }
};

/**
 * 构建Gemini API请求体
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 请求体
 */
export const buildGeminiRequestBody = (
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  // 默认值
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4096;

  // 构建消息部分
  const parts: GeminiPart[] = [
    { text: prompt }
  ];

  // 添加媒体内容
  if (mediaInfo.type === 'image' && mediaInfo.base64) {
    // 添加图像内容
    parts.push(createImageContent(mediaInfo));
  }

  // 返回完整请求体
  return {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 32
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };
};

/**
 * 创建图像内容对象
 * @param mediaInfo 媒体信息
 * @returns 图像内容对象
 */
export const createImageContent = (mediaInfo: MediaInfo): GeminiPart => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('图像内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'image/jpeg';

  // 为Gemini API创建图像内容
  return {
    inlineData: {
      mimeType,
      data: mediaInfo.base64
    }
  };
}; 