// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 消息接口
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isLoading?: boolean;
}

// 聊天接口
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// API配置接口
export interface ApiConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 提示词模板接口
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
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