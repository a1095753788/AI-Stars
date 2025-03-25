import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../i18n/translations';

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface SettingsState {
  themeMode: 'light' | 'dark' | 'system';
  useSystemTheme: boolean;
  allowMultipleFiles: boolean;
  enableVoice: boolean;
  promptTemplates: PromptTemplate[];
  language: Language;
}

const initialState: SettingsState = {
  themeMode: 'system',
  useSystemTheme: true,
  allowMultipleFiles: false,
  enableVoice: true,
  promptTemplates: [],
  language: 'zh',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.themeMode = action.payload;
    },
    setUseSystemTheme: (state, action: PayloadAction<boolean>) => {
      state.useSystemTheme = action.payload;
    },
    setAllowMultipleFiles: (state, action: PayloadAction<boolean>) => {
      state.allowMultipleFiles = action.payload;
    },
    setEnableVoice: (state, action: PayloadAction<boolean>) => {
      state.enableVoice = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    addPromptTemplate: (state, action: PayloadAction<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const template: PromptTemplate = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.promptTemplates.push(template);
    },
    updatePromptTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>> }>) => {
      const { id, updates } = action.payload;
      const template = state.promptTemplates.find(t => t.id === id);
      if (template) {
        Object.assign(template, updates, { updatedAt: Date.now() });
      }
    },
    deletePromptTemplate: (state, action: PayloadAction<string>) => {
      state.promptTemplates = state.promptTemplates.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setThemeMode,
  setUseSystemTheme,
  setAllowMultipleFiles,
  setEnableVoice,
  setLanguage,
  addPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
} = settingsSlice.actions;

export default settingsSlice.reducer; 