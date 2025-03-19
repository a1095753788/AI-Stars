// Redux Store配置
// 注意：实际使用需导入 @reduxjs/toolkit
import { RootState } from '../types/state';
import { chatReducer } from './chatSlice';
import { apiConfigReducer } from './apiSlice';
import { settingsReducer } from './settingsSlice';

// 创建根减速器
const rootReducer = {
  chat: chatReducer,
  api: apiConfigReducer,
  settings: settingsReducer
};

// 配置store
export const configureStore = () => {
  // 实际使用Redux Toolkit时的代码
  // return configureReduxStore({
  //   reducer: rootReducer,
  //   middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //     serializableCheck: false
  //   })
  // });
  
  // 模拟store，仅用于结构说明
  return {
    getState: () => {
      const initialState: RootState = {
        chat: {
          chats: {},
          currentChatId: null,
          loading: false,
          error: null
        },
        api: {
          configs: [],
          activeConfigId: null,
          loading: false,
          error: null
        },
        settings: {
          themeMode: 'light',
          useSystemTheme: true,
          allowMultipleFiles: false,
          enableVoice: true,
          promptTemplates: []
        }
      };
      
      return initialState;
    },
    dispatch: (action: any) => {
      console.log('Dispatching action:', action);
      return action;
    },
    subscribe: (listener: () => void) => {
      return () => {}; // 返回取消订阅函数
    }
  };
};

// 创建store实例
export const store = configureStore();

// 获取类型
export type AppDispatch = typeof store.dispatch; 