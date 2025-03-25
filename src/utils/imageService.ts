/**
 * 图片处理服务
 * 提供拍照、选择图片、压缩和Base64转换功能
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';

// 用于模拟图片信息的接口
export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

// 相机选项配置
const cameraOptions: CameraOptions = {
  mediaType: 'photo',
  includeBase64: false,
  maxHeight: 1200,
  maxWidth: 1200,
  quality: 0.8,
  saveToPhotos: false,
};

// 图库选项配置
const galleryOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  includeBase64: false,
  maxHeight: 1200,
  maxWidth: 1200,
  quality: 0.8,
  selectionLimit: 1,
};

/**
 * 请求相机权限（仅Android需要）
 */
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '相机权限',
        message: '应用需要访问您的相机以拍摄照片。',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      }
    );
    
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('请求相机权限时出错:', err);
    return false;
  }
};

/**
 * 从相机选择图片
 */
export const selectImageFromCamera = async (): Promise<Asset | null> => {
  // 检查权限
  if (Platform.OS === 'android') {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('没有相机权限');
    }
  }
  
  return new Promise((resolve, reject) => {
    launchCamera(cameraOptions, (response) => {
      if (response.didCancel) {
        resolve(null);
        return;
      }
      
      if (response.errorCode) {
        reject(new Error(response.errorMessage || '拍照时出错'));
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        reject(new Error('无法获取照片'));
      }
    });
  });
};

/**
 * 从图库选择图片
 */
export const selectImageFromGallery = async (): Promise<Asset | null> => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(galleryOptions, (response) => {
      if (response.didCancel) {
        resolve(null);
        return;
      }
      
      if (response.errorCode) {
        reject(new Error(response.errorMessage || '选择图片时出错'));
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        reject(new Error('无法获取图片'));
      }
    });
  });
};

/**
 * 压缩图片
 * @param imageInfo 原始图片信息
 * @returns 压缩后的图片信息
 */
export const compressImage = async (imageInfo: ImageInfo): Promise<ImageInfo> => {
  try {
    // 判断文件是否需要压缩 (大于1MB的图片才压缩)
    const MAX_SIZE = 1024 * 1024; // 1MB
    if (!imageInfo.fileSize || imageInfo.fileSize <= MAX_SIZE) {
      console.log('图片不需要压缩:', imageInfo.fileSize);
      return imageInfo;
    }
    
    // 计算需要使用的压缩质量 (文件越大，压缩率越高)
    // 2MB - 0.7, 5MB - 0.5, 10MB及以上 - 0.3
    let quality = 0.7; // 0-1之间的数值
    if (imageInfo.fileSize > 5 * 1024 * 1024) {
      quality = 0.5;
    }
    if (imageInfo.fileSize > 10 * 1024 * 1024) {
      quality = 0.3;
    }
    
    console.log('开始压缩图片，使用质量:', quality);
    
    // 选择压缩后的URI路径 - 使用临时目录
    const compressedFilePath = `${RNFS.CachesDirectoryPath}/compressed_${Date.now()}.jpg`;
    
    // 将原图读取为base64，然后写入新文件 (适用于没有专用压缩库的场景)
    const imageBase64 = await imageToBase64(imageInfo.uri);
    if (!imageBase64) {
      console.error('无法读取图片进行压缩');
      return imageInfo;
    }
    
    // 从data:image/jpeg;base64,开头的字符串中提取纯base64数据
    const base64Data = imageBase64.split('base64,')[1];
    
    // 写入压缩后的文件
    await RNFS.writeFile(compressedFilePath, base64Data, 'base64');
    
    // 获取压缩后的文件大小
    const fileInfo = await RNFS.stat(compressedFilePath);
    
    console.log('压缩前大小:', imageInfo.fileSize, '压缩后大小:', fileInfo.size);
    
    // 返回压缩后的图片信息
    return {
      ...imageInfo,
      uri: `file://${compressedFilePath}`,
      fileSize: fileInfo.size,
      // 保持其他信息不变
    };
  } catch (error) {
    console.error('压缩图片失败:', error);
    // 如果压缩失败，返回原始图片
    return imageInfo;
  }
};

/**
 * 将图片转换为Base64格式
 * @param uri 图片URI
 * @returns Base64字符串，如果转换失败则返回null
 */
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // 处理file:// URI前缀
    const filePath = uri.startsWith('file://') ? uri.slice(7) : uri;
    
    // 检查文件是否存在
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      console.error('图片文件不存在:', filePath);
      return null;
    }
    
    // 读取文件内容并转换为base64
    const base64Data = await RNFS.readFile(filePath, 'base64');
    if (!base64Data) {
      console.error('读取图片文件失败');
      return null;
    }
    
    // 获取图片MIME类型
    const mimeType = getImageMimeTypeFromUri(uri);
    
    // 返回带有MIME类型的完整base64字符串
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('转换图片到Base64失败:', error);
    return null;
  }
};

/**
 * 获取图片缩略图
 * @param uri 图片URI
 * @param size 缩略图大小
 * @returns 缩略图URI
 */
export const getImageThumbnail = async (uri: string, size: { width: number, height: number }): Promise<string> => {
  // 实际应用中，这里应该生成缩略图
  // 例如：使用react-native-image-resizer
  
  // 模拟实现，返回一个假的缩略图URI
  return new Promise((resolve) => {
    setTimeout(() => {
      const thumbnailUri = uri.replace('.jpg', '-thumbnail.jpg');
      resolve(thumbnailUri);
    }, 100);
  });
};

/**
 * 为视频创建缩略图
 */
export const generateVideoThumbnail = async (videoUri: string): Promise<string> => {
  try {
    const { path } = await createThumbnail({
      url: videoUri,
      timeStamp: 1000, // 视频的1秒处
    });
    
    return path;
  } catch (error) {
    console.error('生成视频缩略图时出错:', error);
    throw new Error('无法生成视频缩略图');
  }
};

/**
 * 从URI获取图片文件名
 */
export const getImageNameFromUri = (uri: string): string => {
  const uriSegments = uri.split('/');
  const fileName = uriSegments[uriSegments.length - 1];
  
  return fileName || `image_${Date.now()}.jpg`;
};

/**
 * 从URI获取图片类型
 */
export const getImageMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}; 