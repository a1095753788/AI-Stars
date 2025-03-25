/**
 * 通用工具函数库
 */

/**
 * 生成UUID
 * @returns UUID字符串
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 格式化时间戳为友好的时间字符串
 * @param timestamp 时间戳
 * @param language 语言设置
 * @returns 友好的时间字符串
 */
export const formatTime = (timestamp: number | Date, language: string = 'zh'): string => {
  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // 计算时间差（毫秒）
  const diff = now.getTime() - date.getTime();
  
  // 转换为秒
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return language === 'zh' ? '刚刚' : 'just now';
  }
  
  // 转换为分钟
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return language === 'zh' 
      ? `${minutes}分钟前` 
      : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // 转换为小时
  const hours = Math.floor(minutes / 60);
  
  if (hours < 24) {
    return language === 'zh' 
      ? `${hours}小时前` 
      : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // 转换为天
  const days = Math.floor(hours / 24);
  
  if (days < 7) {
    return language === 'zh' 
      ? `${days}天前` 
      : `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // 超过7天，显示具体日期
  return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 格式化字节大小为易读的字符串
 * @param bytes 字节数
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 延迟执行
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 尝试解析JSON字符串
 * @param jsonString JSON字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析结果或默认值
 */
export const tryParseJSON = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * 格式化日期
 * @param timestamp 时间戳
 * @param locale 语言环境
 * @returns 格式化的日期字符串
 */
export const formatDate = (timestamp: number, locale: 'zh' | 'en' = 'zh'): string => {
  const date = new Date(timestamp);
  
  if (locale === 'zh') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${formatTime(date)}`;
  } else {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return `${date.toLocaleDateString('en-US', options)} ${formatTime(date)}`;
  }
};

/**
 * 格式化日期为相对时间
 * @param timestamp 时间戳
 * @param locale 语言环境
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (timestamp: number, locale: 'zh' | 'en' = 'zh'): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  // 不同时间单位的秒数
  const SECOND = 1;
  const MINUTE = 60;
  const HOUR = 60 * 60;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  
  // 根据时间差返回相应的相对时间
  if (diffInSeconds < MINUTE) {
    return locale === 'zh' ? '刚刚' : 'just now';
  } else if (diffInSeconds < HOUR) {
    const minutes = Math.floor(diffInSeconds / MINUTE);
    return locale === 'zh' ? `${minutes}分钟前` : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < DAY) {
    const hours = Math.floor(diffInSeconds / HOUR);
    return locale === 'zh' ? `${hours}小时前` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < WEEK) {
    const days = Math.floor(diffInSeconds / DAY);
    return locale === 'zh' ? `${days}天前` : `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < MONTH) {
    const weeks = Math.floor(diffInSeconds / WEEK);
    return locale === 'zh' ? `${weeks}周前` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < YEAR) {
    const months = Math.floor(diffInSeconds / MONTH);
    return locale === 'zh' ? `${months}个月前` : `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / YEAR);
    return locale === 'zh' ? `${years}年前` : `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖处理后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流处理后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (obj instanceof Object) {
    const copy = {} as any;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  
  return obj;
}; 