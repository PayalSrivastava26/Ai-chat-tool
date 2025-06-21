export const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyDo_nRnkQMsAsf65p6zDUV_JbQfDX9CsoA"

export const APP_CONFIG = {
  name: "ChatTrix AI",
  version: "1.0.0",
  description: "Your intelligent AI assistant",
  maxHistoryItems: 20,
  themes: {
    DARK: 'dark',
    LIGHT: 'light'
  }
}

// Default export for easier importing
const constants = {
  URL,
  APP_CONFIG
}

export default constants