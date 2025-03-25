import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/presentation/theme/ThemeContext';

/**
 * 应用主入口组件
 * 
 * @returns 应用主组件
 */
const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar 
                  barStyle="dark-content" 
                  backgroundColor="transparent"
                  translucent={Platform.OS === 'android'}
                />
                <AppNavigator />
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App; 