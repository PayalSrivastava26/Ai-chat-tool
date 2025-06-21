// src/components/ChatExport.jsx
import React, { useState, useContext } from 'react';
import { ChatContext } from "../context/ChatContext";
import { 
  EXPORT_FORMATS, 
  exportAndDownloadSession, 
  exportAndDownloadMultipleSessions, 
  getExportPreview,
  getExportStats 
} from '../utils/exportUtils';
import { getAllSessions } from '../utils/chatStorage';

const ChatExport = ({ isOpen, onClose, sessionId = null }) => {
  const { currentSession } = useContext(ChatContext);
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.JSON);
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeSystemMessages: false,
    includeFileData: true,
    maxMessageLength: null
  });
  const [exportMode, setExportMode] = useState('single'); // 'single' or 'multiple'
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sessions = getAllSessions();
  const sessionsList = Object.values(sessions);
  const targetSession = sessionId ? sessions[sessionId] : currentSession;

  React.useEffect(() => {
    if (exportMode === 'single' && targetSession) {
      setSelectedSessions([targetSession.id]);
    }
  }, [exportMode, targetSession]);

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    setPreview(null);
    setShowPreview(false);
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
    setPreview(null);
    setShowPreview(false);
  };

  const handleSessionToggle = (sessionId) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSessions(sessionsList.map(s => s.id));
  };

  const handleSelectNone = () => {
    setSelectedSessions([]);
  };

  const generatePreview = async () => {
    if (exportMode === 'single' && targetSession) {
      const previewResult = getExportPreview(targetSession, selectedFormat, exportOptions);
      setPreview(previewResult);
      setShowPreview(true);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let result;
      
      if (exportMode === 'single' && targetSession) {
        result = exportAndDownloadSession(targetSession, selectedFormat, exportOptions);
      } else if (exportMode === 'multiple' && selectedSessions.length > 0) {
        const sessionsToExport = selectedSessions.map(id => sessions[id]).filter(Boolean);
        result = exportAndDownloadMultipleSessions(sessionsToExport, selectedFormat, exportOptions);
      }
      
      if (result.success) {
        alert(`Export successful! File: ${result.filename}`);
        onClose();
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStatistics = () => {
    if (exportMode === 'single' && targetSession) {
      return {
        sessions: 1,
        messages: targetSession.messages.length,
        estimatedSize: `${Math.round(JSON.stringify(targetSession).length / 1024)} KB`
      };
    } else if (exportMode === 'multiple' && selectedSessions.length > 0) {
      const sessionsToExport = selectedSessions.map(id => sessions[id]).filter(Boolean);
      const stats = getExportStats(sessionsToExport);
      return {
        sessions: stats.totalSessions,
        messages: stats.totalMessages,
        estimatedSize: `${Math.round(stats.totalSize / 1024)} KB`
      };
    }
    return null;
  };

  if (!isOpen) return null;

  const stats = getExportStatistics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Export Chat Sessions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Export Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={exportMode === 'single'}
                  onChange={(e) => setExportMode(e.target.value)}
                  className="mr-2"
                />
                Single Session
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="multiple"
                  checked={exportMode === 'multiple'}
                  onChange={(e) => setExportMode(e.target.value)}
                  className="mr-2"
                />
                Multiple Sessions
              </label>
            </div>
          </div>

          {/* Session Selection for Multiple Mode */}
          {exportMode === 'multiple' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Sessions ({selectedSessions.length} selected)
                </label>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Select None
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {sessionsList.map(session => (
                  <div key={session.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => handleSessionToggle(session.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{session.title}</div>
                      <div className="text-sm text-gray-500">
                        {session.messages.length} messages • {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedFormat === format
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{format.toUpperCase()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format === 'json' && 'Structured data'}
                    {format === 'txt' && 'Plain text'}
                    {format === 'md' && 'Markdown'}
                    {format === 'csv' && 'Spreadsheet'}
                    {format === 'html' && 'Web page'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                  className="mr-2"
                />
                Include metadata (timestamps, IDs, etc.)
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeSystemMessages}
                  onChange={(e) => handleOptionChange('includeSystemMessages', e.target.checked)}
                  className="mr-2"
                />
                Include system messages
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeFileData}
                  onChange={(e) => handleOptionChange('includeFileData', e.target.checked)}
                  className="mr-2"
                />
                Include file attachments and data
              </label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.maxMessageLength !== null}
                  onChange={(e) => handleOptionChange('maxMessageLength', e.target.checked ? 1000 : null)}
                  className="mr-2"
                />
                <span>Limit message length to</span>
                {exportOptions.maxMessageLength !== null && (
                  <input
                    type="number"
                    value={exportOptions.maxMessageLength}
                    onChange={(e) => handleOptionChange('maxMessageLength', parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="100"
                    max="10000"
                  />
                )}
                <span>characters</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Export Statistics</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Sessions:</span>
                  <span className="ml-2 font-medium">{stats.sessions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Messages:</span>
                  <span className="ml-2 font-medium">{stats.messages}</span>
                </div>
                <div>
                  <span className="text-gray-600">Est. Size:</span>
                  <span className="ml-2 font-medium">{stats.estimatedSize}</span>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {exportMode === 'single' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Preview
                </label>
                <button
                  onClick={generatePreview}
                  disabled={!targetSession}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border"
                >
                  Generate Preview
                </button>
              </div>
              
              {showPreview && preview && (
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {preview.preview}
                  </pre>
                  {preview.truncated && (
                    <div className="mt-2 text-xs text-gray-500">
                      Preview truncated... Full export will contain all data.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {exportMode === 'single' 
              ? targetSession ? `Ready to export "${targetSession.title}"` : 'No session selected'
              : `${selectedSessions.length} session(s) selected`
            }
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (!targetSession && exportMode === 'single') || (selectedSessions.length === 0 && exportMode === 'multiple')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatExport;