// 主题相关类型定义

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    userBubble: string;
    assistantBubble: string;
    userText: string;
    assistantText: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

export interface ThemeState {
  mode: ThemeMode;
  systemTheme: boolean;
} 