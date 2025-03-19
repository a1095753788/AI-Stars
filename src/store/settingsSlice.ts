// 设置状态切片
// 注意：实际使用需导入 @reduxjs/toolkit
import { PromptTemplate } from '../types/message';
import { SettingsActionTypes, SettingsState } from '../types/state';
import { ThemeMode } from '../types/theme';
import { saveThemeSettings, saveAllowMultipleFiles, saveEnableVoice } from '../utils/storageService';

// 初始状态
const initialState: SettingsState = {
  themeMode: 'light',
  useSystemTheme: true,
  allowMultipleFiles: false,
  enableVoice: true,
  promptTemplates: []
};

// 减速器
export const settingsReducer = (state = initialState, action: any): SettingsState => {
  switch (action.type) {
    case SettingsActionTypes.SET_THEME_MODE:
      // 保存主题设置
      saveThemeSettings(action.payload, state.useSystemTheme);
      
      return {
        ...state,
        themeMode: action.payload
      };
    
    case SettingsActionTypes.SET_USE_SYSTEM_THEME:
      // 保存主题设置
      saveThemeSettings(state.themeMode, action.payload);
      
      return {
        ...state,
        useSystemTheme: action.payload
      };
    
    case SettingsActionTypes.SET_ALLOW_MULTIPLE_FILES:
      // 保存多文件设置
      saveAllowMultipleFiles(action.payload);
      
      return {
        ...state,
        allowMultipleFiles: action.payload
      };
    
    case SettingsActionTypes.SET_ENABLE_VOICE:
      // 保存语音设置
      saveEnableVoice(action.payload);
      
      return {
        ...state,
        enableVoice: action.payload
      };
    
    case SettingsActionTypes.ADD_PROMPT_TEMPLATE:
      return {
        ...state,
        promptTemplates: [...state.promptTemplates, action.payload]
      };
    
    case SettingsActionTypes.UPDATE_PROMPT_TEMPLATE:
      return {
        ...state,
        promptTemplates: state.promptTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        )
      };
    
    case SettingsActionTypes.DELETE_PROMPT_TEMPLATE:
      return {
        ...state,
        promptTemplates: state.promptTemplates.filter(template => template.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Action Creators
export const setThemeMode = (themeMode: ThemeMode) => ({
  type: SettingsActionTypes.SET_THEME_MODE,
  payload: themeMode
});

export const setUseSystemTheme = (useSystemTheme: boolean) => ({
  type: SettingsActionTypes.SET_USE_SYSTEM_THEME,
  payload: useSystemTheme
});

export const setAllowMultipleFiles = (allow: boolean) => ({
  type: SettingsActionTypes.SET_ALLOW_MULTIPLE_FILES,
  payload: allow
});

export const setEnableVoice = (enable: boolean) => ({
  type: SettingsActionTypes.SET_ENABLE_VOICE,
  payload: enable
});

export const addPromptTemplate = (template: PromptTemplate) => ({
  type: SettingsActionTypes.ADD_PROMPT_TEMPLATE,
  payload: template
});

export const updatePromptTemplate = (template: PromptTemplate) => ({
  type: SettingsActionTypes.UPDATE_PROMPT_TEMPLATE,
  payload: template
});

export const deletePromptTemplate = (templateId: string) => ({
  type: SettingsActionTypes.DELETE_PROMPT_TEMPLATE,
  payload: templateId
}); 