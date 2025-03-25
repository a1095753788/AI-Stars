import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: {},
  currentChatId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages.push(message);
        state.chats[chatId].updatedAt = Date.now();
      }
    },
    createChat: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      state.chats[id] = {
        id,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.currentChatId = id;
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      delete state.chats[chatId];
      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentChat,
  addMessage,
  createChat,
  deleteChat,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer; 