// 聊天状态切片
// 注意：实际使用需导入 @reduxjs/toolkit
import { Message } from '../types/api';
import { Chat } from '../types/message';
import { ChatActionTypes, ChatState } from '../types/state';
import { createNewChat, addMessageToChat } from '../utils/messageService';
import { saveChats, saveCurrentChatId } from '../utils/storageService';

// 初始状态
const initialState: ChatState = {
  chats: {},
  currentChatId: null,
  loading: false,
  error: null
};

// 减速器
export const chatReducer = (state = initialState, action: any): ChatState => {
  switch (action.type) {
    case ChatActionTypes.FETCH_CHATS:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ChatActionTypes.FETCH_CHATS_SUCCESS:
      return {
        ...state,
        chats: action.payload.chats,
        currentChatId: action.payload.currentChatId,
        loading: false
      };
    
    case ChatActionTypes.FETCH_CHATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ChatActionTypes.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChatId: action.payload
      };
    
    case ChatActionTypes.CREATE_CHAT:
      const newChat = createNewChat();
      return {
        ...state,
        chats: {
          ...state.chats,
          [newChat.id]: newChat
        },
        currentChatId: newChat.id
      };
    
    case ChatActionTypes.ADD_MESSAGE:
      if (!state.currentChatId) return state;
      
      const currentChat = state.chats[state.currentChatId];
      if (!currentChat) return state;
      
      const updatedChat = addMessageToChat(currentChat, action.payload);
      
      return {
        ...state,
        chats: {
          ...state.chats,
          [state.currentChatId]: updatedChat
        }
      };
    
    case ChatActionTypes.DELETE_CHAT:
      const { [action.payload]: chatToDelete, ...remainingChats } = state.chats;
      
      return {
        ...state,
        chats: remainingChats,
        currentChatId: state.currentChatId === action.payload ? null : state.currentChatId
      };
    
    case ChatActionTypes.RESET_CHAT_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Action Creators
export const fetchChats = () => ({
  type: ChatActionTypes.FETCH_CHATS
});

export const fetchChatsSuccess = (chats: Record<string, Chat>, currentChatId: string | null) => ({
  type: ChatActionTypes.FETCH_CHATS_SUCCESS,
  payload: { chats, currentChatId }
});

export const fetchChatsFailure = (error: string) => ({
  type: ChatActionTypes.FETCH_CHATS_FAILURE,
  payload: error
});

export const setCurrentChat = (chatId: string) => {
  // 保存当前聊天ID
  saveCurrentChatId(chatId);
  
  return {
    type: ChatActionTypes.SET_CURRENT_CHAT,
    payload: chatId
  };
};

export const createChat = () => {
  return {
    type: ChatActionTypes.CREATE_CHAT
  };
};

export const addMessage = (message: Message) => {
  return {
    type: ChatActionTypes.ADD_MESSAGE,
    payload: message
  };
};

export const deleteChat = (chatId: string) => {
  return {
    type: ChatActionTypes.DELETE_CHAT,
    payload: chatId
  };
};

export const resetChatError = () => ({
  type: ChatActionTypes.RESET_CHAT_ERROR
}); 