/**
 * 缓存服务
 * 提供API响应缓存功能
 */
import { MMKV } from 'react-native-mmkv';

// 创建API缓存存储实例
export const apiCacheStorage = new MMKV({
  id: 'api-cache-storage',
});

// 缓存键前缀
const API_CACHE_PREFIX = 'api_cache_';

/**
 * 生成缓存键
 * @param messages 消息数组
 * @param provider API提供商
 * @param model 模型
 * @param endpoint 端点
 * @returns 缓存键
 */
export const getCacheKey = (
  messages: Array<{ role: string; content: string }>,
  provider?: string,
  model?: string,
  endpoint?: string
): string => {
  // 仅使用消息内容和一些关键参数生成缓存键
  const messagesStr = JSON.stringify(messages.map(m => ({
    role: m.role,
    content: m.content
  })));
  
  return `api-cache:${provider || 'unknown'}:${model || 'unknown'}:${endpoint || ''}:${messagesStr}`;
};

/**
 * 从缓存获取数据
 * @param cacheKey 缓存键
 * @returns 缓存的数据或null
 */
export const getFromCache = async (cacheKey: string): Promise<any | null> => {
  try {
    const key = `${API_CACHE_PREFIX}${cacheKey}`;
    const cacheData = apiCacheStorage.getString(key);
    
    if (!cacheData) return null;
    
    try {
      const { data, timestamp, expiry } = JSON.parse(cacheData);
      const now = Date.now();
      
      // 检查缓存是否过期
      if (timestamp + expiry < now) {
        // 清除过期缓存
        apiCacheStorage.delete(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to parse cached data:', error);
      return null;
    }
  } catch (error) {
    console.error('从缓存获取数据失败:', error);
    return null;
  }
};

/**
 * 将数据存入缓存
 * @param cacheKey 缓存键
 * @param data 缓存数据
 * @param expiresIn 过期时间（毫秒）
 */
export const saveToCache = async (cacheKey: string, data: any, expiresIn: number = 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const key = `${API_CACHE_PREFIX}${cacheKey}`;
    const cacheData = JSON.stringify({
      data,
      timestamp: Date.now(),
      expiry: expiresIn
    });
    
    apiCacheStorage.set(key, cacheData);
  } catch (error) {
    console.error('保存数据到缓存失败:', error);
  }
};

/**
 * 清除过期缓存
 */
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const keys = apiCacheStorage.getAllKeys();
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(API_CACHE_PREFIX)) {
        const cacheData = apiCacheStorage.getString(key);
        if (cacheData) {
          try {
            const { timestamp, expiry } = JSON.parse(cacheData);
            if (timestamp + expiry < now) {
              apiCacheStorage.delete(key);
            }
          } catch (error) {
            // 如果解析失败，删除该缓存
            apiCacheStorage.delete(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('清理过期缓存失败:', error);
  }
};

/**
 * 清除API响应缓存
 */
export const clearApiCache = (): void => {
  const keys = apiCacheStorage.getAllKeys();
  keys.forEach(key => {
    if (key.startsWith(API_CACHE_PREFIX)) {
      apiCacheStorage.delete(key);
    }
  });
};

/**
 * 获取缓存大小(字节)
 * @returns 缓存大小
 */
export const getApiCacheSize = (): number => {
  let size = 0;
  const keys = apiCacheStorage.getAllKeys();
  
  keys.forEach(key => {
    if (key.startsWith(API_CACHE_PREFIX)) {
      const value = apiCacheStorage.getString(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  });
  
  return size;
}; 