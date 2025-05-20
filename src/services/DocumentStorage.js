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
}

export default new DocumentStorage();