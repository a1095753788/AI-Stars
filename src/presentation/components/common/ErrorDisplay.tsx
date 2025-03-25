/**
 * 错误显示组件
 * 用于展示错误信息，并可选添加重试按钮
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';

/**
 * 错误显示组件属性接口
 */
export interface ErrorDisplayProps {
  message: string;
  style?: StyleProp<ViewStyle>;
  onRetry?: () => void;
  retryText?: string;
}

/**
 * 错误显示组件
 * @param props 组件属性
 * @returns React组件
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  style, 
  onRetry, 
  retryText = '重试' 
}) => {
  if (!message) return null;
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  message: {
    color: 'red',
    flex: 1
  },
  retryButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    marginLeft: 10
  },
  retryText: {
    color: '#fff',
    fontSize: 12
  }
});

export default ErrorDisplay; 