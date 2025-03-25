/**
 * 媒体工具函数
 * 处理各种类型媒体的预处理和格式转换
 */

import { Platform } from 'react-native';
import { decode as atob } from 'base-64';
import { AIProvider, MediaInfo, MediaType } from './mediaService';
import * as ImageManipulator from 'expo-image-manipulator';
import { FileSystem } from 'react-native-file-access';
import { ImageResult, manipulateAsync } from 'expo-image-manipulator';
import base64 from 'base-64';

/**
 * 预处理媒体文件
 * @param mediaInfo 媒体信息
 * @param provider 提供商 
 * @returns 处理后的媒体信息
 */
export const preprocessMedia = async (
  mediaInfo: MediaInfo,
  provider?: AIProvider
): Promise<MediaInfo> => {
  // 根据媒体类型执行不同的预处理
  switch (mediaInfo.type) {
    case 'image':
      return preprocessImage(mediaInfo, provider);
    case 'document':
      return preprocessDocument(mediaInfo, provider);
    case 'video':
      return preprocessVideo(mediaInfo, provider);
    default:
      return mediaInfo;
  }
};

/**
 * 预处理图片
 * @param mediaInfo 图片信息
 * @param provider 提供商
 * @returns 处理后的图片信息
 */
export const preprocessImage = async (
  mediaInfo: MediaInfo,
  provider?: AIProvider
): Promise<MediaInfo> => {
  try {
    // 如果已经有base64数据，不需要再处理
    if (mediaInfo.base64) {
      return mediaInfo;
    }

    // 获取提供商的图像大小限制
    const sizeLimit = getImageSizeLimit(provider);

    // 如果没有URI，无法处理
    if (!mediaInfo.uri) {
      throw new Error('图片预处理失败：缺少URI');
    }

    // 压缩图片以符合大小限制
    const compressed = await compressImage({
      uri: mediaInfo.uri,
      width: mediaInfo.width,
      height: mediaInfo.height,
      maxWidth: sizeLimit.maxWidth,
      maxHeight: sizeLimit.maxHeight,
      quality: 0.8
    });

    // 转换为base64
    const base64 = await imageToBase64(compressed.uri);

    return {
      ...mediaInfo,
      base64,
      width: compressed.width,
      height: compressed.height,
      fileSize: compressed.size,
      mimeType: getMimeType(mediaInfo.uri) || 'image/jpeg'
    };
  } catch (error) {
    console.error('图片预处理失败:', error);
    throw error;
  }
};

/**
 * 预处理文档
 * @param mediaInfo 文档信息
 * @param provider 提供商
 * @returns 处理后的文档信息
 */
export const preprocessDocument = async (
  mediaInfo: MediaInfo,
  provider?: AIProvider
): Promise<MediaInfo> => {
  try {
    // 如果已经有base64数据，不需要再处理
    if (mediaInfo.base64) {
      return mediaInfo;
    }

    // 如果没有URI，无法处理
    if (!mediaInfo.uri) {
      throw new Error('文档预处理失败：缺少URI');
    }

    // 读取文件内容
    const fileContent = await FileSystem.readFile(mediaInfo.uri, 'base64');

    return {
      ...mediaInfo,
      base64: fileContent,
      mimeType: getMimeType(mediaInfo.uri) || 'application/octet-stream'
    };
  } catch (error) {
    console.error('文档预处理失败:', error);
    throw error;
  }
};

/**
 * 预处理视频
 * @param mediaInfo 视频信息
 * @param provider 提供商
 * @returns 处理后的视频信息
 */
export const preprocessVideo = async (
  mediaInfo: MediaInfo,
  provider?: AIProvider
): Promise<MediaInfo> => {
  try {
    // 目前只有少数提供商支持视频，如通义千问VL
    if (provider !== 'qwen') {
      throw new Error('该提供商不支持视频处理');
    }

    // 如果已经有base64数据，不需要再处理
    if (mediaInfo.base64) {
      return mediaInfo;
    }

    // 如果没有URI，无法处理
    if (!mediaInfo.uri) {
      throw new Error('视频预处理失败：缺少URI');
    }

    // 读取视频文件内容
    const videoContent = await FileSystem.readFile(mediaInfo.uri, 'base64');

    return {
      ...mediaInfo,
      base64: videoContent,
      mimeType: getMimeType(mediaInfo.uri) || 'video/mp4'
    };
  } catch (error) {
    console.error('视频预处理失败:', error);
    throw error;
  }
};

/**
 * 根据文件扩展名获取MIME类型
 * @param uri 文件URI
 * @returns MIME类型
 */
export const getMimeType = (uri?: string): string | undefined => {
  if (!uri) return undefined;

  const extension = uri.split('.').pop()?.toLowerCase();
  if (!extension) return undefined;

  const mimeTypes: Record<string, string> = {
    // 图像
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    
    // 文档
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    
    // 视频
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm'
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * 压缩图片
 * @param options 压缩选项
 * @returns 压缩后的图片信息
 */
export const compressImage = async (options: {
  uri: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}): Promise<{ uri: string; width: number; height: number; size: number }> => {
  try {
    // 计算新的尺寸
    const originalWidth = options.width || 1024;
    const originalHeight = options.height || 1024;
    const maxWidth = options.maxWidth || 2048;
    const maxHeight = options.maxHeight || 2048;
    const quality = options.quality || 0.8;

    // 计算缩放比例
    let scale = 1;
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      scale = Math.min(widthRatio, heightRatio);
    }

    // 计算新尺寸
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    // 使用ImageManipulator压缩图片
    const result = await ImageManipulator.manipulateAsync(
      options.uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 获取文件大小
    const fileInfo = await FileSystem.stat(result.uri);

    return {
      uri: result.uri,
      width: newWidth,
      height: newHeight,
      size: fileInfo.size || 0
    };
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw error;
  }
};

/**
 * 将图片转换为base64
 * @param uri 图片URI
 * @returns base64字符串
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // 读取文件内容
    const base64 = await FileSystem.readFile(uri, 'base64');
    return base64;
  } catch (error) {
    console.error('图片转Base64失败:', error);
    throw error;
  }
};

/**
 * 获取不同提供商的图像大小限制
 * @param provider 提供商
 * @returns 大小限制
 */
export const getImageSizeLimit = (provider?: AIProvider): {
  maxWidth: number;
  maxHeight: number;
  maxFileSize: number;
} => {
  switch (provider) {
    case 'openai':
      return { maxWidth: 3072, maxHeight: 3072, maxFileSize: 20 * 1024 * 1024 }; // 20MB
    case 'claude':
      return { maxWidth: 5000, maxHeight: 5000, maxFileSize: 5 * 1024 * 1024 }; // 5MB
    case 'gemini':
      return { maxWidth: 4096, maxHeight: 4096, maxFileSize: 10 * 1024 * 1024 }; // 10MB
    case 'mistral':
      return { maxWidth: 2048, maxHeight: 2048, maxFileSize: 5 * 1024 * 1024 }; // 5MB
    case 'qwen':
      return { maxWidth: 4096, maxHeight: 4096, maxFileSize: 10 * 1024 * 1024 }; // 10MB
    default:
      return { maxWidth: 2048, maxHeight: 2048, maxFileSize: 5 * 1024 * 1024 }; // 默认5MB
  }
}; 