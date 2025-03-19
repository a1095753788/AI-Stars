/**
 * 存储服务
 * 处理应用程序数据的持久化存储
 */

import { Chat, ApiConfig, UserSettings, PromptTemplate } from '../types/state';

/**
 * 用户设置接口
 */
export interface UserSettings {
  themeMode?: 'light' | 'dark' | 'system';
  useSystemTheme?: boolean;
  allowMultipleFiles?: boolean;
  enableVoice?: boolean;
  promptTemplates?: PromptTemplate[];
}

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// 模拟存储
let chatHistoryStore: Chat[] = [];
let apiConfigsStore: ApiConfig[] = [];
let settingsStore: UserSettings = {
  themeMode: 'system',
  useSystemTheme: true,
  allowMultipleFiles: false,
  enableVoice: true,
  promptTemplates: []
};

/**
 * 获取聊天历史
 * @returns 聊天历史
 */
export const getChatHistory = async (): Promise<Chat[]> => {
  // 在实际应用中，这里会从存储中读取
  return [...chatHistoryStore];
};

/**
 * 保存聊天历史
 * @param chats 聊天历史
 */
export const saveChatHistory = async (chats: Chat[]): Promise<void> => {
  // 在实际应用中，这里会写入存储
  chatHistoryStore = [...chats];
};

/**
 * 获取单个聊天记录
 * @param chatId 聊天ID
 * @returns 聊天记录
 */
export const getChatRecord = async (chatId: string): Promise<Chat | null> => {
  const chat = chatHistoryStore.find(c => c.id === chatId);
  return chat ? { ...chat } : null;
};

/**
 * 保存聊天记录
 * @param chat 聊天记录
 */
export const saveChatRecord = async (chat: Chat): Promise<void> => {
  const index = chatHistoryStore.findIndex(c => c.id === chat.id);
  
  if (index >= 0) {
    // 更新现有记录
    chatHistoryStore[index] = { ...chat };
  } else {
    // 添加新记录
    chatHistoryStore.push({ ...chat });
  }
};

/**
 * 删除聊天记录
 * @param chatId 聊天ID
 */
export const deleteChatRecord = async (chatId: string): Promise<void> => {
  chatHistoryStore = chatHistoryStore.filter(c => c.id !== chatId);
};

/**
 * 获取API配置列表
 * @returns API配置列表
 */
export const getApiConfigs = async (): Promise<ApiConfig[]> => {
  // 在实际应用中，这里会从存储中读取
  return [...apiConfigsStore];
};

/**
 * 保存API配置列表
 * @param configs API配置列表
 */
export const saveApiConfigs = async (configs: ApiConfig[]): Promise<void> => {
  // 在实际应用中，这里会写入存储
  apiConfigsStore = [...configs];
};

/**
 * 获取活跃的API配置
 * @returns 活跃的API配置
 */
export const getActiveApiConfig = async (): Promise<ApiConfig | null> => {
  const activeConfig = apiConfigsStore.find(config => config.isActive);
  return activeConfig ? { ...activeConfig } : null;
};

/**
 * 添加API配置
 * @param config API配置
 */
export const addApiConfig = async (config: ApiConfig): Promise<void> => {
  // 如果新配置是活跃的，将其他配置设为非活跃
  if (config.isActive) {
    apiConfigsStore = apiConfigsStore.map(c => ({
      ...c,
      isActive: false
    }));
  }
  
  apiConfigsStore.push({ ...config });
};

/**
 * 更新API配置
 * @param config API配置
 */
export const updateApiConfig = async (config: ApiConfig): Promise<void> => {
  const index = apiConfigsStore.findIndex(c => c.id === config.id);
  
  if (index >= 0) {
    // 如果更新的配置是活跃的，将其他配置设为非活跃
    if (config.isActive) {
      apiConfigsStore = apiConfigsStore.map(c => ({
        ...c,
        isActive: c.id === config.id
      }));
    } else {
      apiConfigsStore[index] = { ...config };
    }
  }
};

/**
 * 删除API配置
 * @param configId API配置ID
 */
export const deleteApiConfig = async (configId: string): Promise<void> => {
  const config = apiConfigsStore.find(c => c.id === configId);
  
  // 如果删除的是活跃配置，则将第一个配置设为活跃（如果有）
  if (config?.isActive && apiConfigsStore.length > 1) {
    const remainingConfigs = apiConfigsStore.filter(c => c.id !== configId);
    if (remainingConfigs.length > 0) {
      remainingConfigs[0].isActive = true;
    }
  }
  
  apiConfigsStore = apiConfigsStore.filter(c => c.id !== configId);
};

/**
 * 设置活跃的API配置
 * @param configId API配置ID
 */
export const setActiveApiConfig = async (configId: string): Promise<void> => {
  apiConfigsStore = apiConfigsStore.map(config => ({
    ...config,
    isActive: config.id === configId
  }));
};

/**
 * 获取用户设置
 * @returns 用户设置
 */
export const getSettings = async (): Promise<UserSettings> => {
  // 在实际应用中，这里会从存储中读取
  return { ...settingsStore };
};

/**
 * 保存用户设置
 * @param settings 用户设置
 */
export const saveSettings = async (settings: UserSettings): Promise<void> => {
  // 在实际应用中，这里会写入存储
  settingsStore = { ...settings };
};

/**
 * 获取提示词模板列表
 * @returns 提示词模板列表
 */
export const getPromptTemplates = async (): Promise<PromptTemplate[]> => {
  // 在实际应用中，这里会从存储中读取
  return settingsStore.promptTemplates || [];
};

/**
 * 保存提示词模板
 * @param template 提示词模板
 */
export const savePromptTemplate = async (template: PromptTemplate): Promise<void> => {
  const templates = settingsStore.promptTemplates || [];
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    // 更新现有模板
    templates[index] = { ...template };
  } else {
    // 添加新模板
    templates.push({ ...template });
  }
  
  settingsStore.promptTemplates = templates;
};

/**
 * 删除提示词模板
 * @param templateId 提示词模板ID
 */
export const deletePromptTemplate = async (templateId: string): Promise<void> => {
  if (settingsStore.promptTemplates) {
    settingsStore.promptTemplates = settingsStore.promptTemplates.filter(
      t => t.id !== templateId
    );
  }
}; 