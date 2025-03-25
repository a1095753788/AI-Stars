import React, { useEffect } from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/presentation/theme/ThemeContext';

/**
 * 请求应用所需权限
 */
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      // 请求存储权限
      const storagePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: '存储权限',
          message: '应用需要访问您的存储以选择图片和文件',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定',
        }
      );
      
      // 请求相机权限
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '相机权限',
          message: '应用需要访问您的相机以拍摄照片',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定',
        }
      );
      
      console.log('权限请求结果：', { 
        storage: storagePermission, 
        camera: cameraPermission 
      });
      
    } catch (err) {
      console.warn('请求权限错误：', err);
    }
  }
};

/**
 * 应用主入口组件
 * 
 * @returns 应用主组件
 */
const App = () => {
  // 应用启动时请求权限
  useEffect(() => {
    requestPermissions();
  }, []);

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