import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { getApiConfigs } from '../../utils/storageService';

/**
 * 网络状态钩子
 * 监听网络连接状态变化
 * 
 * @returns 网络状态信息
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isApiConfigured, setApiConfigured] = useState(false);
  
  // 计算网络是否可用
  const isNetworkAvailable = isConnected && isInternetReachable;

  // 检查API配置状态
  const checkApiConfigStatus = useCallback(async () => {
    try {
      const apiConfigs = await getApiConfigs();
      const hasConfigs = Array.isArray(apiConfigs) && apiConfigs.length > 0;
      console.log('API配置状态:', hasConfigs ? '已配置' : '未配置', apiConfigs?.length || 0);
      setApiConfigured(hasConfigs);
      return hasConfigs;
    } catch (error) {
      console.error('检查API配置状态失败:', error);
      setApiConfigured(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // 初始化时检查API配置
    checkApiConfigStatus();
    
    // 实际应用中应该使用NetInfo库来监测网络状态
    // 这里简单模拟永远在线
    setIsConnected(true);
    setIsInternetReachable(true);
    
    return () => {
      // 清理资源
    };
  }, [checkApiConfigStatus]);

  const reconnect = () => {
    // 模拟重新连接网络
    setIsConnected(true);
    setIsInternetReachable(true);
    // 重新检查API配置
    checkApiConfigStatus();
  };

  return { 
    isConnected, 
    isInternetReachable, 
    isNetworkAvailable,
    isApiConfigured,
    checkApiConfigStatus,
    reconnect 
  };
};

export default useNetworkStatus; 