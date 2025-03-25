import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
  language: 'zh' | 'en';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  language
}) => {
  // 根据语言选择按钮文本
  const dismissText = language === 'zh' ? '关闭' : 'Dismiss';
  const retryText = language === 'zh' ? '重试' : 'Retry';
  const settingsText = language === 'zh' ? '设置' : 'Settings';
  const errorTitle = language === 'zh' ? '出错了' : 'Error Occurred';

  return (
    <Modal
      transparent
      visible={!!error}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{errorTitle}</Text>
          <Text style={styles.message}>{error}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>{dismissText}</Text>
            </TouchableOpacity>
            
            {onRetry && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={onRetry}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {onRetry.name?.includes('Settings') ? settingsText : retryText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#E53935'
  },
  message: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 5
  },
  primaryButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333'
  },
  primaryButtonText: {
    color: '#FFFFFF'
  }
});

export default ErrorDisplay; 