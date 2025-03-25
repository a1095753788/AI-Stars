declare module 'react-native-mmkv' {
  interface MMKVOptions {
    id?: string;
    path?: string;
    encryptionKey?: string;
  }

  export class MMKV {
    constructor(options?: MMKVOptions);
    
    set(key: string, value: string | number | boolean | Uint8Array): void;
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    getBuffer(key: string): Uint8Array | undefined;
    
    delete(key: string): void;
    clearAll(): void;
    getAllKeys(): string[];
    
    contains(key: string): boolean;
    addOnValueChangedListener(listener: (key: string) => void): () => void;
  }
} 