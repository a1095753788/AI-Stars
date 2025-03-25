import { MMKV } from 'react-native-mmkv';

// 创建MMKV实例
export const storage = new MMKV({
  id: 'app-storage',
});

// 创建一个兼容AsyncStorage API的包装器，以便轻松替换
export const mmkvStorage = {
  // 设置数据
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // 获取数据
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },

  // 移除数据
  removeItem: (key: string): void => {
    storage.delete(key);
  },

  // 获取所有键
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  // 清除所有数据
  clear: (): void => {
    storage.clearAll();
  }
};

// 订阅值变化的方法
export const subscribeToStorage = (key: string, callback: (value: any) => void) => {
  return storage.addOnValueChangedListener((changedKey) => {
    if (changedKey === key) {
      const newValue = storage.getString(key);
      callback(newValue !== undefined ? newValue : null);
    }
  });
}; 