/**
 * 模块类型声明文件
 * 为缺少TypeScript声明的第三方库提供声明
 */

// expo-image-manipulator类型声明
declare module 'expo-image-manipulator' {
  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
  }

  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
    WEBP = 'webp'
  }

  export interface ImageManipulatorOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export interface ResizeActionOptions {
    width?: number;
    height?: number;
  }

  export interface FlipActionOptions {
    horizontal?: boolean;
    vertical?: boolean;
  }

  export interface CropActionOptions {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }

  export interface RotateActionOptions {
    degrees: number;
  }

  export type Action = 
    | { resize: ResizeActionOptions }
    | { flip: FlipActionOptions }
    | { crop: CropActionOptions }
    | { rotate: RotateActionOptions };

  export function manipulateAsync(
    uri: string,
    actions: Action[],
    options?: ImageManipulatorOptions
  ): Promise<ImageResult>;
}

// react-native-file-access类型声明
declare module 'react-native-file-access' {
  export interface FileSystem {
    // 文件系统路径
    Dirs: {
      CacheDir: string;
      DocumentDir: string;
      MainBundleDir: string;
      DCIMDir?: string;
      DownloadDir?: string;
      SDCardDir?: string;
      MusicDir?: string;
      PicturesDir?: string;
      MoviesDir?: string;
    };

    // 文件操作
    readFile(path: string, encoding?: string): Promise<string>;
    writeFile(path: string, data: string, encoding?: string): Promise<void>;
    appendFile(path: string, data: string, encoding?: string): Promise<void>;
    mkdir(path: string, options?: { intermediates?: boolean }): Promise<void>;
    readdir(path: string): Promise<string[]>;
    stat(path: string): Promise<{
      path: string;
      size: number;
      isFile: () => boolean;
      isDirectory: () => boolean;
      lastModified: number;
    }>;
    unlink(path: string): Promise<void>;
    copyFile(source: string, destination: string): Promise<void>;
    moveFile(source: string, destination: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    hash(path: string, algorithm?: string): Promise<string>;
  }

  export const FileSystem: FileSystem;
} 