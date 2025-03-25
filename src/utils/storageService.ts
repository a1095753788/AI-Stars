/**
 * 存储服务
 * 处理应用程序数据的持久化存储
 */

import { mmkvStorage } from './storage';
import { Chat, Message, Settings, ApiConfig, PromptTemplate, defaultSettings } from '../types/state';

// 存储键
const STORAGE_KEYS = {
  CHAT_HISTORY: 'chat_history',
  SETTINGS: 'settings',
  API_CONFIGS: 'api_configs',
  ACTIVE_API_CONFIG: 'active_api_config',
  PROMPT_TEMPLATES: 'prompt_templates',
  LANGUAGE: 'language',
};

/**
 * 通用错误处理函数
 */
const handleStorageError = (operation: string, error: any): never => {
  console.error(`存储操作失败 (${operation}):`, error);
  throw new Error(`存储操作失败: ${operation} - ${error.message || '未知错误'}`);
};

/**
 * 保存聊天历史
 */
export const saveChatHistory = async (chats: Chat[]): Promise<void> => {
  try {
    mmkvStorage.setObject(STORAGE_KEYS.CHAT_HISTORY, chats);
    return;
  } catch (error) {
    handleStorageError('保存聊天历史', error);
  }
};

/**
 * 获取聊天历史
 */
export const getChatHistory = async (): Promise<Chat[]> => {
  try {
    const data = mmkvStorage.getObject<Chat[]>(STORAGE_KEYS.CHAT_HISTORY);
    return data || [];
  } catch (error) {
    handleStorageError('获取聊天历史', error);
    return [];
  }
};

/**
 * 保存单个聊天
 */
export const saveChat = async (chat: Chat): Promise<void> => {
  try {
    const chats = await getChatHistory();
    const index = chats.findIndex(c => c.id === chat.id);
    
    if (index >= 0) {
      chats[index] = chat;
    } else {
      chats.push(chat);
    }
    
    await saveChatHistory(chats);
    return;
  } catch (error) {
    handleStorageError('保存聊天', error);
  }
};

/**
 * 获取单个聊天记录
 */
export const getChatRecord = async (chatId: string): Promise<Chat | null> => {
  try {
    const chats = await getChatHistory();
    const chat = chats.find(c => c.id === chatId);
    return chat || null;
  } catch (error) {
    handleStorageError('获取聊天记录', error);
    return null;
  }
};

/**
 * 获取单个聊天
 * 为保持一致性而添加的别名函数
 */
export const getChat = async (chatId: string): Promise<Chat | null> => {
  return getChatRecord(chatId);
};

/**
 * 删除聊天
 */
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    const chats = await getChatHistory();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    await saveChatHistory(filteredChats);
    return;
  } catch (error) {
    handleStorageError('删除聊天', error);
  }
};

/**
 * 保存设置
 */
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    mmkvStorage.setObject(STORAGE_KEYS.SETTINGS, settings);
    return;
  } catch (error) {
    handleStorageError('保存设置', error);
  }
};

/**
 * 获取设置
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    const data = mmkvStorage.getObject<Settings>(STORAGE_KEYS.SETTINGS);
    return data || defaultSettings;
  } catch (error) {
    handleStorageError('获取设置', error);
    return defaultSettings;
  }
};

/**
 * 保存API配置
 */
export const saveApiConfigs = async (configs: ApiConfig[]): Promise<void> => {
  try {
    mmkvStorage.setObject(STORAGE_KEYS.API_CONFIGS, configs);
    return;
  } catch (error) {
    handleStorageError('保存API配置', error);
  }
};

/**
 * 获取API配置
 */
export const getApiConfigs = async (): Promise<ApiConfig[]> => {
  try {
    const data = mmkvStorage.getObject<ApiConfig[]>(STORAGE_KEYS.API_CONFIGS);
    return data || [];
  } catch (error) {
    handleStorageError('获取API配置', error);
    return [];
  }
};

/**
 * 保存当前活跃的API配置ID
 */
export const saveActiveApiConfig = async (configId: string | null): Promise<void> => {
  try {
    if (configId) {
      mmkvStorage.setItem(STORAGE_KEYS.ACTIVE_API_CONFIG, configId);
    } else {
      mmkvStorage.removeItem(STORAGE_KEYS.ACTIVE_API_CONFIG);
    }
    return;
  } catch (error) {
    handleStorageError('保存活跃API配置', error);
  }
};

/**
 * 获取当前活跃的API配置ID
 */
export const getActiveApiConfig = async (): Promise<string | null> => {
  try {
    return mmkvStorage.getItem(STORAGE_KEYS.ACTIVE_API_CONFIG);
  } catch (error) {
    handleStorageError('获取活跃API配置', error);
    return null;
  }
};

/**
 * 保存提示词模板
 */
export const savePromptTemplates = async (templates: PromptTemplate[]): Promise<void> => {
  try {
    mmkvStorage.setObject(STORAGE_KEYS.PROMPT_TEMPLATES, templates);
    return;
  } catch (error) {
    handleStorageError('保存提示词模板', error);
  }
};

/**
 * 获取提示词模板
 */
export const getPromptTemplates = async (): Promise<PromptTemplate[]> => {
  try {
    const data = mmkvStorage.getObject<PromptTemplate[]>(STORAGE_KEYS.PROMPT_TEMPLATES);
    return data || [];
  } catch (error) {
    handleStorageError('获取提示词模板', error);
    return [];
  }
};

/**
 * 保存语言设置
 */
export const saveLanguage = async (language: 'zh' | 'en'): Promise<void> => {
  try {
    mmkvStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    return;
  } catch (error) {
    handleStorageError('保存语言设置', error);
  }
};

/**
 * 获取语言设置
 */
export const getLanguage = async (): Promise<'zh' | 'en'> => {
  try {
    const language = mmkvStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (language as 'zh' | 'en') || 'zh';
  } catch (error) {
    handleStorageError('获取语言设置', error);
    return 'zh';
  }
};

/**
 * 清除所有数据
 */
export const clearAllData = async (): Promise<void> => {
  try {
    mmkvStorage.clear();
    return;
  } catch (error) {
    handleStorageError('清除所有数据', error);
  }
};

/**
 * 保存单个API配置
 */
export const saveApiConfig = async (config: ApiConfig): Promise<void> => {
  try {
    const configs = await getApiConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    
    await saveApiConfigs(configs);
    return;
  } catch (error) {
    handleStorageError('保存API配置', error);
  }
};

/**
 * 保存单个提示词模板
 */
export const savePromptTemplate = async (template: PromptTemplate): Promise<void> => {
  try {
    // 确保模板名称和内容干净
    const cleanTemplate: PromptTemplate = {
      ...template,
      name: template.name.trim(),
      content: template.content.trimEnd() // 去除末尾空白字符，保留前导空格
    };
    
    const templates = await getPromptTemplates();
    const index = templates.findIndex(t => t.id === cleanTemplate.id);
    
    if (index >= 0) {
      templates[index] = cleanTemplate;
    } else {
      templates.push(cleanTemplate);
    }
    
    await savePromptTemplates(templates);
    return;
  } catch (error) {
    handleStorageError('保存提示词模板', error);
  }
};

/**
 * 删除提示词模板
 */
export const deletePromptTemplate = async (templateId: string): Promise<void> => {
  try {
    const templates = await getPromptTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    await savePromptTemplates(filteredTemplates);
    return;
  } catch (error) {
    handleStorageError('删除提示词模板', error);
  }
};

/**
 * 删除API配置
 */
export const deleteApiConfig = async (configId: string): Promise<void> => {
  try {
    const configs = await getApiConfigs();
    const filteredConfigs = configs.filter(config => config.id !== configId);
    await saveApiConfigs(filteredConfigs);
    return;
  } catch (error) {
    handleStorageError('删除API配置', error);
  }
}; 