/**
 * 通义千问媒体服务实现
 * 处理发送媒体到阿里通义千问的功能
 */

import { MediaInfo } from '../mediaService';
import { preprocessMedia } from '../mediaUtils';

// 千问响应接口
export interface QwenResponse {
  output: {
    choices: {
      message: {
        content: string;
        role: string;
      };
      finish_reason: string;
    }[];
  };
  usage: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
  };
  request_id: string;
}

// 千问消息内容项接口
export interface QwenContentItem {
  text?: string;
  image?: string;
  video?: string;
}

/**
 * 发送媒体到通义千问API
 * @param apiKey API密钥
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 千问响应
 */
export const sendMediaToQwen = async (
  apiKey: string,
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    highResolution?: boolean;
  }
): Promise<{ content: string; usage?: { total: number; input: number; output: number } }> => {
  try {
    // 预处理媒体文件
    const processedMedia = await preprocessMedia(mediaInfo, 'qwen');

    // 构建请求体
    const requestBody = buildQwenRequestBody(processedMedia, prompt, options);

    // 发送请求
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-DataInspection': 'enable'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`通义千问API错误: ${errorData.message || response.statusText}`);
    }

    const data: QwenResponse = await response.json();

    return {
      content: data.output?.choices?.[0]?.message?.content || '',
      usage: {
        total: data.usage?.total_tokens || 0,
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0
      }
    };
  } catch (error) {
    console.error('发送媒体到通义千问失败:', error);
    throw error;
  }
};

/**
 * 构建通义千问API请求体
 * @param mediaInfo 媒体信息
 * @param prompt 用户提示
 * @param options 可选参数
 * @returns 请求体
 */
export const buildQwenRequestBody = (
  mediaInfo: MediaInfo,
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    highResolution?: boolean;
  }
) => {
  // 默认值
  const model = options?.model || 'qwen-vl-max';
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens || 4096;
  const highResolution = options?.highResolution ?? false;

  // 构建消息内容
  const content: QwenContentItem[] = [
    { text: prompt }
  ];

  // 添加媒体内容
  if (mediaInfo.type === 'image' && mediaInfo.base64) {
    // 添加图像内容到消息中
    content.push(createImageContent(mediaInfo));
  } else if (mediaInfo.type === 'video' && mediaInfo.base64) {
    // 通义千问支持视频处理
    content.push(createVideoContent(mediaInfo));
  }

  // 返回完整请求体
  const requestBody: any = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content
        }
      ]
    },
    parameters: {
      temperature,
      max_tokens: maxTokens,
      result_format: 'message'
    }
  };

  // 如果启用高分辨率
  if (highResolution) {
    requestBody.parameters.vl_high_resolution_images = true;
  }

  return requestBody;
};

/**
 * 创建图像内容对象
 * @param mediaInfo 媒体信息
 * @returns 图像内容对象
 */
export const createImageContent = (mediaInfo: MediaInfo): QwenContentItem => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('图像内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'image/jpeg';

  // 为通义千问API创建图像内容
  return {
    image: `data:${mimeType};base64,${mediaInfo.base64}`
  };
};

/**
 * 创建视频内容对象
 * @param mediaInfo 媒体信息
 * @returns 视频内容对象
 */
export const createVideoContent = (mediaInfo: MediaInfo): QwenContentItem => {
  // 确保有base64数据
  if (!mediaInfo.base64) {
    throw new Error('视频内容缺少base64数据');
  }

  // 获取MIME类型
  const mimeType = mediaInfo.mimeType || 'video/mp4';

  // 为通义千问API创建视频内容
  return {
    video: `data:${mimeType};base64,${mediaInfo.base64}`
  };
}; 