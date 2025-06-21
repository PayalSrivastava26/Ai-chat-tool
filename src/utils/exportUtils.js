// src/utils/exportUtils.js

// Export formats
export const EXPORT_FORMATS = {
  JSON: 'json',
  TXT: 'txt',
  MD: 'md',
  CSV: 'csv',
  HTML: 'html'
};

// Generate filename with timestamp
export const generateExportFilename = (sessionTitle, format, timestamp = new Date()) => {
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  const cleanTitle = sessionTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  return `${cleanTitle}_${dateStr}_${timeStr}.${format}`;
};

// Export single session
export const exportSession = (session, format = EXPORT_FORMATS.JSON, options = {}) => {
  const exportData = prepareSessionData(session, options);
  
  switch (format) {
    case EXPORT_FORMATS.JSON:
      return exportAsJSON(exportData);
    
    case EXPORT_FORMATS.TXT:
      return exportAsText(exportData);
    
    case EXPORT_FORMATS.MD:
      return exportAsMarkdown(exportData);
    
    case EXPORT_FORMATS.CSV:
      return exportAsCSV(exportData);
    
    case EXPORT_FORMATS.HTML:
      return exportAsHTML(exportData);
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Export multiple sessions
export const exportMultipleSessions = (sessions, format = EXPORT_FORMATS.JSON, options = {}) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions: sessions.map(session => prepareSessionData(session, options))
  };
  
  switch (format) {
    case EXPORT_FORMATS.JSON:
      return {
        content: JSON.stringify(exportData, null, 2),
        mimeType: 'application/json',
        filename: generateExportFilename('Multiple_Sessions', 'json')
      };
    
    case EXPORT_FORMATS.TXT:
      return {
        content: exportMultipleSessionsAsText(exportData),
        mimeType: 'text/plain',
        filename: generateExportFilename('Multiple_Sessions', 'txt')
      };
    
    case EXPORT_FORMATS.MD:
      return {
        content: exportMultipleSessionsAsMarkdown(exportData),
        mimeType: 'text/markdown',
        filename: generateExportFilename('Multiple_Sessions', 'md')
      };
    
    default:
      throw new Error(`Format ${format} not supported for multiple sessions`);
  }
};

// Prepare session data for export
const prepareSessionData = (session, options = {}) => {
  const {
    includeMetadata = true,
    includeSystemMessages = false,
    includeFileData = true,
    maxMessageLength = null
  } = options;
  
  let processedMessages = session.messages;
  
  // Filter system messages if needed
  if (!includeSystemMessages) {
    processedMessages = processedMessages.filter(msg => msg.role !== 'system');
  }
  
  // Truncate messages if needed
  if (maxMessageLength) {
    processedMessages = processedMessages.map(msg => ({
      ...msg,
      content: msg.content.length > maxMessageLength ? 
        msg.content.substring(0, maxMessageLength) + '...[truncated]' : 
        msg.content
    }));
  }
  
  // Remove file data if not needed
  if (!includeFileData) {
    processedMessages = processedMessages.map(msg => {
      const { files, ...messageWithoutFiles } = msg;
      return messageWithoutFiles;
    });
  }
  
  const exportSession = {
    id: session.id,
    title: session.title,
    messages: processedMessages,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  };
  
  if (includeMetadata) {
    exportSession.metadata = session.metadata;
  }
  
  return exportSession;
};

// JSON Export
const exportAsJSON = (session) => {
  return {
    content: JSON.stringify(session, null, 2),
    mimeType: 'application/json',
    filename: generateExportFilename(session.title, 'json')
  };
};

// Text Export
const exportAsText = (session) => {
  let content = `CHAT EXPORT\n`;
  content += `Title: ${session.title}\n`;
  content += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
  content += `Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
  content += `Messages: ${session.messages.length}\n`;
  content += `\n${'='.repeat(50)}\n\n`;
  
  session.messages.forEach((message, index) => {
    content += `[${index + 1}] ${message.role.toUpperCase()}\n`;
    content += `Time: ${new Date(message.timestamp).toLocaleString()}\n`;
    
    if (message.files && message.files.length > 0) {
      content += `Files: ${message.files.map(f => f.name).join(', ')}\n`;
    }
    
    content += `\n${message.content}\n`;
    content += `\n${'-'.repeat(30)}\n\n`;
  });
  
  return {
    content,
    mimeType: 'text/plain',
    filename: generateExportFilename(session.title, 'txt')
  };
};

// Markdown Export
const exportAsMarkdown = (session) => {
  let content = `# ${session.title}\n\n`;
  content += `**Created:** ${new Date(session.createdAt).toLocaleString()}  \n`;
  content += `**Updated:** ${new Date(session.updatedAt).toLocaleString()}  \n`;
  content += `**Messages:** ${session.messages.length}  \n\n`;
  content += `---\n\n`;
  
  session.messages.forEach((message, index) => {
    const roleIcon = message.role === 'user' ? '👤' : '🤖';
    content += `## ${roleIcon} ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}\n\n`;
    content += `*${new Date(message.timestamp).toLocaleString()}*\n\n`;
    
    if (message.files && message.files.length > 0) {
      content += `**Files:** ${message.files.map(f => `\`${f.name}\``).join(', ')}\n\n`;
    }
    
    // Format message content
    const formattedContent = message.content
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    
    content += `${formattedContent}\n\n`;
    
    if (index < session.messages.length - 1) {
      content += `---\n\n`;
    }
  });
  
  return {
    content,
    mimeType: 'text/markdown',
    filename: generateExportFilename(session.title, 'md')
  };
};

// CSV Export
const exportAsCSV = (session) => {
  const headers = ['Index', 'Role', 'Timestamp', 'Content', 'Files', 'Message_ID'];
  const rows = [headers];
  
  session.messages.forEach((message, index) => {
    const row = [
      index + 1,
      message.role,
      new Date(message.timestamp).toISOString(),
      `"${message.content.replace(/"/g, '""')}"`, // Escape quotes
      message.files ? message.files.map(f => f.name).join('; ') : '',
      message.id
    ];
    rows.push(row);
  });
  
  const content = rows.map(row => row.join(',')).join('\n');
  
  return {
    content,
    mimeType: 'text/csv',
    filename: generateExportFilename(session.title, 'csv')
  };
};

// HTML Export
const exportAsHTML = (session) => {
  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(session.title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message {
            background: white;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message-header {
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .user .message-header {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .assistant .message-header {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        .message-content {
            padding: 15px;
            white-space: pre-wrap;
        }
        .message-meta {
            padding: 8px 15px;
            font-size: 12px;
            color: #666;
            background-color: #f5f5f5;
            border-top: 1px solid #eee;
        }
        .files {
            background-color: #fff3e0;
            padding: 8px 15px;
            border-top: 1px solid #ffcc02;
            font-size: 12px;
        }
        h1 { color: #1976d2; margin-bottom: 10px; }
        .stats { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(session.title)}</h1>
        <div class="stats">
            <strong>Created:</strong> ${new Date(session.createdAt).toLocaleString()}<br>
            <strong>Updated:</strong> ${new Date(session.updatedAt).toLocaleString()}<br>
            <strong>Messages:</strong> ${session.messages.length}
        </div>
    </div>
    
    ${session.messages.map((message, index) => `
        <div class="message ${message.role}">
            <div class="message-header">
                ${message.role === 'user' ? '👤 User' : '🤖 Assistant'}
            </div>
            ${message.files && message.files.length > 0 ? `
                <div class="files">
                    📎 Files: ${message.files.map(f => escapeHtml(f.name)).join(', ')}
                </div>
            ` : ''}
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="message-meta">
                ${new Date(message.timestamp).toLocaleString()}
            </div>
        </div>
    `).join('')}
    
    <div class="header" style="text-align: center; margin-top: 30px;">
        <small>Exported on ${new Date().toLocaleString()}</small>
    </div>
</body>
</html>`;
  
  return {
    content,
    mimeType: 'text/html',
    filename: generateExportFilename(session.title, 'html')
  };
};

// Multiple sessions exports
const exportMultipleSessionsAsText = (exportData) => {
  let content = `MULTIPLE CHAT SESSIONS EXPORT\n`;
  content += `Exported: ${new Date(exportData.exportedAt).toLocaleString()}\n`;
  content += `Total Sessions: ${exportData.totalSessions}\n\n`;
  content += `${'='.repeat(60)}\n\n`;
  
  exportData.sessions.forEach((session, sessionIndex) => {
    content += `SESSION ${sessionIndex + 1}: ${session.title}\n`;
    content += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
    content += `Messages: ${session.messages.length}\n\n`;
    
    session.messages.forEach((message, msgIndex) => {
      content += `  [${msgIndex + 1}] ${message.role.toUpperCase()}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\n`;
    });
    
    content += `\n${'-'.repeat(40)}\n\n`;
  });
  
  return content;
};

const exportMultipleSessionsAsMarkdown = (exportData) => {
  let content = `# Multiple Chat Sessions Export\n\n`;
  content += `**Exported:** ${new Date(exportData.exportedAt).toLocaleString()}  \n`;
  content += `**Total Sessions:** ${exportData.totalSessions}  \n\n`;
  content += `---\n\n`;
  
  exportData.sessions.forEach((session, sessionIndex) => {
    content += `## Session ${sessionIndex + 1}: ${session.title}\n\n`;
    content += `**Created:** ${new Date(session.createdAt).toLocaleString()}  \n`;
    content += `**Messages:** ${session.messages.length}  \n\n`;
    
    session.messages.forEach((message, msgIndex) => {
      const roleIcon = message.role === 'user' ? '👤' : '🤖';
      content += `### ${roleIcon} Message ${msgIndex + 1}\n\n`;
      content += `${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}\n\n`;
    });
    
    content += `---\n\n`;
  });
  
  return content;
};

// Utility function to escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Download file function
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Export and download session
export const exportAndDownloadSession = (session, format, options = {}) => {
  try {
    const exportResult = exportSession(session, format, options);
    downloadFile(exportResult.content, exportResult.filename, exportResult.mimeType);
    return { success: true, filename: exportResult.filename };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

// Export and download multiple sessions
export const exportAndDownloadMultipleSessions = (sessions, format, options = {}) => {
  try {
    const exportResult = exportMultipleSessions(sessions, format, options);
    downloadFile(exportResult.content, exportResult.filename, exportResult.mimeType);
    return { success: true, filename: exportResult.filename };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

// Get export preview (first 500 characters)
export const getExportPreview = (session, format, options = {}) => {
  try {
    const exportResult = exportSession(session, format, options);
    return {
      success: true,
      preview: exportResult.content.substring(0, 500) + (exportResult.content.length > 500 ? '...' : ''),
      fullLength: exportResult.content.length,
      filename: exportResult.filename
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Import session from JSON
export const importSessionFromJSON = (jsonContent) => {
  try {
    const data = JSON.parse(jsonContent);
    
    // Validate required fields
    if (!data.id || !data.title || !Array.isArray(data.messages)) {
      throw new Error('Invalid session format');
    }
    
    // Validate messages
    data.messages.forEach((message, index) => {
      if (!message.role || !message.content || !message.timestamp) {
        throw new Error(`Invalid message format at index ${index}`);
      }
    });
    
    return {
      success: true,
      session: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get export statistics
export const getExportStats = (sessions) => {
  const stats = {
    totalSessions: sessions.length,
    totalMessages: 0,
    totalSize: 0,
    oldestSession: null,
    newestSession: null,
    averageMessagesPerSession: 0,
    sessionsByMonth: {}
  };
  
  sessions.forEach(session => {
    stats.totalMessages += session.messages.length;
    
    // Calculate approximate size
    const sessionSize = JSON.stringify(session).length;
    stats.totalSize += sessionSize;
    
    // Find oldest and newest
    const createdAt = new Date(session.createdAt);
    if (!stats.oldestSession || createdAt < new Date(stats.oldestSession.createdAt)) {
      stats.oldestSession = session;
    }
    if (!stats.newestSession || createdAt > new Date(stats.newestSession.createdAt)) {
      stats.newestSession = session;
    }
    
    // Group by month
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!stats.sessionsByMonth[monthKey]) {
      stats.sessionsByMonth[monthKey] = 0;
    }
    stats.sessionsByMonth[monthKey]++;
  });
  
  stats.averageMessagesPerSession = stats.totalSessions > 0 ? 
    Math.round(stats.totalMessages / stats.totalSessions) : 0;
  
  return stats;
};