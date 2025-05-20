import { saveAs } from 'file-saver';
/**
 * Exports data to a CSV file and triggers download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToCsv = (data, filename) => {
  if (!data || !data.length) {
    throw new Error('No data to export');
  }
  
  // Get all unique headers from all objects
  const headers = Array.from(
    new Set(
      data.flatMap(obj => Object.keys(obj))
    )
  );
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => formatCsvValue(row[header])).join(',')
    )
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format a value for CSV export (handle special cases like arrays and objects)
 */
const formatCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }
  
  // If the value contains commas, newlines or quotes, wrap it in quotes
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename to extract extension from
 * @returns {string} File extension in lowercase
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Get file type icon based on extension
 * @param {string} filename - Filename to determine icon for
 * @returns {string} Icon name to use with getIcon utility
 */
export const getFileTypeIcon = (filename) => {
  const ext = getFileExtension(filename);
  
  switch (ext) {
    case 'pdf':
      return 'file-text';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'xls':
    case 'xlsx':
      return 'file-spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'file-presentation';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'video';
    default:
      return 'file';
  }
};

/**
 * Get file type label based on extension
 * @param {string} filename - Filename to determine type for
 * @returns {string} Human readable file type
 */
export const getFileTypeLabel = (filename) => {
  const ext = getFileExtension(filename);
  
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return 'Image';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'Video';
    default:
      return ext.toUpperCase();
  }
};

/**
 * Exports data to a PDF file and triggers download
 * @param {Array|Object} data - Data to export to PDF
 * @param {string} filename - Name of the file to download
 */
export const exportToPdf = (data, filename) => {
  if (!data) {
    throw new Error('No data to export');
  }
  
  // For actual implementation, you would format the data for PDF
  // This simplified version creates a text representation
  let content = '';
  
  if (Array.isArray(data)) {
    content = data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
  } else {
    content = JSON.stringify(data, null, 2);
  }
  
  // Create a Blob with the data
  const blob = new Blob([content], { type: 'application/pdf' });
  
  // Use file-saver to trigger download
  saveAs(blob, `${filename}.pdf`);
};

// Alias with lowercase naming for backward compatibility
export const exporttopdf = exportToPdf;

// Alias with uppercase naming for backward compatibility
export const exportToCSV = exportToCsv;