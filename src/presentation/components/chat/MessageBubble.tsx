import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert
} from 'react-native';
import { Message } from '../../../types/state';
import { useTheme } from '../../theme/ThemeContext';
import RenderHtml from 'react-native-render-html';
// 引入语音服务
import * as VoiceService from '../../../services/voiceService';

interface MessageBubbleProps {
  message: Message;
  language: 'zh' | 'en';
  onImagePress?: (url: string) => void;
}

/**
 * 简化的消息气泡组件
 * 负责渲染单个消息，包括文本、图片和文件
 */
const MessageBubble = ({ message, language, onImagePress }: MessageBubbleProps) => {
  const { theme } = useTheme();
  const isUserMessage = message.role === 'user';
  // 添加语音播放状态
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  // 格式化时间戳
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 处理时间戳显示
  const timestamp = message.isLoading ? 
    (language === 'zh' ? '发送中...' : 'Sending...') : 
    formatTime(message.timestamp);

  // 添加复制到剪贴板功能
  const copyToClipboard = () => {
    if (message.content) {
      Clipboard.setString(message.content);
      
      // 显示复制成功提示
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          language === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard',
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          '',
          language === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    }
  };

  // 添加语音播放功能
  const speakMessage = async () => {
    if (!message.content) return;
    
    try {
      if (isSpeaking) {
        // 如果正在播放，则停止
        await VoiceService.stopSpeaking();
        setIsSpeaking(false);
      } else {
        // 开始播放
        setIsSpeaking(true);
        await VoiceService.speakText(message.content);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("语音播放错误:", error);
      setIsSpeaking(false);
      
      // 显示错误提示
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          language === 'zh' ? '语音播放失败' : 'Speech playback failed',
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          '',
          language === 'zh' ? '语音播放失败' : 'Speech playback failed',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    }
  };

  // 添加formatContent函数来转换消息内容为HTML格式
  const formatContent = (content: string): string => {
    // 转换链接
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = content.replace(urlRegex, '<a href="$1">$1</a>');
    
    // 转换代码块 (```code```)
    const codeBlockRegex = /```(.+?)```/gs;
    formattedText = formattedText.replace(codeBlockRegex, '<pre>$1</pre>');
    
    // 转换行内代码 (`code`)
    const inlineCodeRegex = /`(.+?)`/g;
    formattedText = formattedText.replace(inlineCodeRegex, '<code>$1</code>');
    
    // 转换换行
    formattedText = formattedText.replace(/\n/g, '<br/>');
    
    return formattedText;
  };

  // 渲染图片或文件
  const renderMedia = () => {
    if (message.imageUrl) {
      return (
        <TouchableOpacity 
          style={styles.mediaContainer}
          onPress={() => onImagePress && onImagePress(message.imageUrl || '')}
          disabled={!onImagePress}
        >
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={[styles.mediaCaption, { color: theme.colors.text + '80' }]}>
            {language === 'zh' ? '图片' : 'Image'}
          </Text>
        </TouchableOpacity>
      );
    } else if (message.filePath && message.fileName) {
      return (
        <View style={styles.mediaContainer}>
          <View style={[styles.fileContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.fileName, { color: theme.colors.text }]}>
              {message.fileName}
            </Text>
          </View>
          <Text style={[styles.mediaCaption, { color: theme.colors.text + '80' }]}>
            {language === 'zh' ? '文件' : 'File'}
          </Text>
        </View>
      );
    }
    return null;
  };

  // 加载中的消息显示
  if (message.isLoading) {
    return (
      <View style={[
        styles.messageBubble, 
        styles.aiMessage,
        { backgroundColor: theme.colors.card }
      ]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }
  
  // 转换内容中的链接和代码块
  const formattedContent = message.content ? formatContent(message.content) : '';
  
  return (
    <View style={[
      styles.container,
      isUserMessage ? styles.userContainer : styles.aiContainer
    ]}>
      <View style={styles.bubbleContainer}>
        <View style={[
          styles.bubble,
          isUserMessage 
            ? [styles.userBubble, { backgroundColor: theme.colors.primary }] 
            : [styles.aiBubble, { backgroundColor: theme.colors.card }],
          { 
            borderWidth: message.isError ? 1 : 0,
            borderColor: message.isError ? '#ff6b6b' : 'transparent'
          }
        ]}>
          <RenderHtml
            contentWidth={300}
            source={{ html: formattedContent }}
            tagsStyles={{
              body: { 
                color: isUserMessage ? '#fff' : theme.colors.text,
                fontSize: 16,
                lineHeight: 24
              },
              a: { 
                color: isUserMessage ? '#ccf' : theme.colors.primary,
                textDecorationLine: 'underline'
              },
              pre: {
                backgroundColor: isUserMessage ? '#4a44c4' : '#f0f0f0',
                padding: 8,
                borderRadius: 4,
                overflow: 'hidden'
              },
              code: {
                fontFamily: 'monospace',
                backgroundColor: isUserMessage ? '#4a44c4' : '#f0f0f0',
                padding: 2,
                borderRadius: 3
              },
              img: {
                borderRadius: 8,
                margin: 4,
                maxWidth: 300,
                height: 150
              }
            }}
            renderersProps={{
              img: {
                onPress: (_: any, uri: string) => {
                  if (onImagePress && uri) {
                    onImagePress(uri);
                  }
                }
              }
            }}
          />
          
          {/* 错误标记指示器 */}
          {message.isError && (
            <View style={styles.errorIndicator}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>
                {language === 'zh' ? '发送失败' : 'Failed to send'}
              </Text>
            </View>
          )}
        </View>
        
        {/* 功能按钮容器 */}
        <View style={styles.buttonsContainer}>
          {/* 朗读按钮 */}
          <TouchableOpacity 
            onPress={speakMessage}
            style={styles.actionButton}
          >
            <Text style={styles.buttonIcon}>
              {isSpeaking ? '🔊' : '🔈'}
            </Text>
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {language === 'zh' ? '朗读' : 'Speak'}
            </Text>
          </TouchableOpacity>
          
          {/* 复制按钮 */}
          <TouchableOpacity 
            onPress={copyToClipboard}
            style={styles.actionButton}
          >
            <Text style={styles.buttonIcon}>📋</Text>
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {language === 'zh' ? '复制' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.timestamp, { color: theme.colors.text + '80' }]}>
        {timestamp}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubbleContainer: {
    position: 'relative',
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    minWidth: 60,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  fileContainer: {
    padding: 10,
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediaCaption: {
    fontSize: 12,
    marginTop: 4,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  aiMessage: {
    borderBottomLeftRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  errorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    padding: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 4,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
  },
  // 按钮相关样式
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingRight: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MessageBubble; 