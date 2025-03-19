// 消息相关类型定义
import { Message } from './api';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  fileCount: number;
  imageCount: number;
}

export interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
} 