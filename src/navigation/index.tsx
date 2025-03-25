import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme, lightTheme } from '../presentation/theme/ThemeContext';
import AppNavigator from './AppNavigator';

// 导入所有屏幕
import HomeScreen from '../presentation/screens/HomeScreen';
import SettingsScreen from '../presentation/screens/SettingsScreen';
import ApiConfigScreen from '../presentation/screens/ApiConfigScreen';
import PromptTemplatesScreen from '../presentation/screens/PromptTemplatesScreen';
import DefaultScreen from '../presentation/screens/DefaultScreen';
import HistoryScreen from '../presentation/screens/HistoryScreen';
import PromptSelectorScreen from '../presentation/screens/PromptSelectorScreen';
import ApiProviderSelectorScreen from '../presentation/screens/ApiProviderSelectorScreen';
import ModelSelectorScreen from '../presentation/screens/ModelSelectorScreen';
import { PromptTemplate } from '../types/state';
import { ApiProvider } from '../services/api/types';

// 定义导航参数类型
export type RootStackParamList = {
  Home: { templateContent?: string; timestamp?: number } | undefined;
  RefactoredHome: undefined;
  Settings: undefined;
  APISettings: undefined;
  PromptTemplates: undefined;
  ChatHistory: undefined;
  LanguageSettings: undefined;
  ApiConfig: undefined;
  ApiProviderSelector: {
    onSelectProvider: (provider: string, label: string) => void;
    currentProvider?: string;
  };
  ModelSelector: {
    provider: ApiProvider;
    onSelectModel: (model: string) => void;
  };
  PromptSelector: undefined;
  Default: undefined;
  History: undefined;
  Chat: {
    chatId: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

// 导出旧的导航器以便逐步替换
export const LegacyAppNavigator = () => {
  // 使用主题并添加备用主题防止undefined错误
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };

  // 创建导航主题对象
  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.paper,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
            overlayStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
                extrapolate: 'clamp',
              }),
            },
          }),
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ApiConfig" component={ApiConfigScreen} />
        <Stack.Screen name="ApiProviderSelector" component={ApiProviderSelectorScreen} />
        <Stack.Screen
          name="ModelSelector"
          component={ModelSelectorScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
            animationEnabled: true
          }}
        />
        <Stack.Screen name="PromptTemplates" component={PromptTemplatesScreen} />
        <Stack.Screen name="PromptSelector" component={PromptSelectorScreen} />
        <Stack.Screen name="Default" component={DefaultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 默认导出新的导航器
export { AppNavigator };
export default AppNavigator; 