import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

/**
 * 加载覆盖层组件
 * 用于显示加载状态
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  text = '加载中...' 
}) => {
  const { theme } = useTheme();
  
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.dark ? '#333333' : '#FFFFFF' }
          ]}
        >
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.indicator}
          />
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {text}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  indicator: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingOverlay; 