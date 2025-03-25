import { useState, useCallback } from 'react';
import { Message, Chat } from '../../types/state';
import { generateUUID } from '../../utils/commonUtils';
import { saveChat, getChat } from '../../utils/storageService';

/**
 * 聊天操作钩子
 * 管理聊天状态和基本操作
 */
const useChatActions = () => {
  // 聊天状态
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 创建新聊天
  const createNewChat = useCallback(async () => {
    try {
      // 创建新的聊天对象
      const newChat: Chat = {
        id: generateUUID(),
        title: 'New Chat',
        timestamp: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelId: 'default'
      };
      
      console.log('创建新聊天:', newChat.id);
      
      // 保存聊天
      await saveChat(newChat);
      
      // 更新状态
      setChat(newChat);
      setMessages([]);
      
      return newChat;
    } catch (err) {
      console.error('创建新聊天失败:', err);
      setError('创建新聊天失败');
      return null;
    }
  }, []);
  
  // 更新聊天
  const updateChat = useCallback(async (updatedMessages: Message[]) => {
    try {
      if (!chat) {
        console.error('无法更新聊天 - 聊天对象为空');
        return;
      }
      
      // 只有在有用户消息时更新标题
      let updatedTitle = chat.title;
      
      // 如果是新聊天且有用户消息，以第一条用户消息作为标题
      if (chat.title === 'New Chat' && updatedMessages.length > 0) {
        const firstUserMessage = updatedMessages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          // 截取用户消息的前20个字符作为标题
          updatedTitle = firstUserMessage.content.substring(0, 20);
          // 如果内容超过20个字符，添加省略号
          if (firstUserMessage.content.length > 20) {
            updatedTitle += '...';
          }
        }
      }
      
      // 更新聊天对象
      const updatedChat: Chat = {
        ...chat,
        title: updatedTitle,
        timestamp: Date.now(),
        updatedAt: Date.now(),
        messages: updatedMessages
      };
      
      // 保存更新后的聊天
      await saveChat(updatedChat);
      
      // 更新状态
      setChat(updatedChat);
      setMessages(updatedMessages);
    } catch (err) {
      console.error('更新聊天失败:', err);
      setError('更新聊天失败');
    }
  }, [chat]);
  
  // 加载聊天
  const loadChat = useCallback(async (chatId: string) => {
    try {
      // 获取聊天
      const loadedChat = await getChat(chatId);
      
      if (!loadedChat) {
        console.error('找不到聊天:', chatId);
        return false;
      }
      
      // 更新状态
      setChat(loadedChat);
      setMessages(loadedChat.messages || []);
      
      return true;
    } catch (err) {
      console.error('加载聊天失败:', err);
      setError('加载聊天失败');
      return false;
    }
  }, []);
  
  return {
    chat,
    messages,
    error,
    createNewChat,
    updateChat,
    loadChat
  };
};

export default useChatActions; 