import React, { useState } from 'react';

import { useChat } from "../context/ChatContext"; // ✅ correct path


import { MessageCircle, Trash2, Edit3, Plus, Search, Calendar } from 'lucide-react';

const ChatHistory = () => {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    selectChat, 
    deleteChat, 
    updateChat,
    isLoading 
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleNewChat = async () => {
    await createNewChat();
  };

  const handleChatSelect = (chatId) => {
    selectChat(chatId);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  const handleEditStart = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSubmit = async (e, chatId) => {
    e.preventDefault();
    if (editTitle.trim()) {
      await updateChat(chatId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreviewText = (messages) => {
    if (messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '');
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex items-center justify-center">
        <div className="text-gray-400">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat History
          </h2>
          <button
            onClick={handleNewChat}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors group ${
                  currentChatId === chat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                      <form onSubmit={(e) => handleEditSubmit(e, chat.id)} className="mb-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleEditCancel}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <h3 className="font-medium truncate mb-1">{chat.title}</h3>
                    )}

                    <p className="text-sm opacity-75 truncate">
                      {getPreviewText(chat.messages)}
                    </p>

                    <div className="flex items-center mt-2 text-xs opacity-60">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(chat.updatedAt)}
                      <span className="ml-2">
                        {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditStart(e, chat)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors mr-1"
                      title="Edit title"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="p-1 hover:bg-red-600 rounded transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {chats.length} chat{chats.length !== 1 ? 's' : ''} total
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
