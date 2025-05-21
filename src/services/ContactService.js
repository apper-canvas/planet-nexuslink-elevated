/**
 * ContactService.js
 * Service for managing contacts using ApperClient
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
  'email',
  'company',
  'phone'
];

class ContactService {
  constructor() {
    this.tableName = 'contact';
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
   * Get all contacts with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to contacts data
   */
  async getContacts(options = {}) {
    try {
      const params = {
        fields: FIELDS,
        pagingInfo: {
          limit: options.limit || 50,
          offset: options.offset || 0
        }
      };

      // Add search/filter conditions if provided
      if (options.search) {
        params.where = [
          {
            fieldName: 'Name',
            operator: 'Contains',
            values: [options.search]
          }
        ];
      }
      
      // Add ordering if specified
      if (options.orderBy) {
        params.orderBy = [
          {
            field: options.orderBy,
            direction: options.orderDirection || 'ASC'
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  /**
   * Get a single contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise} Promise resolving to contact data
   */
  async getContactById(id) {
    try {
      const response = await this.apperClient.getRecordById(this.tableName, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise} Promise resolving to created contact
   */
  async createContact(contactData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: contactData.name,
          Tags: contactData.tags || "",
          email: contactData.email || "",
          company: contactData.company || "",
          phone: contactData.phone || ""
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Update an existing contact
   * @param {string} id - Contact ID
   * @param {Object} contactData - Contact data to update
   * @returns {Promise} Promise resolving to updated contact
   */
  async updateContact(id, contactData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          Name: contactData.name,
          Tags: contactData.tags || "",
          email: contactData.email || "",
          company: contactData.company || "",
          phone: contactData.phone || ""
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error(`Error updating contact with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a contact
   * @param {string} id - Contact ID to delete
   * @returns {Promise} Promise resolving to success status
   */
  async deleteContact(id) {
    try {
      const params = {
        RecordIds: [id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error deleting contact with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ContactService();