// 主题相关类型定义
import { SimpleTheme } from '../presentation/theme/ThemeContext';

export type ThemeMode = 'light' | 'dark';

// 使用从ThemeContext导出的增强主题类型
export type Theme = SimpleTheme;

export interface ThemeState {
  mode: ThemeMode;
  systemTheme?: ThemeMode;
} 