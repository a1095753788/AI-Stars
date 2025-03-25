import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Platform, NativeModules } from 'react-native';
import { RootState } from '../store';
import translations, { Language } from './translations';
import { setLanguage } from '../store/slices/settingsSlice';

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 获取设备语言
export const getDeviceLanguage = (): Language => {
  let deviceLanguage: string = DEFAULT_LANGUAGE;
  
  try {
    // iOS 系统中获取语言
    if (Platform.OS === 'ios') {
      deviceLanguage = NativeModules.SettingsManager.settings.AppleLocale ||
                       NativeModules.SettingsManager.settings.AppleLanguages[0];
    } 
    // Android 系统中获取语言
    else if (Platform.OS === 'android') {
      deviceLanguage = NativeModules.I18nManager.localeIdentifier;
    }

    // 转换为应用支持的语言代码
    if (deviceLanguage.startsWith('en')) {
      return 'en';
    } else if (deviceLanguage.startsWith('zh')) {
      return 'zh';
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }
  
  return DEFAULT_LANGUAGE;
};

/**
 * 使用翻译文本的钩子
 * 提供一个简单的方式获取当前语言的翻译
 */
export const useTranslation = () => {
  const dispatch = useDispatch();
  
  // 从Redux状态获取当前语言设置
  const language = useSelector<RootState, Language>(
    (state) => {
      try {
        return state.settings.language || DEFAULT_LANGUAGE;
      } catch (e) {
        return DEFAULT_LANGUAGE;
      }
    }
  );

  // 在组件挂载时检查系统语言并同步设置
  useEffect(() => {
    const systemLanguage = getDeviceLanguage();
    // 如果系统语言和当前语言不同，更新语言设置
    if (systemLanguage !== language) {
      dispatch(setLanguage(systemLanguage));
    }
  }, []);

  // 获取对应语言的翻译对象
  const messages = translations[language];

  // 翻译函数
  const t = useCallback(
    (key: string): string => {
      try {
        // 简单的按点分割键名获取嵌套值
        const result = key.split('.').reduce(
          (obj, path) => (obj && obj[path]) || '', 
          messages as any
        );
        
        // 确保返回字符串而非对象
        if (typeof result === 'object') {
          console.warn(`Translation key "${key}" returned an object instead of a string`);
          return JSON.stringify(result);
        }
        
        return result;
      } catch (error) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    },
    [messages]
  );

  // 切换语言函数
  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      dispatch(setLanguage(newLanguage));
    },
    [dispatch]
  );

  return {
    t,
    language,
    messages,
    changeLanguage
  };
};

/**
 * 获取翻译文本（非钩子版本）
 * @param lang 语言代码
 * @param key 翻译键
 * @returns 翻译文本
 */
export const getTranslation = (lang: Language, key: string): string => {
  try {
    const messages = translations[lang];
    const result = key.split('.').reduce(
      (obj, path) => (obj && obj[path]) || '', 
      messages as any
    );
    
    // 确保返回字符串而非对象
    if (typeof result === 'object') {
      console.warn(`Translation key "${key}" returned an object instead of a string`);
      return JSON.stringify(result);
    }
    
    return result;
  } catch (error) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
};

// 使用export type正确导出类型
export type { Language };
export default translations; 