/**
 * 应用多语言支持
 */

// 支持的语言类型
export type Language = 'en' | 'zh';

// 翻译字典类型
interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

// 中文翻译
const zhTranslations: TranslationDictionary = {
  common: {
    back: '返回',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    send: '发送',
    retry: '重试',
    search: '搜索',
    refresh: '刷新',
    checking: '检查中...',
    connected: '网络连接正常',
    disconnected: '网络连接断开',
    manage: '管理',
    clearAll: '清除全部',
  },
  appName: 'AI助手',
  settings: {
    title: '设置',
    appearance: '外观',
    darkMode: '深色模式',
    followSystem: '跟随系统',
    manualControl: '手动控制应用主题',
    automaticTheme: '自动根据系统主题切换',
    language: '语言',
    saveSettings: '保存设置',
    saving: '保存中...',
    loading: '加载设置中...',
    apiSettings: 'API设置',
    apiConfig: 'API配置',
    currentUsing: '当前使用',
    noApiConfig: '未设置API配置',
    manageApiConfig: '管理API配置',
    promptTemplates: '提示词模板',
    managePromptTemplates: '管理常用提示词模板'
  },
  about: {
    title: '关于AI助手',
    version: '版本',
    description: 'AI助手是一款支持多模态的AI对话工具，提供文本和图片处理功能，轻量简洁的界面设计让您的使用体验更加流畅。'
  },
  chat: {
    newChat: '新对话',
    placeholder: '输入消息...',
    send: '发送',
    typing: '正在输入...',
    retryMessage: '重试',
    errorMessage: '消息发送失败，请重试',
    emptyChats: '暂无对话，开始一个新对话吧！',
    createNewChat: '开始新对话'
  },
  welcome: {
    title: '寄意星，随风起',
    companyName: '沭阳县寄意星电子商务经营部欢迎您',
    companyNameEn: 'Welcome to Shuyang County Jiyi Star E-commerce Department'
  },
  history: {
    title: '历史记录',
    noHistory: '暂无历史记录',
    newChat: '新对话',
    messages: '条消息',
    noMessage: '无消息',
    confirmDelete: '确认删除',
    confirmDeleteMsg: '确定要删除该聊天记录吗？此操作不可撤销。',
    confirmClearAll: '确定要清除所有聊天记录吗？此操作不可撤销。',
    deleteError: '删除聊天记录失败',
    clearAll: '清除全部',
    clearError: '清除聊天记录失败'
  },
  promptSelector: {
    title: '选择提示词',
    manage: '管理',
    empty: '没有可用的提示词模板',
    addTemplate: '添加模板',
    loading: '加载中...',
    error: '加载提示词失败',
    retry: '重试'
  },
  emptyChats: '您还没有任何对话，开始一个新对话吧！',
  createNewChat: '开始新对话',
};

// 英文翻译
const enTranslations: TranslationDictionary = {
  common: {
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    send: 'Send',
    retry: 'Retry',
    search: 'Search',
    refresh: 'Refresh',
    checking: 'Checking...',
    connected: 'Network Connected',
    disconnected: 'Network Disconnected',
    manage: 'Manage',
    clearAll: 'Clear All',
  },
  appName: 'AI Assistant',
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    followSystem: 'Follow System',
    manualControl: 'Manually control theme',
    automaticTheme: 'Automatically switch based on system theme',
    language: 'Language',
    saveSettings: 'Save Settings',
    saving: 'Saving...',
    loading: 'Loading Settings...',
    apiSettings: 'API Settings',
    apiConfig: 'API Configuration',
    currentUsing: 'Currently Using',
    noApiConfig: 'No API Configuration Set',
    manageApiConfig: 'Manage API Configuration',
    promptTemplates: 'Prompt Templates',
    managePromptTemplates: 'Manage Prompt Templates'
  },
  about: {
    title: 'About AI Assistant',
    version: 'Version',
    description: 'AI Assistant is a multimodal AI chatting tool that provides text and image processing capabilities with a clean, lightweight interface for a smooth user experience.'
  },
  chat: {
    newChat: 'New Chat',
    placeholder: 'Type a message...',
    send: 'Send',
    typing: 'Typing...',
    retryMessage: 'Retry',
    errorMessage: 'Failed to send message, please try again',
    emptyChats: 'No conversations yet. Start a new chat!',
    createNewChat: 'Create New Chat'
  },
  welcome: {
    title: 'Whisper of Intent, Rising with Wind',
    companyName: 'Welcome to Shuyang County Jiyi Star E-commerce Department',
    companyNameEn: '沭阳县寄意星电子商务经营部欢迎您'
  },
  history: {
    title: 'History',
    noHistory: 'No history yet',
    newChat: 'New Chat',
    messages: 'messages',
    noMessage: 'No messages',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMsg: 'Are you sure you want to delete this chat? This action cannot be undone.',
    confirmClearAll: 'Are you sure you want to clear all chat history? This action cannot be undone.',
    deleteError: 'Failed to delete chat',
    clearAll: 'Clear All',
    clearError: 'Failed to clear chat history'
  },
  promptSelector: {
    title: 'Select Prompt',
    manage: 'Manage',
    empty: 'No prompt templates available',
    addTemplate: 'Add Template',
    loading: 'Loading...',
    error: 'Failed to load prompts',
    retry: 'Retry'
  },
  emptyChats: 'You don\'t have any conversations yet. Start a new chat!',
  createNewChat: 'Create New Chat',
};

// 所有翻译
const translations: Record<Language, TranslationDictionary> = {
  zh: zhTranslations,
  en: enTranslations
};

export default translations; 