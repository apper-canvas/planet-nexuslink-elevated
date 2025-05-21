/**
 * ActivityService.js
 * Service for managing activities using ApperClient
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
  'type',
  'status',
  'description',
  'date',
  'time',
  'duration',
  'location',
  'relatedToType',
  'relatedToId',
  'reminder',
  'reminderTime',
  'reminderUnit',
  'assignedTo'
];

class ActivityService {
  constructor() {
    this.tableName = 'Activity1';
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
   * Get all activities with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to activities data
   */
  async getActivities(options = {}) {
    try {
      const params = {
        fields: FIELDS,
        pagingInfo: {
          limit: options.limit || 50,
          offset: options.offset || 0
        }
      };

      // Add filter for related entity if specified
      if (options.relatedToType && options.relatedToId) {
        params.where = [
          {
            fieldName: 'relatedToType',
            operator: 'ExactMatch',
            values: [options.relatedToType]
          },
          {
            fieldName: 'relatedToId',
            operator: 'ExactMatch',
            values: [options.relatedToId]
          }
        ];
      }

      // Add filter for assigned user if specified
      if (options.assignedTo) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'assignedTo',
          operator: 'ExactMatch',
          values: [options.assignedTo]
        });
      }

      // Add filter for status if specified
      if (options.status) {
        if (!params.where) params.where = [];
        params.where.push({
          fieldName: 'status',
          operator: 'ExactMatch',
          values: [options.status]
        });
      }
      
      // Add ordering if specified (default to date)
      params.orderBy = [
        {
          field: options.orderBy || 'date',
          direction: options.orderDirection || 'ASC'
        }
      ];

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get a single activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise} Promise resolving to activity data
   */
  async getActivityById(id) {
    try {
      const response = await this.apperClient.getRecordById(this.tableName, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise} Promise resolving to created activity
   */
  async createActivity(activityData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: activityData.title || 'New Activity',
          Tags: activityData.tags || '',
          title: activityData.title || '',
          type: activityData.type || 'task',
          status: activityData.status || 'pending',
          description: activityData.description || '',
          date: activityData.date || new Date().toISOString().split('T')[0],
          time: activityData.time || '',
          duration: activityData.duration || 0,
          location: activityData.location || '',
          relatedToType: activityData.relatedToType || '',
          relatedToId: activityData.relatedToId || '',
          reminder: activityData.reminder || false,
          reminderTime: activityData.reminderTime || '',
          reminderUnit: activityData.reminderUnit || '',
          assignedTo: activityData.assignedTo || ''
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Update an existing activity
   * @param {string} id - Activity ID
   * @param {Object} activityData - Activity data to update
   * @returns {Promise} Promise resolving to updated activity
   */
  async updateActivity(id, activityData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          Name: activityData.title || 'Updated Activity',
          Tags: activityData.tags || '',
          title: activityData.title || '',
          type: activityData.type || '',
          status: activityData.status || '',
          description: activityData.description || '',
          date: activityData.date || '',
          time: activityData.time || '',
          duration: activityData.duration || 0,
          location: activityData.location || '',
          relatedToType: activityData.relatedToType || '',
          relatedToId: activityData.relatedToId || '',
          reminder: activityData.reminder !== undefined ? activityData.reminder : false,
          reminderTime: activityData.reminderTime || '',
          reminderUnit: activityData.reminderUnit || '',
          assignedTo: activityData.assignedTo || ''
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error(`Error updating activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an activity
   * @param {string} id - Activity ID to delete
   * @returns {Promise} Promise resolving to success status
   */
  async deleteActivity(id) {
    try {
      const params = {
        RecordIds: [id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error deleting activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get activities by related entity (contact or deal)
   * @param {string} type - Related entity type
   * @param {string} id - Related entity ID
   * @returns {Promise} Promise resolving to activities data
   */
  async getActivitiesByRelated(type, id) {
    return this.getActivities({ relatedToType: type, relatedToId: id });
  }

  // Legacy methods for backward compatibility
  async getAllActivities() {
    return this.getActivities();
  }

  async saveActivity(activity) {
    if (activity.id) {
      return this.updateActivity(activity.id, activity);
    } else {
      return this.createActivity(activity);
    }
  }
}

export default new ActivityService();