/**
 * API鏈嶅姟妯″潡 - 涓诲鍑烘枃浠?
 * 
 * 缁熶竴瀵煎嚭鎵€鏈堿PI鐩稿叧鐨勭被鍨嬪拰鍑芥暟锛屼綔涓轰娇鐢ˋPI鏈嶅姟鐨勭粺涓€鍏ュ彛鐐?
 */

// 瀵煎叆闇€瑕佺殑绫诲瀷
import { Message } from '../../types/state';

// 瀵煎嚭绫诲瀷瀹氫箟
export * from './types';

// 瀵煎嚭鎻愪緵鍟嗙浉鍏冲嚱鏁?
export {
  getApiProviders,
  findProviderByValue,
  getProviderLabel
} from './providers';

export {
  getDefaultEndpoint,
  getRequestHeaders
} from './providers/endpoints';

export {
  getDefaultModel,
  getAvailableModels
} from './providers/models';

export {
  supportsStreaming,
  supportsMultimodal,
  supportsHighResolutionImages,
  getProviderCapabilities
} from './providers/capabilities';

// 瀵煎嚭鏍稿績API璇锋眰鍑芥暟
export {
  sendApiRequest,
  sendImageApiRequest,
} from './core/request';

export {
  sendStreamApiRequest
} from './core/response';

// 瀵煎嚭瀹炵敤宸ュ叿鍑芥暟
export {
  isValidApiConfig,
  generateUUID
} from './core/utils';

// 瀵煎叆鐩存帴浣跨敤鐨勫嚱鏁?
import { isValidApiConfig, generateUUID } from './core/utils';
import { sendApiRequest } from './core/request';
import { ApiConfig } from './types';

/**
 * 妫€鏌PI閰嶇疆鏄惁鏈夋晥
 * @param apiConfig API閰嶇疆
 * @returns 鏄惁鏈夋晥
 */
export const checkApiConfigValidity = (apiConfig: ApiConfig): boolean => {
  return isValidApiConfig(apiConfig);
};

/**
 * 妫€鏌PI鏄惁鍙敤
 * @param apiConfig API閰嶇疆
 * @returns 鐘舵€丳romise
 */
export const checkApiAvailability = async (apiConfig: ApiConfig): Promise<boolean> => {
  if (!checkApiConfigValidity(apiConfig)) {
    return false;
  }
  
  try {
    // 绠€鍗曟祴璇曟秷鎭?
    const testMessage: Message = {
      id: generateUUID(),
      role: 'user',
      content: 'Hello, this is a test message.',
      timestamp: Date.now(),
      chatId: 'test'
    };
    
    const result = await sendApiRequest([testMessage], apiConfig);
    return !result.error;
  } catch (error) {
    console.error('API鍙敤鎬ф鏌ュけ璐?', error);
    return false;
  }
};

// 瀵煎嚭API閰嶇疆鐩稿叧鍑芥暟
export {
  getApiProviders,
  getDefaultApiConfig,
  getApiModels,
} from './providers/config';

// 瀵煎嚭鏇村API鐩稿叧绫诲瀷
export type {
  ApiConfig,
  ApiProvider,
  ApiModel,
  MessageResponse,
} from './types';
