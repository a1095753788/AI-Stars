import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme, lightTheme } from '../presentation/theme/ThemeContext';

// 导入所有屏幕
import HomeScreen from '../presentation/screens/HomeScreen';
import RefactoredHomeScreen from '../presentation/screens/RefactoredHomeScreen';
import SettingsScreen from '../presentation/screens/SettingsScreen';
import ApiConfigScreen from '../presentation/screens/ApiConfigScreen';
import PromptTemplatesScreen from '../presentation/screens/PromptTemplatesScreen';
import DefaultScreen from '../presentation/screens/DefaultScreen';
import HistoryScreen from '../presentation/screens/HistoryScreen';
import PromptSelectorScreen from '../presentation/screens/PromptSelectorScreen';
import ApiProviderSelectorScreen from '../presentation/screens/ApiProviderSelectorScreen';
import ModelSelectorScreen from '../presentation/screens/ModelSelectorScreen';
import { RootStackParamList } from './index';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
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
        <Stack.Screen name="RefactoredHome" component={RefactoredHomeScreen} />
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

export default AppNavigator; 