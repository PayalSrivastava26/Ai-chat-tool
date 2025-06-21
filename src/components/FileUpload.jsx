import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { processFile } from '../utils/fileProcessor';


const FileUpload = ({ onFileProcessed, onClose, acceptedTypes = ['text', 'image', 'document'] }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const acceptedExtensions = {
    text: ['.txt', '.md', '.json', '.csv'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  };

  const getAcceptString = () => {
    return acceptedTypes
      .flatMap(type => acceptedExtensions[type] || [])
      .join(',');
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    const isValidExtension = acceptedTypes.some(type =>
      acceptedExtensions[type]?.includes(extension)
    );

    if (!isValidExtension) {
      return `File type not supported. Accepted types: ${getAcceptString()}`;
    }

    return null;
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending',
      error: validateFile(file),
      content: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFiles = async () => {
    setProcessing(true);
    
    const validFiles = files.filter(f => !f.error);
    const processedFiles = [];

    for (const fileData of validFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'processing' } : f
        ));

        const result = await processFile(fileData.file);

        
        const updatedFile = {
          ...fileData,
          status: 'completed',
          content: result.content,
          metadata: result.metadata
        };

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? updatedFile : f
        ));

        processedFiles.push(updatedFile);
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: error.message }
            : f
        ));
      }
    }

    setProcessing(false);
    
    if (processedFiles.length > 0 && onFileProcessed) {
      onFileProcessed(processedFiles);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return '🖼️';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return '📊';
    } else if (['txt', 'md'].includes(extension)) {
      return '📋';
    } else if (['json'].includes(extension)) {
      return '⚙️';
    } else if (['csv'].includes(extension)) {
      return '📈';
    }
    return '📁';
  };

  const getStatusIcon = (status, error) => {
    switch (status) {
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return error ? <AlertCircle className="w-4 h-4 text-red-500" /> : null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-500 bg-opacity-10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">
            Drag and drop files here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: {getAcceptString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 10MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptString()}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Files ({files.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="text-2xl mr-3">
                      {getFileIcon(fileData.file.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{fileData.file.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(fileData.file.size)}
                      </p>
                      {fileData.error && (
                        <p className="text-sm text-red-400 mt-1">{fileData.error}</p>
                      )}
                      {fileData.status === 'completed' && fileData.metadata && (
                        <p className="text-sm text-green-400 mt-1">
                          Processed: {fileData.metadata.type}
                          {fileData.metadata.wordCount && ` • ${fileData.metadata.wordCount} words`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-2">
                    {getStatusIcon(fileData.status, fileData.error)}
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="ml-2 p-1 hover:bg-gray-600 rounded transition-colors"
                      disabled={processing}
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setFiles([])}
              disabled={processing}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
            <button
              onClick={processFiles}
              disabled={processing || files.every(f => f.error)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
            >
              {processing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <File className="w-4 h-4 mr-2" />
                  Process Files
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;