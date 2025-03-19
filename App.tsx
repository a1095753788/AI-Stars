import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemeProvider, useTheme } from './src/presentation/theme/ThemeContext';
import DefaultScreen from './src/presentation/screens/DefaultScreen';
import ChatScreen from './src/presentation/screens/ChatScreen';
import SettingsScreen from './src/presentation/screens/SettingsScreen';

// 创建导航堆栈
const Stack = createNativeStackNavigator();

// 主应用导航组件
const AppNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer>
      <StatusBar
        barStyle={theme.colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <Stack.Navigator
        initialRouteName="Default"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="Default" component={DefaultScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 主应用组件
const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App; 