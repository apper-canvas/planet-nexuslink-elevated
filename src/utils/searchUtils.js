/**
 * Search utilities for the CRM application
 * Handles global search functionality across different data types
 */
import DocumentStorage from '../services/DocumentStorage';
import { getDocumentCategoryLabel, formatFileSize } from './documentUtils';
import { getFileTypeIcon } from './exportUtils';

/**
 * Search all documents across the application
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} Array of search results
 */
export const searchDocuments = (query, options = {}) => {
  if (!query || query.trim() === '') {
    return [];
  }

  // Get all documents from storage
  const searchResults = DocumentStorage.searchDocuments(query, options);
  
  return searchResults;
};

/**
 * Format document search results for display
 * @param {Array} results - Document search results
 * @returns {Array} Formatted search results
 */
export const formatSearchResults = (results) => {
  return results.map(result => ({
    ...result,
    icon: getFileTypeIcon(result.filename),
    category: getDocumentCategoryLabel(result.type),
    formattedSize: formatFileSize(result.size),
    formattedDate: new Date(result.uploadedAt).toLocaleDateString()
  }));
};

/**
 * Group search results by type
 * @param {Array} results - Search results
 * @returns {Object} Grouped results
 */
export const groupSearchResults = (results) => {
  return results.reduce((groups, result) => {
    const type = result.resultType || 'document';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {});
};

/**
 * Highlight search term in text
 * @param {string} text - Original text
 * @param {string} term - Search term to highlight
 * @returns {string} HTML with highlights
 */
export const highlightSearchTerm = (text, term) => {
  if (!term || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
};