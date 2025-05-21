/**
 * DocumentService.js
 * Service for managing documents using ApperClient
 */

// Fields based on the table definition
const FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy',
  'filename',
  'type',
  'description',
  'version',
  'size',
  'category',
  'fileContent',
  'contactId'
];

class DocumentService {
  constructor() {
    this.tableName = 'document';
    this.initialize();
  }

  initialize() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  /**
   * Get all documents with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to documents data
   */
  async getDocuments(options = {}) {
    try {
      const params = {
        fields: FIELDS,
        pagingInfo: {
          limit: options.limit || 50,
          offset: options.offset || 0
        }
      };

      // Add filter for contact if specified
      if (options.contactId) {
        params.where = [
          {
            fieldName: 'contactId',
            operator: 'ExactMatch',
            values: [options.contactId]
          }
        ];
      }

      // Add search filter if specified
      if (options.search) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'filename',
          operator: 'Contains',
          values: [options.search]
        });
      }
      
      // Add category filter if specified
      if (options.category) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'category',
          operator: 'ExactMatch',
          values: [options.category]
        });
      }
      
      // Add ordering if specified
      if (options.orderBy) {
        params.orderBy = [
          {
            field: options.orderBy,
            direction: options.orderDirection || 'DESC'
          }
        ];
      } else {
        // Default ordering by created date
        params.orderBy = [
          {
            field: 'CreatedOn',
            direction: 'DESC'
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   * @param {string} id - Document ID
   * @returns {Promise} Promise resolving to document data
   */
  async getDocumentById(id) {
    try {
      const response = await this.apperClient.getRecordById(this.tableName, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching document with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   * @param {Object} documentData - Document data
   * @returns {Promise} Promise resolving to created document
   */
  async createDocument(documentData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: documentData.filename || 'New Document',
          Tags: documentData.tags || '',
          filename: documentData.filename || '',
          type: documentData.type || '',
          description: documentData.description || '',
          version: documentData.version || 1,
          size: documentData.size || 0,
          category: documentData.category || '',
          fileContent: documentData.fileContent || '',
          contactId: documentData.contactId || ''
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} id - Document ID to delete
   * @returns {Promise} Promise resolving to success status
   */
  async deleteDocument(id) {
    try {
      const params = {
        RecordIds: [id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get documents by contact ID
   * @param {string} contactId - Contact ID
   * @returns {Promise} Promise resolving to documents data
   */
  async getDocumentsByContact(contactId) {
    return this.getDocuments({ contactId });
  }

  /**
   * Search documents based on query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} Promise resolving to matching documents
   */
  async searchDocuments(query, options = {}) {
    if (!query || query.trim() === '') {
      return [];
    }
    
    return this.getDocuments({ 
      search: query,
      contactId: options.contactId
    });
  }
}

export default new DocumentService();