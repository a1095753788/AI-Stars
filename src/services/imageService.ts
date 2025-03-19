/**
 * 图片信息接口
 */
interface ImageInfo {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
  cancelled?: boolean;
}

/**
 * 上传图片
 * 这是一个模拟实现，实际应用中需要使用对应平台的图片选择库
 * 例如 react-native-image-picker
 * @returns 图片信息
 */
export const uploadImage = async (): Promise<ImageInfo> => {
  // 模拟图片选择延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟用户选择图片
      // 在实际应用中，这里会调用图片选择器
      const mockImages = [
        {
          uri: 'https://picsum.photos/600/400',
          width: 600,
          height: 400,
          fileSize: 50 * 1024, // 50KB
          type: 'image/jpeg',
          fileName: 'photo1.jpg'
        },
        {
          uri: 'https://picsum.photos/800/600',
          width: 800,
          height: 600,
          fileSize: 80 * 1024, // 80KB
          type: 'image/jpeg',
          fileName: 'photo2.jpg'
        },
        {
          uri: 'https://picsum.photos/500/500',
          width: 500,
          height: 500,
          fileSize: 60 * 1024, // 60KB
          type: 'image/png',
          fileName: 'image.png'
        }
      ];
      
      // 随机选择一个图片
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      resolve(mockImages[randomIndex]);
    }, 1000); // 模拟选择图片的延迟
  });
};

/**
 * 计算图片在UI中的显示尺寸
 * @param imageWidth 原始宽度
 * @param imageHeight 原始高度
 * @param maxWidth 最大显示宽度
 * @param maxHeight 最大显示高度
 * @returns 计算后的尺寸 {width, height}
 */
export const calculateImageSize = (
  imageWidth: number = 600,
  imageHeight: number = 400,
  maxWidth: number = 250,
  maxHeight: number = 200
): { width: number; height: number } => {
  // 防止除以零错误
  if (imageWidth === 0 || imageHeight === 0) {
    return { width: maxWidth, height: maxHeight };
  }
  
  // 计算图片宽高比
  const aspectRatio = imageWidth / imageHeight;
  
  // 计算目标尺寸
  let targetWidth = maxWidth;
  let targetHeight = targetWidth / aspectRatio;
  
  // 如果计算后的高度超过最大高度，则以最大高度为基准重新计算
  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * aspectRatio;
  }
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  };
};

/**
 * 将图片转换为Base64
 * 实际应用中需要使用平台特定的方法实现
 * @param uri 图片URI
 * @returns Promise<string> Base64编码的图片
 */
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  // 这是一个模拟实现
  // 实际应用中需要使用适当的库，例如 react-native-fs
  
  // 模拟随机成功或失败
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90%的概率成功
      if (Math.random() < 0.9) {
        // 返回一个假的base64字符串
        resolve('data:image/jpeg;base64,/9j/4AAQSkZJRgABA...(模拟的base64编码)');
      } else {
        reject(new Error('无法转换图片为Base64'));
      }
    }, 500);
  });
};

/**
 * 压缩图片
 * 实际应用中需要使用平台特定的方法实现
 * @param imageInfo 图片信息
 * @returns Promise<ImageInfo> 压缩后的图片信息
 */
export const compressImage = async (imageInfo: ImageInfo): Promise<ImageInfo> => {
  // 这是一个模拟实现
  // 实际应用中需要使用适当的库，例如 react-native-image-resizer
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 假设压缩后文件大小减少50%
      const compressedInfo = {
        ...imageInfo,
        fileSize: imageInfo.fileSize ? Math.round(imageInfo.fileSize * 0.5) : undefined,
        uri: imageInfo.uri // 在实际应用中，这里会是一个新的URI
      };
      
      resolve(compressedInfo);
    }, 800);
  });
}; 