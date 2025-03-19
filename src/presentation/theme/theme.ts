import { Theme, ThemeMode } from '../../types/theme';

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#FF3B30',
    userBubble: '#007AFF',
    assistantBubble: '#F0F0F0',
    userText: '#FFFFFF',
    assistantText: '#000000',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2C2C2C',
    notification: '#FF453A',
    userBubble: '#0A84FF',
    assistantBubble: '#2C2C2C',
    userText: '#FFFFFF',
    assistantText: '#FFFFFF',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
}; 