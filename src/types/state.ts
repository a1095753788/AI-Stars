import { ApiProvider } from '../services/api';

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 消息接口
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  chatId: string;
  imageUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  isLoading?: boolean;
  isError?: boolean;
}

// 聊天接口
export interface Chat {
  id: string;
  title: string;
  timestamp: number;     // 保留timestamp字段以兼容旧数据
  createdAt?: number;    // 创建时间
  updatedAt?: number;    // 更新时间
  messages: Message[];
  modelId: string;
}

// API配置接口
export interface ApiConfig {
  id: string;
  name: string;
  provider: ApiProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  supportsStreaming?: boolean;      // 是否支持流式输出
  supportsVision?: boolean;         // 是否支持图像分析
  supportsMultimodal?: boolean;     // 是否支持多模态
  supportsHighResolutionImages?: boolean; // 是否支持高分辨率图像
  apiVersion?: string;              // API版本号
  organizationId?: string;          // 组织ID(用于OpenAI)
  region?: string;                  // 区域(用于云服务商)
  headers?: Record<string, string>; // 额外请求头
  maxTokens?: number;               // 最大生成令牌数
  temperature?: number;             // 温度参数
  topP?: number;                    // Top-P抽样参数
}

// 提示词模板接口
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  systemPrompt?: string;
  createdAt: number;
  updatedAt: number;
}

// 用户设置接口
export interface UserSettings {
  themeMode: 'light' | 'dark' | 'system';
  useSystemTheme: boolean;
  allowMultipleFiles: boolean;
  enableVoice: boolean;
  promptTemplates?: PromptTemplate[];
}

// 聊天状态
export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
}

// API配置状态
export interface ApiConfigState {
  configs: ApiConfig[];
  activeConfigId: string | null;
  loading: boolean;
  error: string | null;
}

// 设置状态
export interface SettingsState {
  themeMode: 'light' | 'dark' | 'system';
  useSystemTheme: boolean;
  allowMultipleFiles: boolean;
  enableVoice: boolean;
  promptTemplates: PromptTemplate[];
}

// 合并状态
export interface RootState {
  chat: ChatState;
  api: ApiConfigState;
  settings: SettingsState;
}

// 聊天操作类型
export enum ChatActionType {
  FETCH_CHATS = 'chat/fetchChats',
  FETCH_CHATS_SUCCESS = 'chat/fetchChatsSuccess',
  FETCH_CHATS_FAILURE = 'chat/fetchChatsFailure',
  SET_CURRENT_CHAT = 'chat/setCurrentChat',
  CREATE_CHAT = 'chat/createChat',
  ADD_MESSAGE = 'chat/addMessage',
  DELETE_CHAT = 'chat/deleteChat',
  RESET_ERROR = 'chat/resetError'
}

// API配置操作类型
export enum ApiConfigActionType {
  FETCH_CONFIGS = 'api/fetchConfigs',
  FETCH_CONFIGS_SUCCESS = 'api/fetchConfigsSuccess',
  FETCH_CONFIGS_FAILURE = 'api/fetchConfigsFailure',
  ADD_CONFIG = 'api/addConfig',
  UPDATE_CONFIG = 'api/updateConfig',
  DELETE_CONFIG = 'api/deleteConfig',
  SET_ACTIVE_CONFIG = 'api/setActiveConfig',
  RESET_ERROR = 'api/resetError'
}

// 设置操作类型
export enum SettingsActionType {
  SET_THEME_MODE = 'settings/setThemeMode',
  SET_USE_SYSTEM_THEME = 'settings/setUseSystemTheme',
  SET_ALLOW_MULTIPLE_FILES = 'settings/setAllowMultipleFiles',
  SET_ENABLE_VOICE = 'settings/setEnableVoice',
  ADD_PROMPT_TEMPLATE = 'settings/addPromptTemplate',
  UPDATE_PROMPT_TEMPLATE = 'settings/updatePromptTemplate',
  DELETE_PROMPT_TEMPLATE = 'settings/deletePromptTemplate'
}

// 设置类型定义
export interface Settings {
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'system';
  historyCount: number;
  autoDeleteHistory: boolean;
  enableVoice: boolean;
  onlyWifi: boolean;
}

// 模型选项类型定义
export interface ModelOptions {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

// 应用状态类型定义
export interface AppState {
  chats: Chat[];
  activeChatId: string | null;
  settings: Settings;
  apiConfigs: ApiConfig[];
  activeApiConfigId: string | null;
  promptTemplates: PromptTemplate[];
  isLoading: boolean;
  error: string | null;
}

// 初始化设置
export const defaultSettings: Settings = {
  language: 'zh',
  theme: 'system',
  historyCount: 10,
  autoDeleteHistory: false,
  enableVoice: false,
  onlyWifi: true,
};

// 初始化模型选项
export const defaultModelOptions: ModelOptions = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// 初始化API配置
export const defaultApiConfig: ApiConfig = {
  id: 'default',
  name: 'OpenAI',
  provider: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  supportsStreaming: true,
  supportsVision: true
}; 