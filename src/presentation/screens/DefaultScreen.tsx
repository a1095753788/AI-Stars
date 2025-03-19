import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * 默认界面
 * 显示设置和主页，点击聊天框跳转到聊天界面
 */
const DefaultScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        React Native 多模型聊天应用
      </Text>
      
      <TouchableOpacity 
        style={[styles.chatBox, { backgroundColor: theme.colors.card }]} 
        onPress={() => navigation?.navigate('Chat')}
      >
        <Text style={[styles.chatBoxText, { color: theme.colors.text }]}>
          点击开始新对话
        </Text>
        <Text style={[styles.chatBoxSubText, { color: theme.colors.text + '99' }]}>
          支持多AI模型，图片上传，文件发送等功能
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]} 
        onPress={() => navigation?.navigate('Settings')}
      >
        <Text style={styles.settingsButtonText}>设置</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  chatBox: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chatBoxText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  chatBoxSubText: {
    fontSize: 14,
  },
  settingsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DefaultScreen; 