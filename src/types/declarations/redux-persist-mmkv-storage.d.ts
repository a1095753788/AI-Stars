declare module 'redux-persist-mmkv-storage' {
  import { MMKV } from 'react-native-mmkv';
  import { Storage } from 'redux-persist';

  export interface MMKVStorageOptions {
    storage: MMKV;
  }

  export function createMMKVStorage(options: MMKVStorageOptions): Storage;
} 