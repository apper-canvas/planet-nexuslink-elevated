/**
 * DealService.js
 * Service for managing deals using ApperClient
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
  'title',
  'contactId',
  'amount',
  'stage',
  'probability',
  'expectedCloseDate',
  'ownerId',
  'description'
];

// Export deal stages for use in UI
export const DEAL_STAGES = [
  { id: 'lead', name: 'Lead', color: 'blue' },
  { id: 'qualified', name: 'Qualified', color: 'indigo' },
  { id: 'proposal', name: 'Proposal', color: 'purple' },
  { id: 'negotiation', name: 'Negotiation', color: 'amber' },
  { id: 'closed_won', name: 'Closed Won', color: 'green' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'red' }
];

class DealService {
  constructor() {
    this.tableName = 'deal';
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
   * Get all deals with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to deals data
   */
  async getDeals(options = {}) {
    try {
      const params = {
        fields: FIELDS,
        pagingInfo: {
          limit: options.limit || 100,
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

      // Add filter for stage if specified
      if (options.stage) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'stage',
          operator: 'ExactMatch',
          values: [options.stage]
        });
      }
      
      // Add search filter if specified
      if (options.search) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'title',
          operator: 'Contains',
          values: [options.search]
        });
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
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  /**
   * Get a single deal by ID
   * @param {string} id - Deal ID
   * @returns {Promise} Promise resolving to deal data
   */
  async getDealById(id) {
    try {
      const response = await this.apperClient.getRecordById(this.tableName, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching deal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get deals by contact ID
   * @param {string} contactId - Contact ID
   * @returns {Promise} Promise resolving to deals data
   */
  async getDealsByContact(contactId) {
    return this.getDeals({ contactId });
  }

  /**
   * Create a new deal
   * @param {Object} dealData - Deal data
   * @returns {Promise} Promise resolving to created deal
   */
  async createDeal(dealData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: dealData.title || 'New Deal',
          Tags: dealData.tags || '',
          title: dealData.title || '',
          contactId: dealData.contactId || '',
          amount: dealData.amount || 0,
          stage: dealData.stage || 'lead',
          probability: dealData.probability || 0,
          expectedCloseDate: dealData.expectedCloseDate || '',
          ownerId: dealData.ownerId || '',
          description: dealData.description || ''
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update an existing deal
   * @param {string} id - Deal ID
   * @param {Object} dealData - Deal data to update
   * @returns {Promise} Promise resolving to updated deal
   */
  async updateDeal(id, dealData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          Name: dealData.title || 'Updated Deal',
          Tags: dealData.tags || '',
          title: dealData.title || '',
          contactId: dealData.contactId || '',
          amount: dealData.amount || 0,
          stage: dealData.stage || 'lead',
          probability: dealData.probability || 0,
          expectedCloseDate: dealData.expectedCloseDate || '',
          ownerId: dealData.ownerId || '',
          description: dealData.description || ''
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error(`Error updating deal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a deal
   * @param {string} id - Deal ID to delete
   * @returns {Promise} Promise resolving to success status
   */
  async deleteDeal(id) {
    try {
      const params = {
        RecordIds: [id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error deleting deal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all deals (for backward compatibility)
   * @returns {Promise} Promise resolving to all deals
   */
  async getAllDeals() {
    return this.getDeals();
  }
}

// Export singleton instance
export default new DealService();