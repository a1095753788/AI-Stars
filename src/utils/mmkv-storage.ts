/**
 * MMKV存储引擎 - Redux Persist适配器
 * 自定义实现，替代redux-persist-mmkv-storage
 */
import { MMKV } from 'react-native-mmkv';
import { Storage } from 'redux-persist';

interface MMKVStorageOptions {
  storage: MMKV;
}

/**
 * 创建MMKV Storage引擎
 * 为redux-persist提供MMKV存储适配器
 */
export function createMMKVStorage(options: MMKVStorageOptions): Storage {
  const { storage } = options;

  return {
    /**
     * 获取存储项
     * @param key 键名
     * @param callback 回调函数
     */
    getItem: (key: string, callback?: (error?: Error, result?: string) => void): Promise<string | null> => {
      try {
        const item = storage.getString(key);
        if (callback) {
          callback(undefined, item || undefined);
        }
        return Promise.resolve(item || null);
      } catch (error) {
        if (callback) {
          callback(error as Error);
        }
        return Promise.reject(error);
      }
    },

    /**
     * 设置存储项
     * @param key 键名
     * @param value 值
     * @param callback 回调函数
     */
    setItem: (key: string, value: string, callback?: (error?: Error) => void): Promise<void> => {
      try {
        storage.set(key, value);
        if (callback) {
          callback();
        }
        return Promise.resolve();
      } catch (error) {
        if (callback) {
          callback(error as Error);
        }
        return Promise.reject(error);
      }
    },

    /**
     * 移除存储项
     * @param key 键名
     * @param callback 回调函数
     */
    removeItem: (key: string, callback?: (error?: Error) => void): Promise<void> => {
      try {
        storage.delete(key);
        if (callback) {
          callback();
        }
        return Promise.resolve();
      } catch (error) {
        if (callback) {
          callback(error as Error);
        }
        return Promise.reject(error);
      }
    }
  };
}

export default createMMKVStorage; 