import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { Message } from '../../../types/state';

interface ChatMessageItemProps {
  message: Message;
  darkMode: boolean;
  language: 'zh' | 'en';
}

/**
 * 聊天消息项组件
 * 负责渲染单个聊天消息，包括用户消息和AI回复
 */
const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ 
  message, 
  darkMode,
  language
}) => {
  // 检查是否为用户消息
  const isUser = message.role === 'user';
  
  // 根据消息类型和主题选择样式
  const containerStyle = [
    styles.container,
    isUser ? styles.userContainer : styles.aiContainer,
    darkMode && (isUser ? styles.userContainerDark : styles.aiContainerDark)
  ];
  
  const messageStyle = [
    styles.message,
    isUser ? styles.userMessage : styles.aiMessage,
    darkMode && (isUser ? styles.userMessageDark : styles.aiMessageDark),
    message.isError && styles.errorMessage
  ];
  
  // 加载状态或错误状态
  const showLoading = message.isLoading;
  const showError = message.isError;
  
  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={containerStyle}>
      {/* 角色图标 */}
      <View style={styles.avatarContainer}>
        {isUser ? (
          <View style={[styles.userAvatar, darkMode && styles.userAvatarDark]}>
            <Text style={styles.avatarText}>
              {language === 'zh' ? '我' : 'ME'}
            </Text>
          </View>
        ) : (
          <View style={[styles.aiAvatar, darkMode && styles.aiAvatarDark]}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        )}
      </View>
      
      {/* 消息内容 */}
      <View style={styles.contentContainer}>
        {/* 消息文本 */}
        <View style={messageStyle}>
          <Text 
            style={[
              styles.messageText, 
              darkMode && styles.messageTextDark,
              showError && styles.errorText
            ]}
          >
            {message.content}
          </Text>
          
          {/* 如果有图片，显示图片 */}
          {message.imageUrl && (
            <Image 
              source={{ uri: message.imageUrl }} 
              style={styles.imageAttachment}
              resizeMode="contain"
            />
          )}
          
          {/* 加载指示器 */}
          {showLoading && (
            <ActivityIndicator 
              size="small" 
              color={darkMode ? "#FFFFFF" : "#000000"} 
              style={styles.loadingIndicator}
            />
          )}
        </View>
        
        {/* 时间戳 */}
        <Text style={[
          styles.timestamp, 
          darkMode && styles.timestampDark
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  userContainerDark: {
    // 用户消息暗色模式特定样式
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  aiContainerDark: {
    // AI消息暗色模式特定样式
  },
  avatarContainer: {
    width: 36,
    height: 36,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: '#E1F5FE',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarDark: {
    backgroundColor: '#01579B',
  },
  aiAvatar: {
    backgroundColor: '#E8F5E9',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarDark: {
    backgroundColor: '#1B5E20',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    maxWidth: '80%',
  },
  message: {
    padding: 10,
    borderRadius: 12,
    maxWidth: '100%',
  },
  userMessage: {
    backgroundColor: '#E3F2FD',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  userMessageDark: {
    backgroundColor: '#0D47A1',
  },
  aiMessage: {
    backgroundColor: '#F1F8E9',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  aiMessageDark: {
    backgroundColor: '#33691E',
  },
  errorMessage: {
    backgroundColor: '#FFEBEE',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  messageTextDark: {
    color: '#FFF',
  },
  errorText: {
    color: '#C62828',
  },
  imageAttachment: {
    width: '100%',
    height: 200,
    marginTop: 8,
    borderRadius: 8,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  timestampDark: {
    color: '#777',
  },
});

export default ChatMessageItem; 