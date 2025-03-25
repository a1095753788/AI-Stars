import React, { useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

// 组件导入
import HomeHeader from '../components/home/HomeHeader';
import ChatMessageList from '../components/home/ChatMessageList';
import ChatInputBar from '../components/home/ChatInputBar';

// 自定义钩子导入
import useChatActions from '../hooks/useChatActions';
import useUIState from '../hooks/useUIState';
import useMessageHandling from '../hooks/useMessageHandling';
import useNetworkStatus from '../hooks/useNetworkStatus';

/**
 * 重构后的首页屏幕组件
 * 使用分离的逻辑和子组件
 */
const RefactoredHomeScreen: React.FC = () => {
  // 从Redux获取设置
  const { language, darkMode } = useSelector((state: any) => state.settings);
  
  // 导航
  const navigation = useNavigation<any>();
  
  // 扁平列表引用
  const flatListRef = useRef<FlatList>(null);
  
  // 网络状态钩子
  const { 
    isNetworkAvailable,
    isApiConfigured,
    checkApiConfigStatus 
  } = useNetworkStatus();
  
  // 聊天操作钩子
  const { 
    chat, 
    messages, 
    error: chatError,
    createNewChat, 
    updateChat 
  } = useChatActions();
  
  // UI状态钩子
  const { 
    inputText, 
    error, 
    isModalVisible,
    isImagePickerVisible,
    autoscrollEnabled,
    selectedImage,
    setInputText,
    setError,
    showError,
    handleInputChange,
    toggleModal,
    toggleImagePicker,
    toggleAutoscroll,
    clearSelectedImage,
    handleImageSelected
  } = useUIState();
  
  // 消息处理钩子
  const { 
    isProcessing,
    isUploadingImage,
    handleSendMessage,
    handleImageMessage
  } = useMessageHandling(
    language,
    chat,
    messages,
    updateChat,
    createNewChat,
    flatListRef
  );
  
  // 合并错误信息
  useEffect(() => {
    if (chatError) {
      showError(chatError);
    }
  }, [chatError, showError]);
  
  // 初始化时检查API配置状态
  useEffect(() => {
    checkApiConfigStatus();
  }, [checkApiConfigStatus]);
  
  // 处理发送按钮点击
  const onSendPress = useCallback(async () => {
    if (selectedImage) {
      // 处理图片消息
      await handleImageMessage(
        selectedImage,
        inputText,
        setInputText,
        setError
      );
      clearSelectedImage();
    } else {
      // 处理文本消息
      await handleSendMessage(
        inputText,
        setInputText,
        isNetworkAvailable,
        isApiConfigured,
        setError
      );
    }
  }, [
    inputText, 
    selectedImage, 
    handleSendMessage, 
    handleImageMessage, 
    isNetworkAvailable, 
    isApiConfigured, 
    clearSelectedImage,
    setInputText,
    setError
  ]);
  
  // 处理设置按钮点击
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);
  
  // 处理选择图片
  const handleSelectImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        handleImageSelected({
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
          fileName: selectedAsset.fileName,
          fileSize: selectedAsset.fileSize,
          type: selectedAsset.type
        });
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      showError(language === 'zh' ? '选择图片失败' : 'Failed to select image');
    }
  }, [language, handleImageSelected, showError]);
  
  // 处理附件按钮点击
  const handleAttachmentPress = useCallback(() => {
    handleSelectImage();
  }, [handleSelectImage]);
  
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        darkMode ? styles.containerDark : styles.containerLight
      ]}
    >
      {/* 标题栏 */}
      <HomeHeader
        darkMode={darkMode}
        title={language === 'zh' ? '聊天' : 'Chat'}
        onNewChat={createNewChat}
        onSettingsPress={handleSettingsPress}
      />
      
      {/* 聊天消息列表 */}
      <ChatMessageList
        messages={messages}
        flatListRef={flatListRef}
        autoscrollEnabled={autoscrollEnabled}
        language={language}
      />
      
      {/* 输入栏 */}
      <ChatInputBar
        darkMode={darkMode}
        inputText={inputText}
        onChangeText={handleInputChange}
        onSendPress={onSendPress}
        onAttachmentPress={handleAttachmentPress}
        isProcessing={isProcessing}
        isUploadingImage={isUploadingImage}
        selectedImage={selectedImage}
        onClearImage={clearSelectedImage}
        placeholder={language === 'zh' ? '输入消息...' : 'Type a message...'}
      />
      
      {/* 错误提示 */}
      {error && (
        <View style={[
          styles.errorContainer,
          darkMode ? styles.errorContainerDark : styles.errorContainerLight
        ]}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  errorContainerLight: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  errorContainerDark: {
    backgroundColor: 'rgba(211, 47, 47, 0.8)',
  },
  errorContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default RefactoredHomeScreen; 