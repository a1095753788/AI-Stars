/**
 * MMKV存储服务
 * 提供高性能的本地存储功能
 */
import { MMKV } from 'react-native-mmkv';

// 创建MMKV实例，用于不同的存储需求
export const storage = new MMKV({ id: 'app-storage' });
export const apiCache = new MMKV({ id: 'api-cache' });
export const templatesStorage = new MMKV({ id: 'templates-storage' });

/**
 * 通用存储接口
 */
export const mmkvStorage = {
  /**
   * 存储字符串值
   * @param key 键名
   * @param value 值
   */
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },

  /**
   * 获取字符串值
   * @param key 键名
   * @returns 存储的值或null
   */
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value || null;
  },

  /**
   * 移除指定键的值
   * @param key 键名
   */
  removeItem: (key: string): void => {
    storage.delete(key);
  },

  /**
   * 清除所有数据
   */
  clear: (): void => {
    storage.clearAll();
  },

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  /**
   * 存储对象值
   * @param key 键名
   * @param value 对象值
   */
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * 获取对象值
   * @param key 键名
   * @returns 对象值或null
   */
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error('解析存储值失败:', e);
      }
    }
    return null;
  }
};

/**
 * API缓存接口
 * 用于缓存API响应
 */
export const apiCacheStorage = {
  /**
   * 存储缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param expiresIn 过期时间（毫秒）
   */
  set: <T>(key: string, data: T, expiresIn: number = 24 * 60 * 60 * 1000): void => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    apiCache.set(key, JSON.stringify(cacheItem));
  },

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get: <T>(key: string): T | null => {
    const value = apiCache.getString(key);
    if (!value) return null;

    try {
      const cacheItem = JSON.parse(value);
      const { data, timestamp, expiresIn } = cacheItem;
      
      // 检查是否过期
      const now = Date.now();
      if (now - timestamp > expiresIn) {
        // 过期了，删除缓存
        apiCache.delete(key);
        return null;
      }
      
      return data as T;
    } catch (e) {
      console.error('解析缓存数据失败:', e);
      return null;
    }
  },

  /**
   * 清除所有缓存
   */
  clearAll: (): void => {
    apiCache.clearAll();
  },

  /**
   * 清除过期缓存
   */
  clearExpired: (): void => {
    const keys = apiCache.getAllKeys();
    
    for (const key of keys) {
      const value = apiCache.getString(key);
      if (!value) continue;
      
      try {
        const { timestamp, expiresIn } = JSON.parse(value);
        const now = Date.now();
        
        if (now - timestamp > expiresIn) {
          apiCache.delete(key);
        }
      } catch (e) {
        // 解析错误，删除无效缓存
        apiCache.delete(key);
      }
    }
  }
};

/**
 * 模板存储接口
 */
export const templateStorage = {
  /**
   * 保存模板
   * @param key 键名
   * @param data 模板数据
   */
  set: <T>(key: string, data: T): void => {
    templatesStorage.set(key, JSON.stringify(data));
  },

  /**
   * 获取模板
   * @param key 键名
   * @returns 模板数据或null
   */
  get: <T>(key: string): T | null => {
    const value = templatesStorage.getString(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('解析模板数据失败:', e);
      return null;
    }
  },

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  getAllKeys: (): string[] => {
    return templatesStorage.getAllKeys();
  },

  /**
   * 清除所有模板
   */
  clearAll: (): void => {
    templatesStorage.clearAll();
  }
};

/**
 * 清除所有存储数据
 */
export const clearAllStorage = (): void => {
  storage.clearAll();
  apiCache.clearAll();
  templatesStorage.clearAll();
};

export default {
  mmkvStorage,
  apiCacheStorage,
  templateStorage,
  clearAllStorage
}; 