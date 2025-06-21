// src/utils/fileProcessor.js

export const processFile = async (file) => {
  const textTypes = ['text/plain', 'application/json', 'text/csv', 'text/markdown'];
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const documentTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const metadata = { 
    name: file.name, 
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };

  try {
    if (textTypes.includes(file.type)) {
      const text = await file.text();
      const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

      return {
        content: text,
        metadata: {
          ...metadata,
          category: 'text',
          wordCount,
        },
      };
    }

    if (imageTypes.includes(file.type)) {
      const base64 = await convertToBase64(file);
      return {
        content: base64,
        metadata: {
          ...metadata,
          category: 'image',
          dimensions: await getImageDimensions(file)
        },
      };
    }

    if (documentTypes.includes(file.type)) {
      // For now, we'll extract basic info and provide a placeholder
      // In a real implementation, you'd use libraries like pdf-parse, mammoth, etc.
      const content = await extractDocumentContent(file);
      
      return {
        content: content || `[Document: ${file.name}]\nThis document has been uploaded but content extraction is not yet implemented. The file contains ${Math.round(file.size / 1024)}KB of data.`,
        metadata: {
          ...metadata,
          category: 'document',
          needsExtraction: !content
        },
      };
    }

    throw new Error(`Unsupported file type: ${file.type}`);
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
};

const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    
    img.src = url;
  });
};

const extractDocumentContent = async (file) => {
  // This is a placeholder. In a real implementation, you would:
  // - Use pdf-parse for PDFs
  // - Use mammoth for DOCX files
  // - Use xlsx for Excel files
  
  if (file.type === 'application/pdf') {
    // For PDF, you'd use pdf-parse library
    return null; // Placeholder
  }
  
  if (file.type.includes('wordprocessingml')) {
    // For DOCX, you'd use mammoth library
    return null; // Placeholder
  }
  
  if (file.type.includes('spreadsheetml') || file.type.includes('ms-excel')) {
    // For Excel, you'd use xlsx library
    return null; // Placeholder
  }
  
  return null;
};

// Helper function to format file content for AI consumption
export const formatFileForAI = (processedFile) => {
  const { content, metadata } = processedFile;
  
  let formattedContent = `[File: ${metadata.name}]\n`;
  formattedContent += `Type: ${metadata.category}\n`;
  
  if (metadata.category === 'text') {
    formattedContent += `Word Count: ${metadata.wordCount}\n\n`;
    formattedContent += `Content:\n${content}`;
  } else if (metadata.category === 'image') {
    formattedContent += `Format: ${metadata.type}\n`;
    if (metadata.dimensions) {
      formattedContent += `Dimensions: ${metadata.dimensions.width}x${metadata.dimensions.height}\n`;
    }
    formattedContent += `\n[Image content available for analysis]`;
  } else if (metadata.category === 'document') {
    formattedContent += `Size: ${Math.round(metadata.size / 1024)}KB\n\n`;
    formattedContent += content;
  }
  
  return formattedContent;
};