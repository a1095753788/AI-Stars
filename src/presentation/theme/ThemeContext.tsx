import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getSettings, saveSettings } from '../../utils/storageService';

// 主题颜色定义
export type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
};

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system';

// 主题定义
export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

// 主题上下文接口
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

// 亮色主题
const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C7C7CC'
  }
};

// 暗色主题
const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A'
  }
};

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  themeMode: 'light',
  setThemeMode: () => {}
});

// 主题提供者组件
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // 状态
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [theme, setTheme] = useState<Theme>(lightTheme);
  
  // 初始化主题
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // 获取保存的设置
        const settings = await getSettings();
        
        if (settings) {
          // 从设置中获取主题模式
          const savedThemeMode = settings.themeMode || 'light';
          
          // 设置主题模式
          updateThemeMode(savedThemeMode === 'system' 
            ? 'system' 
            : savedThemeMode === 'dark' 
              ? 'dark' 
              : 'light');
        } else {
          // 默认使用系统主题
          const systemColorScheme = Appearance.getColorScheme() || 'light';
          setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('初始化主题失败:', error);
      }
    };
    
    initializeTheme();
    
    // 监听系统主题变化
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // 监听主题模式变化
  useEffect(() => {
    applyThemeMode();
  }, [themeMode]);
  
  // 应用主题模式
  const applyThemeMode = () => {
    if (themeMode === 'system') {
      const systemColorScheme = Appearance.getColorScheme() || 'light';
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    } else {
      setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    }
  };
  
  // 更新主题模式
  const updateThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    
    try {
      // 获取当前设置
      const settings = await getSettings() || {};
      
      // 更新主题设置
      await saveSettings({
        ...settings,
        themeMode: mode
      });
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };
  
  // 切换主题
  const toggleTheme = () => {
    const newMode = theme.dark ? 'light' : 'dark';
    updateThemeMode(newMode);
  };
  
  // 提供上下文值
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    themeMode,
    setThemeMode: updateThemeMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的钩子
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 