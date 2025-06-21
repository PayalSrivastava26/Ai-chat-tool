// src/utils/shareUtils.js

// Share methods
export const SHARE_METHODS = {
  LINK: 'link',
  EMAIL: 'email',
  CLIPBOARD: 'clipboard',
  SOCIAL: 'social'
};

// Privacy levels
export const PRIVACY_LEVELS = {
  PUBLIC: 'public',
  UNLISTED: 'unlisted',
  PRIVATE: 'private'
};

// Generate shareable link (simulation - in real app would use backend)
export const generateShareableLink = (session, options = {}) => {
  const {
    privacyLevel = PRIVACY_LEVELS.UNLISTED,
    expiresIn = 7, // days
    includeFiles = false,
    password = null
  } = options;
  
  // Generate a unique share ID (in real app, this would be done on backend)
  const shareId = generateShareId();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiresIn);
  
  // Create share data (this would be stored on backend)
  const shareData = {
    id: shareId,
    sessionId: session.id,
    title: session.title,
    createdAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString(),
    privacyLevel,
    includeFiles,
    password: password ? hashPassword(password) : null,
    accessCount: 0,
    maxAccess: options.maxAccess || null,
    createdBy: 'user', // In real app, would be actual user ID
    
    // Store session data (simplified for demo)
    sessionData: prepareSessionForShare(session, { includeFiles })
  };
  
  // Store in localStorage (in real app, would be sent to backend)
  storeShareData(shareId, shareData);
  
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/shared/${shareId}`;
  
  return {
    shareId,
    url: shareUrl,
    expiresAt: expiryDate.toISOString(),
    privacyLevel,
    includeFiles,
    hasPassword: !!password
  };
};

// Generate unique share ID
const generateShareId = () => {
  return `share_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
};

// Simple password hashing (in real app, use proper hashing)
const hashPassword = (password) => {
  // This is just for demo - use proper hashing in production
  return btoa(password + 'salt');
};

// Prepare session data for sharing
const prepareSessionForShare = (session, options = {}) => {
  const { includeFiles = false } = options;
  
  let messages = session.messages.map(message => {
    const sharedMessage = {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp
    };
    
    // Include files if requested
    if (includeFiles && message.files) {
      sharedMessage.files = message.files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        // Don't include actual file content for security
        hasContent: !!file.content
      }));
    }
    
    return sharedMessage;
  });
  
  return {
    id: session.id,
    title: session.title,
    messages,
    createdAt: session.createdAt,
    messageCount: messages.length
  };
};

// Store share data (localStorage for demo)
const storeShareData = (shareId, shareData) => {
  const existingShares = getStoredShares();
  existingShares[shareId] = shareData;
  localStorage.setItem('sharedSessions', JSON.stringify(existingShares));
};

// Get stored shares
const getStoredShares = () => {
  try {
    const shares = localStorage.getItem('sharedSessions');
    return shares ? JSON.parse(shares) : {};
  } catch (error) {
    console.error('Error loading shared sessions:', error);
    return {};
  }
};

// Get shared session by ID
export const getSharedSession = (shareId, password = null) => {
  const shares = getStoredShares();
  const shareData = shares[shareId];
  
  if (!shareData) {
    return { success: false, error: 'Share not found' };
  }
  
  // Check if expired
  if (new Date() > new Date(shareData.expiresAt)) {
    return { success: false, error: 'Share has expired' };
  }
  
  // Check password if required
  if (shareData.password && (!password || hashPassword(password) !== shareData.password)) {
    return { success: false, error: 'Password required', needsPassword: true };
  }
  
  // Check access limit
  if (shareData.maxAccess && shareData.accessCount >= shareData.maxAccess) {
    return { success: false, error: 'Access limit reached' };
  }
  
  // Increment access count
  shareData.accessCount++;
  storeShareData(shareId, shareData);
  
  return {
    success: true,
    session: shareData.sessionData,
    shareInfo: {
      createdAt: shareData.createdAt,
      expiresAt: shareData.expiresAt,
      accessCount: shareData.accessCount,
      maxAccess: shareData.maxAccess
    }
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, error: error.message };
  }
};

// Share via email
export const shareViaEmail = (shareUrl, sessionTitle, customMessage = '') => {
  const subject = encodeURIComponent(`Chat Session: ${sessionTitle}`);
  const body = encodeURIComponent(
    `${customMessage}\n\nI'm sharing a chat session with you:\n\nTitle: ${sessionTitle}\nLink: ${shareUrl}\n\nThis link will expire in 7 days.`
  );
  
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoLink);
  
  return { success: true };
};

// Share via social media
export const shareViaSocial = (platform, shareUrl, sessionTitle) => {
  const text = encodeURIComponent(`Check out this chat session: ${sessionTitle}`);
  const url = encodeURIComponent(shareUrl);
  
  let shareLink;
  
  switch (platform) {
    case 'twitter':
      shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      break;
    case 'facebook':
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'linkedin':
      shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'reddit':
      shareLink = `https://reddit.com/submit?url=${url}&title=${text}`;
      break;
    default:
      return { success: false, error: 'Unsupported platform' };
  }
  
  window.open(shareLink, '_blank', 'width=600,height=400');
  return { success: true };
};

// Generate share summary
export const generateShareSummary = (session) => {
  const messageCount = session.messages.length;
  const userMessages = session.messages.filter(m => m.role === 'user').length;
  const assistantMessages = session.messages.filter(m => m.role === 'assistant').length;
  const hasFiles = session.messages.some(m => m.files && m.files.length > 0);
  
  const createdDate = new Date(session.createdAt).toLocaleDateString();
  const duration = calculateSessionDuration(session);
  
  return {
    title: session.title,
    messageCount,
    userMessages,
    assistantMessages,
    hasFiles,
    createdDate,
    duration,
    preview: generatePreviewText(session)
  };
};

// Calculate session duration
const calculateSessionDuration = (session) => {
  if (session.messages.length < 2) return 'Less than a minute';
  
  const firstMessage = new Date(session.messages[0].timestamp);
  const lastMessage = new Date(session.messages[session.messages.length - 1].timestamp);
  const diffMs = lastMessage - firstMessage;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'Less than a minute';
  }
};

// Generate preview text
const generatePreviewText = (session) => {
  const firstUserMessage = session.messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    return firstUserMessage.content.length > 100 ? 
      firstUserMessage.content.substring(0, 100) + '...' : 
      firstUserMessage.content;
  }
  return 'No preview available';
};

// Get all user's shares
export const getUserShares = () => {
  const shares = getStoredShares();
  const userShares = Object.values(shares)
    .filter(share => share.createdBy === 'user') // In real app, filter by actual user ID
    .map(share => ({
      id: share.id,
      sessionId: share.sessionId,
      title: share.title,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      privacyLevel: share.privacyLevel,
      accessCount: share.accessCount,
      maxAccess: share.maxAccess,
      hasPassword: !!share.password,
      url: `${window.location.origin}/shared/${share.id}`,
      isExpired: new Date() > new Date(share.expiresAt)
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return userShares;
};

// Delete share
export const deleteShare = (shareId) => {
  const shares = getStoredShares();
  if (shares[shareId]) {
    delete shares[shareId];
    localStorage.setItem('sharedSessions', JSON.stringify(shares));
    return { success: true };
  }
  return { success: false, error: 'Share not found' };
};

// Update share settings
export const updateShareSettings = (shareId, updates) => {
  const shares = getStoredShares();
  const shareData = shares[shareId];
  
  if (!shareData) {
    return { success: false, error: 'Share not found' };
  }
  
  // Validate updates
  if (updates.expiresIn) {
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + updates.expiresIn);
    shareData.expiresAt = newExpiryDate.toISOString();
  }
  
  if (updates.maxAccess !== undefined) {
    shareData.maxAccess = updates.maxAccess;
  }
  
  if (updates.password !== undefined) {
    shareData.password = updates.password ? hashPassword(updates.password) : null;
  }
  
  if (updates.privacyLevel) {
    shareData.privacyLevel = updates.privacyLevel;
  }
  
  storeShareData(shareId, shareData);
  
  return { success: true, share: shareData };
};

// Check if Web Share API is supported
export const isWebShareSupported = () => {
  return navigator.share !== undefined;
};

// Use Web Share API if available
export const nativeShare = async (shareData) => {
  if (!isWebShareSupported()) {
    return { success: false, error: 'Web Share API not supported' };
  }
  
  try {
    await navigator.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    });
    return { success: true };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Share cancelled by user' };
    }
    return { success: false, error: error.message };
  }
};

// Cleanup expired shares
export const cleanupExpiredShares = () => {
  const shares = getStoredShares();
  const now = new Date();
  let cleanedCount = 0;
  
  Object.keys(shares).forEach(shareId => {
    if (new Date(shares[shareId].expiresAt) < now) {
      delete shares[shareId];
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    localStorage.setItem('sharedSessions', JSON.stringify(shares));
  }
  
  return { cleanedCount };
};