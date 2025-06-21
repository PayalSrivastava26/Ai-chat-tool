// src/contexts/ChatContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ChatContext = createContext()

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [chatSessions, setChatSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Load chat sessions from memory on mount
  useEffect(() => {
    const savedSessions = sessionStorage.getItem('chatSessions')
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions)
        setChatSessions(sessions)
        // Set current session to the most recent one
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id)
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error)
      }
    }
  }, [])

  // Save chat sessions to sessionStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      sessionStorage.setItem('chatSessions', JSON.stringify(chatSessions))
    }
  }, [chatSessions])

  // Create a new chat session
  const createNewSession = (title = null) => {
    const newSession = {
      id: Date.now().toString(),
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    return newSession.id
  }

  // Add message to current session
  const addMessageToSession = (sessionId, message, type = 'user') => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: [...session.messages, { 
                id: Date.now(),
                text: message,
                type,
                timestamp: new Date().toISOString()
              }],
              updatedAt: new Date().toISOString()
            }
          : session
      )
    )
  }

  // Get current session
  const getCurrentSession = () => {
    return chatSessions.find(session => session.id === currentSessionId)
  }

  // Delete a session
  const deleteSession = (sessionId) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId))
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId)
      setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null)
    }
  }

  // Update session title
  const updateSessionTitle = (sessionId, newTitle) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle, updatedAt: new Date().toISOString() }
          : session
      )
    )
  }

  // Clear all sessions
  const clearAllSessions = () => {
    setChatSessions([])
    setCurrentSessionId(null)
    sessionStorage.removeItem('chatSessions')
  }

  // File upload functions
  const addUploadedFile = (file) => {
    const fileData = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      content: null, // Will be populated after processing
      uploadedAt: new Date().toISOString()
    }
    setUploadedFiles(prev => [...prev, fileData])
    return fileData.id
  }

  const updateFileContent = (fileId, content) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, content }
          : file
      )
    )
  }

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  const value = {
    // Session management
    chatSessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    addMessageToSession,
    getCurrentSession,
    deleteSession,
    updateSessionTitle,
    clearAllSessions,
    
    // File management
    uploadedFiles,
    addUploadedFile,
    updateFileContent,
    removeUploadedFile,
    clearUploadedFiles
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}