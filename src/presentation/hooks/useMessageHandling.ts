import { useCallback, useState } from 'react';
import { Message } from '../../types/state';
import { generateUUID } from '../../utils/commonUtils';
import { getActiveApiConfig, getApiConfigs } from '../../utils/storageService';

/**
 * 消息处理钩子
 * 处理发送文本和多媒体消息
 */
const useMessageHandling = (
  language: 'zh' | 'en',
  chat: any,
  messages: Message[],
  updateChat: (messages: Message[]) => Promise<void>,
  createNewChat: () => any,
  flatListRef: any
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setUploadingImage] = useState(false);

  // 处理发送消息
  const handleSendMessage = useCallback(async (
    inputText: string, 
    setInputText: (text: string) => void,
    isNetworkAvailable: boolean,
    apiConfigured: boolean,
    setError: (error: string | null) => void
  ) => {
    // 检查输入是否为空或正在处理中
    if (!inputText.trim() || isProcessing) {
      console.log('未发送消息原因:', !inputText.trim() ? '输入为空' : '正在处理中');
      return;
    }
    
    console.log('开始处理发送消息，当前输入:', inputText.substring(0, 20));
    
    // 保存当前输入文本备份
    const messageToSend = inputText.trim();
    
    // 立即清空输入框
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
      const currentChat = chat || await createNewChat();
      
      // 创建用户消息
      const userMessage: Message = {
        id: generateUUID(),
        role: 'user',
        content: messageToSend,
        timestamp: Date.now(),
        chatId: currentChat.id || '',
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
        chatId: currentChat.id || '',
      };
      
      // 添加消息到UI
      const messagesWithPlaceholder = [...updatedMessages, aiMessagePlaceholder];
      
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
          chatId: currentChat.id || '',
        };
        
        console.log('创建AI回复消息:', aiMessage.content.substring(0, 50) + (aiMessage.content.length > 50 ? '...' : ''));
        
        // 更新消息列表，替换占位消息
        const finalMessages = messagesWithPlaceholder.map(msg => 
          msg.id === aiMessagePlaceholder.id ? aiMessage : msg
        );
        
        // 更新聊天记录
        await updateChat(finalMessages);
        console.log('成功更新聊天记录');
        
        return { success: true, messages: finalMessages };
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
          chatId: currentChat.id || '',
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
          
        return { success: false, error: apiError };
      }
    } catch (err) {
      console.error('发送消息失败详细错误:', err);
      setError(language === 'zh' ? '发送消息失败' : 'Failed to send message');
      return { success: false, error: err };
    } finally {
      setIsProcessing(false);
      console.log('消息处理完成');
    }
  }, [isProcessing, language, chat, messages, updateChat, createNewChat, flatListRef]);

  // 处理图片消息
  const handleImageMessage = useCallback(async (
    imageInfo: any,
    inputText: string,
    setInputText: (text: string) => void,
    setError: (error: string | null) => void
  ) => {
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
        const currentChat = chat || await createNewChat();
        
        // 创建带图片的用户消息
        const userMessage: Message = {
          id: generateUUID(),
          role: 'user',
          content: inputText || '',
          timestamp: Date.now(),
          chatId: currentChat.id || '',
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
          chatId: currentChat.id || '',
        };
        
        // 添加消息到UI
        const messagesWithPlaceholder = [...updatedMessages, aiMessagePlaceholder];
        
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
        
        try {
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
            chatId: currentChat.id || '',
          };
          
          // 更新消息列表，替换占位消息
          const finalMessages = messagesWithPlaceholder.map(msg => 
            msg.id === aiMessagePlaceholder.id ? aiMessage : msg
          );
          
          // 更新聊天记录
          await updateChat(finalMessages);
          
          return { success: true, messages: finalMessages };
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
            chatId: currentChat.id || '',
            isError: true,
          };
          
          // 更新消息列表，替换占位消息
          const messagesWithError = messagesWithPlaceholder.map(msg => 
            msg.id === aiMessagePlaceholder.id ? errorMessage : msg
          );
          
          // 更新聊天记录
          await updateChat(messagesWithError);
          
          return { success: false, error: apiError };
        }
      } catch (error) {
        console.error('处理图片失败:', error);
        setError(language === 'zh' 
          ? `处理图片时发生错误: ${error instanceof Error ? error.message : '未知错误'}` 
          : `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return { success: false, error: error };
      } finally {
        setUploadingImage(false);
      }
    }
  }, [language, chat, messages, createNewChat, updateChat, flatListRef]);

  return {
    isProcessing,
    isUploadingImage,
    handleSendMessage,
    handleImageMessage
  };
};

export default useMessageHandling; 