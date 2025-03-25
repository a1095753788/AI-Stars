import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';

interface NetworkStatusBannerProps {
  isConnected?: boolean;
  language?: 'zh' | 'en';
  onRetry?: () => void;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ 
  isConnected: propIsConnected,
  language = 'zh',
  onRetry 
}) => {
  const { theme } = useTheme();
  const networkStatus = useNetworkStatus();
  // 如果通过props传入isConnected则使用它，否则使用钩子
  const isConnected = propIsConnected !== undefined ? propIsConnected : networkStatus.isConnected;
  
  if (isConnected) return null;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <Text style={styles.text}>
        {language === 'zh' ? '网络连接已断开' : 'Network connection lost'}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>
            {language === 'zh' ? '重试' : 'Retry'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default NetworkStatusBanner; 