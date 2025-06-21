import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as chatStorage from '../utils/chatStorage';

export const ChatContext = createContext(); // ✅ Exported for external access

const initialState = {
  chats: [],
  currentChatId: null,
  currentChat: null,
  isLoading: false,
  error: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'LOAD_CHATS':
      return {
        ...state,
        chats: action.payload,
        isLoading: false,
        error: null
      };

    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChatId: action.payload.id,
        currentChat: action.payload
      };

    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChatId: action.payload.id,
        currentChat: action.payload
      };

    case 'UPDATE_CHAT':
      const updatedChats = state.chats.map(chat =>
        chat.id === action.payload.id ? action.payload : chat
      );
      return {
        ...state,
        chats: updatedChats,
        currentChat: state.currentChatId === action.payload.id ? action.payload : state.currentChat
      };

    case 'DELETE_CHAT':
      const filteredChats = state.chats.filter(chat => chat.id !== action.payload);
      const newCurrentChat = state.currentChatId === action.payload
        ? (filteredChats.length > 0 ? filteredChats[0] : null)
        : state.currentChat;

      return {
        ...state,
        chats: filteredChats,
        currentChatId: newCurrentChat?.id || null,
        currentChat: newCurrentChat
      };

    case 'ADD_MESSAGE':
      if (!state.currentChat) return state;

      const updatedCurrentChat = {
        ...state.currentChat,
        messages: [...state.currentChat.messages, action.payload],
        updatedAt: new Date().toISOString()
      };

      const updatedChatsWithMessage = state.chats.map(chat =>
        chat.id === state.currentChatId ? updatedCurrentChat : chat
      );

      return {
        ...state,
        chats: updatedChatsWithMessage,
        currentChat: updatedCurrentChat
      };

    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chats = await chatStorage.getAllChats();
      dispatch({ type: 'LOAD_CHATS', payload: chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createNewChat = async (title = 'New Chat') => {
    try {
      const newChat = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await chatStorage.saveChat(newChat);
      dispatch({ type: 'CREATE_CHAT', payload: newChat });
      return newChat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectChat = async (chatId) => {
    try {
      const chat = await chatStorage.getChat(chatId);
      if (chat) {
        dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateChat = async (chatId, updates) => {
    try {
      const updatedChat = await chatStorage.updateChat(chatId, updates);
      dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
      return updatedChat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatStorage.deleteChat(chatId);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addMessage = async (message) => {
    try {
      if (!state.currentChat) return;

      const messageWithId = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: messageWithId });

      const updatedChat = {
        ...state.currentChat,
        messages: [...state.currentChat.messages, messageWithId],
        updatedAt: new Date().toISOString()
      };

      await chatStorage.saveChat(updatedChat);

      return messageWithId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    createNewChat,
    selectChat,
    updateChat,
    deleteChat,
    addMessage,
    clearError,
    loadChats
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
