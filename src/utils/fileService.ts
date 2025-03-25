/**
 * 文件处理服务
 * 提供文件选择、文件类型识别和文件显示功能
 */

import { Platform, PermissionsAndroid } from 'react-native';
import DocumentPicker, { 
  DocumentPickerResponse,
  types 
} from 'react-native-document-picker';
import RNFS from 'react-native-fs';

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
 * 请求存储权限（仅Android需要）
 */
const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: '存储权限',
        message: '应用需要访问您的文件以进行上传。',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      }
    );
    
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('请求存储权限时出错:', err);
    return false;
  }
};

/**
 * 选择文件
 * @returns 返回文件信息或null（如果用户取消）
 */
export const selectFile = async (): Promise<DocumentPickerResponse[] | null> => {
  // 检查权限
  if (Platform.OS === 'android') {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      throw new Error('没有存储权限');
    }
  }
  
  try {
    const results = await DocumentPicker.pick({
      type: [
        types.doc,
        types.docx,
        types.pdf,
        types.plainText,
        types.xls,
        types.xlsx,
        types.ppt,
        types.pptx,
        types.zip,
        types.images,
        types.video,
        types.audio,
      ],
      allowMultiSelection: false,
    });
    
    return results;
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return null;
    }
    throw err;
  }
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * 获取文件MIME类型
 */
export const getFileMimeType = (fileName: string): string => {
  const extension = getFileExtension(fileName);
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'ppt':
    case 'pptx':
      return 'application/vnd.ms-powerpoint';
    case 'txt':
      return 'text/plain';
    case 'zip':
      return 'application/zip';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'mp3':
      return 'audio/mpeg';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * 读取文件内容
 */
export const readFileContent = async (filePath: string): Promise<string> => {
  try {
    return await RNFS.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('读取文件内容时出错:', error);
    throw new Error('无法读取文件内容');
  }
};

/**
 * 检查文件是否存在
 */
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('检查文件是否存在时出错:', error);
    return false;
  }
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
 * 将文件转换为Base64格式
 * @param uri 文件URI
 * @returns Base64字符串，如果转换失败则返回null
 */
export const fileToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // 处理file:// URI前缀
    const filePath = uri.startsWith('file://') ? uri.slice(7) : uri;
    
    // 检查文件是否存在
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      console.error('文件不存在:', filePath);
      return null;
    }
    
    // 读取文件内容并转换为base64
    const base64Data = await RNFS.readFile(filePath, 'base64');
    if (!base64Data) {
      console.error('读取文件失败');
      return null;
    }
    
    // 获取文件MIME类型
    const fileName = filePath.split('/').pop() || '';
    const mimeType = getFileMimeType(fileName);
    
    // 返回带有MIME类型的完整base64字符串
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('转换文件到Base64失败:', error);
    return null;
  }
}; 