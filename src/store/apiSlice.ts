// API配置状态切片
// 注意：实际使用需导入 @reduxjs/toolkit
import { ApiConfig } from '../types/api';
import { ApiConfigActionTypes, ApiConfigState } from '../types/state';
import { saveApiConfigs } from '../utils/storageService';

// 初始状态
const initialState: ApiConfigState = {
  configs: [],
  activeConfigId: null,
  loading: false,
  error: null
};

// 减速器
export const apiConfigReducer = (state = initialState, action: any): ApiConfigState => {
  switch (action.type) {
    case ApiConfigActionTypes.FETCH_API_CONFIGS:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ApiConfigActionTypes.FETCH_API_CONFIGS_SUCCESS:
      return {
        ...state,
        configs: action.payload.configs,
        activeConfigId: action.payload.activeConfigId || (action.payload.configs.length > 0 ? action.payload.configs[0].id : null),
        loading: false
      };
    
    case ApiConfigActionTypes.FETCH_API_CONFIGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ApiConfigActionTypes.ADD_API_CONFIG:
      const newConfigs = [...state.configs, action.payload];
      
      // 保存到存储
      saveApiConfigs(newConfigs);
      
      return {
        ...state,
        configs: newConfigs,
        activeConfigId: state.activeConfigId || action.payload.id
      };
    
    case ApiConfigActionTypes.UPDATE_API_CONFIG:
      const updatedConfigs = state.configs.map(config => 
        config.id === action.payload.id ? action.payload : config
      );
      
      // 保存到存储
      saveApiConfigs(updatedConfigs);
      
      return {
        ...state,
        configs: updatedConfigs
      };
    
    case ApiConfigActionTypes.DELETE_API_CONFIG:
      const filteredConfigs = state.configs.filter(config => config.id !== action.payload);
      
      // 保存到存储
      saveApiConfigs(filteredConfigs);
      
      return {
        ...state,
        configs: filteredConfigs,
        activeConfigId: state.activeConfigId === action.payload
          ? (filteredConfigs.length > 0 ? filteredConfigs[0].id : null)
          : state.activeConfigId
      };
    
    case ApiConfigActionTypes.SET_ACTIVE_API_CONFIG:
      return {
        ...state,
        activeConfigId: action.payload
      };
    
    case ApiConfigActionTypes.RESET_API_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Action Creators
export const fetchApiConfigs = () => ({
  type: ApiConfigActionTypes.FETCH_API_CONFIGS
});

export const fetchApiConfigsSuccess = (configs: ApiConfig[], activeConfigId: string | null) => ({
  type: ApiConfigActionTypes.FETCH_API_CONFIGS_SUCCESS,
  payload: { configs, activeConfigId }
});

export const fetchApiConfigsFailure = (error: string) => ({
  type: ApiConfigActionTypes.FETCH_API_CONFIGS_FAILURE,
  payload: error
});

export const addApiConfig = (config: ApiConfig) => ({
  type: ApiConfigActionTypes.ADD_API_CONFIG,
  payload: config
});

export const updateApiConfig = (config: ApiConfig) => ({
  type: ApiConfigActionTypes.UPDATE_API_CONFIG,
  payload: config
});

export const deleteApiConfig = (configId: string) => ({
  type: ApiConfigActionTypes.DELETE_API_CONFIG,
  payload: configId
});

export const setActiveApiConfig = (configId: string) => ({
  type: ApiConfigActionTypes.SET_ACTIVE_API_CONFIG,
  payload: configId
});

export const resetApiError = () => ({
  type: ApiConfigActionTypes.RESET_API_ERROR
}); 