import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import DocumentStorage from '../../services/DocumentStorage';
import { getIcon } from '../../utils/iconUtils';
import { validateDocument, getDocumentCategories, formatFileSize } from '../../utils/documentUtils';

const DocumentUploader = ({ onUpload, contactId, currentUser, showContactSelect = false, contacts = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentCategory, setDocumentCategory] = useState('general');
  const [description, setDescription] = useState('');

  const [selectedContactId, setSelectedContactId] = useState(contactId || '');
  // Icons
  const UploadIcon = getIcon('upload');
  const FileIcon = getIcon('file');
  const XIcon = getIcon('x');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Validate file
    const validation = validateDocument(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const docContactId = showContactSelect ? selectedContactId : contactId;
    
    // Validate required fields
    if (!docContactId) {
      toast.error('Please select a contact');
      setIsUploading(false);
      return;
    }
    
    // Create document object with metadata
    const newDocument = {
      filename: file.name,
      size: file.size,
      type: documentCategory,
      description: description,
      uploadedBy: currentUser,
      uploadedAt: new Date().toISOString(),
      contactId: docContactId,
      url: URL.createObjectURL(file)
    };
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      try {
        // Store the document in our storage service
        // In a real app, this would save the document to a server
        const savedDocument = DocumentStorage.addDocument(newDocument);
        
        // Call the onUpload callback with the new document
        onUpload(savedDocument);
        
        // Reset form
        setIsUploading(false);
        setUploadProgress(0);
        setDocumentCategory('general');
        setDescription('');
        
        toast.success(`Document "${file.name}" uploaded successfully`);
      } catch (error) {
        toast.error('Failed to save document: ' + error.message);
      }
    }, 2000);
  }, [onUpload, contactId, currentUser, documentCategory, description, selectedContactId, showContactSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading,
    maxFiles: 1,
    // In a real app, you might want to limit file types based on what your backend supports
    accept: {
            <div>
              <label htmlFor="contact" className="block text-sm font-medium mb-1">
                Select Contact *
              </label>
              <select
                id="contact"
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
  });

  return (
    <div className="space-y-5 bg-surface-50 dark:bg-surface-800 p-5 rounded-lg border border-surface-200 dark:border-surface-700">
      {showContactSelect && (
        <div>
          <label htmlFor="contact" className="block text-sm font-medium mb-1">
            Select Contact *
          </label>
          <select
            id="contact"
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
        </div>
      )}
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
    <div className="space-y-5 bg-surface-50 dark:bg-surface-800 p-5 rounded-lg border border-surface-200 dark:border-surface-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* Document category */}
          <div className="mb-4">
            <label htmlFor="documentCategory" className="block text-sm font-medium mb-1">
              Document Category
            </label>
            <select
              id="documentCategory"
              value={documentCategory}
              onChange={(e) => setDocumentCategory(e.target.value)}
              className="input-field"
              disabled={isUploading}
            >
              {getDocumentCategories().map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Enter document description..."
              disabled={isUploading}
            />
          </div>
        </div>

        <div>
          {/* Dropzone */}
          <div data-testid="dropzone" className={`document-dropzone h-full ${isDragActive ? 'document-dropzone-active' : ''}`} {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
              <UploadIcon className="w-8 h-8 text-surface-400" />
            </div>
            {isUploading ? (
              <div className="w-full max-w-xs">
                <p className="mb-2">Uploading document... {uploadProgress}%</p>
                <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-center">Drag and drop a file here, or click to select</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;