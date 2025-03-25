import { ThemeMode } from '../../types/theme';
import { SimpleTheme, lightTheme as simpleLightTheme, darkTheme as simpleDarkTheme } from './ThemeContext';

// 导出SimpleTheme替代旧的Theme类型
export type { SimpleTheme };

// 直接导出ThemeContext中定义的主题
export const lightTheme: SimpleTheme = simpleLightTheme;
export const darkTheme: SimpleTheme = simpleDarkTheme;

// 获取主题方法
export const getTheme = (mode: ThemeMode): SimpleTheme => {
  return mode === 'light' ? lightTheme : darkTheme;
}; 