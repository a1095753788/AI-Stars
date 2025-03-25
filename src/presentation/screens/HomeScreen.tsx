import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  PermissionsAndroid
} from 'react-native';
import { useTheme, lightTheme } from '../theme/ThemeContext';
import { getChatHistory, saveChat, getLanguage, getApiConfigs, getActiveApiConfig, getPromptTemplates } from '../../utils/storageService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { generateUUID } from '../../utils/commonUtils';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Message, Chat, PromptTemplate } from '../../types/state';
import MessageBubble from '../components/chat/MessageBubble';
import ErrorDisplay from '../components/common/ErrorDisplay';
import NetworkStatusBanner from '../components/common/NetworkStatusBanner';
import { setLanguage } from '../../store/slices/settingsSlice';
import { useTranslation } from '../../i18n';
import MediaPicker from '../components/chat/MediaPicker';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

/**
 * 主屏幕组件
 * 显示聊天界面，提供新建聊天和进入设置的入口
 */
const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };
  const { t } = useTranslation();
  
  // 安全获取翻译文本，避免对象错误
  const safeTranslate = (key: string, fallback: string): string => {
    const result = t(key);
    return typeof result === 'string' ? result : fallback;
  };
  
  // 聊天状态
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setUploadingImage] = useState(false);
  
  const flatListRef = useRef<FlatList<Message>>(null);
  
  // 添加网络状态钩子
  const { isConnected, isInternetReachable, reconnect } = useNetworkStatus();
  const isNetworkAvailable = isConnected && isInternetReachable;
  
  // 添加媒体选择器状态
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  
  // 修改useEffect监听route.params的方式
  useEffect(() => {
    const templateContent = route.params?.templateContent;
    if (templateContent) {
      // 去除内容末尾的空白字符
      const cleanContent = templateContent.trimEnd();
      console.log('主页接收到模板内容参数，长度:', cleanContent.length);
      console.log('内容预览:', cleanContent.substring(0, 50) + (cleanContent.length > 50 ? '...' : ''));
      
      // 直接设置到输入框
      setInputText(cleanContent);
      
      // 重置参数
      navigation.setParams({ 
        templateContent: undefined,
        timestamp: undefined
      });
      
      console.log('输入框内容已设置，当前值长度:', cleanContent.length);
    }
  }, [route.params?.timestamp]); // 使用timestamp作为触发器
  
  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 加载语言设置
        const lang = await getLanguage();
        if (lang) dispatch(setLanguage(lang));
        
        // 检查API配置
        const configs = await getApiConfigs();
        if (configs && configs.length > 0) {
          setApiConfigured(true);
        } else {
          setError(language === 'zh' ? 
            '未找到API配置，请在设置中配置API' : 
            'No API configuration found, please set up API in settings');
          return;
        }
        
        // 创建新聊天（如果没有）
        if (!chat) {
          createNewChat();
        }
      } catch (err) {
        console.error('初始化数据失败:', err);
        setError(language === 'zh' ? '加载数据失败' : 'Failed to load data');
      }
    };
    
    initializeData();
  }, [language, dispatch]);
  
  // 检查网络状态
  useEffect(() => {
    if (!isNetworkAvailable && !error) {
      setError(language === 'zh' ? '网络连接已断开' : 'Network connection lost');
    } else if (isNetworkAvailable && error && 
               (error === '网络连接已断开' || error === 'Network connection lost')) {
      setError(null);
    }
  }, [isNetworkAvailable, error, language]);
  
  // 创建新聊天
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateUUID(),
      title: language === 'zh' ? '新对话' : 'New Chat',
      messages: [],
      timestamp: Date.now(),
      modelId: 'default'
    };
    
    setChat(newChat);
    setMessages([]);
    setInputText('');
    
    try {
      saveChat(newChat);
    } catch (err) {
      console.error('保存新聊天失败:', err);
    }
  }, [language]);
  
  // 更新并保存聊天记录
  const updateChat = useCallback(async (updatedMessages: Message[]) => {
    if (!chat) return;
    
    try {
      // 如果是第一条消息，使用用户消息的前15个字符作为标题
      const firstUserMessage = updatedMessages.find(msg => msg.role === 'user');
      const needsTitleUpdate = chat.title === (language === 'zh' ? '新对话' : 'New Chat') && firstUserMessage;
      
      const chatTitle = needsTitleUpdate && firstUserMessage
        ? firstUserMessage.content.substring(0, 15) + (firstUserMessage.content.length > 15 ? '...' : '')
        : chat.title;
      
      const updatedChat: Chat = {
        ...chat,
        title: chatTitle,
        messages: updatedMessages,
        timestamp: Date.now()
      };
      
      setChat(updatedChat);
      setMessages(updatedMessages);
      
      // 保存到存储
      await saveChat(updatedChat);
    } catch (err) {
      console.error('保存聊天记录失败:', err);
      const errorMsg = language === 'zh' ? '保存聊天记录失败' : 'Failed to save chat';
      setError(errorMsg);
    }
  }, [chat, language]);
  
  // 处理发送消息
  const handleSendMessage = useCallback(async () => {
    // 检查输入是否为空或正在处理中
    if (!inputText.trim() || isProcessing) {
      console.log('未发送消息原因:', !inputText.trim() ? '输入为空' : '正在处理中');
      return;
    }
    
    console.log('开始处理发送消息，当前输入:', inputText.substring(0, 20));
    
    // 保存当前输入文本备份
    const messageToSend = inputText.trim();
    
    // 立即清空输入框 - 在setState后添加回调确保已清空
    setInputText('');
    console.log('已执行清空输入框操作');
    
    // 设置处理中状态
    setIsProcessing(true);
    
    try {
      if (!apiConfigured) {
        console.error('API未配置');
        throw new Error(language === 'zh' ? '未配置API' : 'API not configured');
      }
      
      if (!isNetworkAvailable) {
        console.error('网络不可用');
        throw new Error(language === 'zh' ? '网络连接不可用' : 'Network connection unavailable');
      }
      
      // 确保chat对象存在
      if (!chat) {
        console.log('聊天对象不存在，创建新聊天');
        await createNewChat();
      }
      
      // 创建用户消息
      const userMessage: Message = {
        id: generateUUID(),
        role: 'user',
        content: messageToSend,
        timestamp: Date.now(),
        chatId: chat?.id || '',
      };
      
      console.log('已创建用户消息:', userMessage.content.substring(0, 20) + '...');
      
      // 添加用户消息到列表
      const updatedMessages = [...messages, userMessage];
      
      // 创建AI消息占位
      const aiMessagePlaceholder: Message = {
        id: generateUUID(),
        role: 'assistant',
        content: language === 'zh' ? '思考中...' : 'Thinking...',
        timestamp: Date.now() + 1,
        isLoading: true,
        chatId: chat?.id || '',
      };
      
      // 添加消息到UI
      const messagesWithPlaceholder = [...updatedMessages, aiMessagePlaceholder];
      setMessages(messagesWithPlaceholder);
      
      // 先保存用户消息
      await updateChat(updatedMessages);
      
      // 滚动到底部
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
      
      // 获取活跃的API配置
      const activeConfigId = await getActiveApiConfig();
      console.log('获取活跃API配置ID:', activeConfigId);
      
      if (!activeConfigId) {
        throw new Error(language === 'zh' ? '未找到活跃的API配置' : 'No active API configuration found');
      }
      
      // 获取所有配置
      const apiConfigs = await getApiConfigs();
      const activeConfig = apiConfigs.find(config => config.id === activeConfigId);
      
      if (!activeConfig) {
        console.error('未找到匹配的API配置');
        throw new Error(language === 'zh' ? '未找到匹配的API配置' : 'No matching API configuration found');
      }
      
      console.log('准备调用API:', activeConfig.provider, activeConfig.model);
      
      // 调用API服务
      const { sendApiRequest } = await import('../../services/api');
      
      try {
        console.log('发送请求到API...');
        // 发送消息到API
        const response = await sendApiRequest(
          updatedMessages,
          {
            ...activeConfig,
            isActive: true,
            supportsStreaming: true,
            supportsMultimodal: false
          },
          {
            timeout: 60000, // 60秒超时
            enableCache: true, // 启用缓存
            cacheTime: 24 * 60 * 60 * 1000 // 缓存1天
          }
        );
        
        console.log('收到API响应:', response.error ? '出错' : '成功');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // 创建AI消息
        const aiMessage: Message = {
          id: aiMessagePlaceholder.id,
          role: 'assistant',
          content: response.content || '',
          timestamp: Date.now(),
          chatId: chat?.id || '',
        };
        
        console.log('创建AI回复消息:', aiMessage.content.substring(0, 50) + (aiMessage.content.length > 50 ? '...' : ''));
        
        // 更新消息列表，替换占位消息
        const finalMessages = messagesWithPlaceholder.map(msg => 
          msg.id === aiMessagePlaceholder.id ? aiMessage : msg
        );
        
        // 更新聊天记录
        await updateChat(finalMessages);
        console.log('成功更新聊天记录');
      } catch (apiError) {
        console.error('API调用失败详情:', apiError);
        
        // 创建错误标记的AI消息
        const errorMessage: Message = {
          id: aiMessagePlaceholder.id,
          role: 'assistant',
          content: language === 'zh' 
            ? `未能获取回复: ${apiError instanceof Error ? apiError.message : '未知错误'}` 
            : `Failed to get response: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
          timestamp: Date.now(),
          chatId: chat?.id || '',
          isError: true, // 标记为错误消息
        };
        
        console.log('添加错误消息');
        
        // 更新消息列表，替换占位消息
        const messagesWithError = messagesWithPlaceholder.map(msg => 
          msg.id === aiMessagePlaceholder.id ? errorMessage : msg
        );
        
        // 更新聊天记录 - 保留用户消息和错误消息
        await updateChat(messagesWithError);
        
        // 设置错误状态 - 供用户查看
        setError(apiError instanceof Error ? apiError.message : 
          (language === 'zh' ? '调用API失败' : 'Failed to call API'));
      }
    } catch (err) {
      console.error('发送消息失败详细错误:', err);
      setError(language === 'zh' ? '发送消息失败' : 'Failed to send message');
    } finally {
      setIsProcessing(false);
      console.log('消息处理完成');
    }
  }, [apiConfigured, chat, inputText, language, messages, isNetworkAvailable, updateChat, createNewChat]);
  
  // 处理图片查看
  const handleImagePress = useCallback((url: string) => {
    Alert.alert(
      language === 'zh' ? '图片' : 'Image',
      url,
      [
        { text: language === 'zh' ? '关闭' : 'Close' }
      ]
    );
  }, [language]);
  
  // 打开提示词
  const handleOpenPrompts = () => {
    // 导航到提示词选择器界面
    navigation.navigate('PromptSelector');
  };
  
  // 媒体选择相关功能
  const openMediaPicker = useCallback(() => {
    setIsMediaPickerVisible(true);
  }, []);
  
  // 处理选择的图片
  const handleImageSelected = useCallback(async (imageInfo: any) => {
    console.log('选择的图片:', imageInfo);
    if (imageInfo && imageInfo.uri) {
      try {
        setUploadingImage(true);
        
        // 1. 先压缩图片
        const { compressImage } = await import('../../utils/imageService');
        const compressedImage = await compressImage({
          uri: imageInfo.uri,
          width: imageInfo.width || 800,
          height: imageInfo.height || 600,
          fileName: imageInfo.fileName,
          fileSize: imageInfo.fileSize,
          type: imageInfo.type
        });
        
        console.log('图片压缩完成:', compressedImage.fileSize);
        
        // 2. 将图片转换为base64
        const { imageToBase64 } = await import('../../utils/imageService');
        const base64Image = await imageToBase64(compressedImage.uri);
        
        if (!base64Image) {
          throw new Error(language === 'zh' ? '图片转换失败' : 'Image conversion failed');
        }
        
        console.log('图片转换为base64完成，长度:', base64Image.length);
        
        // 3. 处理图片消息
        
        // 获取当前对话
        if (!chat) {
          console.log('聊天对象不存在，创建新聊天');
          await createNewChat();
        }
        
        // 创建带图片的用户消息
        const userMessage: Message = {
          id: generateUUID(),
          role: 'user',
          content: inputText || '',
          timestamp: Date.now(),
          chatId: chat?.id || '',
          imageUrl: compressedImage.uri,
        };
        
        // 添加用户消息到列表
        const updatedMessages = [...messages, userMessage];
        
        // 创建AI消息占位
        const aiMessagePlaceholder: Message = {
          id: generateUUID(),
          role: 'assistant',
          content: language === 'zh' ? '分析图片中...' : 'Analyzing image...',
          timestamp: Date.now() + 1,
          isLoading: true,
          chatId: chat?.id || '',
        };
        
        // 添加消息到UI
        const messagesWithPlaceholder = [...updatedMessages, aiMessagePlaceholder];
        setMessages(messagesWithPlaceholder);
        
        // 保存用户消息
        await updateChat(updatedMessages);
        
        // 清空输入框
        setInputText('');
        
        // 滚动到底部
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
        
        // 获取活跃的API配置
        const activeConfigId = await getActiveApiConfig();
        const apiConfigs = await getApiConfigs();
        const activeConfig = apiConfigs.find(config => config.id === activeConfigId);
        
        if (!activeConfig) {
          throw new Error(language === 'zh' ? '未找到匹配的API配置' : 'No matching API configuration found');
        }
        
        // 使用base64图片发送API请求
        // 注意：实际发送需要根据API提供商的要求调整图片格式
        
        try {
          // TODO: 这里可以根据API实现发送带图片的消息
          // 例如：将base64Image作为消息的一部分发送
          
          // 调用API服务发送带图片的请求
          const { sendImageApiRequest } = await import('../../services/api');
          
          const response = await sendImageApiRequest(
            updatedMessages,
            base64Image,
            {
              ...activeConfig,
              isActive: true,
              supportsMultimodal: true, // 确保支持多模态输入
            },
            {
              timeout: 90000, // 图片处理可能需要更长时间
              enableCache: true,
            }
          );
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          // 创建AI消息
          const aiMessage: Message = {
            id: aiMessagePlaceholder.id,
            role: 'assistant',
            content: response.content || (language === 'zh' 
              ? `我收到了您的图片${userMessage.content ? `和消息"${userMessage.content}"` : ''}。这是一张${compressedImage.width}x${compressedImage.height}的图片。`
              : `I received your image${userMessage.content ? ` and message "${userMessage.content}"` : ''}. This is a ${compressedImage.width}x${compressedImage.height} image.`),
            timestamp: Date.now(),
            chatId: chat?.id || '',
          };
          
          // 更新消息列表，替换占位消息
          const finalMessages = messagesWithPlaceholder.map(msg => 
            msg.id === aiMessagePlaceholder.id ? aiMessage : msg
          );
          
          // 更新聊天记录
          await updateChat(finalMessages);
          
        } catch (apiError) {
          console.error('发送图片到API失败:', apiError);
          
          // 创建错误标记的AI消息
          const errorMessage: Message = {
            id: aiMessagePlaceholder.id,
            role: 'assistant',
            content: language === 'zh' 
              ? `未能处理图片: ${apiError instanceof Error ? apiError.message : '未知错误'}` 
              : `Failed to process image: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
            timestamp: Date.now(),
            chatId: chat?.id || '',
            isError: true,
          };
          
          // 更新消息列表，替换占位消息
          const messagesWithError = messagesWithPlaceholder.map(msg => 
            msg.id === aiMessagePlaceholder.id ? errorMessage : msg
          );
          
          // 更新聊天记录
          await updateChat(messagesWithError);
        }
      } catch (error) {
        console.error('处理图片失败:', error);
        Alert.alert(
          language === 'zh' ? '图片处理失败' : 'Image Processing Failed',
          language === 'zh' 
            ? `处理图片时发生错误: ${error instanceof Error ? error.message : '未知错误'}` 
            : `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`,
          [{ text: language === 'zh' ? '确定' : 'OK' }]
        );
      } finally {
        setUploadingImage(false);
      }
    }
  }, [language, chat, messages, inputText, createNewChat, updateChat]);
  
  // 处理选择的文件
  const handleFileSelected = useCallback((fileInfo: any) => {
    console.log('选择的文件:', fileInfo);
    if (fileInfo && fileInfo.length > 0) {
      const file = fileInfo[0];
      // 这里可以将文件添加到消息中或上传文件
      Alert.alert(
        language === 'zh' ? '已选择文件' : 'File Selected',
        language === 'zh' ? `已选择文件: ${file.name || '文件'}` : `Selected file: ${file.name || 'file'}`,
        [{ text: language === 'zh' ? '确定' : 'OK' }]
      );
    }
  }, [language]);
  
  // 打开设置
  const handleOpenSettings = async () => {
    // 请求存储权限
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: language === 'zh' ? '存储权限申请' : 'Storage Permission',
            message: language === 'zh' 
              ? '应用需要访问您的存储以保存和读取文件' 
              : 'App needs access to your storage to save and read files',
            buttonNeutral: language === 'zh' ? '稍后询问' : 'Ask Me Later',
            buttonNegative: language === 'zh' ? '拒绝' : 'Cancel',
            buttonPositive: language === 'zh' ? '允许' : 'OK'
          }
        );
        
        console.log('存储权限申请结果:', granted);
        
        // 同时申请相机权限
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: language === 'zh' ? '相机权限申请' : 'Camera Permission',
            message: language === 'zh' 
              ? '应用需要访问您的相机以拍摄照片' 
              : 'App needs access to your camera to take photos',
            buttonNeutral: language === 'zh' ? '稍后询问' : 'Ask Me Later',
            buttonNegative: language === 'zh' ? '拒绝' : 'Cancel',
            buttonPositive: language === 'zh' ? '允许' : 'OK'
          }
        );
        
        console.log('相机权限申请结果:', cameraGranted);
        
      } catch (err) {
        console.error('申请权限时出错:', err);
      }
    }
    
    // 导航到设置页面
    navigation.navigate('Settings');
  };
  
  // 处理历史记录
  const handleOpenHistory = () => {
    navigation.navigate('History');
  };
  
  // 优化输入框高度自适应逻辑，修复未显示全部内容的问题
  const calculateInputHeight = (text: string) => {
    const numLines = (text.match(/\n/g) || []).length + 1;
    // 改进估算逻辑：考虑更多因素，包括长单词和标点符号
    const charsPerLine = 25;
    const lineEstimateByLength = Math.ceil(text.length / charsPerLine);
    const estimatedLines = Math.max(numLines, lineEstimateByLength);
    
    // 调整每行高度和最大高度限制
    const lineHeight = 24;
    const minHeight = 44;
    const maxHeight = 200; // 增加最大高度
    
    return Math.min(maxHeight, Math.max(minHeight, estimatedLines * lineHeight));
  };
  
  // 渲染聊天内容
  const renderChatContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5E56E7" />
          <Text style={styles.loadingText}>
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </Text>
        </View>
      );
    }
    
    if (messages.length === 0) {
      return (
        <View style={styles.content}>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { color: theme.colors.primary }]}>
              {safeTranslate('welcome.title', '寄意星，随风起')}
            </Text>
            <Text style={styles.welcomeText}>
              {safeTranslate('welcome.companyName', '沭阳县寄意星电子商务经营部欢迎您')}
            </Text>
            <Text style={styles.welcomeSubText}>
              {safeTranslate('welcome.companyNameEn', 'Welcome to Shuyang County Jiyi Star E-commerce Department')}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageBubble 
            message={item} 
            language={language as 'zh' | 'en'}
            onImagePress={handleImagePress}
          />
        )}
        contentContainerStyle={styles.messageList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
    );
  };
  
  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor: theme.colors.background }
        ]}
      >
        <View style={styles.statusBarSpacer} />
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* 头部 */}
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity onPress={handleOpenHistory} style={styles.historyButton}>
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                📚
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {safeTranslate('appName', 'AI Chat')}
            </Text>
            <TouchableOpacity onPress={handleOpenSettings} style={styles.headerRight}>
              <Text style={[styles.newChatText, { color: theme.colors.primary }]}>
                ⚙️
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 网络状态提示 */}
          {!isNetworkAvailable && (
            <NetworkStatusBanner 
              language={language as 'zh' | 'en'}
              onRetry={reconnect}
            />
          )}
          
          {/* 错误提示 */}
          {error && (
            <ErrorDisplay
              message={error}
              onRetry={() => setError(null)}
              retryText={language === 'zh' ? '关闭' : 'Dismiss'}
            />
          )}
          
          {/* 主要内容区域 */}
          <View style={styles.chatContainer}>
            {renderChatContent()}
          </View>
          
          {/* 底部输入框 */}
          <View style={[
            styles.inputContainer,
            { 
              borderTopColor: theme.isDark ? '#333333' : '#F0F0F0',
              backgroundColor: theme.colors.background
            }
          ]}>
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.inputActionButton} onPress={openMediaPicker}>
                <Text style={[styles.inputActionIcon, { color: theme.colors.primary }]}>📎</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  height: calculateInputHeight(inputText)
                }
              ]}
              placeholder={language === 'zh' ? "输入消息..." : "Type a message..."}
              placeholderTextColor={theme.colors.placeholder}
              value={inputText}
              onChangeText={(text) => {
                console.log('输入文本变化，新长度:', text.length);
                setInputText(text);
              }}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.sendButton,
                  alignSelf: 'center' // 确保按钮垂直居中
                },
                (!inputText.trim() || isProcessing) && { opacity: 0.6 }
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isProcessing || !apiConfigured || !isNetworkAvailable}
            >
              <Text style={styles.sendButtonIcon}>
                {isProcessing ? '⏳' : '🚀'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 底部导航栏 */}
          <View style={[
            styles.tabBar, 
            { 
              backgroundColor: theme.colors.background,
              borderTopColor: theme.isDark ? '#333333' : '#F0F0F0' 
            }
          ]}>
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={createNewChat}
            >
              <Text style={[styles.tabIcon, { color: theme.colors.primary }]}>➕</Text>
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }]}>新对话</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={handleOpenPrompts}
            >
              <Text style={[styles.tabIcon, { color: theme.colors.primary }]}>💡</Text>
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }]}>提示词</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={openMediaPicker}
            >
              <Text style={[styles.tabIcon, { color: theme.colors.primary }]}>📎</Text>
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }]}>媒体</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={handleOpenHistory}
            >
              <Text style={[styles.tabIcon, { color: theme.colors.primary }]}>📚</Text>
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }]}>历史</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        
        {/* 媒体选择器模态框 */}
        <Modal
          visible={isMediaPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsMediaPickerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <MediaPicker
                onImageSelected={handleImageSelected}
                onFileSelected={handleFileSelected}
                onDismiss={() => setIsMediaPickerVisible(false)}
                language={language as 'zh' | 'en'}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  historyButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    padding: 8,
  },
  newChatText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 450,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  messageList: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  inputActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  inputActionButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  inputActionIcon: {
    fontSize: 18,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingLeft: 2,
    paddingTop: 1,
  },
  sendButtonIcon: {
    color: 'white',
    fontSize: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default HomeScreen; 