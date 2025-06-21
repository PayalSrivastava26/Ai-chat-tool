const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chatSessions',
  CURRENT_SESSION: 'currentSession',
  SETTINGS: 'chatSettings',
  CHATS: 'chats' // for backward compatibility
};

// Unique session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new chat session
export const createNewSession = (title = null) => {
  const sessionId = generateSessionId();
  const session = {
    id: sessionId,
    title: title || `Chat ${new Date().toLocaleDateString()}`,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      messageCount: 0,
      lastActivity: new Date().toISOString()
    }
  };

  const sessions = getAllSessions();
  sessions[sessionId] = session;
  localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);

  return session;
};

// Get all chat sessions
export const getAllSessions = () => {
  try {
    const sessions = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    return sessions ? JSON.parse(sessions) : {};
  } catch (error) {
    console.error('Error loading sessions:', error);
    return {};
  }
};

export const getSession = (sessionId) => {
  const sessions = getAllSessions();
  return sessions[sessionId] || null;
};

export const getCurrentSession = () => {
  const currentSessionId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  return currentSessionId ? getSession(currentSessionId) : null;
};

export const updateSession = (sessionId, updates) => {
  const sessions = getAllSessions();
  if (sessions[sessionId]) {
    sessions[sessionId] = {
      ...sessions[sessionId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    return sessions[sessionId];
  }
  return null;
};

export const deleteSession = (sessionId) => {
  const sessions = getAllSessions();
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));

    const currentSessionId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (currentSessionId === sessionId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
    return true;
  }
  return false;
};

export const setCurrentSession = (sessionId) => {
  const session = getSession(sessionId);
  if (session) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    return session;
  }
  return null;
};

// Message management
export const addMessageToSession = (sessionId, message) => {
  const session = getSession(sessionId);
  if (session) {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...message
    };
    session.messages.push(newMessage);
    session.metadata.messageCount = session.messages.length;
    session.metadata.lastActivity = new Date().toISOString();
    updateSession(sessionId, session);
    return newMessage;
  }
  return null;
};

export const updateMessageInSession = (sessionId, messageId, updates) => {
  const session = getSession(sessionId);
  if (session) {
    const index = session.messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      session.messages[index] = {
        ...session.messages[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      updateSession(sessionId, session);
      return session.messages[index];
    }
  }
  return null;
};

export const deleteMessageFromSession = (sessionId, messageId) => {
  const session = getSession(sessionId);
  if (session) {
    session.messages = session.messages.filter(msg => msg.id !== messageId);
    session.metadata.messageCount = session.messages.length;
    updateSession(sessionId, session);
    return true;
  }
  return false;
};

// Settings
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      theme: 'dark',
      autoSave: true,
      exportFormat: 'json',
      maxSessions: 50,
      maxMessagesPerSession: 1000
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

export const updateSettings = (newSettings) => {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
};

// Cleanup
export const cleanupOldSessions = (maxSessions = 50) => {
  const sessions = getAllSessions();
  const sessionList = Object.values(sessions).sort((a, b) =>
    new Date(b.metadata.lastActivity) - new Date(a.metadata.lastActivity)
  );

  if (sessionList.length > maxSessions) {
    const sessionsToDelete = sessionList.slice(maxSessions);
    sessionsToDelete.forEach(session => deleteSession(session.id));
  }
};

export const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return {
    total,
    formatted: `${(total / 1024).toFixed(2)} KB`
  };
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

//
// Compatibility with App.jsx usage:
//

// Save chat to legacy format
export const saveChatToStorage = (chatId, messages, title = 'Untitled Chat') => {
  const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
  chats[chatId] = { messages, title };
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};

// Load a specific chat
export const loadChatFromStorage = (chatId) => {
  const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
  return chats[chatId] || null;
};

// Return all chats
export const getAllChats = () => {
  const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
  return chats;
};

// Delete a chat by id
export const deleteChatFromStorage = (chatId) => {
  const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
  delete chats[chatId];
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};
