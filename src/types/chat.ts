/**
 * 聊天相关类型定义
 */

import { Message } from './api';

/**
 * 聊天会话类型
 */
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  imageCount: number;  // 图片消息数量
  fileCount: number;   // 文件消息数量
  apiConfigId?: string; // 使用的API配置ID
  pinned?: boolean;    // 是否置顶
  archived?: boolean;  // 是否归档
}

/**
 * 聊天历史记录类型
 */
export interface ChatHistory {
  chats: Chat[];
  recentChatIds: string[]; // 最近访问的聊天ID列表
}

/**
 * 创建新聊天的函数参数
 */
export interface CreateChatParams {
  title?: string;
  systemMessage?: string;
  apiConfigId?: string;
}

/**
 * 聊天统计信息
 */
export interface ChatStats {
  totalChats: number;
  totalMessages: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  averageMessagesPerChat: number;
  dateRange: {
    start: number;
    end: number;
  }
}

/**
 * 消息过滤选项
 */
export interface MessageFilter {
  roles?: ('user' | 'assistant' | 'system')[];
  hasImage?: boolean;
  hasFile?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  searchText?: string;
}

/**
 * 聊天排序选项
 */
export enum ChatSortOption {
  DATE_CREATED_DESC = 'dateCreatedDesc',
  DATE_CREATED_ASC = 'dateCreatedAsc',
  DATE_UPDATED_DESC = 'dateUpdatedDesc',
  DATE_UPDATED_ASC = 'dateUpdatedAsc',
  ALPHABETICAL = 'alphabetical',
  MESSAGE_COUNT_DESC = 'messageCountDesc'
} 