/**
 * Document utility functions for the CRM application
 */

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate a document for upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateDocument = (file) => {
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit (${formatFileSize(file.size)})`
    };
  }
  
  // Check file type based on extension
  const validExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.txt'
  ];
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File type '${extension}' is not supported`
    };
  }
  
  return { isValid: true };
};

/**
 * Get document category options
 * @returns {Array} Array of document category objects
 */
export const getDocumentCategories = () => [
  { id: 'contract', label: 'Contract' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'report', label: 'Report' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'legal', label: 'Legal Document' },
  { id: 'marketing', label: 'Marketing Material' },
  { id: 'specification', label: 'Specification' },
  { id: 'general', label: 'General Document' }
];

/**
 * Get document category label by id
 * @param {string} categoryId - Category ID
 * @returns {string} Category label
 */
export const getDocumentCategoryLabel = (categoryId) => {
  const category = getDocumentCategories().find(cat => cat.id === categoryId);
  return category ? category.label : 'Document';
};

/**
 * Generate thumbnail URL for a document based on file type
 * @param {string} filename - Document filename
 * @returns {string} Thumbnail URL or empty string
 */
export const generateThumbnailUrl = (filename) => {
  // In a real app, this would generate/fetch actual thumbnails
  return '';
};