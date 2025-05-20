import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';

const DocumentUploader = ({ onUpload, contactId, currentUser }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('general');
  const [description, setDescription] = useState('');

  // Icons
  const UploadIcon = getIcon('upload');
  const FileIcon = getIcon('file');
  const XIcon = getIcon('x');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    
    // In a real app, we would upload the file to a server here
    // For this prototype, we'll simulate the upload with a timeout
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Create document object with metadata
      const file = acceptedFiles[0];
      const newDocument = {
        id: `doc-${Date.now()}`,
        filename: file.name,
        size: file.size,
        type: documentType,
        description: description,
        uploadedBy: currentUser,
        uploadedAt: new Date().toISOString(),
        contactId: contactId,
        version: 1,
        // In a real app, this would be the actual file URL from the server
        url: URL.createObjectURL(file)
      };
      
      // Call the onUpload callback with the new document
      onUpload(newDocument);
      
      // Reset form
      setIsUploading(false);
      setUploadProgress(0);
      setDocumentType('general');
      setDescription('');
      
      toast.success('Document uploaded successfully');
    }, 2000);
  }, [onUpload, contactId, currentUser, documentType, description]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading,
    maxFiles: 1,
    // In a real app, you might want to limit file types based on what your backend supports
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  return (
    <div className="space-y-4">
      <div className={`document-dropzone ${isDragActive ? 'document-dropzone-active' : ''}`} {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <UploadIcon className="w-8 h-8 text-surface-400" />
        </div>
        {isUploading ? (
          <div className="w-full max-w-xs">
            <p className="mb-2">Uploading document...</p>
            <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <p className="font-medium mb-1">Drag and drop a file here, or click to select</p>
            <p className="text-sm text-surface-500">Supports PDF, Word, Excel, and image files up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;