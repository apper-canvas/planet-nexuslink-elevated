/**
 * Document Storage Service
 * Handles document persistence, retrieval, updates, and deletion
 */
import { toast } from 'react-toastify';

const STORAGE_KEY = 'crm-documents';

class DocumentStorage {
  constructor() {
    this.documents = this.loadDocuments();
  }

  /**
   * Load documents from localStorage
   */
  loadDocuments() {
    try {
      const storedDocs = localStorage.getItem(STORAGE_KEY);
      return storedDocs ? JSON.parse(storedDocs) : [];
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  /**
   * Save documents to localStorage
   */
  saveDocuments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Error saving documents:', error);
      toast.error('Failed to save document changes');
    }
  }

  /**
   * Get all documents for a specific contact
   * @param {string} contactId - Contact ID
   * @returns {Array} Array of documents
   */
  getDocumentsByContact(contactId) {
    return this.documents.filter(doc => doc.contactId === contactId);
  }

  /**
   * Add a new document
   * @param {Object} document - Document object to add
   * @returns {Object} Added document
   */
  addDocument(document) {
    // Check if this is a new version of an existing document
    const existingDoc = this.documents.find(
      doc => doc.filename === document.filename && doc.contactId === document.contactId
    );

    if (existingDoc) {
      // Create a new version
      const newDoc = {
        ...document,
        id: `doc-${Date.now()}`,
        version: existingDoc.version + 1,
        previousVersions: [...(existingDoc.previousVersions || []), existingDoc]
      };
      
      // Replace the existing document
      this.documents = this.documents.filter(doc => doc.id !== existingDoc.id);
      this.documents.push(newDoc);
    } else {
      // Add a new document
      const newDoc = {
        ...document,
        id: document.id || `doc-${Date.now()}`,
        version: 1,
        previousVersions: []
      };
      this.documents.push(newDoc);
    }

    this.saveDocuments();
    return this.documents[this.documents.length - 1];
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID to delete
   * @returns {boolean} Success status
   */
  deleteDocument(documentId) {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== documentId);
    
    if (this.documents.length < initialLength) {
      this.saveDocuments();
      return true;
    }
    return false;
  }

  /**
   * Search documents based on query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching documents
   */
  searchDocuments(query, options = {}) {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const term = query.toLowerCase();
      let results = this.documents.filter(doc => 
        doc.filename.toLowerCase().includes(term) ||
        (doc.description && doc.description.toLowerCase().includes(term)) ||
        (doc.type && doc.type.toLowerCase().includes(term))
      );

      // Apply contactId filter if provided
      if (options.contactId) {
        results = results.filter(doc => doc.contactId === options.contactId);
      }

      // Add result metadata
      return results.map(doc => ({
        ...doc,
        resultType: 'document',
        matchField: this.getMatchField(doc, term)
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Determine which field matched the search query
   * @param {Object} doc - Document object
   * @param {string} term - Search term
   * @returns {string} Matched field name
   */
  getMatchField(doc, term) {
    if (doc.filename.toLowerCase().includes(term)) {
      return 'filename';
    } else if (doc.description && doc.description.toLowerCase().includes(term)) {
      return 'description';
    } else if (doc.type && doc.type.toLowerCase().includes(term)) {
      return 'type';
    }
    return 'other';
  }
}

export default new DocumentStorage();