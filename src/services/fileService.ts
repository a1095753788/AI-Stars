/**
 * 文件信息接口
 */
interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
  cancelled?: boolean;
}

/**
 * 上传文件
 * 这是一个模拟实现，实际应用中需要使用对应平台的文件选择库
 * 例如 react-native-document-picker
 * @returns 文件信息
 */
export const uploadFile = async (): Promise<FileInfo> => {
  // 模拟文件选择延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟用户选择文件
      // 在实际应用中，这里会调用文件选择器
      const mockFiles = [
        {
          uri: 'file://mock-file-1.pdf',
          name: 'sample-document.pdf',
          type: 'application/pdf',
          size: 1024 * 1024 * 2.5, // 2.5MB
        },
        {
          uri: 'file://mock-file-2.docx',
          name: 'project-report.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1024 * 1024 * 1.2, // 1.2MB
        },
        {
          uri: 'file://mock-file-3.txt',
          name: 'notes.txt',
          type: 'text/plain',
          size: 1024 * 5, // 5KB
        },
        {
          uri: 'file://mock-file-4.json',
          name: 'config.json',
          type: 'application/json',
          size: 1024 * 2, // 2KB
        }
      ];
      
      // 随机选择一个文件
      const randomIndex = Math.floor(Math.random() * mockFiles.length);
      resolve(mockFiles[randomIndex]);
    }, 1000); // 模拟选择文件的延迟
  });
};

/**
 * 获取可读的文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const getReadableFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 根据文件类型获取图标
 * @param fileType 文件MIME类型
 * @returns 文件类型对应的图标
 */
export const getFileIcon = (fileType: string): string => {
  if (!fileType) return '📄';
  
  if (fileType.includes('image')) {
    return '🖼️';
  } else if (fileType.includes('audio')) {
    return '🎵';
  } else if (fileType.includes('video')) {
    return '🎬';
  } else if (fileType.includes('pdf')) {
    return '📕';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  } else if (fileType.includes('excel') || fileType.includes('sheet')) {
    return '📊';
  } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
    return '📊';
  } else if (fileType.includes('text')) {
    return '📄';
  } else if (fileType.includes('zip') || fileType.includes('compressed')) {
    return '🗜️';
  } else if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('html')) {
    return '📋';
  }
  
  return '📦';
};

/**
 * 获取文件显示名称
 * @param fileName 文件名
 * @param maxLength 最大长度
 * @returns 格式化后的文件名
 */
export const getFileDisplayName = (fileName: string, maxLength: number = 20): string => {
  if (!fileName) return '未知文件';
  
  if (fileName.length <= maxLength) {
    return fileName;
  }
  
  // 分割文件名和扩展名
  const lastDotIndex = fileName.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // 没有扩展名
    return fileName.substring(0, maxLength - 3) + '...';
  }
  
  const name = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex);
  
  // 保留扩展名，截断文件名
  const maxNameLength = maxLength - extension.length - 3;
  if (maxNameLength <= 0) {
    // 如果扩展名太长，只截断扩展名
    return name.substring(0, maxLength - 3) + '...';
  }
  
  return name.substring(0, maxNameLength) + '...' + extension;
}; 