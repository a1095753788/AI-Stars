// 消息管理服务
import { Chat } from '../types/message';
import { Message } from '../types/api';

/**
 * 创建新的聊天会话
 * @returns 新的聊天会话
 */
export const createNewChat = (): Chat => {
  const now = Date.now();
  return {
    id: `chat_${now}`,
    title: `新对话 ${new Date(now).toLocaleString()}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
    fileCount: 0,
    imageCount: 0
  };
};

/**
 * 添加消息到聊天会话
 * @param chat 聊天会话
 * @param message 消息
 * @returns 更新后的聊天会话
 */
export const addMessageToChat = (chat: Chat, message: Message): Chat => {
  // 更新文件和图片计数
  let fileCount = chat.fileCount;
  let imageCount = chat.imageCount;
  
  if (message.filePath) {
    fileCount += 1;
  }
  
  if (message.imageUrl) {
    imageCount += 1;
  }
  
  return {
    ...chat,
    messages: [...chat.messages, message],
    updatedAt: Date.now(),
    fileCount,
    imageCount
  };
};

/**
 * 检查是否可以向聊天中添加图片
 * @param chat 当前聊天对象
 * @param allowMultiple 是否允许多图片/文件
 * @returns 是否可以添加图片
 */
export const canAddImageToChat = (chat: Chat, allowMultiple: boolean): boolean => {
  // 如果允许多图片，则没有限制
  if (allowMultiple) {
    return true;
  }
  
  // 否则检查当前聊天是否已有图片
  return chat.imageCount === 0;
};

/**
 * 检查是否可以向聊天中添加文件
 * @param chat 当前聊天对象
 * @param allowMultiple 是否允许多图片/文件
 * @returns 是否可以添加文件
 */
export const canAddFileToChat = (chat: Chat, allowMultiple: boolean): boolean => {
  // 如果允许多文件，则没有限制
  if (allowMultiple) {
    return true;
  }
  
  // 否则检查当前聊天是否已有文件
  return chat.fileCount === 0;
};

/**
 * 根据消息内容生成聊天标题
 * @param messages 消息数组
 * @returns 生成的标题
 */
export const generateChatTitle = (messages: Message[]): string => {
  // 找到第一条用户消息
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  
  if (firstUserMessage) {
    // 如果消息是文本，截取前30个字符作为标题
    if (!firstUserMessage.imageUrl && !firstUserMessage.filePath) {
      const content = firstUserMessage.content || '';
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    
    // 如果是图片消息
    if (firstUserMessage.imageUrl) {
      return '图片对话';
    }
    
    // 如果是文件消息
    if (firstUserMessage.filePath) {
      const fileName = firstUserMessage.filePath.split('/').pop() || '';
      return `文件对话: ${fileName}`;
    }
  }
  
  // 默认标题
  return '新对话';
};

/**
 * 添加或替换消息中的变量
 * @param message 原始消息文本
 * @param variables 变量键值对
 * @returns 替换变量后的消息
 */
export const replaceMessageVariables = (message: string, variables: Record<string, string>): string => {
  let result = message;
  
  // 替换形如 {{varName}} 的变量
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(pattern, value);
  }
  
  return result;
};

/**
 * 将HTML格式的消息转换为纯文本
 * @param htmlMessage HTML格式的消息
 * @returns 纯文本消息
 */
export const stripHtmlFromMessage = (htmlMessage: string): string => {
  // 移除HTML标签
  return htmlMessage.replace(/<[^>]*>/g, '');
};

/**
 * 检查消息是否包含敏感词
 * @param message 要检查的消息
 * @param sensitiveWords 敏感词列表
 * @returns 是否包含敏感词
 */
export const containsSensitiveWords = (message: string, sensitiveWords: string[]): boolean => {
  const lowerMessage = message.toLowerCase();
  
  return sensitiveWords.some(word => {
    const lowerWord = word.toLowerCase();
    return lowerMessage.includes(lowerWord);
  });
}; 