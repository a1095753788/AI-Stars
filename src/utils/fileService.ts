/**
 * 文件处理服务
 * 提供文件选择、文件类型识别和文件显示功能
 */

// 文件信息接口
export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  type: string;
}

// 支持的文件类型
export enum FileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  TXT = 'txt',
  CSV = 'csv',
  ZIP = 'zip',
  RAR = 'rar',
  OTHER = 'other'
}

/**
 * 从设备选择文件
 * @returns 文件信息数组，如果用户取消则返回空数组
 */
export const selectFile = async (): Promise<FileInfo[]> => {
  // 实际应用中，这里应该调用文件选择API
  // 例如：使用react-native-document-picker

  // 模拟实现，返回一个假的文件信息
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟用户选择文件
      const mockFileInfo: FileInfo = {
        uri: 'file://mock-document.pdf',
        name: 'mock-document.pdf',
        size: 1024 * 1024 * 1.2, // 1.2MB
        type: 'application/pdf'
      };
      
      resolve([mockFileInfo]);
      
      // 如果要模拟用户取消，则返回：resolve([]);
    }, 500);
  });
};

/**
 * 根据文件扩展名获取文件类型
 * @param fileName 文件名
 * @returns 文件类型
 */
export const getFileTypeFromName = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return FileType.PDF;
    case 'doc':
      return FileType.DOC;
    case 'docx':
      return FileType.DOCX;
    case 'xls':
      return FileType.XLS;
    case 'xlsx':
      return FileType.XLSX;
    case 'ppt':
      return FileType.PPT;
    case 'pptx':
      return FileType.PPTX;
    case 'txt':
      return FileType.TXT;
    case 'csv':
      return FileType.CSV;
    case 'zip':
      return FileType.ZIP;
    case 'rar':
      return FileType.RAR;
    default:
      return FileType.OTHER;
  }
};

/**
 * 根据文件类型获取图标
 * @param fileType 文件类型
 * @returns 文件图标（emoji）
 */
export const getFileIconByType = (fileType: FileType): string => {
  switch (fileType) {
    case FileType.PDF:
      return '📄';
    case FileType.DOC:
    case FileType.DOCX:
      return '📝';
    case FileType.XLS:
    case FileType.XLSX:
      return '📊';
    case FileType.PPT:
    case FileType.PPTX:
      return '📑';
    case FileType.TXT:
      return '📃';
    case FileType.CSV:
      return '📋';
    case FileType.ZIP:
    case FileType.RAR:
      return '🗄️';
    default:
      return '📎';
  }
};

/**
 * 获取文件显示名称
 * 如果文件名过长，截断中间部分并用省略号代替
 * @param fileName 文件名
 * @param maxLength 最大长度
 * @returns 处理后的显示名称
 */
export const getFileDisplayName = (fileName: string, maxLength: number = 20): string => {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  
  const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
  const nameWithoutExt = fileName.substring(0, fileName.length - extension.length - 1);
  
  if (extension && nameWithoutExt.length > maxLength - extension.length - 3) {
    const half = Math.floor((maxLength - extension.length - 3) / 2);
    return `${nameWithoutExt.substring(0, half)}...${nameWithoutExt.substring(nameWithoutExt.length - half)}.${extension}`;
  }
  
  return `${nameWithoutExt.substring(0, maxLength - 3)}...`;
};

/**
 * 格式化文件大小为人类可读格式
 * @param bytes 文件大小（字节）
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 