// Redux Store配置
// 注意：实际使用需导入 @reduxjs/toolkit
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { combineReducers } from 'redux';
import { storage } from '../utils/storage';
import { createMMKVStorage } from '../utils/mmkv-storage';

import chatReducer from './slices/chatSlice';
import settingsReducer from './slices/settingsSlice';

// 创建MMKV存储引擎
const mmkvStorage = createMMKVStorage({ storage });

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: mmkvStorage,
  whitelist: ['settings', 'chat'], // 只持久化这些reducer的状态
};

// 合并所有reducers
const rootReducer = combineReducers({
  chat: chatReducer,
  settings: settingsReducer,
});

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 创建持久化store
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 