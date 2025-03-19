import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Message } from '../../types/api';
import { canAddFileToChat, canAddImageToChat } from '../../utils/messageService';
import { selectImageFromCamera, selectImageFromGallery, compressImage, imageToBase64 } from '../../utils/imageService';
import { selectFile, FileInfo } from '../../utils/fileService';
import { speak, stopSpeaking } from '../../utils/voiceService';
import { sendMessageToAPI, sendImageMessageToAPI } from '../../services/apiService';
import { getApiConfigs } from '../../utils/storageService';
import ImageMessageBubble from '../components/chat/ImageMessageBubble';
import FileMessageBubble from '../components/chat/FileMessageBubble';
import VoiceButton from '../components/chat/VoiceButton';

/**
 * 聊天界面
 * 处理与AI的对话，支持发送消息、图片和文件
 */
const ChatScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { chatId, isNewChat, promptTemplate } = route.params || {};

  // 聊天状态
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [apiConfig, setApiConfig] = useState<any>(null);
  
  // 上传状态
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // 引用
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // 获取多文件设置和API配置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 从route参数获取允许多文件设置
        const allowMultiple = route?.params?.allowMultipleFiles ?? false;
        
        // 获取API配置
        const configs = await getApiConfigs();
        if (configs && configs.length > 0) {
          // 获取激活的配置
          const activeConfig = configs.find(config => config.isActive) || configs[0];
          setApiConfig(activeConfig);
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    
    loadSettings();
  }, [route?.params?.allowMultipleFiles]);

  // 初始化聊天
  useEffect(() => {
    // 预填充提示词模板内容
    if (promptTemplate) {
      setInputText(promptTemplate.content);
    }
    
    loadChat();
    loadApiConfig();
  }, [chatId, isNewChat, promptTemplate]);

  // 加载API配置
  const loadApiConfig = async () => {
    try {
      const config = await getApiConfigs();
      if (!config) {
        Alert.alert('错误', '未找到可用的API配置，请先在设置中配置API');
        navigation.goBack();
        return;
      }
      setApiConfig(config);
    } catch (error) {
      console.error('加载API配置失败:', error);
      Alert.alert('错误', '加载API配置失败');
    }
  };

  // 加载聊天记录
  const loadChat = async () => {
    setLoading(true);
    
    try {
      if (chatId) {
        // 加载现有聊天
        const existingChat = await getChatRecord(chatId);
        if (existingChat) {
          setChat(existingChat);
          setMessages(existingChat.messages);
        } else {
          Alert.alert('错误', '未找到聊天记录');
          navigation.goBack();
        }
      } else {
        // 创建新聊天
        const newChat: Chat = {
          id: Date.now().toString(),
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setChat(newChat);
        setMessages([]);
        
        // 保存新聊天
        await saveChatRecord(newChat);
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
      Alert.alert('错误', '加载聊天记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新并保存聊天记录
  const updateChat = async (updatedMessages: Message[], title?: string) => {
    if (!chat) return;
    
    try {
      // 如果是第一条消息，使用用户消息的前15个字符作为标题
      const firstUserMessage = updatedMessages.find(msg => msg.role === 'user');
      const chatTitle = title || (chat.title === '新对话' && firstUserMessage 
        ? firstUserMessage.content.substring(0, 15) + (firstUserMessage.content.length > 15 ? '...' : '')
        : chat.title);
      
      const updatedChat: Chat = {
        ...chat,
        title: chatTitle,
        messages: updatedMessages,
        updatedAt: Date.now()
      };
      
      setChat(updatedChat);
      setMessages(updatedMessages);
      
      // 保存到存储
      await saveChatRecord(updatedChat);
      
      // 更新导航栏标题
      navigation.setOptions({
        title: chatTitle
      });
    } catch (error) {
      console.error('保存聊天记录失败:', error);
      Alert.alert('错误', '保存聊天记录失败');
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadingImage && !uploadingFile) return;
    if (!apiConfig) {
      Alert.alert('错误', '请先配置API设置');
      return;
    }
    
    try {
      setSending(true);
      
      // 创建用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText.trim(),
        timestamp: Date.now()
      };
      
      // 添加用户消息到列表
      const updatedMessages = [...messages, userMessage];
      await updateChat(updatedMessages);
      
      // 清空输入框
      setInputText('');
      
      // 创建AI消息占位
      const aiMessagePlaceholder: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '思考中...',
        timestamp: Date.now() + 1,
        isLoading: true
      };
      
      // 添加AI消息占位到列表
      const messagesWithPlaceholder = [...updatedMessages, aiMessagePlaceholder];
      setMessages(messagesWithPlaceholder);
      
      // 滚动到底部
      scrollToBottom();
      
      // 调用API发送消息
      const apiResponse = await sendMessage({
        messages: updatedMessages,
        apiConfig
      });
      
      // 如果是第一条消息，可能需要更新标题
      const shouldUpdateTitle = messages.length === 0;
      
      // 创建实际的AI回复消息
      const aiMessage: Message = {
        id: aiMessagePlaceholder.id,
        role: 'assistant',
        content: apiResponse.content,
        timestamp: Date.now() + 1,
        isLoading: false
      };
      
      // 更新消息列表，替换占位消息
      const finalMessages = messagesWithPlaceholder.map(msg => 
        msg.id === aiMessagePlaceholder.id ? aiMessage : msg
      );
      
      // 更新聊天记录
      await updateChat(finalMessages, shouldUpdateTitle ? userMessage.content.substring(0, 15) : undefined);
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 从消息列表中移除加载中的消息
      const messagesWithoutLoading = messages.filter(msg => !msg.isLoading);
      setMessages(messagesWithoutLoading);
      
      // 显示错误消息
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      Alert.alert('错误', errorMessage);
    } finally {
      setSending(false);
    }
  };

  // 上传图片
  const handleUploadImage = async () => {
    try {
      setUploadingImage(true);
      
      // 调用图片上传服务
      const result = await uploadImage();
      
      if (result.cancelled) {
        return;
      }
      
      // 创建图片消息
      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '[图片]',
        timestamp: Date.now(),
        imageUrl: result.uri
      };
      
      // 添加图片消息到列表
      const updatedMessages = [...messages, imageMessage];
      await updateChat(updatedMessages);
      
      // 可选：自动向AI发送关于图片的提示
      if (result.uri) {
        setInputText('这是一张图片，请描述一下你看到了什么');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      Alert.alert('错误', '上传图片失败');
    } finally {
      setUploadingImage(false);
    }
  };

  // 上传文件
  const handleUploadFile = async () => {
    try {
      setUploadingFile(true);
      
      // 调用文件上传服务
      const result = await uploadFile();
      
      if (result.cancelled) {
        return;
      }
      
      // 创建文件消息
      const fileMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `[文件: ${result.name}]`,
        timestamp: Date.now(),
        filePath: result.uri,
        fileName: result.name,
        fileSize: result.size,
        fileType: result.type
      };
      
      // 添加文件消息到列表
      const updatedMessages = [...messages, fileMessage];
      await updateChat(updatedMessages);
      
      // 可选：自动向AI发送关于文件的提示
      if (result.uri) {
        setInputText(`我上传了一个名为 "${result.name}" 的文件，请分析其内容`);
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      Alert.alert('错误', '上传文件失败');
    } finally {
      setUploadingFile(false);
    }
  };

  // 朗读文本
  const handleSpeakText = (text: string) => {
    try {
      speakText(text);
    } catch (error) {
      console.error('语音播放失败:', error);
      Alert.alert('错误', '语音播放失败');
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // 渲染消息气泡
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    // 加载中的消息
    if (item.isLoading) {
      return (
        <View style={[
          styles.messageBubble,
          styles.aiMessageBubble,
          { backgroundColor: theme.colors.card }
        ]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>AI思考中...</Text>
          </View>
        </View>
      );
    }
    
    // 图片消息
    if (item.imageUrl) {
      return (
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}>
          <ImageMessageBubble 
            uri={item.imageUrl}
            isUser={isUser}
            style={{ 
              backgroundColor: isUser ? theme.colors.primary : theme.colors.card
            }}
          />
        </View>
      );
    }
    
    // 文件消息
    if (item.filePath) {
      return (
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}>
          <FileMessageBubble
            uri={item.filePath}
            fileName={item.fileName || '未知文件'}
            fileSize={item.fileSize || 0}
            fileType={item.fileType || 'unknown'}
            isUser={isUser}
            style={{ 
              backgroundColor: isUser ? theme.colors.primary : theme.colors.card
            }}
          />
        </View>
      );
    }
    
    // 文本消息
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? [styles.userMessageBubble, { backgroundColor: theme.colors.primary }] :
                   [styles.aiMessageBubble, { backgroundColor: theme.colors.card }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : theme.colors.text }
          ]}>
            {item.content}
          </Text>
          
          {/* 语音按钮 (仅AI消息) */}
          {!isUser && (
            <VoiceButton 
              text={item.content} 
              style={styles.voiceButton}
            />
          )}
        </View>
        
        {/* 消息时间 */}
        <Text style={[styles.messageTime, { color: theme.colors.text + '80' }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  // 渲染聊天列表
  const renderChatList = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>加载聊天...</Text>
        </View>
      );
    }
    
    if (messages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../assets/chat-empty.png')} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            开始新对话
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.text + '99' }]}>
            发送消息、图片或文件，开始与AI助手对话
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatListContent}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, { color: theme.colors.primary }]}>返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {chat?.title || '新对话'}
        </Text>
        <View style={{ width: 50 }} />
      </View>
      
      {/* 聊天区域 */}
      <View style={styles.chatContainer}>
        {renderChatList()}
      </View>
      
      {/* 输入区域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          {/* 附加功能按钮 */}
          <View style={styles.attachButtons}>
            <TouchableOpacity 
              style={[styles.attachButton, { backgroundColor: theme.colors.background }]}
              onPress={handleUploadImage}
              disabled={sending || uploadingImage}
            >
              <Text style={styles.attachButtonIcon}>🖼️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.attachButton, { backgroundColor: theme.colors.background }]}
              onPress={handleUploadFile}
              disabled={sending || uploadingFile}
            >
              <Text style={styles.attachButtonIcon}>📎</Text>
            </TouchableOpacity>
          </View>
          
          {/* 文本输入框 */}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
            placeholder="输入消息..."
            placeholderTextColor={theme.colors.text + '50'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
          />
          
          {/* 发送按钮 */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.primary + '50',
                opacity: sending ? 0.7 : 1
              }
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '发送中' : '发送'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  voiceButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  attachButtons: {
    flexDirection: 'row',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ChatScreen; 